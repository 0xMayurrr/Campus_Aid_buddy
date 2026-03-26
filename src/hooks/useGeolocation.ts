import { useState, useCallback } from 'react';

interface TicketLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
  address: string;
  campusZone: string;
  timestamp: Date;
}

interface GeolocationState {
  location: TicketLocation | null;
  error: string | null;
  isLoading: boolean;
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    location: null,
    error: null,
    isLoading: false,
  });

  const getLocation = useCallback(async (): Promise<TicketLocation | null> => {
    if (!navigator.geolocation) {
      setState({ location: null, error: 'Geolocation not supported by your browser', isLoading: false });
      return null;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude, accuracy } = position.coords;

          // Reverse geocode using OpenStreetMap (free, no API key)
          let address = `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
          let campusZone = 'Main Campus';
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
            );
            const data = await res.json();
            if (data?.display_name) {
              address = data.display_name;
            }
            // Simple campus zone detection
            if (latitude > 10.97) campusZone = 'North Campus';
            else if (latitude < 10.96) campusZone = 'South Campus';
            else campusZone = 'Main Campus';
          } catch { }

          const locationData: TicketLocation = { latitude, longitude, accuracy, address, campusZone, timestamp: new Date() };
          setState({ location: locationData, error: null, isLoading: false });
          resolve(locationData);
        },
        (error) => {
          const msg =
            error.code === error.PERMISSION_DENIED ? 'Location permission denied. Please allow access.' :
            error.code === error.POSITION_UNAVAILABLE ? 'Location unavailable. Try again.' :
            'Location request timed out.';
          setState({ location: null, error: msg, isLoading: false });
          resolve(null);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });
  }, []);

  const clearLocation = useCallback(() => {
    setState({ location: null, error: null, isLoading: false });
  }, []);

  return { ...state, getLocation, clearLocation };
}