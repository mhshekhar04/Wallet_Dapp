import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { RNCamera } from 'react-native-camera';
import { useNavigation } from '@react-navigation/native';
import * as Permissions from 'react-native-permissions';
export default function Scanner({ route }) {
  const navigation = useNavigation();
  const { fromAccount, selectedNetwork, selectedForToken, selectedForCollectible } = route.params; // Get fromAccount from route params
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
      selectedForCollectible
    }); // Navigate back with scanned data
  };
  if (hasPermission === null) {
    return <View />;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
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
      />
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#17171A',
  },
  camera: {
    width: '100%',
    height: '100%',
  },
  scanButton: {
    width: 300,
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  text: {
    color: '#FFF',
    fontFamily: 'Poppins',
    fontSize: 14,
    fontWeight: '400',
    textAlign: 'center',
    marginTop: 20,
  },
});





