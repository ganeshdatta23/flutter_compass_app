import * as Location from 'expo-location';
import { LocationData } from './supabaseService';

export interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp?: number;
}

export interface BearingData {
  bearing: number;
  distance: number;
  userLocation: UserLocation;
  targetLocation: LocationData;
}

export class LocationService {
  private static watchId: Location.LocationSubscription | null = null;

  // Request location permissions
  static async requestPermissions(): Promise<boolean> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting location permissions:', error);
      return false;
    }
  }

  // Get current location
  static async getCurrentLocation(): Promise<UserLocation | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error('Location permission not granted');
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy || undefined,
        timestamp: location.timestamp,
      };
    } catch (error) {
      console.error('Error getting current location:', error);
      return null;
    }
  }

  // Start watching location changes
  static async startWatchingLocation(callback: (location: UserLocation) => void): Promise<boolean> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error('Location permission not granted');
      }

      this.watchId = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 1000, // Update every second
          distanceInterval: 1, // Update every meter
        },
        (location) => {
          callback({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            accuracy: location.coords.accuracy || undefined,
            timestamp: location.timestamp,
          });
        }
      );

      return true;
    } catch (error) {
      console.error('Error starting location watch:', error);
      return false;
    }
  }

  // Stop watching location
  static stopWatchingLocation(): void {
    if (this.watchId) {
      this.watchId.remove();
      this.watchId = null;
    }
  }

  // Calculate bearing between two coordinates using Haversine formula
  static calculateBearing(userLat: number, userLon: number, targetLat: number, targetLon: number): number {
    const toRadians = (degrees: number) => degrees * (Math.PI / 180);
    const toDegrees = (radians: number) => radians * (180 / Math.PI);

    const φ1 = toRadians(userLat);
    const φ2 = toRadians(targetLat);
    const Δλ = toRadians(targetLon - userLon);

    const y = Math.sin(Δλ) * Math.cos(φ2);
    const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);

    const θ = Math.atan2(y, x);

    // Convert to degrees and normalize to 0-360
    const bearing = (toDegrees(θ) + 360) % 360;
    return bearing;
  }

  // Calculate distance between two coordinates using Haversine formula
  static calculateDistance(userLat: number, userLon: number, targetLat: number, targetLon: number): number {
    const toRadians = (degrees: number) => degrees * (Math.PI / 180);
    const R = 6371; // Earth's radius in kilometers

    const φ1 = toRadians(userLat);
    const φ2 = toRadians(targetLat);
    const Δφ = toRadians(targetLat - userLat);
    const Δλ = toRadians(targetLon - userLon);

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in kilometers
  }

  // Calculate bearing and distance data
  static calculateBearingData(userLocation: UserLocation, targetLocation: LocationData): BearingData {
    const bearing = this.calculateBearing(
      userLocation.latitude,
      userLocation.longitude,
      targetLocation.latitude,
      targetLocation.longitude
    );

    const distance = this.calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      targetLocation.latitude,
      targetLocation.longitude
    );

    return {
      bearing,
      distance,
      userLocation,
      targetLocation,
    };
  }

  // Check if bearing is within alignment threshold (default 20 degrees)
  static isAligned(currentHeading: number, targetBearing: number, threshold: number = 20): boolean {
    const diff = Math.abs(currentHeading - targetBearing);
    return Math.min(diff, 360 - diff) <= threshold;
  }

  // Get turn direction and angle
  static getTurnDirection(currentHeading: number, targetBearing: number): { direction: 'left' | 'right', angle: number } {
    let diff = targetBearing - currentHeading;
    
    // Normalize to -180 to 180
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    
    return {
      direction: diff > 0 ? 'right' : 'left',
      angle: Math.abs(diff)
    };
  }
}