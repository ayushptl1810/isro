import random
import math
import time
import sys

class SensorSimulator:
    def __init__(self):
        # Initial state
        self.altitude = 0.17  # meters
        self.heading = 0.0    # degrees
        self.speed = 0.0      # m/s
        self.loop_count = 0
        
        # GPS state
        self.lat = 0.0
        self.lon = 0.0
        self.sats = 0

    def simulate_distance_sensors(self):
        """Simulate distance sensor readings"""
        # Add some random variation but keep values realistic
        d0 = max(5, int(self.altitude * 100 + random.uniform(-2, 2)))
        d1 = max(5, int(self.altitude * 100 + random.uniform(-2, 2)))
        return f"[TX] D0:{d0}cm", f"[TX] D1:{d1}cm"

    def simulate_optical_flow(self):
        """Simulate optical flow data"""
        # Generate realistic optical flow data
        flow_x = random.randint(-1, 1)
        flow_y = random.randint(-1, 1)
        m_x = random.uniform(-0.5, 0.5)
        m_y = random.uniform(-0.5, 0.5)
        distance = max(0.15, self.altitude + random.uniform(-0.02, 0.02))
        quality = random.randint(40, 50)
        
        return f"[TX] F:X{flow_x} Y{flow_y} M_X{m_x:.3f} M_Y{m_y:.3f} D{distance:.2f} Q{quality}"

    def simulate_imu(self):
        """Simulate IMU data"""
        # Generate realistic IMU data
        acc_x = random.randint(-40, -30)
        acc_y = random.randint(-35, -25)
        acc_z = -980 + random.randint(-5, 5)
        
        gyro_x = random.randint(-3, 3)
        gyro_y = random.randint(-3, 3)
        gyro_z = random.randint(-2, 2)
        
        return f"[TX] I:A{acc_x},{acc_y},{acc_z} G{gyro_x},{gyro_y},{gyro_z}"

    def simulate_gps(self):
        """Simulate GPS data"""
        # Simple GPS simulation
        self.lat += random.uniform(-0.000001, 0.000001)
        self.lon += random.uniform(-0.000001, 0.000001)
        return f"[TX] G:{self.lat:.6f},{self.lon:.6f} A{self.altitude:.1f} S{self.sats}"

    def update_state(self):
        """Update simulation state"""
        self.loop_count += 1
        
        # Update altitude slightly
        self.altitude += random.uniform(-0.01, 0.01)
        self.altitude = max(0.15, min(self.altitude, 0.20))
        
        # Update heading in a pattern
        if self.loop_count % 50 < 10:
            self.heading = 0.0
        elif self.loop_count % 50 < 20:
            self.heading = 90.0
        elif self.loop_count % 50 < 30:
            self.heading = 180.0
        elif self.loop_count % 50 < 40:
            self.heading = 270.0
            
        # Update speed based on heading changes
        self.speed = 0.5 if self.loop_count % 50 < 40 else 0.0
        
        # Update GPS data
        if self.loop_count % 25 == 0:
            self.sats = random.randint(5, 12)

    def generate_data(self):
        """Generate one complete set of sensor data"""
        self.update_state()
        
        # Generate all sensor readings
        d0, d1 = self.simulate_distance_sensors()
        flow = self.simulate_optical_flow()
        imu = self.simulate_imu()
        gps = self.simulate_gps()
        
        # Return all data in the correct format
        return f"{d0}\n{d1}\n{flow}\n{imu}\n{gps}"

def main():
    simulator = SensorSimulator()
    
    try:
        while True:
            # Generate and print data
            data = simulator.generate_data()
            print(data, flush=True)
            sys.stdout.flush()
            
            # Sleep for a short interval (200ms)
            time.sleep(0.2)
            
    except KeyboardInterrupt:
        print("\nSimulator stopped by user")
        sys.exit(0)

if __name__ == "__main__":
    main() 