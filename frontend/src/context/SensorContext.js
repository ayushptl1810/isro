import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { io } from "socket.io-client";

const SensorContext = createContext(null);

export const useSensorData = () => {
  const context = useContext(SensorContext);
  if (!context) {
    throw new Error("useSensorData must be used within a SensorProvider");
  }
  return context;
};

export const SensorProvider = ({ children }) => {
  const [sensorData, setSensorData] = useState({
    D0: null,
    D1: null,
    F: null,
    I: null,
    G: null,
  });
  const [historicalData, setHistoricalData] = useState({
    timestamps: [],
    values: {
      D0: [],
      D1: [],
      F: [],
      I: [],
      G: [],
    },
  });
  const [connectionState, setConnectionState] = useState({
    isConnected: false,
    port: "COM1",
    baudRate: 9600,
  });
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [timeWindow, setTimeWindow] = useState(60);
  const [socket, setSocket] = useState(null);

  // Update sensor data while preserving existing values
  const updateSensorData = useCallback(
    (newData) => {
      const timestamp = Date.now();
      setSensorData((prevData) => {
        const updatedData = { ...prevData };
        // Update only the fields that are present in newData
        Object.keys(newData).forEach((key) => {
          if (newData[key] !== null && newData[key] !== undefined) {
            updatedData[key] = newData[key];
          }
        });
        return updatedData;
      });

      // Update historical data
      setHistoricalData((prev) => {
        const newTimestamps = [...prev.timestamps, timestamp];
        const newValues = { ...prev.values };

        // Keep only last timeWindow seconds of data
        const cutoffTime = timestamp - timeWindow * 1000;
        const validIndices = newTimestamps
          .map((t, i) => ({ t, i }))
          .filter(({ t }) => t >= cutoffTime)
          .map(({ i }) => i);

        // Update each sensor type's historical data
        Object.keys(newData).forEach((key) => {
          if (newData[key] !== null && newData[key] !== undefined) {
            newValues[key] = [
              ...prev.values[key].filter((_, i) => validIndices.includes(i)),
              newData[key],
            ];
          }
        });

        return {
          timestamps: newTimestamps.filter((_, i) => validIndices.includes(i)),
          values: newValues,
        };
      });
    },
    [timeWindow]
  );

  const connect = useCallback(
    (port, baudRate) => {
      console.log("Frontend: Creating new socket connection...");
      const newSocket = io("http://127.0.0.1:5000", {
        transports: ["websocket"],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      newSocket.on("connect", () => {
        console.log("Frontend: Socket connected, sending start_connection...");
        newSocket.emit("start_connection", { port, baudRate });
      });

      newSocket.on("connect_error", (error) => {
        console.error("Frontend: Connection error:", error);
        setConnectionState((prev) => ({ ...prev, isConnected: false }));
      });

      newSocket.on("connection_established", () => {
        console.log("Frontend: Connection established with backend");
        setConnectionState({ isConnected: true, port, baudRate });
      });

      newSocket.on("connection_failed", (error) => {
        console.error("Frontend: Connection failed:", error);
        newSocket.disconnect();
        setConnectionState((prev) => ({ ...prev, isConnected: false }));
      });

      newSocket.on("disconnect", () => {
        console.log("Frontend: Socket disconnected");
        setConnectionState((prev) => ({ ...prev, isConnected: false }));
      });

      newSocket.on("output_data", (data) => {
        console.log("Frontend: Received sensor data:", data);
        updateSensorData(data.result);
      });

      setSocket(newSocket);
    },
    [updateSensorData]
  );

  const disconnect = useCallback(() => {
    if (socket) {
      socket.emit("stop_connection");
      socket.disconnect();
      setSocket(null);
      setConnectionState((prev) => ({ ...prev, isConnected: false }));
    }
  }, [socket]);

  const resetData = useCallback(() => {
    console.log("Resetting all sensor data...");
    // Reset current sensor data
    setSensorData({
      D0: null,
      D1: null,
      F: null,
      I: null,
      G: null,
    });
    // Reset historical data
    setHistoricalData({
      timestamps: [],
      values: {
        D0: [],
        D1: [],
        F: [],
        I: [],
        G: [],
      },
    });
  }, []);

  const startMonitoring = useCallback(() => {
    if (socket) {
      socket.emit("start_monitoring");
      setIsMonitoring(true);
    }
  }, [socket]);

  const stopMonitoring = useCallback(() => {
    if (socket) {
      socket.emit("stop_monitoring");
      setIsMonitoring(false);
    }
  }, [socket]);

  useEffect(() => {
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [socket]);

  const value = {
    sensorData,
    historicalData,
    connectionState,
    isMonitoring,
    timeWindow,
    connect,
    disconnect,
    startMonitoring,
    stopMonitoring,
    resetData,
    setTimeWindow,
  };

  return (
    <SensorContext.Provider value={value}>{children}</SensorContext.Provider>
  );
};
