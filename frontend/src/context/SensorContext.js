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
  const [sensorData, setSensorData] = useState(null);
  const [connectionState, setConnectionState] = useState({
    isConnected: false,
    port: "COM1",
    baudRate: 9600,
  });
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [timeWindow, setTimeWindow] = useState(60);
  const [socket, setSocket] = useState(null);

  const connect = useCallback((port, baudRate) => {
    const newSocket = io("http://127.0.0.1:5000");

    newSocket.on("connect", () => {
      setConnectionState({ isConnected: true, port, baudRate });
      newSocket.emit("start_process");
    });

    newSocket.on("disconnect", () => {
      setConnectionState((prev) => ({ ...prev, isConnected: false }));
    });

    newSocket.on("output_data", (data) => {
      setSensorData(data.result);
    });

    setSocket(newSocket);
  }, []);

  const disconnect = useCallback(() => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
      setConnectionState((prev) => ({ ...prev, isConnected: false }));
    }
  }, [socket]);

  const startMonitoring = useCallback(() => {
    setIsMonitoring(true);
  }, []);

  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false);
  }, []);

  const clearData = useCallback(() => {
    setSensorData(null);
  }, []);

  useEffect(() => {
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [socket]);

  const value = {
    sensorData,
    connectionState,
    isMonitoring,
    timeWindow,
    connect,
    disconnect,
    startMonitoring,
    stopMonitoring,
    clearData,
    setTimeWindow,
  };

  return (
    <SensorContext.Provider value={value}>{children}</SensorContext.Provider>
  );
};
