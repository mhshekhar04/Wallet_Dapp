import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import CryptoJS from 'crypto-js';
import config from '../config/config';
import { ethers } from 'ethers';

export default function WebViewScreen({ route }) {
  const { url, selectedAccount, selectedNetwork } = route.params;

  // Log route parameters for debugging
  console.log('Route parameters:', route.params);

  // Check if selectedAccount and selectedNetwork are available
  if (!selectedAccount || !selectedNetwork) {
    console.error('selectedAccount or selectedNetwork is missing');
    return null; // or handle the error as needed
  }

  const { address, encryptedPrivateKey } = selectedAccount;
  const webViewRef = useRef(null);

  console.log('url ww === ', url);

  // Decrypt the private key
  const decryptPrivateKey = (encryptedPrivateKey) => {
    try {
      const bytes = CryptoJS.AES.decrypt(
        encryptedPrivateKey,
        config.privateKeyEncryptionString
      );
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error('Failed to decrypt private key:', error.message);
      return null;
    }
  };

  const privateKey = decryptPrivateKey(encryptedPrivateKey);

  if (!privateKey) {
    console.error('Failed to decrypt the private key');
    return null; // or handle the error as needed
  }

  // Inject script function within WebViewScreen
  const injectScript = (selectedAccount, privateKey, selectedNetwork) => {
    return `
   (function () {
    // Save original console methods for debugging
    const originalConsoleLog = console.log;
    const originalConsoleError = console.error;

    console.log = function (...args) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'log', message: args }));
        originalConsoleLog.apply(console, args);
    };

    console.error = function (...args) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'error', message: args }));
        originalConsoleError.apply(console, args);
    };

    console.log('Injected script executed');

    // Dynamically load ethers.js from a CDN
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/ethers@5.7.2/dist/ethers.umd.min.js'; // Ensure correct version

    script.onload = () => {
        // Check if ethers is loaded properly
        if (typeof ethers === 'undefined') {
            console.error('Ethers.js not loaded');
            return;
        }

        console.log('Ethers.js loaded successfully');

        // Proceed with the rest of the script after ethers.js is loaded
        const selectedAccount = "${selectedAccount}";
        const privateKey = "${privateKey}";
        const chainId = "${selectedNetwork.chainId}";
        const rpcUrl = "${selectedNetwork.networkurl}";

        // Initialize the provider and wallet variables
        let provider;
        let wallet;

        // Initialize the provider and log its status
        function initializeProvider() {
            if (!provider) {
                try {
                    console.log('Initializing provider with RPC URL:', rpcUrl);
                    provider = new ethers.providers.JsonRpcProvider(rpcUrl);

                    // Check connection status
                    provider.getNetwork().then((network) => {
                        console.log('Provider connected to network:', network);
                    }).catch((error) => {
                        console.error('Provider network connection error:', error.message);
                        provider = null; // Reset provider on failure
                    });

                    console.log('Provider initialized:', provider);
                } catch (error) {
                    console.error('Failed to initialize provider:', error.message);
                    provider = null;
                }
            }
        }

        // Function to ensure the wallet is created only when needed
        function ensureWallet() {
            if (!wallet) {
                initializeProvider();  // Ensure provider is available before wallet creation
                if (provider) {
                    try {
                        wallet = new ethers.Wallet(privateKey, provider);
                        console.log('Wallet initialized:', wallet);
                    } catch (error) {
                        console.error('Failed to initialize wallet:', error.message);
                        wallet = null;
                    }
                } else {
                    console.error('Cannot initialize wallet, provider is not available');
                }
            }
        }

        // Inject ethereum object
        window.ethereum = {
            isMetaMask: false,
            isNavigator: true,
            walletName: "Navigator", // Custom wallet name
            selectedAddress: selectedAccount,
            chainId: chainId,
            networkVersion: chainId,

            enable: async () => {
                console.log('enable called');
                return Promise.resolve([selectedAccount]);
            },

            request: async ({ method, params }) => {
                console.log('request called', method, params);
                switch (method) {
                    case 'eth_requestAccounts':
                    case 'eth_accounts':
                        return [selectedAccount];
                    case 'eth_chainId':
                        console.log('eth_chainId called');
                        return chainId;
                    case 'eth_gasPrice':
                        console.log('eth_gasPrice called');
                        initializeProvider();  // Ensure provider is created before calling
                        if (provider) {
                            try {
                                const gasPrice = await provider.getGasPrice();
                                console.log('Gas price retrieved:', gasPrice.toString());
                                return gasPrice.toHexString();
                            } catch (error) {
                                console.error('Failed to retrieve gas price:', error.message);
                                throw new Error('Failed to retrieve gas price');
                            }
                        } else {
                            console.error('Provider not available for gas price retrieval');
                            throw new Error('Provider not initialized');
                        }
                    case 'eth_estimateGas':
                        console.log('eth_estimateGas called', params[0]);
                        initializeProvider();  // Ensure provider is created before calling
                        if (provider) {
                            try {
                                const estimatedGas = await provider.estimateGas(params[0]);
                                console.log('Estimated gas:', estimatedGas.toString());
                                return estimatedGas.toHexString();
                            } catch (error) {
                                console.error('Failed to estimate gas:', error.message);
                                throw new Error('Failed to estimate gas');
                            }
                        } else {
                            console.error('Provider not available for gas estimation');
                            throw new Error('Provider not initialized');
                        }
                    case 'personal_sign':
                        ensureWallet();  // Ensure wallet is created before calling
                        if (wallet) {
                            try {
                                const signature = await wallet.signMessage(ethers.utils.arrayify(params[0]));
                                console.log('personal_sign signature', signature);
                                return signature;
                            } catch (error) {
                                console.error('Failed to sign message:', error.message);
                                throw new Error('Failed to sign message');
                            }
                        } else {
                            console.error('Wallet not available for signing');
                            throw new Error('Wallet not initialized');
                        }
                    case 'eth_sendTransaction':
                        ensureWallet();  // Ensure wallet is created before calling
                        if (wallet) {
                            try {
                                const tx = params[0];
                                console.log('eth_sendTransaction called', tx);

                                // Ensure transaction keys are correct and values are properly formatted
                                const transaction = {
                                    to: tx.to,
                                    value: ethers.BigNumber.from(tx.value),  // Ensure value is a BigNumber
                                    data: tx.data,
                                    gasLimit: ethers.BigNumber.from(tx.gas), // Use gasLimit instead of gas
                                    from: selectedAccount
                                };

                                const sentTransaction = await wallet.sendTransaction(transaction);
                                console.log('Transaction sent:', sentTransaction.hash);
                                return sentTransaction.hash;
                            } catch (error) {
                                console.error('Failed to send transaction:', error.message);
                                throw new Error('Failed to send transaction');
                            }
                        } else {
                            console.error('Wallet not available for sending transaction');
                            throw new Error('Wallet not initialized');
                        }
                    default:
                        throw new Error('Unsupported method');
                }
            },

            sendAsync: (request, callback) => {
                console.log('sendAsync called', request);
                const { method, params } = request;

                this.request({ method, params })
                    .then((result) => {
                        callback(null, { result });
                    })
                    .catch((error) => {
                        console.error('sendAsync error', error.message);
                        callback(error, null);
                    });
            },

            on: (eventName, handler) => {
                console.log('Event listener added for:', eventName);
                // Handle account or network change events if needed
            },

            removeListener: (eventName, handler) => {
                console.log('Event listener removed for:', eventName);
                // Remove event listeners if necessary
            }
        };

        console.log('window.ethereum injected', window.ethereum);

        // Inject Web3 if not already present
        if (typeof window.web3 === 'undefined') {
            window.web3 = new Web3(window.ethereum);
            console.log('window.web3 injected', window.web3);
        }

        // Automatically connect to PancakeSwap by calling enable immediately
        window.ethereum.enable().then(accounts => {
            console.log('Accounts:', accounts);
        }).catch(error => {
            console.error('Enable error:', error.message);
        });
    };

    script.onerror = () => {
        console.error('Failed to load ethers.js');
    };

    document.head.appendChild(script);
})();



    `;
  };

  const injectedJavaScript = injectScript(address, privateKey, selectedNetwork);

  useEffect(() => {
    console.log('WebViewScreen mounted');
    console.log('Selected Network:', selectedNetwork); // Log selectedNetwork for debugging
  }, []);

  console.log('selectedNetwork ww', selectedNetwork);

  const handleMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'log') {
        console.log(...data.message);
      } else if (data.type === 'error') {
        console.error(...data.message);
      }
    } catch (e) {
      console.error('Failed to parse message from webview', e);
    }
  };

  return (
    <View style={styles.container}>
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
            color="#c0c0c0"
            size="large"
            style={styles.loadingIndicator}
          />
        )}
        onMessage={handleMessage}
        onError={(event) => {
          console.error('WebView error', event.nativeEvent);
        }}
        onLoadStart={() => {
          console.log('WebView loading started');
        }}
        onLoadEnd={() => {
          console.log('WebView loading ended');
          webViewRef.current.injectJavaScript(injectedJavaScript);
        }}
      />
    </View>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webView: {
    flex: 1,
  },
  loadingIndicator: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});