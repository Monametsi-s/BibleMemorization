import React, { createContext, useContext, useState, useEffect } from 'react';
import { initDatabase, getUserProgress, getStatistics, getAchievements } from '../services/database';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [userProgress, setUserProgress] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      initDatabase();
      await refreshData();
      setLoading(false);
    } catch (error) {
      console.error('Failed to initialize app:', error);
      setLoading(false);
    }
  };

  const refreshData = async () => {
    const progress = getUserProgress();
    const stats = getStatistics();
    const ach = getAchievements();

    setUserProgress(progress);
    setStatistics(stats);
    setAchievements(ach);
  };

  return (
    <AppContext.Provider
      value={{
        userProgress,
        statistics,
        achievements,
        loading,
        refreshData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
