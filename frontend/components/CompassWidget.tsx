import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Svg, { Circle, Line, Text as SvgText, G } from 'react-native-svg';

interface CompassWidgetProps {
  heading: number;
  targetBearing: number;
  isAligned: boolean;
  turnDirection?: 'left' | 'right';
  turnAngle?: number;
  size?: number;
}

const { width } = Dimensions.get('window');
const DEFAULT_SIZE = Math.min(width * 0.8, 300);

export default function CompassWidget({
  heading,
  targetBearing,
  isAligned,
  turnDirection,
  turnAngle,
  size = DEFAULT_SIZE,
}: CompassWidgetProps) {
  const radius = size / 2 - 20;
  const center = size / 2;

  // Calculate positions for direction markers
  const getMarkerPosition = (angle: number, distance: number) => {
    const radian = (angle - 90) * (Math.PI / 180); // -90 to make 0° point up
    return {
      x: center + Math.cos(radian) * distance,
      y: center + Math.sin(radian) * distance,
    };
  };

  // Main compass directions
  const directions = [
    { angle: 0, label: 'N' },
    { angle: 90, label: 'E' },
    { angle: 180, label: 'S' },
    { angle: 270, label: 'W' },
  ];

  // Target indicator position (relative to compass, not device rotation)
  const targetPos = getMarkerPosition(targetBearing - heading, radius - 10);
  
  // North indicator position (always at top when heading is 0)
  const northPos = getMarkerPosition(-heading, radius - 10);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        {/* Outer circle */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={isAligned ? '#4CAF50' : '#2196F3'}
          strokeWidth="3"
          fill="none"
        />
        
        {/* Inner circle */}
        <Circle
          cx={center}
          cy={center}
          r={radius - 30}
          stroke={isAligned ? '#4CAF50' : '#2196F3'}
          strokeWidth="1"
          fill="none"
          opacity={0.3}
        />
        
        {/* Degree markings */}
        {Array.from({ length: 36 }, (_, i) => {
          const angle = i * 10;
          const outerPos = getMarkerPosition(angle - heading, radius - 5);
          const innerPos = getMarkerPosition(angle - heading, radius - (i % 9 === 0 ? 20 : 15));
          
          return (
            <Line
              key={i}
              x1={outerPos.x}
              y1={outerPos.y}
              x2={innerPos.x}
              y2={innerPos.y}
              stroke={isAligned ? '#4CAF50' : '#666'}
              strokeWidth={i % 9 === 0 ? '2' : '1'}
            />
          );
        })}
        
        {/* Direction labels */}
        {directions.map(({ angle, label }) => {
          const pos = getMarkerPosition(angle - heading, radius - 35);
          return (
            <SvgText
              key={label}
              x={pos.x}
              y={pos.y + 5}
              textAnchor="middle"
              fontSize="16"
              fontWeight="bold"
              fill={isAligned ? '#4CAF50' : '#2196F3'}
            >
              {label}
            </SvgText>
          );
        })}
        
        {/* Target direction indicator (Appaji's direction) */}
        <Circle
          cx={targetPos.x}
          cy={targetPos.y}
          r="8"
          fill={isAligned ? '#4CAF50' : '#FF5722'}
          stroke="white"
          strokeWidth="2"
        />
        
        {/* Center dot (device position) */}
        <Circle
          cx={center}
          cy={center}
          r="6"
          fill={isAligned ? '#4CAF50' : '#2196F3'}
        />
        
        {/* Heading line */}
        <Line
          x1={center}
          y1={center}
          x2={center}
          y2={center - radius + 30}
          stroke={isAligned ? '#4CAF50' : '#2196F3'}
          strokeWidth="3"
          strokeLinecap="round"
        />
      </Svg>
      
      {/* Status overlay */}
      <View style={styles.statusOverlay}>
        <Text style={[styles.headingText, { color: isAligned ? '#4CAF50' : '#2196F3' }]}>
          {Math.round(heading)}°
        </Text>
        
        {!isAligned && turnDirection && turnAngle && (
          <View style={styles.turnIndicator}>
            <MaterialIcons
              name={turnDirection === 'left' ? 'keyboard-arrow-left' : 'keyboard-arrow-right'}
              size={32}
              color="#FF5722"
            />
            <Text style={styles.turnText}>
              Turn {turnDirection} {Math.round(turnAngle)}°
            </Text>
          </View>
        )}
        
        {isAligned && (
          <View style={styles.alignedIndicator}>
            <MaterialIcons name="check-circle" size={32} color="#4CAF50" />
            <Text style={styles.alignedText}>Aligned with Appaji</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  statusOverlay: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headingText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  turnIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  turnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF5722',
    marginLeft: 4,
  },
  alignedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  alignedText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
    marginLeft: 4,
  },
});