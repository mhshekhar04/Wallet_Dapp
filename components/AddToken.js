import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  Image,
} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { ethers } from 'ethers';
import RNSecureStorage from 'rn-secure-storage';
import Svg, { Circle, Text as SvgText } from 'react-native-svg';
const abi = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function balanceOf(address) view returns (uint256)',
];
export default function AddToken({ navigation, route }) {
  const { selectedNetwork } = route.params;
  const provider = new ethers.providers.JsonRpcProvider(
    selectedNetwork?.networkurl,
  );
  const [address, setAddress] = useState('');
  const [isValid, setIsValid] = useState(true);
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [tokenName, setTokenName] = useState('');
  const [tokenImage, setTokenImage] = useState('');
  const [showTokenInfo, setShowTokenInfo] = useState(false);
  const handleAddressChange = input => {
    setAddress(input);
    if (ethers.utils.isAddress(input)) {
      setIsValid(true);
    } else {
      setIsValid(false);
    }
  };
  const fetchTokenImage = async (address, selectedNetwork) => {
    let tokenImageUrl;
    switch (selectedNetwork.name) {
      case 'Sepolia':
      case 'Ethereum Mainnet':
        tokenImageUrl = `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${ethers.utils.getAddress(
          address,
        )}/logo.png`;
        break;
      case 'Polygon Mainnet':
      case 'Amoy':
        tokenImageUrl = `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/polygon/assets/${ethers.utils.getAddress(
          address,
        )}/logo.png`;
        break;
      case 'BNB Chain Mainnet':
      case 'BNB testnet':
        tokenImageUrl = `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/binance/assets/${ethers.utils.getAddress(
          address,
        )}/logo.png`;
        break;
        case 'Core Mainnet':
          tokenImageUrl = `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/core/assets/${ethers.utils.getAddress(
            address,
          )}/logo.png`;
      default:
        tokenImageUrl = '';
        break;
    }
    
    console.log(`Fetching token image from URL: ${tokenImageUrl}`);
    try {
      const response = await fetch(tokenImageUrl);
      if (response.ok) {
        return tokenImageUrl;
      } else {
        const coingeckoUrl = `https://api.coingecko.com/api/v3/coins/${selectedNetwork.name.toLowerCase()}/contract/${ethers.utils.getAddress(
          address,
        )}`;
        const coingeckoResponse = await fetch(coingeckoUrl);
        if (coingeckoResponse.ok) {
          const coingeckoData = await coingeckoResponse.json();
          return coingeckoData.image.thumb;
        } else {
          return '';
        }
      }
    } catch (error) {
      console.error('Error fetching token image:', error);
      return '';
    }
  };
  const generateFallbackIcon = name => {
    const firstLetter = name.charAt(0).toUpperCase();
    return (
      <Svg height="50" width="50">
        <Circle cx="25" cy="25" r="25" fill="#FEBF32" />
        <SvgText
          x="25"
          y="35"
          textAnchor="middle"
          fill="#FFFFFF"
          fontSize="24"
          fontWeight="bold">
          {firstLetter}
        </SvgText>
      </Svg>
    );
  };
  const handleNext = async () => {
    if (ethers.utils.isAddress(address)) {
      try {
        const tokenContract = new ethers.Contract(address, abi, provider);
        // Fetch token name
        let name;
        try {
          name = await tokenContract.name();
        } catch (error) {
          console.error('Error fetching token name:', error);
          Alert.alert(
            'Error',
            'Failed to fetch token name. This might not be a valid ERC-20 token.',
          );
          return;
        }
         // Fetch token symbol
         let symbol;
         try {
           symbol = await tokenContract.symbol();
         } catch (error) {
           console.error('Error fetching token symbol:', error);
           Alert.alert(
             'Error',
             'Failed to fetch token symbol. This might not be a valid ERC-20 token.',
           );
           return;
         }
        // Fetch token image
        const imageUrl = await fetchTokenImage(address, selectedNetwork);
        setTokenSymbol(symbol);
        setTokenName(name);
        setTokenImage(imageUrl);
        setShowTokenInfo(true);
      } catch (error) {
        setIsValid(false);
        console.error('Error fetching token data:', error);
        Alert.alert(
          'Error',
          'Failed to fetch token data. Please check the contract address and try again.',
        );
      }
    } else {
      Alert.alert(
        'Invalid Address',
        'Please enter a valid token contract address.',
      );
    }
  };
  const handleImport = async () => {
    if (!ethers.utils.isAddress(address)) {
      Alert.alert(
        'Invalid Address',
        'Please enter a valid token contract address.',
      );
      return;
    }
    const fallbackIcon = generateFallbackIcon(tokenName);
    const newToken = {
      address,
      symbol: tokenSymbol,
      name: tokenName,
      image: tokenImage || fallbackIcon,
      network: selectedNetwork.name // Add the network property
    };
    try {
      let existingTokens = [];
      try {
        const existingTokensJson = await RNSecureStorage.getItem('tokenss');
        if (existingTokensJson) {
          existingTokens = JSON.parse(existingTokensJson);
        }
      } catch (error) {
        console.warn('Error fetching tokens from storage:', error);
      }
      if (!Array.isArray(existingTokens)) {
        existingTokens = [];
      }
      const tokenExists = existingTokens.some(
        token => token.address === address,
      );
      if (tokenExists) {
        Alert.alert(
          'Token Already Imported',
          'This token has already been imported.',
        );
        return;
      }
      existingTokens.push(newToken);
      await RNSecureStorage.setItem('tokenss', JSON.stringify(existingTokens));
      Alert.alert('Token Imported', 'Token successfully imported!');
      navigation.navigate('MainPage');
    } catch (error) {
      console.error('Error storing token:', error);
      Alert.alert('Error', 'Failed to import token. Please try again.');
    }
  };
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Add Token</Text>
      <View style={styles.warningContainer}>
        <FontAwesome name="exclamation-triangle" size={24} color="#FEBF32" />
        <Text style={styles.warningText}>
          Anyone can create a token, including creating fake versions of
          existing tokens.
        </Text>
      </View>
      <Text style={styles.sectionHeader}>Token Contract Address</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter token contract address"
        placeholderTextColor="#ABAFC4"
        value={address}
        onChangeText={handleAddressChange}
      />
      {!isValid && <Text style={styles.invalidText}>Invalid address</Text>}
      {!showTokenInfo && (
        <TouchableOpacity
          style={[
            styles.nextButton,
            isValid ? styles.activeButton : styles.inactiveButton,
          ]}
          onPress={handleNext}
          disabled={!isValid}>
          <Text style={styles.buttonText}>Next</Text>
        </TouchableOpacity>
      )}
      {showTokenInfo && (
        <View>
          <Text style={styles.sectionHeader}>
            Would you like to import this token?
          </Text>
          <Text style={styles.tokenSymbol}>{tokenSymbol}</Text>
          {tokenImage ? (
            <Image source={{uri: tokenImage}} style={styles.tokenImage} />
          ) : (
            generateFallbackIcon(tokenName)
          )}
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setShowTokenInfo(false)}>
              <Text style={styles.buttonText}>Back</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.importButton}
              onPress={handleImport}>
              <Text style={styles.buttonText}>Import</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C1C1C',
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
  },
  warningText: {
    color: '#FEBF32',
    marginLeft: 10,
    fontSize: 14,
    flex: 1,
    flexWrap: 'wrap',
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#333',
    color: '#FFF',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  invalidText: {
    color: '#FF6347',
    marginBottom: 10,
  },
  nextButton: {
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 20,
  },
  activeButton: {
    backgroundColor: '#FEBF32',
  },
  inactiveButton: {
    backgroundColor: '#555',
  },
  buttonText: {
    color: '#1C1C1C',
    fontWeight: 'bold',
  },
  tokenSymbol: {
    color: '#FFF',
    fontSize: 18,
    marginBottom: 10,
  },
  tokenImage: {
    width: 20,
    height: 20,
    marginBottom: 10,
  },
  tokenImagePlaceholder: {
    color: '#ABAFC4',
    marginBottom: 10,
  },
  buttonRow: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  backButton: {
    backgroundColor: '#555',
    padding: 15,
    borderRadius: 5,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  importButton: {
    backgroundColor: '#FEBF32',
    padding: 15,
    borderRadius: 5,
    flex: 1,
    marginLeft: 10,
    alignItems: 'center',
  },
});


