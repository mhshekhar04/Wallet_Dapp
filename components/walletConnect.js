import { useState, useEffect } from 'react';
import WalletConnect from '@walletconnect/client';
import QRCodeModal from '@walletconnect/qrcode-modal';

export const useWalletConnect = () => {
  const [connector, setConnector] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [chainId, setChainId] = useState(null);

  useEffect(() => {
    // Initialize WalletConnect
    const connector = new WalletConnect({
      bridge: 'https://bridge.walletconnect.org', // Required
      qrcodeModal: QRCodeModal,
      clientMeta: {
        name: "CC Wallet",
        description: "Connect with CC Wallet",
        url: "https://web5solution.com/",
        icons: ["https://web5solution.com/icon.png"],
      },
      projectId: "0744b3ca22fcd4452b6febf9c129a265", // Your project ID
    });

    // If not connected, create a new session
    if (!connector.connected) {
      connector.createSession();
    }

    // Event listener for connect event
    connector.on('connect', (error, payload) => {
      if (error) {
        console.error('Connection Error:', error);
        return;
      }
      const { accounts, chainId } = payload.params[0];
      setAccounts(accounts);
      setChainId(chainId);
    });

    // Event listener for session update event
    connector.on('session_update', (error, payload) => {
      if (error) {
        console.error('Session Update Error:', error);
        return;
      }
      const { accounts, chainId } = payload.params[0];
      setAccounts(accounts);
      setChainId(chainId);
    });

    // Event listener for disconnect event
    connector.on('disconnect', (error) => {
      if (error) {
        console.error('Disconnection Error:', error);
        return;
      }
      setAccounts([]);
      setChainId(null);
    });

    setConnector(connector);

    // Clean up WalletConnect instance on component unmount
    return () => {
      if (connector) {
        connector.killSession();
      }
    };
  }, []);

  console.log('accounts Wallet Connect',accounts)
  console.log('connector Wallet Connect',connector)
  console.log('chainId Wallet Connect',chainId)


  return { connector, accounts, chainId };
};
