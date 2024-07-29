<<<<<<< Updated upstream
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import CryptoJS from 'crypto-js';
import { ethers } from 'ethers';

const decryptPrivateKey = (encryptedPrivateKey) => {
  const bytes = CryptoJS.AES.decrypt(encryptedPrivateKey, 'your-secret-key');
  return bytes.toString(CryptoJS.enc.Utf8);
};

const injectScript = (selectedAccount, privateKey, selectedNetwork) => {
  return `
    (function() {
      console.log('Injected script executed');

      const selectedAccount = "${selectedAccount}";
      const privateKey = "${privateKey}";

      window.ethereum = {
        isMetaMask: true,
        selectedAddress: selectedAccount,
        enable: async () => {
          console.log('enable called');
          return [selectedAccount];
        },
        request: async ({ method, params }) => {
          console.log('request called', method, params);
          if (method === 'eth_requestAccounts' || method === 'eth_accounts') {
            return [selectedAccount];
          }
          if (method === 'eth_chainId') {
            return '${selectedNetwork.chainId}';
          }
          if (method === 'personal_sign') {
            const wallet = new ethers.Wallet(privateKey);
            const signature = await wallet.signMessage(ethers.utils.arrayify(params[0]));
            console.log('personal_sign signature', signature);
            return signature;
          }
          return [];
        },
        sendAsync: (request, callback) => {
          console.log('sendAsync called', request);
          if (request.method === 'eth_requestAccounts' || request.method === 'eth_accounts') {
            callback(null, { result: [selectedAccount] });
          } else if (request.method === 'eth_chainId') {
            callback(null, { result: '${selectedNetwork.chainId}' });
          } else if (request.method === 'personal_sign') {
            const wallet = new ethers.Wallet(privateKey);
            wallet.signMessage(ethers.utils.arrayify(request.params[0]))
              .then(signature => {
                console.log('sendAsync personal_sign signature', signature);
                callback(null, { result: signature });
              })
              .catch(error => {
                console.error('sendAsync personal_sign error', error);
                callback(error, null);
              });
          } else {
            callback(new Error('Unsupported method'), null);
          }
        }
      };

      console.log('window.ethereum injected', window.ethereum);

      // Optional: For older dApps using web3
      if (typeof window.web3 === 'undefined') {
        window.web3 = new Web3(window.ethereum);
        console.log('window.web3 injected', window.web3);
      }
    })();
    true;
  `;
};

export default function WebViewScreen({ route }) {
  const { url, selectedAccount, selectedNetwork } = route.params;
  const { address, encryptedPrivateKey } = selectedAccount;
  const webViewRef = useRef(null);

  const privateKey = decryptPrivateKey(encryptedPrivateKey);
  const injectedJavaScript = injectScript(address, privateKey, selectedNetwork);

  useEffect(() => {
    console.log("WebViewScreen mounted");
  }, []);
=======

import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import WalletConnect from "@walletconnect/client";

export default function WebViewScreen({ route }) {
  const { url } = route.params;
  const webViewRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('Navigating to URL:', url);

    if (url.includes("wc?uri=")) {
      const walletConnectUri = url.split("wc?uri=")[1];
      console.log('WalletConnect URI:', decodeURIComponent(walletConnectUri));

      const connector = new WalletConnect({
        uri: decodeURIComponent(walletConnectUri),
      });

      connector.on("connect", (error, payload) => {
        if (error) {
          setError(error.message);
          console.error('WalletConnect connect error:', error);
          return;
        }
        // Get provided accounts and chainId
        const { accounts, chainId } = payload.params[0];
        console.log('Connected:', accounts, chainId);
      });

      connector.on("session_update", (error, payload) => {
        if (error) {
          setError(error.message);
          console.error('WalletConnect session update error:', error);
          return;
        }
        // Get updated accounts and chainId
        const { accounts, chainId } = payload.params[0];
        console.log('Session Updated:', accounts, chainId);
      });

      connector.on("disconnect", (error) => {
        if (error) {
          setError(error.message);
          console.error('WalletConnect disconnect error:', error);
          return;
        }
        console.log("Disconnected");
      });
    }
  }, [url]);

  const handleLoadEnd = () => {
    console.log('WebView load end');
    setLoading(false);
  };

  const handleError = (syntheticEvent) => {
    const { nativeEvent } = syntheticEvent;
    console.warn('WebView error:', nativeEvent);
    setError(nativeEvent.description);
    setLoading(false);
  };
