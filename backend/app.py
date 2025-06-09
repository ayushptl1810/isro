from flask import Flask, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO
import os
import subprocess
from threading import Thread
import re

# Initialize Flask app
app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv("SECRET_KEY")

# Configure CORS for your API routes
CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})

# Initialize SocketIO with Flask app
socketio = SocketIO(app, cors_allowed_origins="http://localhost:3000")

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
        parsed_data["D1"] = f"{distance}cm"

    elif output.startswith("[TX] D1:"):
        distance = output[len("[TX] D1:"):-2]
        parsed_data["D2"] = f"{distance}cm"


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
    for line in iter(proc.stdout.readline, b''):
        if not line:
            break
        output = line.decode('utf-8').strip()
        formatted_output = format(output)
        socketio.emit('output_data', {'result': formatted_output})
    proc.stdout.close()

# WebSocket event to start the subprocess
@socketio.on('start_process')
def handle_start_process():
    proc = subprocess.Popen(
        ['python', 'data.py'],  
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        bufsize=1,
        universal_newlines=False  # Read bytes, decode later
    )
    thread = Thread(target=read_subprocess_output, args=(proc,))
    thread.daemon = True
    thread.start()

if __name__ == "__main__":
    # Use socketio.run instead of app.run to enable WebSocket support
    socketio.run(
        app,
        host=os.getenv("HOST", "0.0.0.0"),
        port=int(os.getenv("PORT", 5000)),
        debug=os.getenv("FLASK_ENV", "development") == "development"
    )
