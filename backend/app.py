# Eventlet setup must be first
import eventlet
eventlet.monkey_patch()

from flask import Flask, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO
import os
import subprocess
from threading import Thread
import re
import json
import sys
import traceback
import time

# Initialize Flask app
app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv("SECRET_KEY")

# Configure CORS for your API routes
CORS(app)

# Initialize SocketIO with Flask app
socketio = SocketIO(
    app,
    cors_allowed_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    async_mode='eventlet',
    logger=True,
    engineio_logger=True
)

# Global variables
data_process = None
monitor_thread = None
is_monitoring = False

# Basic error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Not found"}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({"error": "Internal server error"}), 500

# Format the output by converting it to a JSON object
def format(output):
    parsed_data = {}

    if output.startswith("[TX] D0:"):
        distance = output[len("[TX] D0:"):-2]  # Extract value before "cm"
        parsed_data["D0"] = f"{distance}cm"

    elif output.startswith("[TX] D1:"):
        distance = output[len("[TX] D1:"):-2]
        parsed_data["D1"] = f"{distance}cm"

    elif output.startswith("[TX] F:"):
        # Regex to extract F data
        match = re.match(r".*F:X(\S+) Y(\S+) M_X(\S+) M_Y(\S+) D(\S+) Q(\S+)", output)
        if match:
            parsed_data["F"] = {
                "flow_x": match.group(1),
                "flow_y": match.group(2),
                "flow_comp_m_x": match.group(3),
                "flow_comp_m_y": match.group(4),
                "ground_distance_m": match.group(5),
                "quality": match.group(6),
            }

    elif output.startswith("[TX] I:"):
        # Regex to extract I data
        match = re.match(r".*I:A(\S+) G(\S+)", output)
        if match:
            acc, gyro = match.group(1), match.group(2)
            acc_x, acc_y, acc_z = acc.split(',')
            gyro_x, gyro_y, gyro_z = gyro.split(',')

            parsed_data["I"] = {
                "A": {"xacc": acc_x, "yacc": acc_y, "zacc": acc_z},
                "G": {"xgyro": gyro_x, "ygyro": gyro_y, "zgyro": gyro_z},
            }

    elif output.startswith("[TX] G:"):
        # Regex to extract G data
        match = re.match(r".*G:(\S+) A(\S+) S(\S+)", output)
        if match:
            lat_lon, altitude, satellites = match.group(1), match.group(2), match.group(3)
            latitude, longitude = lat_lon.split(',')
            parsed_data["G"] = {
                "latitude": latitude,
                "longitude": longitude,
                "altitude_m": altitude,
                "satellites_visible": satellites,
            }

    return parsed_data


# Function to read subprocess output and emit to clients
def read_subprocess_output(proc):
    global is_monitoring
    while is_monitoring and proc and proc.poll() is None:
        try:
            # Add timeout to readline
            line = proc.stdout.readline()
            if not line:
                time.sleep(0.1)  # Add small sleep if no data
                continue
            # Process the line with a timeout
            try:
                output = line.strip()
                if not output:  # Skip empty lines
                    continue
                    
                print(f"Received from data process: {output}")  # Debug log
                formatted_output = format(output)
                if formatted_output:  # Only emit if we have valid data
                    socketio.emit('output_data', {'result': formatted_output})
            except Exception as e:
                print(f"Error processing line: {str(e)}")
                continue  # Continue to next line instead of breaking
                
        except Exception as e:
            print(f"Error reading process output: {str(e)}")
            print("Traceback:")
            traceback.print_exc()
            time.sleep(1)  # Add delay before retrying
            continue  # Try to continue reading instead of breaking
    if proc:
        proc.stdout.close()
        proc.stderr.close()

