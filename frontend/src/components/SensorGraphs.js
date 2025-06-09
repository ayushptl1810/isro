import React, { useEffect, useRef, useState } from "react";
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
  const { sensorData, timeWindow } = useSensorData();
  const [distanceData, setDistanceData] = useState([]);
  const [gpsData, setGpsData] = useState([]);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!sensorData) return;

    const now = Date.now();
    const cutoff = now - timeWindow * 1000;

    // Update distance data
    if (sensorData.D0 || sensorData.D1) {
      setDistanceData((prev) => {
        const newData = [
          ...prev,
          {
            timestamp: now,
            value: parseFloat(sensorData.D0?.replace("cm", "") || "0"),
          },
        ].filter((point) => point.timestamp > cutoff);
        return newData;
      });
    }

    // Update GPS data
    if (sensorData.G?.latitude && sensorData.G?.longitude) {
      setGpsData((prev) => {
        const newData = [
          ...prev,
          {
            timestamp: now,
            value: parseFloat(sensorData.G?.latitude || "0"),
          },
        ].filter((point) => point.timestamp > cutoff);
        return newData;
      });
    }
  }, [sensorData, timeWindow]);

  const distanceChartData = {
    labels: distanceData.map((d) => new Date(d.timestamp).toLocaleTimeString()),
    datasets: [
      {
        label: "Distance (cm)",
        data: distanceData.map((d) => d.value),
        borderColor: "rgb(75, 192, 192)",
        tension: 0.1,
      },
    ],
  };

  const gpsChartData = {
    labels: gpsData.map((d) => new Date(d.timestamp).toLocaleTimeString()),
    datasets: [
      {
        label: "GPS Movement",
        data: gpsData.map((d) => d.value),
        borderColor: "rgb(255, 99, 132)",
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
      </div>
    </div>
  );
};
