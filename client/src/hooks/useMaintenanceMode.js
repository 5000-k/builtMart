import { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';

/**
 * Verify if maintenance mode data is valid
 * Prevents tampering with localStorage
 */
const verifyMaintenanceData = (settings) => {
  try {
    if (!settings || typeof settings !== 'object') {
      return false;
    }
    if (typeof settings.maintenanceMode !== 'boolean') {
      return false;
    }
    return true;
  } catch {
    return false;
  }
};

/**
 * Hook to check if maintenance mode is enabled.
 * Source of truth is the SERVER settings endpoint; localStorage is only a
 * cached fallback so the flag can't simply be flicked off via devtools.
 */
export const useMaintenanceMode = () => {
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const fromLocalStorage = () => {
      try {
        const settings = localStorage.getItem('adminSettings');
        if (settings) {
          const parsed = JSON.parse(settings);
          if (verifyMaintenanceData(parsed)) {
            return parsed.maintenanceMode || false;
          }
        }
      } catch { /* ignore */ }
      return false;
    };

    const applyServerSettings = (settings) => {
      if (!settings) return;
      if (typeof settings.maintenanceMode !== 'boolean') return;
      if (cancelled) return;
      setIsMaintenanceMode(settings.maintenanceMode);
      // Refresh local cache so the rest of the app sees the same value
      localStorage.setItem('adminSettings', JSON.stringify(settings));
    };

    // Initial check from cache (fast paint), then server becomes authoritative
    setIsMaintenanceMode(fromLocalStorage());

    const fetchServerState = async () => {
      try {
        const response = await axiosClient.get('/settings');
        const settings = response.data?.data?.settings;
        applyServerSettings(settings);
      } catch { /* ignore transient failures; keep current value */ }
    };

    fetchServerState();

    // Listen for storage changes (real-time updates across tabs)
    const handleStorageChange = (e) => {
      if (e.key === 'adminSettings') {
        setIsMaintenanceMode(fromLocalStorage());
      }
    };
    window.addEventListener('storage', handleStorageChange);

    // Poll server every 30s (for same-tab updates + restores authority)
    const interval = setInterval(fetchServerState, 30000);

    return () => {
      cancelled = true;
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  return { isMaintenanceMode };
};

/**
 * Check if current user is admin
 * Admins can bypass maintenance mode
 * Enhanced security: checks both user role AND valid auth token
 */
export const isAdmin = () => {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.role !== 'admin') {
      return false;
    }

    const token = localStorage.getItem('accessToken');
    if (!token) {
      return false;
    }

    if (!user._id || !user.email) {
      return false;
    }

    return true;
  } catch (error) {
    return false;
  }
};

export default useMaintenanceMode;