def start_data_process():
    global data_process, monitor_thread, is_monitoring
    try:
        print("Backend: Starting new data process...")
        # Get the absolute path to data_simulator.py
        data_script = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data_simulator.py')
        print(f"Starting data process from: {data_script}")
        
        # Check if the script exists
        if not os.path.exists(data_script):
            print(f"Error: data.py not found at {data_script}")
            return False

        # Start the process with full path
        data_process = subprocess.Popen(
            [sys.executable, data_script],  # Use the current Python interpreter
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,  # Capture stderr separately
            bufsize=1,
            universal_newlines=True,  # This makes stdout/stderr return strings instead of bytes
            cwd=os.path.dirname(data_script)  # Set working directory to script location
        )
        
        # Check if process started successfully
        if data_process.poll() is not None:
            error = data_process.stderr.read()  # Already a string due to universal_newlines=True
            print(f"Process failed to start. Error: {error}")
            return False

        is_monitoring = True
        monitor_thread = Thread(target=read_subprocess_output, args=(data_process,))
        monitor_thread.daemon = True
        monitor_thread.start()
        print("Data process started successfully")
        return True
    except Exception as e:
        print(f"Error starting data process: {str(e)}")
        print("Traceback:")
        traceback.print_exc()
        return False

def stop_data_process():
    global data_process, is_monitoring
    print("Backend: Stopping data process...")
    is_monitoring = False
    if data_process:
        try:
            print("Backend: Terminating process...")
            data_process.terminate()
            data_process.wait(timeout=5)
            print("Backend: Process terminated successfully")
        except Exception as e:
            print(f"Backend: Error terminating process: {str(e)}")
            try:
                print("Backend: Force killing process...")
                data_process.kill()
            except:
                pass
        finally:
            data_process = None
            print("Backend: Process cleanup complete")

@socketio.on('connect')
def handle_connect():
    print('Client connected')
    # Send immediate acknowledgment
    socketio.emit('connection_ack', {'status': 'connected'})

@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')
    stop_data_process()

@socketio.on('start_connection')
def handle_start_connection(data):
    print(f"Received start_connection request with data: {data}")
    try:
        if start_data_process():
            socketio.emit('connection_established')
            print("Connection established and data process started")
        else:
            error_msg = "Failed to start data process. Check server logs for details."
            print(error_msg)
            socketio.emit('connection_failed', error_msg)
    except Exception as e:
        error_msg = f"Connection failed: {str(e)}"
        print(error_msg)
        print("Traceback:")
        traceback.print_exc()
        socketio.emit('connection_failed', error_msg)
        stop_data_process()

@socketio.on('stop_connection')
def handle_stop_connection():
    stop_data_process()
    print("Connection stopped")

@socketio.on('start_monitoring')
def handle_start_monitoring():
    global is_monitoring
    if not is_monitoring and data_process:
        is_monitoring = True
        print("Started monitoring")

@socketio.on('stop_monitoring')
def handle_stop_monitoring():
    global is_monitoring
    is_monitoring = False
    print("Stopped monitoring")

@socketio.on('reset_data')
def handle_reset_data():
    global data_process, is_monitoring
    print("Backend: Received reset_data event")
    try:
        # Stop current process
        print("Backend: Stopping current data process...")
        stop_data_process()
        # Clear monitoring state
        is_monitoring = False
        # Start fresh process
        print("Backend: Starting fresh data process...")
        if start_data_process():
            is_monitoring = True
            print("Backend: Data process reset successful")
            socketio.emit('connection_established')  # Notify frontend of successful reset
            return {'status': 'success'}
        else:
            print("Backend: Failed to reset data process")
            socketio.emit('connection_failed', 'Failed to reset data process')
            return {'status': 'error', 'message': 'Failed to reset data process'}
    except Exception as e:
        print(f"Backend: Error during reset: {str(e)}")
        print("Backend: Traceback:")
        traceback.print_exc()
        socketio.emit('connection_failed', f'Error during reset: {str(e)}')
        return {'status': 'error', 'message': str(e)}

@app.route('/api/data', methods=['GET'])
def get_data():
    with open('sample_data.json', 'r') as file:
        data = json.load(file)
    return jsonify(data)

if __name__ == "__main__":
    try:
        print("Starting server...")
        socketio.run(
            app,
            host="127.0.0.1",
            port=5000,
            debug=True,
            use_reloader=False
        )
    except Exception as e:
        print(f"Server startup failed: {str(e)}")
        print("Traceback:")
        traceback.print_exc()
