import { HDNode } from 'ethers';
import CryptoJS from 'crypto-js';

self.onmessage = async (event) => {
  const { mnemonic, secretKey } = event.data;
  const rootNode = HDNode.fromMnemonic(mnemonic);

  const newAccounts = [];
  for (let i = 0; i < 25; i++) {
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

  postMessage({ newAccounts });
};

