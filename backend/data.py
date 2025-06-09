import serial
from pymavlink import mavutil

# Connect to flight controller (adjust tty if needed)
master = mavutil.mavlink_connection('/dev/ttyACM0', baud=115200)

# HC-12 on USB
hc12 = serial.Serial("/dev/ttyUSB0", 9600, timeout=0.01)

print("Started telemetry stream forwarding...")

def send(data):
    try:
        hc12.write((data + '\n').encode())
        print(f"[TX] {data}")
    except Exception as e:
        print(f"[ERROR] Sending: {e}")

def handle_distance_sensor(msg):
    return f"D{msg.id}:{msg.current_distance}cm"

def handle_optical_flow(msg):
    dist = msg.ground_distance if msg.ground_distance > 0 else 0
    return f"F:X{msg.flow_x} Y{msg.flow_y} M_X{msg.flow_comp_m_x:.3f} M_Y{msg.flow_comp_m_y:.3f} D{dist:.2f} Q{msg.quality}"

def handle_imu(msg):
    return f"I:A{msg.xacc},{msg.yacc},{msg.zacc} G{msg.xgyro},{msg.ygyro},{msg.zgyro}"

def handle_gps(msg):
    lat = msg.lat / 1e7
    lon = msg.lon / 1e7
    alt = msg.alt / 1000.0
    return f"G:{lat:.6f},{lon:.6f} A{alt:.1f} S{msg.satellites_visible}"

while True:
    try:
        msg = master.recv_match(type=[
            "DISTANCE_SENSOR",
            "OPTICAL_FLOW",
            "RAW_IMU",
            "GPS_RAW_INT"
        ], blocking=False)

        if msg is None:
            continue
        msg_type = msg.get_type()

        if msg_type == "DISTANCE_SENSOR":
            send(handle_distance_sensor(msg))

        elif msg_type == "OPTICAL_FLOW":
            send(handle_optical_flow(msg))

        elif msg_type == "RAW_IMU":
            send(handle_imu(msg))

        elif msg_type == "GPS_RAW_INT":
            send(handle_gps(msg))

    except KeyboardInterrupt:
        print("Exiting...")
        hc12.close()
        break

    except Exception as e:
        print(f"[ERROR] {e}")
