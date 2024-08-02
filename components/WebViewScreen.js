import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import CryptoJS from 'crypto-js';
import { ethers } from 'ethers';

// Configuration for BNB Chain Mainnet
const bnbChainMainnet = {
  name: 'BNB Chain Mainnet',
  networkurl: 'https://bsc-dataseed1.binance.org',
  suffix: 'BNB',
  chainId: '0x38', // Hexadecimal representation
};

// Function to decrypt the private key
const decryptPrivateKey = (encryptedPrivateKey) => {
  const bytes = CryptoJS.AES.decrypt(encryptedPrivateKey, 'your-secret-key');
  return bytes.toString(CryptoJS.enc.Utf8);
};

// Function to inject the Ethereum provider script
const injectScript = (selectedAccount, privateKey, selectedNetwork) => {
  // Convert hex chain ID to number
  const chainIdNumber = parseInt(selectedNetwork.chainId, 16);

  return `
    (function() {
      const originalConsoleLog = console.log;
      const originalConsoleError = console.error;

      // Override console.log and console.error to post messages to React Native
      console.log = function(...args) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'log', message: args }));
        originalConsoleLog.apply(console, args);
      };
      console.error = function(...args) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'error', message: args }));
        originalConsoleError.apply(console, args);
      };

      console.log('Injected script executed');

      const selectedAccount = "${selectedAccount}";
      const privateKey = "${privateKey}";

      // Set up a mock Ethereum provider
      window.ethereum = {
        isMetaMask: true,
        selectedAddress: selectedAccount,
        enable: async () => {
          console.log('enable called');
          return [selectedAccount];
        },
        request: async ({ method, params }) => {
          console.log('request called', method, params);

          // Handle account requests
          if (method === 'eth_requestAccounts' || method === 'eth_accounts') {
            return [selectedAccount];
          }

          // Handle chain ID requests
          if (method === 'eth_chainId') {
            console.log('eth_chainId called');
            return '${selectedNetwork.chainId}'; // Return hex as string
          }

          // Handle personal sign requests
          if (method === 'personal_sign') {
            const wallet = new ethers.Wallet(privateKey);
            const signature = await wallet.signMessage(ethers.utils.arrayify(params[0]));
            console.log('personal_sign signature', signature);
            return signature;
          }

          // Handle transaction by hash requests
          if (method === 'eth_getTransactionByHash') {
            const txHash = params[0];
            console.log('eth_getTransactionByHash called with txHash:', txHash);

            // Validate transaction hash
            if (!txHash || !ethers.utils.isHexString(txHash)) {
              console.error('Invalid transaction hash:', txHash);
              throw new Error('Invalid transaction hash');
            }

            // Fetch the transaction using ethers.js provider
            const provider = new ethers.providers.JsonRpcProvider('${selectedNetwork.networkurl}');
            const transaction = await provider.getTransaction(txHash);
            console.log('Transaction details:', transaction);
            return transaction; // Return the transaction details
          }

          // Default empty response for unsupported methods
          console.warn('Unsupported method:', method);
          return [];
        },
        sendAsync: (request, callback) => {
          console.log('sendAsync called', request);

          // Handle account requests
          if (request.method === 'eth_requestAccounts' || request.method === 'eth_accounts') {
            callback(null, { result: [selectedAccount] });
          }

          // Handle chain ID requests
          else if (request.method === 'eth_chainId') {
            console.log('sendAsync eth_chainId called');
            callback(null, { result: '${selectedNetwork.chainId}' });
          }

          // Handle personal sign requests
          else if (request.method === 'personal_sign') {
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
          }

          // Handle transaction by hash requests
          else if (request.method === 'eth_getTransactionByHash') {
            const txHash = request.params[0];
            console.log('sendAsync eth_getTransactionByHash called with txHash:', txHash);

            // Validate transaction hash
            if (!txHash || !ethers.utils.isHexString(txHash)) {
              console.error('Invalid transaction hash:', txHash);
              callback(new Error('Invalid transaction hash'), null);
              return;
            }

            // Fetch transaction using ethers.js provider
            const provider = new ethers.providers.JsonRpcProvider('${selectedNetwork.networkurl}');
            provider.getTransaction(txHash)
              .then(transaction => {
                console.log('Transaction details:', transaction);
                callback(null, { result: transaction });
              })
              .catch(error => {
                console.error('Failed to fetch transaction:', error);
                callback(error, null);
              });
          }

          // Handle unsupported methods
          else {
            console.warn('Unsupported method:', request.method);
            callback(new Error('Unsupported method'), null);
          }
        }
      };

      console.log('window.ethereum injected', window.ethereum);

      // Inject web3 if it's not already present
      if (typeof window.web3 === 'undefined') {
        window.web3 = new Web3(window.ethereum);
        console.log('window.web3 injected', window.web3);
      }
    })();
    true;
  `;
};

// Main component for rendering the WebView
export default function WebViewScreen({ route }) {
  const { url } = route.params;
  const webViewRef = useRef(null);

  // Decrypt the private key
  const privateKey = decryptPrivateKey(encryptedPrivateKey);

  // Generate the injected JavaScript script
  const injectedJavaScript = injectScript(address, privateKey, selectedNetwork);

  // Log when the component is mounted
  useEffect(() => {
    console.log("WebViewScreen mounted");
  }, []);

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
        renderLoading={() => (
          <ActivityIndicator
            color="#FEBF32"
            size="large"
            style={styles.loadingIndicator}
          />
        )}
        // Handle messages received from the WebView
        onMessage={(event) => {
          const { type, message } = JSON.parse(event.nativeEvent.data);
          if (type === 'log') {
            console.log('WebView log:', ...message);
          } else if (type === 'error') {
            console.error('WebView error:', ...message);
          }
        }}
        // Handle errors occurring in the WebView
        onError={(event) => {
          console.error('WebView error:', event.nativeEvent);
        }}
        // Log when the WebView starts loading
        onLoadStart={() => {
          console.log('WebView loading started');
        }}
        // Inject JavaScript when the WebView finishes loading
        onLoadEnd={() => {
          console.log('WebView loading ended');
          webViewRef.current.injectJavaScript(injectedJavaScript);
        }}
      />
    </View>
  );
}

// Styling for the container and WebView
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
});
