import React, { useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import RNSecureStorage, { ACCESSIBLE } from 'rn-secure-storage';
import Svg, { Defs, LinearGradient, Stop, Text as SvgText } from 'react-native-svg';

export default function WalletSetup() {
  const navigation = useNavigation();

  // useFocusEffect(
  //   useCallback(() => {
  //     const checkCredentials = async () => {
  //       const password = await RNSecureStorage.getItem('newPassword');
  //       const seed = await RNSecureStorage.getItem('seedPhraseVerified');
  //       const fingerprint = await RNSecureStorage.getItem('userFingerprint');
  //       const pin = await RNSecureStorage.getItem('userPin');
        
  //       console.log('Wallet Setup Password', password);
  //       console.log('Seed Phrase', seed);
  //       console.log('Fingerprint', fingerprint);
  //       console.log('Pin', pin);
  
  //       if (password && seed ) {
      
  //           navigation.replace('Lock');
  //         } else {
  //           navigation.replace('MainPage');
  //         }
        
  //     };
  //     checkCredentials();
  //   }, []),
  // );


  useFocusEffect(
    useCallback(() => {
      const checkCredentials = async () => {
        try {
          const password = await RNSecureStorage.getItem('newPassword');
<<<<<<< Updated upstream
          const seed = await RNSecureStorage.getItem('seedPhraseVerified');
          
          // Logging for debugging
          console.log('Wallet Setup Password:', password);
          console.log('Seed Phrase:', seed);
          
          if (password && seed) {
            let fingerprint = null;
            let pin = null;

            try {
              fingerprint = await RNSecureStorage.getItem('userFingerprint');
            } catch (error) {
              console.error('Error retrieving fingerprint:', error);
            }

            try {
              pin = await RNSecureStorage.getItem('userPin');
            } catch (error) {
              console.error('Error retrieving pin:', error);
            }

            // Additional logging for debugging
            console.log('Fingerprint:', fingerprint);
            console.log('Pin:', pin);
              
            if (fingerprint || pin) {
              console.log('Navigating to Lock screen');
              navigation.replace('Lock');
            } else {
              console.log('Navigating to MainPage');
              navigation.replace('MainPage');
            }
          } else {
            console.log('Missing credentials');
            // Optionally handle missing credentials, e.g., navigate to a setup screen
          }
        } catch (error) {
          console.error('Error retrieving secure storage items:', error);
          // Optionally handle errors, e.g., show an alert or navigate to an error screen
        }
      };
  
      checkCredentials();
    }, [navigation])
  );


  
=======
          console.log('Wallet Setup Password', password);
          const seed = await RNSecureStorage.getItem('seedPhraseVerified');
          console.log('Seed Phrase', seed);

          // Optional credentials
          let fingerprint, pin;
          try {
            fingerprint = await RNSecureStorage.getItem('userFingerprint');
            console.log('Fingerprint', fingerprint);
          } catch (e) {
            console.log('Fingerprint not found');
          }
          try {
            pin = await RNSecureStorage.getItem('userPin');
            console.log('Pin', pin);
          } catch (e) {
            console.log('Pin not found');
          }

          if (password && seed) {
            if (pin || fingerprint) {
              navigation.replace('Lock');
            } else {
              navigation.replace('MainPage');
            }
          } else {
            navigation.replace('WalletSetup');
          }
        } catch (error) {
          console.error('Error checking credentials:', error);
          // Handle error if needed
        }
      };

      checkCredentials();
    }, [navigation])
  );
