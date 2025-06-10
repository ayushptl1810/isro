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
          <h1 className="text-3xl font-bold text-green-500 text-center">
            UAV Ground Station Control System
          </h1>
          <p className="text-gray-400 mt-1 text-sm text-center">
            Real-time sensor monitoring and visualization
          </p>
        </header>

        <ConnectionPanel />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 m-4">
          <div className="flex flex-col gap-4">
            <LiveSensorReadings />
            <UAVAlignment />
          </div>
          <div>
            <SensorGraphs />
          </div>
        </div>
      </div>
    </SensorProvider>
  );
}

export default App;
