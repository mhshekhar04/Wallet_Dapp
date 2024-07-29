import React, { useState, useEffect, useRef } from 'react';
import History from './History';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  Alert,
  Clipboard,
  Animated,
  Easing,
  Image,
} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Feather from 'react-native-vector-icons/Feather';
import SecureStorage from 'rn-secure-storage';
import CryptoJS from 'crypto-js';
import Navigation from './Navigation';
import config from '../config/config';


const Profile = ({ navigation, route }) => {
  const { selectedAccount } = route.params;
  const [accounts, setAccounts] = useState([]);
  const [selectedDataAccount, setSelectedDataAccount] = useState([]);
  const [showPrivateKeyModal, setShowPrivateKeyModal] = useState(false);
  const [showCreateAccountModal, setShowCreateAccountModal] = useState(false);
  const [newAccountName, setNewAccountName] = useState('');
  const [generateNewAccounts, setGenerateNewAccounts] = useState([]);
  const [password, setPassword] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [error, setError] = useState('');
  const [fadeAnim] = useState(new Animated.Value(0));
  const [showPassword, setShowPassword] = useState(false);
  const [fetchedAccount, setFetchedAccount] = useState(null);
  const [fetchedAccountIndex, setFetchedAccountIndex] = useState(-1);

  const scrollViewRef = useRef(null);

  useEffect(() => {
    const getStoredAccounts = async () => {
      try {
        const storedAccounts = await SecureStorage.getItem('new accounts');
        if (storedAccounts) {
          const parsedAccounts = JSON.parse(storedAccounts);
          setGenerateNewAccounts(parsedAccounts);
          setAccounts(parsedAccounts);
          setSelectedDataAccount(parsedAccounts);
        }
      } catch (error) {
        console.error('Error fetching accounts:', error);
      }
    };

    getStoredAccounts();
  }, []);

  const handleRevealPrivateKey = (account) => {
    setSelectedDataAccount(account);
    setShowPrivateKeyModal(true);
    setPrivateKey('');
    setError('');
  };

  const verifyPasswordAndShowPrivateKey = async () => {
    try {
      const encryptedPassword = await SecureStorage.getItem('newPassword');
      const storedPassword = CryptoJS.AES.decrypt(
        encryptedPassword,
        config.encryptionPassword
      ).toString(CryptoJS.enc.Utf8);

      if (storedPassword === password) {
        let decryptedPrivateKey = '';
        if (selectedAccount.imported) {
          // For imported accounts, the private key is stored directly
          const privateKeyBytes = CryptoJS.AES.decrypt(
            selectedAccount.encryptedPrivateKey,
            config.privateKeyEncryptionString
          );
          decryptedPrivateKey = privateKeyBytes.toString(CryptoJS.enc.Utf8);
        } else {
          // For normal accounts, decrypt the private key
          const privateKeyBytes = CryptoJS.AES.decrypt(
            selectedAccount.encryptedPrivateKey,
            config.privateKeyEncryptionString
          );
          decryptedPrivateKey = privateKeyBytes.toString(CryptoJS.enc.Utf8);
        }

        setPrivateKey(decryptedPrivateKey);
        setPassword('');
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }).start();
      } else {
        setError('Incorrect password. Please try again.');
      }
    } catch (error) {
      console.error('Error verifying password:', error);
      setError('An error occurred. Please try again.');
    }
  };

  const copyToClipboard = (text) => {
    Clipboard.setString(text);

  };

  const handleCreateAccount = async () => {
    try {
      const storedAccounts = await SecureStorage.getItem('accounts');
      if (!storedAccounts) {
        console.error('No accounts found in local storage');
        return;
      }

      let parsedAccounts = JSON.parse(storedAccounts);
      if (!parsedAccounts || parsedAccounts.length === 0) {
        console.error('No valid accounts found in local storage');
        return;
      }

      parsedAccounts.sort((a, b) => {
        const aName = a.name.match(/Account (\d+)/);
        const bName = b.name.match(/Account (\d+)/);
        if (aName && bName) {
          return parseInt(aName[1], 10) - parseInt(bName[1], 10);
        }
        return 0;
      });

      let fetchedAccountIndex;
      try {
        const storedFetchedAccountIndex = await SecureStorage.getItem(
          'fetchedAccountIndex'
        );
        fetchedAccountIndex = storedFetchedAccountIndex
          ? parseInt(storedFetchedAccountIndex, 10)
          : 0;
      } catch (error) {
        console.error(
          'Error retrieving fetchedAccountIndex from local storage:',
          error
        );
        fetchedAccountIndex = 0;
      }

      if (fetchedAccountIndex >= parsedAccounts.length) {
        console.log('All accounts have already been generated');
        return;
      }

      const nextAccount = parsedAccounts[fetchedAccountIndex];

      const accountExists = generateNewAccounts.some(
        (account) => account.address === nextAccount.address
      );

      if (accountExists) {
        console.log('Account already exists:', nextAccount);
        Alert.alert('Account already exists:');
        return;
      }

      setFetchedAccount(nextAccount);
      setFetchedAccountIndex(fetchedAccountIndex);

      const updatedAccounts = [...accounts, nextAccount];
      setAccounts(updatedAccounts);
      setGenerateNewAccounts([...generateNewAccounts, nextAccount]);

      setNewAccountName(nextAccount.name);
      await SecureStorage.setItem(
        'new accounts',
        JSON.stringify(updatedAccounts)
      );
      await SecureStorage.setItem(
        'fetchedAccountIndex',
        (fetchedAccountIndex + 1).toString()
      );

      setTimeout(() => {
        if (scrollViewRef.current) {
          scrollViewRef.current.scrollToEnd({ animated: true });
        }
      }, 100);
    } catch (error) {
      console.error('Error creating account:', error);
    }
  };

  const handleYourWalletButton = () => {
    navigation.navigate('YourWallet');
  };

  return (
    <>
    <View style={styles.container}>
      <Text style={styles.header}>My Profile</Text>

      <TouchableOpacity style={styles.section}>
        <FontAwesome name="user-circle" size={20} color="#c0c0c0" />
        {selectedAccount && (
          <View style={styles.accountInfo}>
            <Text style={styles.accountName}>{selectedAccount?.name}</Text>
            <View style={styles.accountAddressRow}>
              <Text style={styles.accountAddress}>
                {selectedAccount.address}
              </Text>
              <TouchableOpacity
                onPress={() => copyToClipboard(selectedAccount?.address)}
              >
                <FontAwesome name="copy" size={16} color="#c0c0c0" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.section}
        onPress={() => navigation.navigate('ImportAccount',{selectedAccount})}
      >
        <FontAwesome name="download" size={20} color="#c0c0c0" />
        <Text style={styles.sectionTitle}>Import Account</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.section}
        onPress={() => handleRevealPrivateKey(selectedAccount)}
      >
        <FontAwesome name="key" size={20} color="#c0c0c0" />
        <Text style={styles.sectionTitle}>Reveal Your Secret Key</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.section} onPress={handleYourWalletButton}>
        <FontAwesome5 name="wallet" size={20} color="#c0c0c0" />
        <Text style={styles.sectionTitle}>Your Wallet</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.section}>
        <FontAwesome name="user-plus" size={20} color="#c0c0c0" />
        <Text style={styles.sectionTitle}>Your Referral Code</Text>
      </TouchableOpacity>

      <TouchableOpacity
  style={styles.section}
  onPress={() => navigation.navigate('History', { selectedAccount })}
