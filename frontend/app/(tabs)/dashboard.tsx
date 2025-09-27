import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useCompass } from '../../hooks/useCompass';
import { TouchableOpacity } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';

export default function DashboardScreen() {
  const {
    heading,
    userLocation,
    targetLocation,
    bearingData,
    isAligned,
    distance,
    isLoading,
    error,
    permissionGranted,
  } = useCompass();

  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Simulate refresh - in a real app, you might refetch data
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const showLocationDetails = () => {
    if (!userLocation || !targetLocation) return;
    
    const details = `
Your Location:
Latitude: ${userLocation.latitude.toFixed(6)}
Longitude: ${userLocation.longitude.toFixed(6)}
Accuracy: ${userLocation.accuracy ? `±${Math.round(userLocation.accuracy)}m` : 'N/A'}

Appaji's Location:
Latitude: ${targetLocation.latitude.toFixed(6)}
Longitude: ${targetLocation.longitude.toFixed(6)}
Address: ${targetLocation.address || 'N/A'}

Bearing: ${bearingData ? Math.round(bearingData.bearing) : 'N/A'}°
Distance: ${distance.toFixed(2)}km`;
    
    Alert.alert('Location Details', details, [{ text: 'OK' }]);
  };

  const formatTimestamp = (timestamp?: number) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleString();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#FF5722"
            colors={['#FF5722']}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Compass Dashboard</Text>
          <Text style={styles.subtitle}>Real-time status and information</Text>
        </View>

        {/* Status Cards */}
        <View style={styles.cardsContainer}>
          {/* Compass Status Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <MaterialIcons name="explore" size={24} color="#FF5722" />
              <Text style={styles.cardTitle}>Compass Status</Text>
            </View>
            <View style={styles.cardContent}>
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>Current Heading:</Text>
                <Text style={styles.statusValue}>{Math.round(heading)}°</Text>
              </View>
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>Target Bearing:</Text>
                <Text style={styles.statusValue}>
                  {bearingData ? `${Math.round(bearingData.bearing)}°` : 'Calculating...'}
                </Text>
              </View>
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>Alignment:</Text>
                <Text style={[styles.statusValue, { color: isAligned ? '#4CAF50' : '#FF5722' }]}>
                  {isAligned ? 'Aligned ✓' : 'Not Aligned'}
                </Text>
              </View>
            </View>
          </View>

          {/* Location Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <MaterialIcons name="location-on" size={24} color="#2196F3" />
              <Text style={styles.cardTitle}>Location Info</Text>
            </View>
            <View style={styles.cardContent}>
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>Distance to Appaji:</Text>
                <Text style={styles.statusValue}>
                  {distance < 1 
                    ? `${(distance * 1000).toFixed(0)}m`
                    : `${distance.toFixed(1)}km`
                  }
                </Text>
              </View>
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>GPS Accuracy:</Text>
                <Text style={styles.statusValue}>
                  {userLocation?.accuracy ? `±${Math.round(userLocation.accuracy)}m` : 'N/A'}
                </Text>
              </View>
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>Last Updated:</Text>
                <Text style={styles.statusValue}>
                  {formatTimestamp(userLocation?.timestamp)}
                </Text>
              </View>
              <TouchableOpacity style={styles.detailsButton} onPress={showLocationDetails}>
                <MaterialIcons name="info" size={16} color="#2196F3" />
                <Text style={styles.detailsButtonText}>View Details</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Target Location Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <MaterialIcons name="place" size={24} color="#4CAF50" />
              <Text style={styles.cardTitle}>Appaji's Location</Text>
            </View>
            <View style={styles.cardContent}>
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>Address:</Text>
                <Text style={[styles.statusValue, styles.addressText]}>
                  {targetLocation?.address || 'Avadhoota Datta Peetham'}
                </Text>
              </View>
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>Coordinates:</Text>
                <Text style={styles.statusValue}>
                  {targetLocation 
                    ? `${targetLocation.latitude.toFixed(4)}, ${targetLocation.longitude.toFixed(4)}`
                    : 'Loading...'}
                </Text>
              </View>
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>Last Updated:</Text>
                <Text style={styles.statusValue}>
                  {targetLocation?.updated_at 
                    ? new Date(targetLocation.updated_at).toLocaleString()
                    : 'N/A'}
                </Text>
              </View>
            </View>
          </View>

          {/* System Status Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <MaterialIcons name="settings" size={24} color="#9C27B0" />
              <Text style={styles.cardTitle}>System Status</Text>
            </View>
            <View style={styles.cardContent}>
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>Location Permission:</Text>
                <Text style={[styles.statusValue, { color: permissionGranted ? '#4CAF50' : '#FF5722' }]}>
                  {permissionGranted ? 'Granted ✓' : 'Not Granted'}
                </Text>
              </View>
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>GPS Status:</Text>
                <Text style={[styles.statusValue, { color: userLocation ? '#4CAF50' : '#FF5722' }]}>
                  {userLocation ? 'Active ✓' : 'Searching...'}
                </Text>
              </View>
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>Connection:</Text>
                <Text style={[styles.statusValue, { color: targetLocation ? '#4CAF50' : '#FF5722' }]}>
                  {targetLocation ? 'Connected ✓' : 'Connecting...'}
                </Text>
              </View>
              {error && (
                <View style={styles.errorRow}>
                  <MaterialIcons name="error" size={16} color="#FF5722" />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  scrollView: {
    flex: 1,
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
  },
  cardsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 8,
  },
  cardContent: {
    gap: 8,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  statusLabel: {
    fontSize: 14,
    color: '#999',
    flex: 1,
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'right',
    flex: 1,
  },
  addressText: {
    fontSize: 12,
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(33, 150, 243, 0.1)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  detailsButtonText: {
    color: '#2196F3',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 87, 34, 0.1)',
    padding: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  errorText: {
    color: '#FF5722',
    fontSize: 12,
    marginLeft: 8,
    flex: 1,
  },
});