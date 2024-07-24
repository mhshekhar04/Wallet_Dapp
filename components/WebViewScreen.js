import React from 'react';
import {View, StyleSheet, ActivityIndicator} from 'react-native';
import {WebView} from 'react-native-webview';

export default function WebViewScreen({route}) {
  const {url} = route.params;

  return (
    <View style={styles.container}>
      <WebView
        source={{uri: url}}
        style={styles.webView}
        startInLoadingState={true}
        renderLoading={() => (
          <ActivityIndicator
            color="#c0c0c0"
            size="large"
            style={styles.loadingIndicator}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '1C1C1C',
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
