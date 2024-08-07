import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Platform, Alert } from 'react-native';
import { RNCamera } from 'react-native-camera';
import { useNavigation } from '@react-navigation/native';
import * as Permissions from 'react-native-permissions';
import Feather from 'react-native-vector-icons/Feather'; // Import Feather for icons

export default function Scanner({ route }) {
  const navigation = useNavigation();
  const { fromAccount, selectedNetwork, selectedForToken, selectedForCollectible } = route.params;
  const [hasPermission, setHasPermission] = useState(null);

  useEffect(() => {
    requestCameraPermission();
  }, []);

  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      const result = await Permissions.request(Permissions.PERMISSIONS.ANDROID.CAMERA);
      setHasPermission(result === Permissions.RESULTS.GRANTED);
    } else {
      const result = await Permissions.request(Permissions.PERMISSIONS.IOS.CAMERA);
      setHasPermission(result === Permissions.RESULTS.GRANTED);
    }
  };

  const handleBarCodeRead = ({ data }) => {
    console.log('Scanned QR code data:', data);
    navigation.navigate('SendToken', {
      recipientAddress: data,
      fromAccount,
      selectedNetwork,
      selectedForToken,
      selectedForCollectible,
    });
  };

  const copyToClipboard = (text) => {
    Clipboard.setString(text);
    Alert.alert('Copied to clipboard!', text);
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No access to camera</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <RNCamera
        style={styles.camera}
        onBarCodeRead={handleBarCodeRead}
        captureAudio={false}
        androidCameraPermissionOptions={{
          title: 'Permission to use camera',
          message: 'We need your permission to use your camera',
          buttonPositive: 'Ok',
          buttonNegative: 'Cancel',
        }}
      >
        <View style={styles.overlay}>
          <View style={styles.scanArea}>
            <Text style={styles.scanAreaText}>
              Align QR code within this area to scan
            </Text>
            <View style={styles.clipIconContainer}>
              <Feather
                name="paperclip"
                size={24}
                color="#FFF"
                onPress={() => copyToClipboard('Recipient Address')} // Use the actual address
              />
            </View>
          </View>
        </View>
      </RNCamera>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#17171A',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  scanArea: {
    width: 250,
    height: 250,
    borderColor: '#FEBF32',
    borderWidth: 3,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    position: 'relative',
  },
  scanAreaText: {
    color: '#FFF',
    fontFamily: 'Poppins',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 10,
  },
  loadingText: {
    color: '#FFF',
    fontFamily: 'Poppins',
    fontSize: 16,
    fontWeight: '400',
    textAlign: 'center',
    marginTop: 20,
  },
  errorText: {
    color: 'red',
    fontFamily: 'Poppins',
    fontSize: 16,
    fontWeight: '400',
    textAlign: 'center',
    marginTop: 20,
  },
  clipIconContainer: {
    position: 'absolute',
    top: '80%',
    alignItems: 'center',
  },
});
