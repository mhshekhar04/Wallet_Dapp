import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { ethers } from 'ethers';
import CryptoJS from 'crypto-js';
import ERC721Abi from './ERC721Abi.json';
import LottieView from 'lottie-react-native'; // Import LottieView
import loaderAnimation from '../assets/transaction_loader.json'; // Import your Lottie JSON file for loader
import successAnimation from '../assets/payment.json'; // Import your Lottie JSON file for success
import config from '../config/config';
export default function TransferNFT({ route, navigation }) {
  const { fromAccount, data, toAccount, selectedForCollectible, collectibleAddress, collectibleId, selectedNetwork } = route.params;
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const tickOpacity = useState(new Animated.Value(0))[0];
  const decryptPrivateKey = (encryptedPrivateKey) => {
    const bytes = CryptoJS.AES.decrypt(encryptedPrivateKey, 'your-secret-key');
    return bytes.toString(CryptoJS.enc.Utf8);
  };
  const handleNext = async () => {
    setLoading(true);
    try {
      const encryptedPrivateKey = fromAccount?.encryptedPrivateKey || data?.encryptedPrivateKey || fromAccount?.privateKey||data?.privateKey;
      if (!encryptedPrivateKey) {
        throw new Error('No encryptedPrivateKey or privateKey found');
      }
      const provider = new ethers.providers.JsonRpcProvider(selectedNetwork.networkurl);
      const decryptedPrivateKey = decryptPrivateKey(encryptedPrivateKey);
      const wallet = new ethers.Wallet(decryptedPrivateKey, provider);
      const contract = new ethers.Contract(collectibleAddress, ERC721Abi, wallet);
      const fromAddress = fromAccount?.address || data?.address;
      const toAddress = toAccount?.address;
      if (!fromAddress || !toAddress) {
        throw new Error('Both from and to addresses must be provided');
      }
      const tx = await contract.transferFrom(fromAddress, toAddress, collectibleId);
      const receipt = await tx.wait();
      setLoading(false);
      // Show success animation
      setShowSuccess(true);
      Animated.timing(tickOpacity, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      }).start(() => {
        setTimeout(() => {
          setShowSuccess(false);
          navigation.navigate('MainPage');
        }, 2000); // Show the tick for 1 second before navigating
      });
    } catch (error) {
      setLoading(false);
      Alert.alert('Transaction Failed', error.message);
      console.error('Error in TransferNFT:', error);
    }
  };
  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Transfer NFT</Text>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>NFT Address</Text>
        <Text style={styles.label}>{collectibleAddress}</Text>
        <Text style={styles.label}>Token ID</Text>
        <Text style={styles.label}>{collectibleId}</Text>
      </View>
      <TouchableOpacity
        style={styles.nextButton}
        onPress={handleNext}
        disabled={loading}>
        {loading ? (
          <LottieView // Use LottieView when loading
            source={loaderAnimation}
            autoPlay
            loop
            style={styles.lottieAnimation}
          />
        ) : (
          <Text style={styles.nextButtonText}>Send</Text>
        )}
      </TouchableOpacity>
      {showSuccess && (
        <LottieView
          source={successAnimation}
          autoPlay
          loop={false}
          style={styles.successAnimation}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#17171A',
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    color: '#FFF',
    fontFamily: 'Poppins',
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 20,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  label: {
    color: '#FFF',
    fontFamily: 'Poppins',
    fontSize: 16,
    marginBottom: 8,
  },
  nextButton: {
    width: 327,
    padding: 12,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#c0c0c0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
  nextButtonText: {
    color: '#17171A',
    fontFamily: 'Poppins',
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
  },
  lottieAnimation: {
    width: 200,
    height: 200,
  },
  successAnimation: {
    width: 100,
    height: 100,
    position: 'absolute',
    top: '80%', // Adjusted to move it down
    left: '57%',
    transform: [{ translateX: -50 }, { translateY: -50 }],
  },
});
