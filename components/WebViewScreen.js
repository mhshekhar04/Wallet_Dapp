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
            console.log('eth_chainId called');
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
            console.log('sendAsync eth_chainId called');
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
          webViewRef.current.injectJavaScript(injectedJavaScript);
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
});