// import React, {useState} from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   TextInput,
//   Alert,
// } from 'react-native';
// import FontAwesome from 'react-native-vector-icons/FontAwesome';
// import {ethers} from 'ethers';
// import RNSecureStorage from 'rn-secure-storage';

// // console.log("my urlll", provider);

// // Replace <API-KEY> with your actual Infura API key
// const abi = [
//   'function name() view returns (string)',
//   'function symbol() view returns (string)',
//   'function decimals() view returns (uint8)',
//   'function balanceOf(address) view returns (uint256)',
// ];

// export default function AddToken({navigation, route}) {
//   const {selectedNetwork} = route.params;
//   const provider = new ethers.providers.JsonRpcProvider(selectedNetwork?.networkurl);
//   // const provider = selectedNetwork?.networkurl;
//   console.log('hhhhh=====', selectedNetwork);
//   const [address, setAddress] = useState('');
//   const [isValid, setIsValid] = useState(true);
//   const [tokenSymbol, setTokenSymbol] = useState('');
//   const [tokenName, setTokenName] = useState('');
//   const [showTokenInfo, setShowTokenInfo] = useState(false);

//   const handleAddressChange = input => {
//     console.log("hhhhhhhhhhhhh====",provider);
//     console.log('input', input);
//     setAddress(input);
//     if (ethers.utils.isAddress(input)) {
//       setIsValid(true);
//       console.log('true hai', true);
//     } else {
//       setIsValid(false);
//       console.log('falsrhai', false);
//     }
//   };

