import React, { createContext, useContext, useState } from 'react';
import { ethers } from 'ethers';

const WalletContext = createContext();

export const useWallet = () => useContext(WalletContext);

const WalletContextProvider = ({ children }) => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);

  const connectWallet = async () => {
    try {
      if (!window.ethereum) throw new Error('No crypto wallet found');
      const newProvider = new ethers.providers.Web3Provider(window.ethereum);
      await newProvider.send('eth_requestAccounts', []);
      const newSigner = newProvider.getSigner();
      setProvider(newProvider);
      setSigner(newSigner);
    } catch (error) {
      console.error('Error connecting to wallet:', error);
    }
  };

  return (
    <WalletContext.Provider value={{ provider, signer, connectWallet }}>
      {children}
    </WalletContext.Provider>
  );
};

export default WalletContextProvider;
