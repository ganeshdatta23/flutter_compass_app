import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { Video, Audio, AVPlaybackStatus } from 'expo-av';
import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface DarshanOverlayProps {
  visible: boolean;
  onClose: () => void;
}

const { width, height } = Dimensions.get('window');

export default function DarshanOverlay({ visible, onClose }: DarshanOverlayProps) {
  const [videoStatus, setVideoStatus] = useState<AVPlaybackStatus | null>(null);
  const [audioStatus, setAudioStatus] = useState<AVPlaybackStatus | null>(null);
  const videoRef = useRef<Video>(null);
  const audioRef = useRef<Audio.Sound | null>(null);
  const insets = useSafeAreaInsets();

  // Initialize audio on mount
  useEffect(() => {
    const initAudio = async () => {
      try {
        const { sound } = await Audio.Sound.createAsync(
          // For now, we'll use a placeholder. In production, you'd load the actual audio file
          { uri: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav' },
          {
            shouldPlay: false,
            isLooping: true,
            volume: 0.7,
          }
        );
        audioRef.current = sound;
      } catch (error) {
        console.error('Error loading audio:', error);
      }
    };

    initAudio();

    return () => {
      if (audioRef.current) {
        audioRef.current.unloadAsync();
      }
    };
  }, []);

  // Play/pause media based on visibility
  useEffect(() => {
    if (visible) {
      // Play video
      if (videoRef.current) {
        videoRef.current.playAsync();
      }
      // Play audio
      if (audioRef.current) {
        audioRef.current.playAsync();
      }
    } else {
      // Pause video
      if (videoRef.current) {
        videoRef.current.pauseAsync();
      }
      // Pause audio
      if (audioRef.current) {
        audioRef.current.pauseAsync();
      }
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      presentationStyle="overFullScreen"
      statusBarTranslucent
    >
      <View style={styles.container}>
        {/* Background Video */}
        <Video
          ref={videoRef}
          style={styles.backgroundVideo}
          source={{
            // Placeholder video URL - replace with actual darshan video
            uri: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
          }}
          resizeMode="cover"
          shouldPlay={visible}
          isLooping
          onPlaybackStatusUpdate={setVideoStatus}
        />
        
        {/* Overlay gradient */}
        <View style={styles.overlay} />
        
        {/* Appaji Image - Centered */}
        <View style={styles.imageContainer}>
          <Image
            source={{
              // Placeholder image - replace with actual Appaji image
              uri: 'https://via.placeholder.com/200x250/FFD700/000000?text=Sri+Swamiji',
            }}
            style={styles.swamijiImage}
            contentFit="contain"
          />
          
          {/* Blessing text */}
          <Text style={styles.blessingText}>🙏 Appaji's Blessings 🙏</Text>
          <Text style={styles.alignedText}>You are aligned with divine grace</Text>
        </View>
        
        {/* Close button */}
        <TouchableOpacity
          style={[styles.closeButton, { top: insets.top + 20 }]}
          onPress={onClose}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <MaterialIcons name="close" size={32} color="white" />
        </TouchableOpacity>
        
        {/* Volume control hint */}
        <View style={[styles.volumeHint, { bottom: insets.bottom + 40 }]}>
          <MaterialIcons name="volume-up" size={24} color="white" />
          <Text style={styles.volumeText}>Adjust volume for full experience</Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundVideo: {
    position: 'absolute',
    top: 0,
    left: 0,
    width,
    height,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width,
    height,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  imageContainer: {
    alignItems: 'center',
    zIndex: 10,
  },
  swamijiImage: {
    width: 200,
    height: 250,
    borderRadius: 15,
    marginBottom: 20,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 20,
  },
  blessingText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
    textAlign: 'center',
    marginBottom: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  alignedText: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    opacity: 0.9,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  closeButton: {
    position: 'absolute',
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 25,
    padding: 8,
    zIndex: 20,
  },
  volumeHint: {
    position: 'absolute',
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    zIndex: 20,
  },
  volumeText: {
    color: 'white',
    fontSize: 12,
    marginLeft: 8,
    opacity: 0.8,
  },
});