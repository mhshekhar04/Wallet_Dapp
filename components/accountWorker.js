import { HDNode } from 'ethers';
import CryptoJS from 'crypto-js';

self.onmessage = async (event) => {
  const { mnemonic, startIndex, numAccounts, secretKey } = event.data;

  const rootNode = HDNode.fromMnemonic(mnemonic);
  const newAccounts = [];
  for (let i = startIndex; i < startIndex + numAccounts; i++) {
    const childNode = rootNode.derivePath(`m/44'/60'/0'/0/${i}`);
    const newAccount = {
      name: `Account ${i + 1}`,
      address: childNode.address,
      encryptedPrivateKey: CryptoJS.AES.encrypt(
        childNode.privateKey,
        secretKey,
      ).toString(),
    };
    newAccounts.push(newAccount);
  }

  self.postMessage({ newAccounts });
};
