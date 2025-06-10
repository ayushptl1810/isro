import React from "react";
import { useSensorData } from "../context/SensorContext";

const SensorValue = ({ label, value }) => (
  <div className="flex justify-between items-center text-sm">
    <span className="text-gray-400">{label}:</span>
    <span className="font-mono">{value || "---"}</span>
  </div>
);

export const LiveSensorReadings = () => {
  const { sensorData } = useSensorData();

  return (
    <div className="panel">
      <h2 className="title">Live Sensor Readings</h2>
      <div className="gap-4 my-5">
        {/* Distance Sensors */}
        <div>
          <h3 className="subtitle text-sm mt-2">Distance Sensors</h3>
          <div className="space-y-2">
            <SensorValue label="D0" value={sensorData?.D0} />
            <SensorValue label="D1" value={sensorData?.D1} />
          </div>
        </div>

        {/* Optical Flow */}
        <div className="my-5">
          <h3 className="subtitle text-sm mt-2">Optical Flow</h3>
          <div className="space-y-2">
            <SensorValue label="Flow X" value={sensorData?.F?.flow_x} />
            <SensorValue label="Flow Y" value={sensorData?.F?.flow_y} />
            <SensorValue label="Quality" value={sensorData?.F?.quality} />
          </div>
        </div>

        {/* IMU Data */}
        <div className="my-5">
          <h3 className="subtitle text-sm mt-2">IMU Data</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-xs text-gray-400 mb-1">Accel</h4>
              <div className="space-y-2">
                <SensorValue label="X" value={sensorData?.I?.A.xacc} />
                <SensorValue label="Y" value={sensorData?.I?.A.yacc} />
                <SensorValue label="Z" value={sensorData?.I?.A.zacc} />
              </div>
            </div>
            <div>
              <h4 className="text-xs text-gray-400 mb-1">Gyro</h4>
              <div className="space-y-2">
                <SensorValue label="X" value={sensorData?.I?.G.xgyro} />
                <SensorValue label="Y" value={sensorData?.I?.G.ygyro} />
                <SensorValue label="Z" value={sensorData?.I?.G.zgyro} />
              </div>
            </div>
          </div>
        </div>

        {/* GPS Data */}
        <div className="my-5">
          <h3 className="subtitle text-sm">GPS Data</h3>
          <div className="space-y-2">
            <SensorValue label="Lat" value={sensorData?.G?.latitude} />
            <SensorValue label="Lon" value={sensorData?.G?.longitude} />
            <SensorValue label="Alt" value={sensorData?.G?.altitude_m} />
            <SensorValue
              label="Sats"
              value={sensorData?.G?.satellites_visible}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
