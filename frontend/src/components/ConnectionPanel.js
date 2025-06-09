import React, { useState } from "react";
import { useSensorData } from "../context/SensorContext";

const COM_PORTS = Array.from({ length: 10 }, (_, i) => `COM${i + 1}`);

export const ConnectionPanel = () => {
  const { connectionState, connect, disconnect } = useSensorData();
  const [selectedPort, setSelectedPort] = useState(connectionState.port);
  const [baudRate, setBaudRate] = useState(connectionState.baudRate);

  const handleConnect = () => {
    if (connectionState.isConnected) {
      disconnect();
    } else {
      connect(selectedPort, baudRate);
    }
  };

  return (
    <div className="panel">
      <h2 className="title">Connection Panel</h2>
      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <select
            value={selectedPort}
            onChange={(e) => setSelectedPort(e.target.value)}
            disabled={connectionState.isConnected}
            className="bg-gray-800 text-white px-3 py-2 rounded-lg border border-gray-600"
          >
            {COM_PORTS.map((port) => (
              <option key={port} value={port}>
                {port}
              </option>
            ))}
          </select>

          <input
            type="number"
            value={baudRate}
            onChange={(e) => setBaudRate(Number(e.target.value))}
            disabled={connectionState.isConnected}
            className="bg-gray-800 text-white px-3 py-2 rounded-lg border border-gray-600 w-24"
          />

          <button
            onClick={handleConnect}
            className={`btn ${
              connectionState.isConnected ? "btn-red" : "btn-green"
            }`}
          >
            {connectionState.isConnected ? "Disconnect" : "Connect"}
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <div
            className={`w-3 h-3 rounded-full ${
              connectionState.isConnected ? "bg-green-500" : "bg-red-500"
            }`}
          />
          <span className="text-sm">
            {connectionState.isConnected ? "CONNECTED" : "DISCONNECTED"}
          </span>
        </div>
      </div>
    </div>
  );
};
