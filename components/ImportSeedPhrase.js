import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { ethers } from 'ethers';
import SecureStorage from 'rn-secure-storage';
import CryptoJS from 'crypto-js';
import debounce from 'lodash.debounce';
import LottieView from 'lottie-react-native';
import config from '../config/config'; // Ensure your config file is correctly set up
import EthereumHDKey from './EthereumHDKey'; 

const ImportSeedPhrase = ({ navigation }) => {
  const [seedPhrase, setSeedPhrase] = useState(new Array(12).fill(''));
  const [isVerified, setIsVerified] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkSeedPhraseVerified = async () => {
      try {
        const seedPhraseVerified = await SecureStorage.getItem('seedPhraseVerified');
        if (seedPhraseVerified) {
          navigation.replace('VerifiedSeedPhrase');
        }
      } catch (error) {
        console.error('Error checking seed phrase verification:', error);
      }
    };

    checkSeedPhraseVerified();
  }, []);

  const handleSeedPhraseChange = (text, index) => {
    const newSeedPhrase = [...seedPhrase];
    newSeedPhrase[index] = text;
    setSeedPhrase(newSeedPhrase);
  };

  const debouncedVerifySeedPhrase = useCallback(
    debounce(async (mnemonic) => {
      try {
        const start1 = Date.now();
        const isValid = ethers.utils.isValidMnemonic(mnemonic);
        const end1 = Date.now();
        console.log('Time taken for isValidMnemonic:', (end1 - start1) / 1000, 'seconds');

        if (isValid) {
          setIsVerified(true);

          const start2 = Date.now();
          const rootNode = ethers.utils.HDNode.fromMnemonic(mnemonic);
          const end2 = Date.now();
          console.log('Time taken for HDNode.fromMnemonic:', (end2 - start2) / 1000, 'seconds');

          const start3 = Date.now();
          const newAccounts = await generateAccounts(rootNode, accounts.length, 25);
          const end3 = Date.now();
          console.log('Time taken for generating accounts:', (end3 - start3) / 1000, 'seconds');

          // Encrypt the seed phrase
          const encryptedSeedPhrase = CryptoJS.AES.encrypt(
            mnemonic,
            config.privateKeyEncryptionString
          ).toString();

          const start4 = Date.now();
          const updatedAccounts = [...accounts, ...newAccounts];
          await Promise.all([
            SecureStorage.setItem('accounts', JSON.stringify(updatedAccounts)),
            SecureStorage.setItem('seedPhraseVerified', 'true'),
            SecureStorage.setItem('encryptedSeedPhrase', encryptedSeedPhrase), // Store encrypted seed phrase
          ]);
          const end4 = Date.now();
          console.log('Time taken for saving to SecureStorage:', (end4 - start4) / 1000, 'seconds');

          setAccounts(updatedAccounts);
          setSelectedAccount(newAccounts[0]);
          Alert.alert('Verification passed', 'Seed phrase is verified by ethers.js');
          navigation.replace('VerifiedSeedPhrase');
        } else {
          setIsVerified(false);
          Alert.alert('Verification Failed', 'Seed phrase not verified by ethers.js');
        }
      } catch (error) {
        console.error('Error verifying seed phrase:', error);
        setIsVerified(false);
        Alert.alert('Verification Failed', 'An error occurred while verifying seed phrase');
      } finally {
        setLoading(false);
      }
    }, 0),
    [accounts, navigation]
  );

  const generateAccounts = async (rootNode, startIdx, count) => {
    const newAccounts = [];
    const tasks = [];

    for (let i = 0; i < count; i++) {
      tasks.push((async (index) => {
        const childNode = rootNode.derivePath(`m/44'/60'/0'/0/${index}`);
        const newAccount = {
          name: `Account ${startIdx + index + 1}`,
          address: childNode.address,
          encryptedPrivateKey: CryptoJS.AES.encrypt(
            childNode.privateKey,
            config.privateKeyEncryptionString
          ).toString(),
        };
        return newAccount;
      })(i));
    }

    const results = await Promise.all(tasks);
    newAccounts.push(...results);

    return newAccounts;
  };

  const verifySeedPhrase = async () => {
    setLoading(true);
    const mnemonic = seedPhrase.join(' ');
    debouncedVerifySeedPhrase(mnemonic);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.rectanglesContainer}>
        <View style={styles.rectangle}></View>
        <View style={styles.rectangle}></View>
        <View style={styles.rectangle}></View>
      </View>
      <Text style={styles.header}>
        Write down the Seed Phrase for your CC Wallet
      </Text>
      <View style={styles.seedPhraseContainer}>
        {seedPhrase.map((word, index) => (
          <TextInput
            key={index}
            style={styles.seedPhraseBox}
            placeholder={`Word ${index + 1}`}
            onChangeText={text => handleSeedPhraseChange(text, index)}
            value={word}
            maxLength={20}
            autoFocus={index === 0}
            autoCapitalize="none"
          />
        ))}
      </View>
      {loading ? (
        <View style={styles.animationContainer}>
          
        <LottieView
            source={require('../assets/loading.json')}
            autoPlay
            loop
            style={styles.lottieAnimation}
            colorFilters={[
              {
                keypath: 'Shape Layer 1',
                color: '#FEBF32',
              },
              {
                keypath: 'Shape Layer 2',
                color: '#FEBF32',
              },
              {
                keypath: 'Shape Layer 3',
                color: '#FEBF32',
              },
            ]}
          />
        </View>
      ) : (
        <TouchableOpacity
          style={styles.verifyButton}
          onPress={verifySeedPhrase}>
          <Text style={styles.buttonText}>Verify</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#17171A',
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 20,
  },
  rectanglesContainer: {
    flexDirection: 'row',
    height: 8,
    width: '100%',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  rectangle: {
    flex: 1,
    height: 8,
    borderRadius: 2,
    backgroundColor: '#222531',
    marginHorizontal: 2,
  },
  header: {
    fontFamily: 'Poppins',
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 28,
    textAlign: 'center',
    color: '#FFF',
    marginBottom: 16,
  },
  seedPhraseContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 16,
  },
  seedPhraseBox: {
    width: '48%',
    marginVertical: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#222531',
    borderRadius: 8,
    color: '#FFF',
    fontFamily: 'Poppins',
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 24,
  },
  animationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  lottieAnimation: {
    width: 150,
    height: 150,
  },
  verifyButton: {
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FEBF32',
    borderRadius: 8,
  },
  buttonText: {
    fontFamily: 'Poppins',
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
    color: '#000',
    textAlign: 'center',
  },
});

export default ImportSeedPhrase;
