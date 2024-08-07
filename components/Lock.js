import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  Modal,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import RNSecureStorage from 'rn-secure-storage';
import CryptoJS from 'crypto-js';
import TouchID from 'react-native-touch-id';

export default function LoginScreen() {
  const [pin, setPin] = useState(['', '', '', '']);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const navigation = useNavigation();
  
  const pinRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];
  
  const ENCRYPTION_KEY = 'your-encryption-key'; // Replace with your own encryption key

  useEffect(() => {
    checkFingerprintSupport();
  }, []);

  const checkFingerprintSupport = async () => {
    try {
      const fingerprintStored = await RNSecureStorage.getItem('userFingerprint');
      if (fingerprintStored) {
        // Fingerprint is stored, proceed to authenticate if user presses the button
      }
    } catch (error) {
      console.error('Fingerprint authentication not supported or not stored:', error);
    }
  };

  const authenticateWithFingerprint = async () => {
    try {
      setIsModalVisible(true);
      const authenticated = await TouchID.authenticate('Scan your fingerprint to authenticate');
      if (authenticated) {
        navigation.replace('MainPage');
      }
      setIsModalVisible(false);
    } catch (error) {
      console.error('Fingerprint authentication failed:', error);
      setIsModalVisible(false);
    }
  };

  const handlePinChange = (value, index) => {
    if (value.length > 1) {
      value = value[0]; // only keep the first character if more than one character is entered
    }
    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);
    if (value !== '' && index < 3) {
      pinRefs[index + 1].current.focus();
    }
  };

  const handleLogin = async () => {
    try {
      const pinString = pin.join('');
      const encryptedPin = await RNSecureStorage.getItem('userPin');
      const decryptedPin = CryptoJS.AES.decrypt(encryptedPin, ENCRYPTION_KEY).toString(CryptoJS.enc.Utf8);

      if (pinString === decryptedPin) {
        navigation.replace('MainPage');
      } else {
        Alert.alert('Error', 'Incorrect PIN');
      }
    } catch (error) {
      console.error('Failed to authenticate:', error);
    }
  };

  return (
    <View style={styles.container}>

        <Image source={require('../assets/flogo.png')} style={styles.image} />
    
      <Text style={styles.title}>Welcome Back</Text>
      <Text style={styles.subtitle}>Please enter your PIN to continue</Text>
      <View style={styles.pinContainer}>
        <View style={styles.pinInputContainer}>
          {pin.map((digit, index) => (
            <TextInput
              key={index}
              style={styles.pinInput}
              keyboardType="numeric"
              maxLength={1}
              value={digit}
              onChangeText={(value) => handlePinChange(value, index)}
              ref={pinRefs[index]}
            />
          ))}
        </View>
      </View>
      <TouchableOpacity
        style={styles.loginButton}
        onPress={handleLogin}
        disabled={pin.join('').length !== 4}
      >
        <Text style={styles.loginButtonText}>Login</Text>
      </TouchableOpacity>
      <View style={styles.fingerprintContainer}>
        <TouchableOpacity style={styles.fingerprintButton} onPress={authenticateWithFingerprint}>
          <Ionicons name="finger-print-sharp" size={24} color="#FEBF32" />
          <Text style={styles.fingerprintButtonText}>Use Fingerprint</Text>
        </TouchableOpacity>
      </View>
      <Modal
        transparent={true}
        animationType="slide"
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
  
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    padding: 20,
   
  }, 
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FEBF32',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#ABAFC4',
    textAlign: 'center',
    marginBottom: 20,
  },
  pinContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  pinInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    marginVertical: 10,
  },
  pinInput: {
    width: 50,
    height: 50,
    borderWidth: 1,
    borderColor: '#888DAA',
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 18,
    color: '#FFF',
  },
  loginButton: {
    width: '100%',
    padding: 15,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#FEBF32',
    marginTop: 20,
    opacity: 1,
  },
  loginButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  fingerprintContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  fingerprintButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#444',
    padding: 15,
    borderRadius: 8,
  },
  fingerprintButtonText: {
    color: '#FFF',
    fontSize: 16,
    marginLeft: 10,
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: '#1E1E1E',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FEBF32',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    color: '#ABAFC4',
    textAlign: 'center',
    marginTop: 10,
  },
  image: {
    width: 270,
    height: 270,

  
  }
});