>
  <FontAwesome name="history" size={20} color="#c0c0c0" />
  <Text style={styles.sectionTitle}>Your Transaction History</Text>
</TouchableOpacity>

      

      <Modal
        visible={showCreateAccountModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCreateAccountModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create Account</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter account name"
              value={newAccountName}
              onChangeText={setNewAccountName}
            />
            <TouchableOpacity
              style={styles.createButton}
              onPress={handleCreateAccount}
            >
              <Text style={styles.createButtonText}>Save Account</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowCreateAccountModal(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showPrivateKeyModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPrivateKeyModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Enter Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Enter your password"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
              >
                <FontAwesome
                  name={showPassword ? 'eye-slash' : 'eye'}
                  size={20}
                  color="#FFF"
                />
              </TouchableOpacity>
            </View>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            <TouchableOpacity
              style={styles.verifyButton}
              onPress={verifyPasswordAndShowPrivateKey}
            >
              <Text style={styles.verifyButtonText}>Verify</Text>
            </TouchableOpacity>
            {privateKey ? (
              <Animated.View
                style={[styles.privateKeyContainer, { opacity: fadeAnim }]}
              >
                <Text style={styles.privateKey}>{privateKey}</Text>
                <TouchableOpacity
                  style={styles.copyButton}
                  onPress={() => copyToClipboard(privateKey)}
                >
                  <FontAwesome name="copy" size={16} color="#FFF" />
                </TouchableOpacity>
              </Animated.View>
            ) : null}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowPrivateKeyModal(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
    <Navigation selectedAccount={selectedAccount} />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C1C1C',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  header: {
    color: '#FFF',
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 20,
  },
  section: {
    backgroundColor: '#333',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    color: '#FFF',
    fontSize: 18,
    marginLeft: 10,
  },
  accountInfo: {
    marginLeft: 10,
    flex: 1,
  },
  accountName: {
    color: '#FFF',
    fontSize: 16,
  },
  accountAddressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  accountAddress: {
    color: 'gray',
    fontSize: 14,
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#1C1C1C',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    color: '#FFF',
    fontSize: 18,
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#333',
    color: '#FFF',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginBottom: 20,
    width: '100%',
  },
  createButton: {
    backgroundColor: '#c0c0c0',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  createButtonText: {
    color: '#1C1C1C',
    marginLeft: 10,
  },
  closeButton: {
    marginTop: 10,
  },
  closeButtonText: {
    color: '#FFF',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    borderRadius: 20,
    width: '100%',
    marginBottom: 20,
  },
  passwordInput: {
    flex: 1,
    color: '#FFF',
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  eyeButton: {
    padding: 10,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
  verifyButton: {
    backgroundColor: '#c0c0c0',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  verifyButtonText: {
    color: '#1C1C1C',
    fontSize: 16,
  },
  privateKeyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
  },
  privateKey: {
    color: '#FFF',
    marginRight: 10,
  },
  copyButton: {
    padding: 5,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#333',
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: '#1C1C1C',
  },
  footerButton: {
    alignItems: 'center',
    flex: 1,
  },
  footerButtonText: {
    color: '#FFF',
    marginTop: 5,
  },
  activeFooterButton: {
    borderBottomWidth: 2,
    borderBottomColor: '#c0c0c0',
  },
});

export default Profile;



// import React, {useState, useEffect, useRef} from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   ScrollView,
//   Modal,
//   TextInput,
//   Alert,
//   Clipboard,
//   Animated,
//   Easing,
//   Image,
// } from 'react-native';
// import FontAwesome from 'react-native-vector-icons/FontAwesome';
// import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
// import Feather from 'react-native-vector-icons/Feather';
// import SecureStorage from 'rn-secure-storage';
// import CryptoJS from 'crypto-js';

// const ENCRYPTION_KEY = 'your-encryption-key'; // Replace with your own encryption key

// const Profile = ({navigation,route}) => {
//   const {selectedAccount}=route.params
//   const [accounts, setAccounts] = useState([]);
//   const [selectedDataAccount, setSelectedDataAccount] = useState([]);
//   // const [selectedAccount, setSelectedAccount] = useState(null);
//   const [showPrivateKeyModal, setShowPrivateKeyModal] = useState(false);
//   const [showCreateAccountModal, setShowCreateAccountModal] = useState(false);
//   const [newAccountName, setNewAccountName] = useState('');
//   const [generateNewAccounts, setGenerateNewAccounts] = useState([]);
//   const [password, setPassword] = useState('');
//   const [privateKey, setPrivateKey] = useState('');
//   const [error, setError] = useState('');
//   const [fadeAnim] = useState(new Animated.Value(0));
//   const [showPassword, setShowPassword] = useState(false);
//   const [fetchedAccount, setFetchedAccount] = useState(null);
//   const [fetchedAccountIndex, setFetchedAccountIndex] = useState(-1);

//   const scrollViewRef = useRef(null);

//   useEffect(() => {
//     const getStoredAccounts = async () => {
//       try {
//         const storedAccounts = await SecureStorage.getItem('new accounts');
//         if (storedAccounts) {
//           const parsedAccounts = JSON.parse(storedAccounts);
//           setGenerateNewAccounts(parsedAccounts);
//           setAccounts(parsedAccounts);
//           setSelectedDataAccount(parsedAccounts);
//           // if (parsedAccounts.length > 0) {
//           //   setSelectedAccount(parsedAccounts[0]);
//           // }
//         }
//       } catch (error) {
//         console.error('Error fetching accounts:', error);
//       }
//     };

//     getStoredAccounts();
//   }, []);

//   const handleRevealPrivateKey = account => {
//     setSelectedDataAccount(account);
//     setShowPrivateKeyModal(true);
//     setPrivateKey('');
//     setError('');
//   };
//   // console.log('selectedAccount profile page,', selectedAccount);
//   // console.log('selectedDataAccount === ',selectedDataAccount)

//   const verifyPasswordAndShowPrivateKey = async () => {
//     try {
//       const encryptedPassword = await SecureStorage.getItem('newPassword');
//       const storedPassword = CryptoJS.AES.decrypt(
//         encryptedPassword,
//         ENCRYPTION_KEY,
//       ).toString(CryptoJS.enc.Utf8);

//       if (storedPassword === password) {
//         const privateKeyBytes = CryptoJS.AES.decrypt(
//           selectedAccount.encryptedPrivateKey,
//           'your-secret-key',
//         );
//         const decryptedPrivateKey = privateKeyBytes.toString(CryptoJS.enc.Utf8);

//         setPrivateKey(decryptedPrivateKey);
//         setPassword('');
//         Animated.timing(fadeAnim, {
//           toValue: 1,
//           duration: 500,
//           easing: Easing.inOut(Easing.ease),
//           useNativeDriver: true,
//         }).start();
//       } else {
//         setError('Incorrect password. Please try again.');
//       }
//     } catch (error) {
//       console.error('Error verifying password:', error);
//       setError('An error occurred. Please try again.');
//     }
//   };

//   const copyToClipboard = text => {
//     Clipboard.setString(text);
//     Alert.alert(
//       'Copied to clipboard',
//       'Private key has been copied to clipboard.',
//     );
//   };

//   const handleCreateAccount = async () => {
//     try {
//       const storedAccounts = await SecureStorage.getItem('accounts');
//       if (!storedAccounts) {
//         console.error('No accounts found in local storage');
//         return;
//       }

//       let parsedAccounts = JSON.parse(storedAccounts);
//       if (!parsedAccounts || parsedAccounts.length === 0) {
//         console.error('No valid accounts found in local storage');
//         return;
//       }

//       parsedAccounts.sort((a, b) => {
//         const aName = a.name.match(/Account (\d+)/);
//         const bName = b.name.match(/Account (\d+)/);
//         if (aName && bName) {
//           return parseInt(aName[1], 10) - parseInt(bName[1], 10);
//         }
//         return 0;
//       });

//       let fetchedAccountIndex;
//       try {
//         const storedFetchedAccountIndex = await SecureStorage.getItem(
//           'fetchedAccountIndex',
//         );
//         fetchedAccountIndex = storedFetchedAccountIndex
//           ? parseInt(storedFetchedAccountIndex, 10)
//           : 0;
//       } catch (error) {
//         console.error(
//           'Error retrieving fetchedAccountIndex from local storage:',
//           error,
//         );
//         fetchedAccountIndex = 0;
//       }

//       if (fetchedAccountIndex >= parsedAccounts.length) {
//         console.log('All accounts have already been generated');
//         return;
//       }

//       const nextAccount = parsedAccounts[fetchedAccountIndex];

//       const accountExists = generateNewAccounts.some(
//         account => account.address === nextAccount.address,
//       );

//       if (accountExists) {
//         console.log('Account already exists:', nextAccount);
//         Alert.alert('Account already exists:');
//         return;
//       }

//       setFetchedAccount(nextAccount);
//       setFetchedAccountIndex(fetchedAccountIndex);

//       const updatedAccounts = [...accounts, nextAccount];
//       setAccounts(updatedAccounts);
//       setGenerateNewAccounts([...generateNewAccounts, nextAccount]);

//       setNewAccountName(nextAccount.name);
//       await SecureStorage.setItem(
//         'new accounts',
//         JSON.stringify(updatedAccounts),
//       );
//       await SecureStorage.setItem(
//         'fetchedAccountIndex',
//         (fetchedAccountIndex + 1).toString(),
//       );

//       // setSelectedAccount(nextAccount);
//       // setShowCreateAccountModal(false);

//       setTimeout(() => {
//         if (scrollViewRef.current) {
//           scrollViewRef.current.scrollToEnd({animated: true});
//         }
//       }, 100);
//     } catch (error) {
//       console.error('Error creating account:', error);
//     }
//   };

//   const handleYourWalletButton = () => {
//     navigation.navigate('YourWallet');
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.header}>My Profile</Text>

//       <TouchableOpacity style={styles.section}>
//         <FontAwesome name="user-circle" size={20} color="#c0c0c0" />
//         {selectedAccount && (
//           <View style={styles.accountInfo}>
//             <Text style={styles.accountName}>{selectedAccount?.name}</Text>
//             <View style={styles.accountAddressRow}>
//               <Text style={styles.accountAddress}>
//                 {selectedAccount.address}
//               </Text>
//               <TouchableOpacity
//                 onPress={() => copyToClipboard(selectedAccount?.address)}>
//                 <FontAwesome name="copy" size={16} color="#c0c0c0" />
//               </TouchableOpacity>
//             </View>
//           </View>
//         )}
//       </TouchableOpacity>

//       {/* <TouchableOpacity
//         style={styles.section}
//         onPress={() => setShowCreateAccountModal(true)}>
//         <FontAwesome name="plus-circle" size={20} color="#c0c0c0" />
//         <Text style={styles.sectionTitle}>Create Account</Text>
//       </TouchableOpacity> */}

//       <TouchableOpacity
//         style={styles.section}
//         onPress={() => navigation.navigate('ImportAccount')}>
//         <FontAwesome name="download" size={20} color="#c0c0c0" />
//         <Text style={styles.sectionTitle}>Import Account</Text>
//       </TouchableOpacity>

//       <TouchableOpacity
//         style={styles.section}
//         onPress={() => handleRevealPrivateKey(selectedAccount)}>
//         <FontAwesome name="key" size={20} color="#c0c0c0" />
//         <Text style={styles.sectionTitle}>Reveal Your Secret Key</Text>
//       </TouchableOpacity>

//       <TouchableOpacity style={styles.section} onPress={handleYourWalletButton}>
//         <FontAwesome5 name="wallet" size={20} color="#c0c0c0" />
//         <Text style={styles.sectionTitle}>Your Wallet</Text>
//       </TouchableOpacity>

//       <TouchableOpacity style={styles.section}>
//         <FontAwesome name="user-plus" size={20} color="#c0c0c0" />
//         <Text style={styles.sectionTitle}>Your Referral Code</Text>
//       </TouchableOpacity>

//       <TouchableOpacity style={styles.section}>
//         <FontAwesome name="history" size={20} color="#c0c0c0" />
//         <Text style={styles.sectionTitle}>Your Transaction History</Text>
//       </TouchableOpacity>

//       <View style={styles.footer}>
//         <TouchableOpacity
//           style={styles.footerButton}
//           onPress={() => navigation.navigate('MainPage')}>
//           <FontAwesome name="home" size={24} color="#c0c0c0" />
//           <Text style={styles.footerButtonText}>Home</Text>
//         </TouchableOpacity>
//         <TouchableOpacity
//           style={[styles.footerButton, styles.activeFooterButton]}>
//           <FontAwesome name="user" size={24} color="#c0c0c0" />
//           <Text style={styles.footerButtonText}>Profile</Text>
//         </TouchableOpacity>
//       </View>

//       <Modal
//         visible={showCreateAccountModal}
//         animationType="slide"
//         transparent={true}
//         onRequestClose={() => setShowCreateAccountModal(false)}>
//         <View style={styles.modalContainer}>
//           <View style={styles.modalContent}>
//             <Text style={styles.modalTitle}>Create Account</Text>
//             <TextInput
//               style={styles.input}
//               placeholder="Enter account name"
//               value={newAccountName}
//               onChangeText={setNewAccountName}
//             />
//             <TouchableOpacity
//               style={styles.createButton}
//               onPress={handleCreateAccount}>
//               <Text style={styles.createButtonText}>Save Account</Text>
//             </TouchableOpacity>
//             <TouchableOpacity
//               style={styles.closeButton}
//               onPress={() => setShowCreateAccountModal(false)}>
//               <Text style={styles.closeButtonText}>Close</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </Modal>

//       <Modal
//         visible={showPrivateKeyModal}
//         animationType="slide"
//         transparent={true}
//         onRequestClose={() => setShowPrivateKeyModal(false)}>
//         <View style={styles.modalContainer}>
//           <View style={styles.modalContent}>
//             <Text style={styles.modalTitle}>Enter Password</Text>
//             <View style={styles.passwordContainer}>
//               <TextInput
//                 style={styles.passwordInput}
//                 placeholder="Enter your password"
//                 secureTextEntry={!showPassword}
//                 value={password}
//                 onChangeText={setPassword}
//               />
//               <TouchableOpacity
//                 style={styles.eyeButton}
//                 onPress={() => setShowPassword(!showPassword)}>
//                 <FontAwesome
//                   name={showPassword ? 'eye-slash' : 'eye'}
//                   size={20}
//                   color="#FFF"
//                 />
//               </TouchableOpacity>
//             </View>
//             {error ? <Text style={styles.errorText}>{error}</Text> : null}
//             <TouchableOpacity
//               style={styles.verifyButton}
//               onPress={verifyPasswordAndShowPrivateKey}>
//               <Text style={styles.verifyButtonText}>Verify</Text>
//             </TouchableOpacity>
//             {privateKey ? (
//               <Animated.View
//                 style={[styles.privateKeyContainer, {opacity: fadeAnim}]}>
//                 <Text style={styles.privateKey}>{privateKey}</Text>
//                 <TouchableOpacity
//                   style={styles.copyButton}
//                   onPress={() => copyToClipboard(privateKey)}>
//                   <FontAwesome name="copy" size={16} color="#FFF" />
//                 </TouchableOpacity>
//               </Animated.View>
//             ) : null}
//             <TouchableOpacity
//               style={styles.closeButton}
//               onPress={() => setShowPrivateKeyModal(false)}>
//               <Text style={styles.closeButtonText}>Close</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </Modal>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#1C1C1C',
//     paddingTop: 50,
//     paddingHorizontal: 20,
//   },
//   header: {
//     color: '#FFF',
//     fontSize: 24,
//     textAlign: 'center',
//     marginBottom: 20,
//   },
//   section: {
//     backgroundColor: '#333',
//     borderRadius: 10,
//     padding: 15,
//     marginBottom: 15,
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   sectionTitle: {
//     color: '#FFF',
//     fontSize: 18,
//     marginLeft: 10,
//   },
//   accountInfo: {
//     marginLeft: 10,
//     flex: 1,
//   },
//   accountName: {
//     color: '#FFF',
//     fontSize: 16,
//   },
//   accountAddressRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//   },
//   accountAddress: {
//     color: 'gray',
//     fontSize: 14,
//     flex: 1,
//   },
//   modalContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: 'rgba(0,0,0,0.5)',
//   },
//   modalContent: {
//     width: '80%',
//     backgroundColor: '#1C1C1C',
//     padding: 20,
//     borderRadius: 10,
//     alignItems: 'center',
//   },
//   modalTitle: {
//     color: '#FFF',
//     fontSize: 18,
//     marginBottom: 20,
//   },
//   input: {
//     backgroundColor: '#333',
//     color: '#FFF',
//     borderRadius: 20,
//     paddingVertical: 10,
//     paddingHorizontal: 15,
//     marginBottom: 20,
//     width: '100%',
//   },
//   createButton: {
//     backgroundColor: '#c0c0c0',
//     borderRadius: 20,
//     paddingVertical: 10,
//     paddingHorizontal: 20,
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 20,
//   },
//   createButtonText: {
//     color: '#1C1C1C',
//     marginLeft: 10,
//   },
//   closeButton: {
//     marginTop: 10,
//   },
//   closeButtonText: {
//     color: '#FFF',
//   },
//   passwordContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#333',
//     borderRadius: 20,
//     width: '100%',
//     marginBottom: 20,
//   },
//   passwordInput: {
//     flex: 1,
//     color: '#FFF',
//     paddingVertical: 10,
//     paddingHorizontal: 15,
//   },
//   eyeButton: {
//     padding: 10,
//   },
//   errorText: {
//     color: 'red',
//     marginBottom: 10,
//   },
//   verifyButton: {
//     backgroundColor: '#c0c0c0',
//     borderRadius: 20,
//     paddingVertical: 10,
//     paddingHorizontal: 20,
//     marginBottom: 20,
//   },
//   verifyButtonText: {
//     color: '#1C1C1C',
//     fontSize: 16,
//   },
//   privateKeyContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#333',
//     padding: 10,
//     borderRadius: 10,
//     marginTop: 10,
//   },
//   privateKey: {
//     color: '#FFF',
//     marginRight: 10,
//   },
//   copyButton: {
//     padding: 5,
//   },
//   footer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     paddingVertical: 20,
//     borderTopWidth: 1,
//     borderTopColor: '#333',
//   },
//   footerButton: {
//     alignItems: 'center',
//   },
//   footerButtonText: {
//     color: '#FFF',
//     marginTop: 5,
//   },
//   activeFooterButton: {
//     borderBottomWidth: 2,
//     borderBottomColor: '#c0c0c0',
//   },
// });

// export default Profile;
