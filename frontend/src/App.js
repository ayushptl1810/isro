import React from "react";
import { SensorProvider } from "./context/SensorContext";
import { ConnectionPanel } from "./components/ConnectionPanel";
import { LiveSensorReadings } from "./components/LiveSensorReadings";
import { SensorGraphs } from "./components/SensorGraphs";
import UAVAlignment from "./components/UAVAlignment";

function App() {
  return (
    <SensorProvider>
      <div className="min-h-screen bg-black text-white p-4">
        <header className="mb-4">
          <h1 className="text-3xl font-bold text-green-500">
            UAV Ground Station Control System
          </h1>
          <p className="text-gray-400 mt-1 text-sm">
            Real-time sensor monitoring and visualization
          </p>
        </header>

        <ConnectionPanel />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div>
            <LiveSensorReadings />
          </div>
          <div>
            <SensorGraphs />
          </div>
          <div>
            <UAVAlignment />
          </div>
        </div>
      </div>
    </SensorProvider>
  );
}

export default App;