//   // const handleNext = async () => {
//   //   console.log('adress validdd', address);

//   //   if (ethers.utils.isAddress(address)) {
//   //     try {
//   //       console.log('is address if', provider);
//   //       const tokenContract = new ethers.Contract(address, abi, provider);
//   //       const symbol = await tokenContract.symbol();
//   //       const name = await tokenContract.name();
//   //       setTokenSymbol(symbol);
//   //       setTokenName(name);
//   //       setShowTokenInfo(true);
//   //     } catch (error) {
//   //       setIsValid(false);
//   //       console.error('Error fethcing address:url', error);
//   //     }
//   //   }
//   // };
//   const handleNext = async () => {
//     if (ethers.utils.isAddress(address)) {
//       try {
//         const provider = new ethers.providers.JsonRpcProvider(selectedNetwork?.networkurl);
//         const tokenContract = new ethers.Contract(address, abi, provider);
//         const symbol = await tokenContract.symbol();
//         const name = await tokenContract.name();
//         setTokenSymbol(symbol);
//         setTokenName(name);
//         setShowTokenInfo(true);
//       } catch (error) {
//         setIsValid(false);
//         console.error('Error fetching address:', error);
//       }
//     }
//   };
  

 
//   const handleImport = async () => {
//     console.log('address valid', address);
    
//     if (!ethers.utils.isAddress(address)) {
//       Alert.alert(
//         'Invalid Address',
//         'Please enter a valid token contract address.',
//       );
//       return;
//     }
  
//     const newToken = { address, symbol: tokenSymbol, name: tokenName };
  
//     try {
//       // Initialize existingTokens as an empty array
//       let existingTokens = [];
  
//       // Attempt to fetch existing tokens from storage
//       try {
//         const existingTokensJson = await RNSecureStorage.getItem('tokenss');
//         if (existingTokensJson) {
//           existingTokens = JSON.parse(existingTokensJson);
//         }
//       } catch (error) {
//         console.warn('Error fetching tokens from storage:', error);
//         // Handle error if necessary
//       }
  
//       // Ensure existingTokens is an array
//       if (!Array.isArray(existingTokens)) {
//         existingTokens = [];
//       }
  
//       // Check if the token address already exists in the list
//       const tokenExists = existingTokens.some(token => token.address === address);
//       if (tokenExists) {
//         Alert.alert('Token Already Imported', 'This token has already been imported.');
//         return;
//       }
  
//       // Append new token to the existing list
//       existingTokens.push(newToken);
  
