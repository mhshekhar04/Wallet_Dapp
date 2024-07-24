import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import CheckBox from '@react-native-community/checkbox';
import { useNavigation } from '@react-navigation/native';
import RNSecureStorage, { ACCESSIBLE } from 'rn-secure-storage';
import CryptoJS from 'crypto-js';
import TouchID from 'react-native-touch-id';
import LottieView from 'lottie-react-native';

export default function SetupScreen() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pin, setPin] = useState(['', '', '', '']);
  const [isChecked, setChecked] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showCPassword, setShowCPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState('');
  const [activeStep, setActiveStep] = useState('password');
  const [isFingerprintSetup, setIsFingerprintSetup] = useState(false);
  const navigation = useNavigation();
  
  const pinRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  const ENCRYPTION_KEY = 'your-encryption-key'; // Replace with your own encryption key

  useEffect(() => {
    const getPassword = async () => {
      try {
        const encryptedPassword = await RNSecureStorage.getItem('newPassword');
        if (encryptedPassword) {
          const decryptedPassword = CryptoJS.AES.decrypt(encryptedPassword, ENCRYPTION_KEY).toString(CryptoJS.enc.Utf8);
          console.log("Decrypted Password:", decryptedPassword);
          setActiveStep('fingerprint');
        }
      } catch (error) {
        console.error('Failed to get saved password:', error);
      }
    };
    getPassword();
  }, []);

  useEffect(() => {
    const getFinger = async () => {
      try {
        const userFingerprint = await RNSecureStorage.getItem('userFingerprint');
        if (userFingerprint) {
          navigation.replace('ImportSeedPhrase');
        }
      } catch (error) {
        console.error('Failed to get saved fingerprint:', error);
      }
    };
    getFinger();
  }, []);

  const handleCreatePassword = async () => {
    if (newPassword.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword && !isChecked) {
      Alert.alert(
        'Error',
        'Passwords do not match and checkbox is not checked.',
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }

    if (!isChecked) {
      Alert.alert('Error', 'Checkbox is not checked.');
      return;
    }

    try {
      const encryptedPassword = CryptoJS.AES.encrypt(newPassword, ENCRYPTION_KEY).toString();
      await RNSecureStorage.setItem('newPassword', encryptedPassword, {
        accessible: ACCESSIBLE.WHEN_UNLOCKED,
      });

      Alert.alert('Success', 'Password has been created.');
      console.log('Password saved:', encryptedPassword);
      setActiveStep('pin'); // Switch to PIN setup
    } catch (error) {
      console.error('Failed to save the password:', error);
      Alert.alert('Error', 'Failed to save the password.');
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

  const handleNext = async () => {
    const pinString = pin.join('');
    if (pinString.length !== 4) {
      Alert.alert('PIN must be 4 digits long.');
      return;
    }

    try {
      const encryptedPin = CryptoJS.AES.encrypt(pinString, ENCRYPTION_KEY).toString();
      await RNSecureStorage.setItem('userPin', encryptedPin, {
        accessible: ACCESSIBLE.WHEN_UNLOCKED,
      });
      setActiveStep('fingerprint');
    } catch (error) {
      console.error('Failed to save the PIN:', error);
      Alert.alert('Failed to save the PIN.');
    }
  };

  const setupFingerprint = async () => {
    try {
      await TouchID.authenticate('Scan your fingerprint to complete setup');
      await RNSecureStorage.setItem('userFingerprint', 'true');
      setIsFingerprintSetup(true);
      Alert.alert('Success', 'Fingerprint setup complete!');
      navigation.replace('ImportSeedPhrase');
    } catch (error) {
      Alert.alert('Error', 'Fingerprint authentication failed. Please try again.');
    }
  };

  const handleSave = () => {
    navigation.replace('ImportSeedPhrase');
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleCPasswordVisibility = () => {
    setShowCPassword(!showCPassword);
  };

  const calculatePasswordStrength = (password) => {
    let strength = "Weak";
    const regexStrong = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    const regexMedium = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

    if (regexStrong.test(password)) {
      strength = "Strong";
    } else if (regexMedium.test(password)) {
      strength = "Medium";
    } else if (password.length >= 8) {
      strength = "Weak";
    }

    return strength;
  };

  const getPasswordStrengthColor = (strength) => {
    switch (strength) {
      case "Strong":
        return 'green';
      case "Medium":
        return 'yellow';
      case "Weak":
        return 'red';
      default:
        return 'red';
    }
  };

  useEffect(() => {
    setPasswordStrength(calculatePasswordStrength(newPassword));
  }, [newPassword]);

  return (
    <View style={styles.container}>
      {activeStep === 'password' ? (
        <>
          <Text style={styles.title}>Create Password</Text>
          <Text style={styles.subtitle}>
            This password will unlock your Navigator only on this service
          </Text>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>New Password</Text>
            <View style={styles.passwordInput}>
              <TextInput
                style={styles.input}
                secureTextEntry={!showPassword}
                value={newPassword}
                onChangeText={setNewPassword}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={togglePasswordVisibility}>
                <Feather
                  name={showPassword ? 'eye-off' : 'eye'}
                  size={24}
                  color="#888DAA"
                />
              </TouchableOpacity>
            </View>
            <Text style={[styles.passwordStrength, { color: getPasswordStrengthColor(passwordStrength) }]}>
              {newPassword.length < 8
                ? 'Password must be at least 8 characters'
                : `Password strength: ${passwordStrength}`}
            </Text>
            <Text style={styles.inputLabel}>Confirm Password</Text>
            <View style={styles.passwordInput}>
              <TextInput
                style={styles.input}
                secureTextEntry={!showCPassword}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={toggleCPasswordVisibility}>
                <Feather
                  name={showCPassword ? 'eye-off' : 'eye'}
                  size={24}
                  color="#888DAA"
                />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.checkboxContainer}>
            <CheckBox
              value={isChecked}
              onValueChange={setChecked}
              color={isChecked ? '#c0c0c0' : undefined}
            />
            <Text style={styles.checkboxText}>
              I understand that Navigator cannot recover this password for me.{' '}
              <Text style={styles.learnMore}>Learn more</Text>
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.createPasswordButton, { opacity: isChecked ? 1 : 0.5 }]}
            onPress={handleCreatePassword}
            disabled={!isChecked}>
            <Text style={styles.createPasswordButtonText}>Next</Text>
          </TouchableOpacity>
        </>
      ) : activeStep === 'pin' ? (
        <>
          <Text style={styles.title}>Create PIN</Text>
          <Text style={styles.subtitle}>
            This PIN will be used to access your Navigator
          </Text>
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
            <TouchableOpacity
              style={styles.nextButton}
              onPress={handleNext}
              disabled={pin.join('').length !== 4}>
              <Text style={styles.nextButtonText}>Next</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.skipButton}
              onPress={() => setActiveStep('fingerprint')}>
              <Text style={styles.skipButtonText}>Skip</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <View style={styles.fingerprintContainer}>
          <Text style={styles.title}>Set up your Fingerprint</Text>
          <LottieView
            source={require('../assets/fingerprintt.json')} // Replace with the path to your Lottie JSON file
            autoPlay
            loop
            style={styles.lottieAnimation}
          />
          <TouchableOpacity style={styles.fingerprintButton} onPress={setupFingerprint}>
            <Text style={styles.buttonText}>Scan Fingerprint</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleSave}>
            <Text style={styles.skipButtonText}>Skip</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#17171A',
    alignItems: 'center',
    paddingVertical: 50,
    paddingHorizontal: 20,
  },
  title: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
    lineHeight: 24,
    color: '#c0c0c0',
    marginVertical: 20,
    textAlign: 'center',
  },
  subtitle: {
    color: '#ABAFC4',
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    lineHeight: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  inputLabel: {
    color: '#888DAA',
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 5,
  },
  passwordInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#888DAA',
    marginBottom: 10,
  },
  input: {
    flex: 1,
    color: '#FFF',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    lineHeight: 24,
  },
  eyeIcon: {
    position: 'absolute',
    right: 0,
    padding: 10,
  },
  passwordStrength: {
    color: '#888DAA',
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    lineHeight: 16,
    marginTop: 10,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: 20,
  },
  checkboxText: {
    flex: 1,
    color: '#FFF',
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    lineHeight: 24,
    padding: 10,
  },
  learnMore: {
    color: '#5F97FF',
  },
  createPasswordButton: {
    width: '100%',
    padding: 12,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#c0c0c0',
    marginTop: 20,
  },
  createPasswordButtonText: {
    color: '#000',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
    lineHeight: 24,
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
    fontFamily: 'Poppins_600SemiBold',
  },
  nextButton: {
    width: '100%',
    padding: 12,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#c0c0c0',
    marginTop: 20,
    opacity: 1,
  },
  nextButtonText: {
    color: '#000',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
    lineHeight: 24,
  },
  fingerprintButton: {
    width: '100%',
    padding: 12,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#c0c0c0',
    marginTop: 20,
  },
  buttonText: {
    color: '#000',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
    lineHeight: 24,
  },
  skipButton: {
    width: '100%',
    padding: 12,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#888DAA',
    marginTop: 200, // Adjusted to provide space between the buttons
   
  },
  skipButtonText: {
    color: '#000',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
    lineHeight: 24,
  },
  fingerprintContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  lottieAnimation: {
    width: 200,
    height: 200,
    marginVertical: 30,
  },
  saveButton: {
    width: '100%',
    padding: 12,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#c0c0c0',
    marginTop: 20,
  },
  saveButtonText: {
    color: '#000',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
    lineHeight: 24,
  },
});


