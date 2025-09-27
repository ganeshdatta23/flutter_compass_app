import { useState, useEffect, useRef } from 'react';
import { Magnetometer } from 'expo-sensors';
import * as Haptics from 'expo-haptics';
import { LocationService, UserLocation, BearingData } from '../services/locationService';
import { SupabaseService, LocationData } from '../services/supabaseService';
import { AppState, AppStateStatus } from 'react-native';

export interface CompassData {
  heading: number;
  userLocation: UserLocation | null;
  targetLocation: LocationData | null;
  bearingData: BearingData | null;
  isAligned: boolean;
  turnDirection: 'left' | 'right' | null;
  turnAngle: number;
  distance: number;
  isLoading: boolean;
  error: string | null;
  permissionGranted: boolean;
}

export function useCompass() {
  const [compassData, setCompassData] = useState<CompassData>({
    heading: 0,
    userLocation: null,
    targetLocation: null,
    bearingData: null,
    isAligned: false,
    turnDirection: null,
    turnAngle: 0,
    distance: 0,
    isLoading: true,
    error: null,
    permissionGranted: false,
  });

  const [wasAligned, setWasAligned] = useState(false);
  const [manuallyClosedDarshan, setManuallyClosedDarshan] = useState(false);
  const lastHapticTime = useRef(0);
  const locationUpdateInterval = useRef<NodeJS.Timeout | null>(null);
  const motionSubscription = useRef<any>(null);

  // Initialize compass and location services
  useEffect(() => {
    let mounted = true;

    const initializeServices = async () => {
      try {
        // Request location permissions
        const hasPermission = await LocationService.requestPermissions();
        if (!mounted) return;

        if (!hasPermission) {
          setCompassData(prev => ({
            ...prev,
            error: 'Location permission is required for compass functionality',
            isLoading: false,
            permissionGranted: false,
          }));
          return;
        }

        setCompassData(prev => ({ ...prev, permissionGranted: true }));

        // Get initial target location from Supabase
        const targetLocation = await SupabaseService.getSwamijiLocation();
        if (!mounted) return;

        if (!targetLocation) {
          // Use default location if not found in database
          const defaultLocation: LocationData = {
            id: 'swamiji_location',
            latitude: 12.308367,
            longitude: 76.645467,
            address: 'Avadhoota Datta Peetham',
            updated_at: new Date().toISOString(),
          };
          setCompassData(prev => ({ ...prev, targetLocation: defaultLocation }));
        } else {
          setCompassData(prev => ({ ...prev, targetLocation }));
        }

        // Get initial user location
        const userLocation = await LocationService.getCurrentLocation();
        if (!mounted) return;

        if (userLocation) {
          setCompassData(prev => ({ ...prev, userLocation }));
        }

        // Start location updates
        const locationStarted = await LocationService.startWatchingLocation((location) => {
          if (!mounted) return;
          setCompassData(prev => ({ ...prev, userLocation: location }));
        });

        if (!locationStarted) {
          setCompassData(prev => ({
            ...prev,
            error: 'Failed to start location tracking',
          }));
        }

        // Start device motion (compass) updates
        const isAvailable = await DeviceMotion.isAvailableAsync();
        if (isAvailable) {
          DeviceMotion.setUpdateInterval(100); // Update every 100ms
          motionSubscription.current = DeviceMotion.addListener((motionData) => {
            if (!mounted) return;
            
            // Extract heading from device motion
            // Note: This is a simplified approach. In production, you might want to use
            // expo-sensors Magnetometer for more accurate compass readings
            const { rotation } = motionData;
            if (rotation) {
              const heading = ((rotation.gamma || 0) * 180 / Math.PI + 360) % 360;
              setCompassData(prev => ({ ...prev, heading }));
            }
          });
        }

        setCompassData(prev => ({ ...prev, isLoading: false }));
      } catch (error) {
        if (!mounted) return;
        console.error('Error initializing compass services:', error);
        setCompassData(prev => ({
          ...prev,
          error: 'Failed to initialize compass services',
          isLoading: false,
        }));
      }
    };

    initializeServices();

    // Set up periodic target location updates (every 30 seconds)
    locationUpdateInterval.current = setInterval(async () => {
      if (!mounted) return;
      const targetLocation = await SupabaseService.getSwamijiLocation();
      if (targetLocation && mounted) {
        setCompassData(prev => ({ ...prev, targetLocation }));
      }
    }, 30000);

    return () => {
      mounted = false;
      LocationService.stopWatchingLocation();
      if (motionSubscription.current) {
        motionSubscription.current.remove();
      }
      if (locationUpdateInterval.current) {
        clearInterval(locationUpdateInterval.current);
      }
    };
  }, []);

  // Calculate bearing and alignment when location or heading changes
  useEffect(() => {
    if (!compassData.userLocation || !compassData.targetLocation) return;

    const bearingData = LocationService.calculateBearingData(
      compassData.userLocation,
      compassData.targetLocation
    );

    const isAligned = LocationService.isAligned(compassData.heading, bearingData.bearing, 20);
    const turnInfo = LocationService.getTurnDirection(compassData.heading, bearingData.bearing);

    setCompassData(prev => ({
      ...prev,
      bearingData,
      isAligned,
      turnDirection: isAligned ? null : turnInfo.direction,
      turnAngle: turnInfo.angle,
      distance: bearingData.distance,
    }));

    // Handle haptic feedback for alignment
    if (isAligned && !wasAligned && !manuallyClosedDarshan) {
      const now = Date.now();
      if (now - lastHapticTime.current > 2000) { // Prevent too frequent haptics
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        lastHapticTime.current = now;
      }
      setWasAligned(true);
    } else if (!isAligned && wasAligned) {
      setWasAligned(false);
    }
  }, [compassData.heading, compassData.userLocation, compassData.targetLocation, wasAligned, manuallyClosedDarshan]);

  // Handle app state changes (pause/resume)
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'background') {
        // Pause location updates to save battery
        LocationService.stopWatchingLocation();
        if (motionSubscription.current) {
          motionSubscription.current.remove();
          motionSubscription.current = null;
        }
      } else if (nextAppState === 'active') {
        // Resume location updates
        LocationService.startWatchingLocation((location) => {
          setCompassData(prev => ({ ...prev, userLocation: location }));
        });
        
        // Resume motion updates
        DeviceMotion.isAvailableAsync().then((isAvailable) => {
          if (isAvailable && !motionSubscription.current) {
            motionSubscription.current = DeviceMotion.addListener((motionData) => {
              const { rotation } = motionData;
              if (rotation) {
                const heading = ((rotation.gamma || 0) * 180 / Math.PI + 360) % 360;
                setCompassData(prev => ({ ...prev, heading }));
              }
            });
          }
        });
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, []);

  // Methods for darshan management
  const closeDarshan = () => {
    setManuallyClosedDarshan(true);
    setWasAligned(false);
  };

  const resetDarshanState = () => {
    setManuallyClosedDarshan(false);
    setWasAligned(false);
  };

  // Check if darshan should be shown
  const shouldShowDarshan = compassData.isAligned && !manuallyClosedDarshan;

  return {
    ...compassData,
    shouldShowDarshan,
    closeDarshan,
    resetDarshanState,
  };
}