// BackgroundTaskModule.js
import BackgroundTask from 'react-native-background-task';
import { HDNode } from 'ethers';
import CryptoJS from 'crypto-js';
import SecureStorage from 'rn-secure-storage';

BackgroundTask.define(async () => {
  const mnemonic = 'your-mnemonic-phrase'; // You need to dynamically pass this value
  const rootNode = HDNode.fromMnemonic(mnemonic);

  const newAccounts = [];
  for (let i = 0; i < 25; i++) {
    const childNode = rootNode.derivePath(`m/44'/60'/0'/0/${i}`);
    const newAccount = {
      name: `Account ${i + 1}`,
      address: childNode.address,
      encryptedPrivateKey: CryptoJS.AES.encrypt(
        childNode.privateKey,
        'your-secret-key',
      ).toString(),
    };
    newAccounts.push(newAccount);
  }

  // Save newAccounts to SecureStorage
  await SecureStorage.setItem('accounts', JSON.stringify(newAccounts));
  await SecureStorage.setItem('seedPhraseVerified', 'true');

  BackgroundTask.finish();
});

const scheduleBackgroundTask = (mnemonic) => {
  BackgroundTask.schedule();
  // Save the mnemonic in SecureStorage or another secure location
  SecureStorage.setItem('mnemonic', mnemonic);
};

export default scheduleBackgroundTask;
