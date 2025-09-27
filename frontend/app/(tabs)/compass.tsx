import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useCompass } from '../../hooks/useCompass';
import CompassWidget from '../../components/CompassWidget';
import DarshanOverlay from '../../components/DarshanOverlay';
import * as Haptics from 'expo-haptics';

export default function CompassScreen() {
  const {
    heading,
    userLocation,
    targetLocation,
    isAligned,
    turnDirection,
    turnAngle,
    distance,
    isLoading,
    error,
    permissionGranted,
    shouldShowDarshan,
    closeDarshan,
    resetDarshanState,
  } = useCompass();

  // Handle permission request
  const handlePermissionRequest = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      // The hook will automatically request permissions on mount
      // This is just for user feedback
      Alert.alert(
        'Location Permission Required',
        'Please enable location permissions in your device settings to use the compass.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error handling permission request:', error);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF5722" />
          <Text style={styles.loadingText}>Initializing compass...</Text>
          <Text style={styles.subText}>Getting your location and connecting to services</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show error state
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={64} color="#FF5722" />
          <Text style={styles.errorTitle}>Compass Error</Text>
          <Text style={styles.errorText}>{error}</Text>
          {!permissionGranted && (
            <TouchableOpacity style={styles.permissionButton} onPress={handlePermissionRequest}>
              <MaterialIcons name="location-on" size={24} color="white" />
              <Text style={styles.permissionButtonText}>Enable Location</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    );
  }

  // Show no location data state
  if (!userLocation || !targetLocation) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <MaterialIcons name="location-searching" size={64} color="#FF5722" />
          <Text style={styles.loadingText}>Searching for location...</Text>
          <Text style={styles.subText}>
            {!userLocation && 'Getting your GPS location...'}
            {!targetLocation && 'Connecting to Appaji\'s location...'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Info */}
      <View style={styles.header}>
        <Text style={styles.title}>Find Appaji</Text>
        <Text style={styles.subtitle}>
          {targetLocation.address || 'Avadhoota Datta Peetham'}
        </Text>
        
        {/* Distance Display */}
        <View style={styles.distanceContainer}>
          <MaterialIcons name="place" size={20} color="#FF5722" />
          <Text style={styles.distanceText}>
            {distance < 1 
              ? `${(distance * 1000).toFixed(0)}m away`
              : `${distance.toFixed(1)}km away`
            }
          </Text>
        </View>
      </View>

      {/* Main Compass */}
      <View style={styles.compassContainer}>
        <CompassWidget
          heading={heading}
          targetBearing={0} // This will be calculated in the compass widget based on bearing data
          isAligned={isAligned}
          turnDirection={turnDirection}
          turnAngle={turnAngle}
        />
      </View>

      {/* Status Information */}
      <View style={styles.statusContainer}>
        <View style={styles.statusRow}>
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>Heading</Text>
            <Text style={styles.statusValue}>{Math.round(heading)}°</Text>
          </View>
          
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>Accuracy</Text>
            <Text style={styles.statusValue}>
              {userLocation.accuracy ? `±${Math.round(userLocation.accuracy)}m` : 'N/A'}
            </Text>
          </View>
          
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>Status</Text>
            <Text style={[styles.statusValue, { color: isAligned ? '#4CAF50' : '#FF5722' }]}>
              {isAligned ? 'Aligned' : 'Searching'}
            </Text>
          </View>
        </View>
        
        {/* Alignment Instruction */}
        {!isAligned && (
          <View style={styles.instructionContainer}>
            <MaterialIcons 
              name={turnDirection === 'left' ? 'keyboard-arrow-left' : 'keyboard-arrow-right'} 
              size={32} 
              color="#FF5722" 
            />
            <Text style={styles.instructionText}>
              Turn {turnDirection} by {Math.round(turnAngle)}° to align with Appaji
            </Text>
          </View>
        )}
        
        {isAligned && (
          <View style={styles.alignedContainer}>
            <MaterialIcons name="check-circle" size={32} color="#4CAF50" />
            <Text style={styles.alignedText}>
              Perfect alignment! You are facing towards Appaji 🙏
            </Text>
          </View>
        )}
      </View>

      {/* Reset Button */}
      {shouldShowDarshan && (
        <TouchableOpacity style={styles.resetButton} onPress={resetDarshanState}>
          <MaterialIcons name="refresh" size={24} color="white" />
          <Text style={styles.resetButtonText}>Reset Alignment</Text>
        </TouchableOpacity>
      )}

      {/* Darshan Overlay */}
      <DarshanOverlay
        visible={shouldShowDarshan}
        onClose={closeDarshan}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginTop: 16,
    textAlign: 'center',
  },
  subText: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF5722',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  permissionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF5722',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  permissionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#999',
    marginBottom: 12,
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 87, 34, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  distanceText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF5722',
    marginLeft: 8,
  },
  compassContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  statusContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  statusItem: {
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  statusValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  instructionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 87, 34, 0.1)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  instructionText: {
    fontSize: 16,
    color: '#FF5722',
    fontWeight: '600',
    marginLeft: 8,
    textAlign: 'center',
  },
  alignedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  alignedText: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '600',
    marginLeft: 8,
    textAlign: 'center',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#666',
    marginHorizontal: 20,
    marginBottom: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  resetButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});