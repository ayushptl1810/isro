import React from "react";
import { useSensorData } from "../context/SensorContext";

const UAVAlignment = () => {
  const { sensorData } = useSensorData();

  // Get gyroscope data, defaulting to 0 if not available
  const gyroX = parseFloat(sensorData?.I?.G?.xgyro || 0);
  const gyroY = parseFloat(sensorData?.I?.G?.ygyro || 0);
  const gyroZ = parseFloat(sensorData?.I?.G?.zgyro || 0);

  // Calculate rotation angles (simplified)
  // Note: In a real application, you'd want to use proper quaternion or euler angle calculations
  const pitch = Math.min(Math.max(gyroY * 2, -45), 45); // Limit to ±45 degrees
  const roll = Math.min(Math.max(gyroX * 2, -45), 45); // Limit to ±45 degrees

  return (
    <div className="panel">
      <h2 className="title">UAV Alignment</h2>
      <div className="flex flex-col items-center">
        {/* UAV Orientation Visualization */}
        <div className="relative w-48 h-48 bg-gray-800 rounded-lg border border-gray-600 mb-4">
          {/* Horizon Line */}
          <div
            className="absolute w-full h-0.5 bg-blue-500"
            style={{
              top: "50%",
              transform: `translateY(-50%) rotate(${roll}deg)`,
              transformOrigin: "center",
            }}
          />

          {/* Pitch Indicator */}
          <div
            className="absolute w-0.5 h-full bg-red-500"
            style={{
              left: "50%",
              transform: `translateX(-50%) rotate(${pitch}deg)`,
              transformOrigin: "center",
            }}
          />

          {/* Center Point */}
          <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-white rounded-full transform -translate-x-1/2 -translate-y-1/2" />

          {/* Degree Markers */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-full h-full border border-gray-600 rounded-full" />
            <div className="absolute w-full h-full border border-gray-600 rounded-full scale-75" />
            <div className="absolute w-full h-full border border-gray-600 rounded-full scale-50" />
          </div>
        </div>

        {/* Numerical Values */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-xs text-gray-400">Roll</div>
            <div className="font-mono">{roll.toFixed(1)}°</div>
          </div>
          <div>
            <div className="text-xs text-gray-400">Pitch</div>
            <div className="font-mono">{pitch.toFixed(1)}°</div>
          </div>
          <div>
            <div className="text-xs text-gray-400">Yaw</div>
            <div className="font-mono">{gyroZ.toFixed(1)}°/s</div>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div
            className={`px-3 py-1 rounded ${
              Math.abs(roll) > 30
                ? "bg-red-500/20 text-red-400"
                : "bg-green-500/20 text-green-400"
            }`}
          >
            Roll {Math.abs(roll) > 30 ? "Critical" : "Stable"}
          </div>
          <div
            className={`px-3 py-1 rounded ${
              Math.abs(pitch) > 30
                ? "bg-red-500/20 text-red-400"
                : "bg-green-500/20 text-green-400"
            }`}
          >
            Pitch {Math.abs(pitch) > 30 ? "Critical" : "Stable"}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UAVAlignment;
