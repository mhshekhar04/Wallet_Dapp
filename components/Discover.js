import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Navigation from './Navigation';
<<<<<<< Updated upstream
=======
import { useWalletConnect } from './walletConnect';
>>>>>>> Stashed changes

const dexLinks = [
  { name: '1inch.io', url: 'https://1inch.io' },
  { name: 'Curve', url: 'https://curve.fi' },
  { name: 'Pancakeswap', url: 'https://pancakeswap.finance/swap' },
<<<<<<< Updated upstream
  { name: 'Aerodrome', url: 'https://aerodrome.finance/swap' },
  { name: 'Gmx', url: 'https://app.gmx.io/#/trade' },
];

export default function Discover({ navigation, route }) {
  const { selectedAccount, selectedNetwork } = route.params;
=======
  { name: 'Aerodrome', url: 'https://aerodrome.com' },
  { name: 'Gmx', url: 'https://gmx.io' },
];

export default function Discover({ navigation, route }) {
  const { selectedAccount } = route.params;
>>>>>>> Stashed changes
  const [searchQuery, setSearchQuery] = useState('');
  const { connector, accounts, chainId } = useWalletConnect();

<<<<<<< Updated upstream
  const handleSearch = () => {
    let url = searchQuery.trim();
    if (!/^https?:\/\//i.test(url)) {
      url = `https://${url}`;
    }
    navigation.navigate('WebViewScreen', { url, selectedAccount, selectedNetwork });
  };

  const handleLinkPress = (url) => {
    navigation.navigate('WebViewScreen', { url, selectedAccount, selectedNetwork });
=======
  const handleSearchAndConnect = async () => {
    try {
      let url = searchQuery.trim();
      if (!/^https?:\/\//i.test(url)) {
        url = `https://${url}`;
      }

      const navigateWithUri = (uri) => {
        const fullUrl = uri ? `${url}?uri=${encodeURIComponent(uri)}` : url;
        navigation.navigate('WebViewScreen', { url: fullUrl });
      };

      if (connector && !connector.connected) {
        await connector.createSession();
        const uri = connector.uri;
        console.log('WalletConnect URI:', uri);
        navigateWithUri(uri);
      } else if (connector && connector.connected) {
        const uri = connector.uri;
        navigateWithUri(uri);
      } else {
        navigateWithUri(null);
      }
    } catch (error) {
      console.error('Error during WalletConnect session creation:', error);
      Alert.alert('Error', 'An error occurred while connecting to WalletConnect. Please try again.');
    }
  };

  const handleLinkPress = async (url) => {
    try {
      const navigateWithUri = (uri) => {
        const fullUrl = uri ? `${url}?uri=${encodeURIComponent(uri)}` : url;
        navigation.navigate('WebViewScreen', { url: fullUrl });
      };

      if (connector && !connector.connected) {
        await connector.createSession();
        const uri = connector.uri;
        console.log('WalletConnect URI:', uri);
        navigateWithUri(uri);
      } else if (connector && connector.connected) {
        const uri = connector.uri;
        navigateWithUri(uri);
      } else {
        navigateWithUri(null);
      }
    } catch (error) {
      console.error('Error during WalletConnect session creation:', error);
      Alert.alert('Error', 'An error occurred while connecting to WalletConnect. Please try again.');
    }
>>>>>>> Stashed changes
  };

  return (
    <>
      <View style={styles.container}>
        <TextInput
          style={styles.searchBar}
          placeholder="Paste link here..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          keyboardType="url"
          autoCapitalize="none"
        />
<<<<<<< Updated upstream
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>Go</Text>
        </TouchableOpacity>
=======
        <TouchableOpacity style={styles.searchButton} onPress={handleSearchAndConnect}>
          <Text style={styles.searchButtonText}>Go & Connect Wallet</Text>
        </TouchableOpacity>
        {accounts.length > 0 && (
          <View style={styles.walletInfo}>
            <Text style={styles.walletText}>Connected Wallet:</Text>
            <Text style={styles.walletText}>{accounts[0]}</Text>
          </View>
        )}
>>>>>>> Stashed changes
        <ScrollView>
          {dexLinks.map((dex) => (
            <TouchableOpacity
              key={dex.name}
              style={styles.link}
              onPress={() => handleLinkPress(dex.url)}
            >
              <Text style={styles.linkText}>{dex.name}</Text>
<<<<<<< Updated upstream
              <FontAwesome name="external-link" size={16} color="#c0c0c0" />
=======
              <FontAwesome name="external-link" size={16} color="#FEBF32" />
>>>>>>> Stashed changes
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      <Navigation selectedAccount={selectedAccount} />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C1C1C',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  searchBar: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 16,
    paddingLeft: 8,
    color: '#FFF',
    backgroundColor: '#333',
  },
  searchButton: {
    backgroundColor: '#FEBF32',
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  searchButtonText: {
    color: '#1C1C1C',
  },
  walletInfo: {
    padding: 10,
    backgroundColor: '#333',
    borderRadius: 5,
    marginBottom: 20,
    alignItems: 'center',
  },
  walletText: {
    color: '#FFF',
  },
  link: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#333',
    padding: 15,
    borderRadius: 5,
    marginVertical: 5,
  },
  linkText: {
    color: '#FFF',
    fontSize: 16,
  },
});
<<<<<<< Updated upstream
=======



// import React, { useState } from 'react';
// import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
// import FontAwesome from 'react-native-vector-icons/FontAwesome';
// import Navigation from './Navigation';



// const dexLinks = [
//   { name: '1inch.io', url: 'https://app.1inch.io/#/1/swap/ETH/DAI' },
//   { name: 'Curve', url: 'https://curve.fi/#/ethereum/swap' },
//   { name: 'Pancakeswap', url: 'https://pancakeswap.finance/swap' },
//   { name: 'Aerodrome', url: 'https://aerodrome.finance/swap' }, // Updated the URL
//   { name: 'Gmx', url: 'https://app.gmx.io/#/trade' },

// ];


// export default function Discover({ navigation,route }) {
//   const {selectedAccount} = route.params;
//   const [searchQuery, setSearchQuery] = useState('');

//   const handleSearch = () => {
//     let url = searchQuery.trim();
//     if (!/^https?:\/\//i.test(url)) {
//       url = 'https://${url}';
//     }
//     navigation.navigate('WebViewScreen', { url });
//   };

//   const handleLinkPress = (url) => {
//     navigation.navigate('WebViewScreen', { url });
//   };

//   return (
//     <>

    
//     <View style={styles.container}>
//       <TextInput
//         style={styles.searchBar}
//         placeholder="Paste link here..."
//         value={searchQuery}
//         onChangeText={setSearchQuery}
//         keyboardType="url"
//         autoCapitalize="none"
//       />
//       <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
//         <Text style={styles.searchButtonText}>Go</Text>
//       </TouchableOpacity>
//       <ScrollView>
//         {dexLinks.map((dex) => (
//           <TouchableOpacity
//             key={dex.name}
//             style={styles.link}
//             onPress={() => handleLinkPress(dex.url)}
//           >
//             <Text style={styles.linkText}>{dex.name}</Text>
//             <FontAwesome name="external-link" size={16} color="#c0c0c0" />
//           </TouchableOpacity>
//         ))}
//       </ScrollView>
//     </View>
//     <Navigation selectedAccount={selectedAccount} />
//     </>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#1C1C1C',
//     paddingTop: 50,
//     paddingHorizontal: 20,
//   },
//   searchBar: {
//     height: 40,
//     borderColor: 'gray',
//     borderWidth: 1,
//     marginBottom: 16,
//     paddingLeft: 8,
//     color: '#FFF',
//     backgroundColor: '#333',
//   },
//   searchButton: {
//     backgroundColor: '#c0c0c0',
//     borderRadius: 5,
//     paddingVertical: 10,
//     paddingHorizontal: 20,
//     marginBottom: 20,
//     alignItems: 'center',
//   },
//   searchButtonText: {
//     color: '#1C1C1C',
//   },
//   link: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     backgroundColor: '#333',
//     padding: 15,
//     borderRadius: 5,
//     marginVertical: 5,
//   },
//   linkText: {
//     color: '#FFF',
//     fontSize: 16,
//   },
// });













// import React, { useState, useEffect } from 'react';
// import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
// import FontAwesome from 'react-native-vector-icons/FontAwesome';
// import Navigation from './Navigation';
// import { useWeb3React } from '@web3-react/core';
// import { InjectedConnector } from '@web3-react/injected-connector';

// const injected = new InjectedConnector({ supportedChainIds: [1, 3, 4, 5, 42] });

// const dexLinks = [
//   { name: '1inch.io', url: 'https://app.1inch.io/#/1/swap/ETH/DAI' },
//   { name: 'Curve', url: 'https://curve.fi/#/ethereum/swap' },
//   { name: 'Pancakeswap', url: 'https://pancakeswap.finance/swap' },
//   { name: 'Aerodrome', url: 'https://aerodrome.finance/swap' },
//   { name: 'Gmx', url: 'https://app.gmx.io/#/trade' },
// ];

// export default function Discover({ navigation, route }) {
//   const { selectedAccount } = route.params;
//   const [searchQuery, setSearchQuery] = useState('');
//   const { activate, account, library } = useWeb3React();

//   const handleSearch = () => {
//     let url = searchQuery.trim();
//     if (!/^https?:\/\//i.test(url)) {
//       url = `https://${url}`;
//     }
//     navigation.navigate('WebViewScreen', { url });
//   };

//   const handleLinkPress = async (url) => {
//     if (!account) {
//       await activate(injected);
//     }
//     navigation.navigate('WebViewScreen', { url });
//   };

//   return (
//     <>
//       <View style={styles.container}>
//         <TextInput
//           style={styles.searchBar}
//           placeholder="Paste link here..."
//           value={searchQuery}
//           onChangeText={setSearchQuery}
//           keyboardType="url"
//           autoCapitalize="none"
//         />
//         <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
//           <Text style={styles.searchButtonText}>Go</Text>
//         </TouchableOpacity>
//         <ScrollView>
//           {dexLinks.map((dex) => (
//             <TouchableOpacity
//               key={dex.name}
//               style={styles.link}
//               onPress={() => handleLinkPress(dex.url)}
//             >
//               <Text style={styles.linkText}>{dex.name}</Text>
//               <FontAwesome name="external-link" size={16} color="#c0c0c0" />
//             </TouchableOpacity>
//           ))}
//         </ScrollView>
//       </View>
//       <Navigation selectedAccount={selectedAccount} />
//     </>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#1C1C1C',
//     paddingTop: 50,
//     paddingHorizontal: 20,
//   },
//   searchBar: {
//     height: 40,
//     borderColor: 'gray',
//     borderWidth: 1,
//     marginBottom: 16,
//     paddingLeft: 8,
//     color: '#FFF',
//     backgroundColor: '#333',
//   },
//   searchButton: {
//     backgroundColor: '#c0c0c0',
//     borderRadius: 5,
//     paddingVertical: 10,
//     paddingHorizontal: 20,
//     marginBottom: 20,
//     alignItems: 'center',
//   },
//   searchButtonText: {
//     color: '#1C1C1C',
//   },
//   link: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     backgroundColor: '#333',
//     padding: 15,
//     borderRadius: 5,
//     marginVertical: 5,
//   },
//   linkText: {
//     color: '#FFF',
//     fontSize: 16,
//   },
// });
>>>>>>> Stashed changes