>>>>>>> Stashed changes

  return (
    <View style={styles.container}>
      {loading && (
        <ActivityIndicator
          color="#FEBF32"
          size="large"
          style={styles.loadingIndicator}
        />
      )}
      {error && <Text style={styles.errorText}>{error}</Text>}
      <WebView
        ref={webViewRef}
        source={{ uri: url }}
        style={styles.webView}
        injectedJavaScript={injectedJavaScript}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        onLoadEnd={handleLoadEnd}
        onError={handleError}
        renderError={(errorName) => (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{errorName}</Text>
          </View>
        )}
        onMessage={(event) => {
          console.log('WebView message', event.nativeEvent.data);
        }}
        onError={(event) => {
          console.error('WebView error', event.nativeEvent);
        }}
        onLoadStart={() => {
          console.log('WebView loading started');
        }}
        onLoadEnd={() => {
          console.log('WebView loading ended');
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1C1C1C',
    flex: 1,
  },
  webView: {
    flex: 1,
  },
  loadingIndicator: {
    flex: 1,
    justifyContent: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
});
<<<<<<< Updated upstream
=======


//recent code
// import React from 'react';
// import {View, StyleSheet, ActivityIndicator} from 'react-native';
// import {WebView} from 'react-native-webview';

// export default function WebViewScreen({route}) {
//   const {url} = route.params;

//   return (
//     <View style={styles.container}>
//       <WebView
//         source={{uri: url}}
//         style={styles.webView}
//         startInLoadingState={true}
//         renderLoading={() => (
//           <ActivityIndicator
//             color="#c0c0c0"
//             size="large"
//             style={styles.loadingIndicator}
//           />
//         )}
//       />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     backgroundColor: '1C1C1C',
//     flex: 1,
//   },
//   webView: {
//     flex: 1,
//   },
//   loadingIndicator: {
//     flex: 1,
//     justifyContent: 'center',
//   },
// });





// import React, { useRef, useEffect } from 'react';
// import { View, StyleSheet } from 'react-native';
// import { WebView } from 'react-native-webview';
// // import WalletConnect from '@walletconnect/client';
// // import QRCodeModal from '@walletconnect/qrcode-modal';

// export default function WebViewScreen({ navigation, route }) {
//   const { url, selectedAccount } = route.params;
//   const connector = useRef(null);

//   useEffect(() => {
//     async function setupWalletConnect() {
//       try {
//         connector.current = new WalletConnect({
//           bridge: 'https://bridge.walletconnect.org', // Required
//           qrcodeModal: QRCodeModal,
//         });

//         if (!connector.current.connected) {
//           await connector.current.createSession();
//         }

//         connector.current.on('connect', (error, payload) => {
//           if (error) {
//             throw error;
//           }
//           const { accounts } = payload.params[0];
//           console.log('Connected', accounts);
//         });

//         connector.current.on('session_update', (error, payload) => {
//           if (error) {
//             throw error;
//           }
//           const { accounts } = payload.params[0];
//           console.log('Updated', accounts);
//         });

//         connector.current.on('disconnect', (error, payload) => {
//           if (error) {
//             throw error;
//           }
//           console.log('Disconnected');
//         });
//       } catch (error) {
//         console.error('WalletConnect error:', error);
//       }
//     }

//     setupWalletConnect();
//   }, []);

//   return (
//     <View style={styles.container}>
//       <WebView
//         source={{ uri: url }}
//         style={{ flex: 1 }}
//         originWhitelist={['*']}
//         javaScriptEnabled
//         domStorageEnabled
//         onMessage={event => {
//           // Handle messages from the webview if needed
//         }}
//       />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#1C1C1C',
//   },
// });









// import React, { useEffect, useState } from 'react';
// import { WebView } from 'react-native-webview';
// import { useWeb3React } from '@web3-react/core';
// import { View, ActivityIndicator } from 'react-native';

// export default function WebViewScreen({ route }) {
//   const { url } = route.params;
//   const { account, library } = useWeb3React();
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     if (account && library) {
//       setLoading(false);
//     }
//   }, [account, library]);

//   if (loading) {
//     return (
//       <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
//         <ActivityIndicator size="large" color="#0000ff" />
//       </View>
//     );
//   }

//   return <WebView source={{ uri: url }} />;
// }
>>>>>>> Stashed changes
