import React from 'react';
import { Modal, View, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { styles } from './styles';

const LocationPermissionModal = ({ visible, onUseLocation, onSkip, loading }) => {
  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.iconOuterRing}>
            <View style={styles.iconInnerCircle}>
              <Icon name="location-on" size={34} color="#fff" />
            </View>
          </View>

          <Text style={styles.title}>Enable your location</Text>
          <Text style={styles.subtitle}>
            Choose your location to start find the request around you
          </Text>

          <TouchableOpacity style={styles.button} onPress={onUseLocation} disabled={loading}>
            <Text style={styles.buttonText}>{loading ? 'Please wait...' : 'Use my location'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.skipButton} onPress={onSkip} disabled={loading}>
            <Text style={styles.skipText}>Skip for now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default LocationPermissionModal;
