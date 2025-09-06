import React, { createContext, useContext, useState, useEffect } from 'react';

interface MaintenanceContextType {
  isMaintenanceMode: boolean;
  setMaintenanceMode: (enabled: boolean) => void;
  maintenanceMessage: string;
  setMaintenanceMessage: (message: string) => void;
}

const MaintenanceContext = createContext<MaintenanceContextType | undefined>(undefined);

export const useMaintenanceMode = () => {
  const context = useContext(MaintenanceContext);
  if (!context) {
    throw new Error('useMaintenanceMode must be used within a MaintenanceProvider');
  }
  return context;
};

interface MaintenanceProviderProps {
  children: React.ReactNode;
}

export const MaintenanceProvider: React.FC<MaintenanceProviderProps> = ({ children }) => {
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState(
    'እያሻሻልን ነው። እባክዎ ትንሽ ይጠብቁ። / We are updating. Please wait a moment.'
  );

  useEffect(() => {
    // Check environment variable for maintenance mode
    const envMaintenanceMode = import.meta.env.VITE_MAINTENANCE_MODE === 'true';
    
    // Clear localStorage maintenance mode to ensure it's off
    localStorage.removeItem('maintenanceMode');
    
    // Use only env variable (which is false)
    setIsMaintenanceMode(envMaintenanceMode);
    
    // Check for custom maintenance message
    const storedMessage = localStorage.getItem('maintenanceMessage');
    if (storedMessage) {
      setMaintenanceMessage(storedMessage);
    }
  }, []);

  const setMaintenanceMode = (enabled: boolean) => {
    setIsMaintenanceMode(enabled);
    localStorage.setItem('maintenanceMode', enabled.toString());
  };

  const setMaintenanceMessageHandler = (message: string) => {
    setMaintenanceMessage(message);
    localStorage.setItem('maintenanceMessage', message);
  };

  return (
    <MaintenanceContext.Provider
      value={{
        isMaintenanceMode,
        setMaintenanceMode,
        maintenanceMessage,
        setMaintenanceMessage: setMaintenanceMessageHandler,
      }}
    >
      {children}
    </MaintenanceContext.Provider>
  );
};