//       // Store the updated list back into storage
//       await RNSecureStorage.setItem('tokenss', JSON.stringify(existingTokens));
  
//       Alert.alert('Token Imported', 'Token successfully imported!');
//       navigation.navigate('MainPage');
//     } catch (error) {
//       console.error('Error storing token:', error);
//       Alert.alert('Error', 'Failed to import token. Please try again.');
//     }
//   };
  
  

//   return (
//     <View style={styles.container}>
//       <Text style={styles.header}>Add Token</Text>

//       <View style={styles.warningContainer}>
//         <FontAwesome name="exclamation-triangle" size={24} color="#FEBF32" />
//         <Text style={styles.warningText}>
//           Anyone can create a token, including creating fake versions of
//           existing tokens.
//         </Text>
//       </View>

//       <Text style={styles.sectionHeader}>Token Contract Address</Text>
//       <TextInput
//         style={styles.input}
//         placeholder="Enter token contract address"
//         placeholderTextColor="#ABAFC4"
//         value={address}
//         onChangeText={handleAddressChange}
//       />
//       {!isValid && <Text style={styles.invalidText}>Invalid address</Text>}

//       {!showTokenInfo && (
//         <TouchableOpacity
//           style={[
//             styles.nextButton,
//             isValid ? styles.activeButton : styles.inactiveButton,
//           ]}
//           onPress={handleNext}
//           disabled={!isValid}>
//           <Text style={styles.buttonText}>Next</Text>
//         </TouchableOpacity>
//       )}

//       {showTokenInfo && (
//         <View>
//           <Text style={styles.sectionHeader}>
//             Would you like to import this token?
//           </Text>
//           <Text style={styles.tokenSymbol}>{tokenSymbol}</Text>
//           <View style={styles.buttonRow}>
//             <TouchableOpacity
//               style={styles.backButton}
//               onPress={() => setShowTokenInfo(false)}>
//               <Text style={styles.buttonText}>Back</Text>
//             </TouchableOpacity>
//             <TouchableOpacity
//               style={styles.importButton}
//               onPress={handleImport}>
//               <Text style={styles.buttonText}>Import</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#17171A',
//     paddingHorizontal: 20,
//     paddingTop: 40,
//   },
//   header: {
//     color: '#FEBF32',
//     fontSize: 24,
//     fontFamily: 'Poppins',
//     marginBottom: 20,
//     textAlign: 'center',
//   },
//   warningContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#26262A',
//     padding: 10,
//     borderRadius: 5,
//     marginBottom: 20,
//   },
//   warningText: {
//     color: '#FFF',
//     fontSize: 14,
//     fontFamily: 'Poppins',
//     marginLeft: 10,
//   },
//   sectionHeader: {
//     color: '#FFF',
//     fontSize: 16,
//     fontFamily: 'Poppins',
//     marginBottom: 10,
//   },
//   input: {
//     backgroundColor: '#26262A',
//     color: '#FFF',
//     borderRadius: 5,
//     padding: 10,
//     marginBottom: 10,
//   },
//   invalidText: {
//     color: 'red',
//     fontSize: 14,
//     fontFamily: 'Poppins',
//     marginBottom: 10,
//   },
//   nextButton: {
//     padding: 15,
//     borderRadius: 5,
//     marginBottom: 20,
//   },
//   activeButton: {
//     backgroundColor: '#FEBF32',
//   },
//   inactiveButton: {
//     backgroundColor: '#555',
//   },
//   buttonText: {
//     color: '#17171A',
//     fontSize: 16,
//     fontFamily: 'Poppins',
//     textAlign: 'center',
//   },
//   tokenSymbol: {
//     color: '#FFF',
//     fontSize: 24,
//     fontFamily: 'Poppins',
//     textAlign: 'center',
//     marginBottom: 20,
//   },
//   buttonRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//   },
//   backButton: {
//     backgroundColor: '#555',
//     padding: 15,
//     borderRadius: 5,
//     flex: 1,
//     marginRight: 10,
//   },
//   importButton: {
//     backgroundColor: '#FEBF32',
//     padding: 15,
//     borderRadius: 5,
//     flex: 1,
//     marginLeft: 10,
//   },
// });
