import React, { createContext, useState, useEffect } from 'react';
import SecureStorage from 'rn-secure-storage';

const AccountsContext = createContext();

const AccountsProvider = ({ children }) => {
  const [accounts, setAccounts] = useState([]);
  const [generateNewAccounts, setGenerateNewAccounts] = useState([]);

  useEffect(() => {
    const getStoredAccounts = async () => {
      try {
        const storedAccounts = await SecureStorage.getItem('new accounts');
        if (storedAccounts) {
          const parsedAccounts = JSON.parse(storedAccounts);
          setGenerateNewAccounts(parsedAccounts);
          setAccounts(parsedAccounts);
        }
      } catch (error) {
        console.error('Error fetching accounts:', error);
      }
    };

    getStoredAccounts();
  }, []);

  const addAccount = async (newAccount) => {
    const updatedAccounts = [...generateNewAccounts, newAccount];
    setGenerateNewAccounts(updatedAccounts);
    setAccounts(updatedAccounts);
    await SecureStorage.setItem('new accounts', JSON.stringify(updatedAccounts));
  };
  console.log('Provier Context accounts === ',accounts)

  return (
    <AccountsContext.Provider value={{ accounts, generateNewAccounts, addAccount }}>
      {children}
    </AccountsContext.Provider>
  );
};

export { AccountsContext, AccountsProvider };