>>>>>>> Stashed changes
  const handleDeleteSeedPhrase = async () => {
    try {
      await RNSecureStorage.setItem('seedPhrase', null);
      Alert.alert('Success', 'Seed phrase has been deleted.');
      console.log('Seed phrase deleted.');
    } catch (error) {
      console.error('Failed to delete the seed phrase:', error);
      Alert.alert('Error', 'Failed to delete the seed phrase.');
    }
  };

  const handleDeletePassword = async () => {
    try {
      await RNSecureStorage.setItem('newPassword', null);
      Alert.alert('Success', 'Password has been deleted.');
      console.log('Password deleted.');
    } catch (error) {
      console.error('Failed to delete the password:', error);
      Alert.alert('Error', 'Failed to delete the password.');
    }
  };

  const handleGetAllSeedPhrases = async () => {
    try {
      const allKeys = await RNSecureStorage.getAllKeys();
      const seedPhrases = [];

      for (const key of allKeys) {
        if (key.startsWith('seedPhrase')) {
          const seedPhrase = await RNSecureStorage.getItem(key);
          seedPhrases.push(seedPhrase);
        }
      }

      console.log('All Seed Phrases:', seedPhrases);
    } catch (error) {
      console.error('Failed to get all seed phrases:', error);
    }
  };

  const handleGetAllAccounts = async () => {
    try {
      const accountsJson = await RNSecureStorage.getItem('accounts');
      if (accountsJson) {
        const accounts = JSON.parse(accountsJson);
        console.log('All Accounts:', accounts);
        Alert.alert('Accounts', JSON.stringify(accounts, null, 2));
      } else {
        Alert.alert('No Accounts', 'No accounts found in storage.');
      }
    } catch (error) {
      console.error('Failed to get all accounts:', error);
      Alert.alert('Error', 'Failed to get all accounts.');
    }
  };

  const handleGetAllNewAccounts = async () => {
    try {
      const accountsJson = await RNSecureStorage.getItem('new accounts');
      if (accountsJson) {
        const accounts = JSON.parse(accountsJson);
        console.log('All NewAccounts Accounts:', accounts);
        Alert.alert('Accounts NewAccounts', JSON.stringify(accounts, null, 2));
      } else {
        Alert.alert(
          'No NewAccounts Accounts',
          'No NewAccounts accounts found in storage.',
        );
      }
    } catch (error) {
      console.error('Failed to get all accounts:', error);
      Alert.alert('Error', 'Failed to get all accounts.');
    }
  };

  const handleDeleteAllAccounts = async () => {
    try {
      await RNSecureStorage.removeItem('accounts');
      Alert.alert('Success', 'All accounts have been deleted.');
      console.log('All accounts deleted.');
    } catch (error) {
      console.error('Failed to delete all accounts:', error);
      Alert.alert('Error', 'Failed to delete all accounts.');
    }
  };

  const handleGetAllTokens = async () => {
    try {
      const tokensJson = await RNSecureStorage.getItem('tokenss');
      if (tokensJson) {
        const tokens = JSON.parse(tokensJson);
        console.log('All Tokens:', tokens);
        Alert.alert('Tokens', JSON.stringify(tokens, null, 2));
      } else {
        Alert.alert('No Tokens', 'No tokens found in storage.');
      }
    } catch (error) {
      console.error('Failed to get all tokens:', error);
      Alert.alert('Error', 'Failed to get all tokens.');
    }
  };

  const handleGetAllNFT = async () => {
    try {
      const tokensJson = await RNSecureStorage.getItem('collectibless');
      if (tokensJson) {
        const tokens = JSON.parse(tokensJson);
        console.log('All Collectiblessss:', tokens);
        Alert.alert('Collectiblessss', JSON.stringify(tokens, null, 2));
      } else {
        Alert.alert('No Tokens', 'No tokens found in storage.');
      }
    } catch (error) {
      console.error('Failed to get all Collectibles:', error);
      Alert.alert('Error', 'Failed to get all collectibles.');
    }
  };

  const handleDeleteCollectibles = async () => {
    try {
      const tokensJson = await RNSecureStorage.removeItem('collectibless');
      if (tokensJson) {
        const tokens = JSON.parse(tokensJson);
        console.log('All Collectiblessss:', tokens);
        Alert.alert('Collectiblessss', JSON.stringify(tokens, null, 2));
      } else {
        Alert.alert('No Tokens', 'No tokens found in storage.');
      }
    } catch (error) {
      console.error('Failed to get all Collectibles:', error);
      Alert.alert('Error', 'Failed to get all collectibles.');
    }
  };

  const handleDeleteSeedPhraseVerified = async () => {
    try {
      await RNSecureStorage.setItem('seedPhraseVerified', null);
      Alert.alert(
        'Success',
        'Seed phrase verification status has been deleted.',
      );
      console.log('Seed phrase verification status deleted.');
    } catch (error) {
      console.error(
        'Failed to delete the seed phrase verification status:',
        error,
      );
      Alert.alert(
        'Error',
        'Failed to delete the seed phrase verification status.',
      );
    }
  };

  const handleDeleteAllNewAccounts = async () => {
    try {
      const tokensJson = await RNSecureStorage.removeItem('new accounts');
      if (tokensJson) {
        const tokens = JSON.parse(tokensJson);
        console.log('All new accounts:', tokens);
        Alert.alert('new accounts', JSON.stringify(tokens, null, 2));
      } else {
        Alert.alert('No Tokens', 'No tokens found in storage.');
      }
    } catch (error) {
      console.error('Failed to get all Collectibles:', error);
      Alert.alert('Error', 'Failed to get all collectibles.');
    }
  };

  const handleDeleteAllTokens = async () => {
    try {
      const tokensJson = await RNSecureStorage.removeItem('tokenss');
      if (tokensJson) {
        const tokens = JSON.parse(tokensJson);
        console.log('All Tokens deleted:', tokens);
        Alert.alert('All Tokens deleted', JSON.stringify(tokens, null, 2));
      } else {
        Alert.alert('No Tokens', 'No tokens found in storage.');
      }
    } catch (error) {
      console.error('Failed to get all Collectibles:', error);
      Alert.alert('Error', 'Failed to get all collectibles.');
    }
  };

  const handleGetFetchedIndex = async () => {
    try {
      const tokensJson = await RNSecureStorage.getItem('fetchedAccountIndex');
      if (tokensJson) {
        const tokens = JSON.parse(tokensJson);
        console.log('All fetchedAccountIndex:', tokens);
        Alert.alert('fetchedAccountIndex', JSON.stringify(tokens, null, 2));
      } else {
        Alert.alert(
          'No fetchedAccountIndex',
          'No fetchedAccountIndex found in storage.',
        );
      }
    } catch (error) {
      console.error('Failed to get all fetchedAccountIndex:', error);
      Alert.alert('Error', 'Failed to get all fetchedAccountIndex.');
    }
  };

  const handleDeleteFetchedIndex = async () => {
    try {
      const tokensJson = await RNSecureStorage.removeItem(
        'fetchedAccountIndex',
      );
      if (tokensJson) {
        const tokens = JSON.parse(tokensJson);
        console.log('All fetchedAccountIndex deleted:', tokens);
        Alert.alert(
          'All fetchedAccountIndex deleted',
          JSON.stringify(tokens, null, 2),
        );
      } else {
        Alert.alert(
          'No fetchedAccountIndex',
          'No fetchedAccountIndex found in storage.',
        );
      }
    } catch (error) {
      console.error('Failed to get all fetchedAccountIndex:', error);
      Alert.alert('Error', 'Failed to get all fetchedAccountIndex.');
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require('../assets/navigator_icon_grey.png')} style={styles.image} />
      {/* <Svg height="60" width="100%">
        <Defs>
          <LinearGradient id="grad" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor="#A9CDFF" stopOpacity="1" />
            <Stop offset="0.22" stopColor="#72F6D1" stopOpacity="1" />
            <Stop offset="0.56" stopColor="#A0ED8D" stopOpacity="1" />
            <Stop offset="0.82" stopColor="#FED365" stopOpacity="1" />
            <Stop offset="1" stopColor="#FAA49E" stopOpacity="1" />
          </LinearGradient>
        </Defs>
        <SvgText
          fill="url(#grad)"
          fontSize="30"
          fontWeight="bold"
          x="50%"
          y="50%"
          textAnchor="middle">
          Navigator
        </SvgText>
      </Svg>
      <Text style={styles.title}>Navigator</Text> */}

      <TouchableOpacity
        onPress={() => navigation.navigate('CreatePasswordImport')}>
        <Text style={{ color: '#000', ...styles.buttonYellow }}>
          Import Using Seed Phrase
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.buttonYellow}
        onPress={() => navigation.navigate('CreatePassword')}>
        <Text style={styles.buttonYellowText}>Create a New Wallet</Text>
      </TouchableOpacity>

      
      {/* <TouchableOpacity
        style={styles.buttonGray}
        onPress={handleDeleteAllTokens}>
        <Text style={styles.deleteButtonText}>Delete All Tokens</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={handleDeletePassword}>
        <Text style={styles.deleteButtonText}>Delete Password</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={handleDeleteAllAccounts}>
        <Text style={styles.deleteButtonText}>Delete All Accounts</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={handleDeleteAllNewAccounts}>
        <Text style={styles.deleteButtonText}>DeleteAllNewAccounts</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.buttonGray}
        onPress={handleGetAllAccounts}>
        <Text style={styles.buttonGrayText}>Get All Accounts</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={handleDeleteCollectibles}>
        <Text style={styles.deleteButtonText}>Delete Collectible</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.buttonGray}
        onPress={handleGetAllNewAccounts}>
        <Text style={styles.buttonGrayText}>et All New Accounts</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={handleDeleteSeedPhraseVerified}>
        <Text style={styles.deleteButtonText}>Delete SeedPhrase Verified</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={handleDeleteFetchedIndex}>
        <Text style={styles.deleteButtonText}>Delete Fetched Index</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={handleGetFetchedIndex}>
        <Text style={styles.deleteButtonText}>Get Fetched Index</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.buttonGray} onPress={handleGetAllTokens}>
        <Text style={styles.deleteButtonText}>Get All Tokens</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.buttonGray} onPress={handleGetAllNFT}>
        <Text style={styles.deleteButtonText}>Get All collectibles</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={handleDeleteSeedPhrase}>
        <Text style={styles.deleteButtonText}>Delete Seed Phrase</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={handleGetAllSeedPhrases}>
        <Text style={styles.deleteButtonText}>Get All Seed Phrases</Text>
      </TouchableOpacity>  */}
     

      <Text style={styles.para}>Secure Seamless Trading</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#17171A',
    padding: 20,
  },
  image: {
    width: 300,
    height: 300,
    marginBottom: 10,
  },
  title: {
    fontSize: 30,
    fontWeight: '300',
    color: 'white',
    marginBottom: 30,
  },
  buttonGray: {
    borderRadius: 8,
    backgroundColor: '#2A2D3C',
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginBottom: 20,
  },

  para: {
    fontFamily: 'poppins',
    fontSize: 30,
    marginTop: 100,
    color: '#FFF',
    textAlign: 'center',
  },
  buttonGrayText: {
    fontSize: 26,
    marginBottom: 10,
    lineHeight: 24,
    color: '#c0c0c0',
    textAlign: 'center',
  },
  buttonYellow: {
    borderRadius: 8,
    backgroundColor: '#c0c0c0',
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  buttonYellowText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#000',
    textAlign: 'center',
  },
  deleteButton: {
    borderRadius: 8,
    backgroundColor: '#FF3B30',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  deleteButtonText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#000',
    textAlign: 'center',
  },
});

