import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { useSensorData } from "../context/SensorContext";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export const SensorGraphs = () => {
  const { historicalData } = useSensorData();

  const distanceChartData = {
    labels: historicalData.timestamps.map((t) =>
      new Date(t).toLocaleTimeString()
    ),
    datasets: [
      {
        label: "Distance D0 (cm)",
        data: historicalData.values.D0.map((d) =>
          parseFloat(d?.replace("cm", "") || "0")
        ),
        borderColor: "rgb(75, 192, 192)",
        tension: 0.1,
      },
      {
        label: "Distance D1 (cm)",
        data: historicalData.values.D1.map((d) =>
          parseFloat(d?.replace("cm", "") || "0")
        ),
        borderColor: "rgb(255, 99, 132)",
        tension: 0.1,
      },
    ],
  };

  const gpsChartData = {
    labels: historicalData.timestamps.map((t) =>
      new Date(t).toLocaleTimeString()
    ),
    datasets: [
      {
        label: "GPS Latitude",
        data: historicalData.values.G.map((g) =>
          parseFloat(g?.latitude || "0")
        ),
        borderColor: "rgb(75, 192, 192)",
        tension: 0.1,
      },
      {
        label: "GPS Longitude",
        data: historicalData.values.G.map((g) =>
          parseFloat(g?.longitude || "0")
        ),
        borderColor: "rgb(255, 99, 132)",
        tension: 0.1,
      },
    ],
  };

  const imuChartData = {
    labels: historicalData.timestamps.map((t) =>
      new Date(t).toLocaleTimeString()
    ),
    datasets: [
      {
        label: "Gyro X",
        data: historicalData.values.I.map((i) =>
          parseFloat(i?.G?.xgyro || "0")
        ),
        borderColor: "rgb(255, 99, 132)",
        tension: 0.1,
      },
      {
        label: "Gyro Y",
        data: historicalData.values.I.map((i) =>
          parseFloat(i?.G?.ygyro || "0")
        ),
        borderColor: "rgb(75, 192, 192)",
        tension: 0.1,
      },
      {
        label: "Gyro Z",
        data: historicalData.values.I.map((i) =>
          parseFloat(i?.G?.zgyro || "0")
        ),
        borderColor: "rgb(153, 102, 255)",
        tension: 0.1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    animation: {
      duration: 0,
    },
    scales: {
      x: {
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
        ticks: {
          color: "rgba(255, 255, 255, 0.7)",
        },
      },
      y: {
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
        ticks: {
          color: "rgba(255, 255, 255, 0.7)",
        },
      },
    },
    plugins: {
      legend: {
        labels: {
          color: "rgba(255, 255, 255, 0.7)",
        },
      },
    },
  };

  return (
    <div className="panel">
      <h2 className="title">Sensor Graphs</h2>
      <div className="space-y-6">
        <div>
          <h3 className="subtitle">Distance vs Time</h3>
          <div className="h-64">
            <Line data={distanceChartData} options={chartOptions} />
          </div>
        </div>
        <div>
          <h3 className="subtitle">GPS Movement</h3>
          <div className="h-64">
            <Line data={gpsChartData} options={chartOptions} />
          </div>
        </div>
        <div>
          <h3 className="subtitle">IMU Data</h3>
          <div className="h-64">
            <Line data={imuChartData} options={chartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
};
