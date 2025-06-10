import React, { useState } from "react";
import { useSensorData } from "../context/SensorContext";

const COM_PORTS = Array.from({ length: 10 }, (_, i) => `COM${i + 1}`);

export const ConnectionPanel = () => {
  const { connectionState, connect, disconnect, resetData } = useSensorData();
  const [selectedPort, setSelectedPort] = useState(connectionState.port);
  const [baudRate, setBaudRate] = useState(connectionState.baudRate);

  const handleConnect = () => {
    if (connectionState.isConnected) {
      disconnect();
    } else {
      connect(selectedPort, baudRate);
    }
  };

  const handleReset = () => {
    resetData();
  };

  return (
    <div className="panel m-4">
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

          <div className="flex space-x-4">
            <button
              onClick={handleConnect}
              className={`flex-1 px-4 py-2 rounded-md text-white font-medium ${
                connectionState.isConnected
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {connectionState.isConnected ? "Disconnect" : "Connect"}
            </button>

            <button
              onClick={handleReset}
              className="px-4 py-2 rounded-md text-white font-medium bg-gray-600 hover:bg-gray-700"
            >
              Reset Data
            </button>
          </div>
        </div>

        <div className="flex items-center">
          <div
            className={`w-3 h-3 rounded-full mr-2 ${
              connectionState.isConnected ? "bg-green-500" : "bg-red-500"
            }`}
          />
          <span className="text-sm text-gray-600">
            {connectionState.isConnected ? "Connected" : "Disconnected"}
          </span>
        </div>
      </div>
    </div>
  );
};
