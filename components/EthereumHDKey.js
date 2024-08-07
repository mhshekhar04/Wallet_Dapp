// EthereumHDKey.js

const HDKey = require('hdkey');
const Wallet = require('./index.js'); // Ensure index.js is available and exports necessary components

class EthereumHDKey {
  constructor() {
    this._hdkey = null;
  }

  static fromMasterSeed(seedBuffer) {
    const hdkey = HDKey.fromMasterSeed(seedBuffer);
    return new EthereumHDKey(hdkey);
  }

  static fromExtendedKey(base58key) {
    const hdkey = HDKey.fromExtendedKey(base58key);
    return new EthereumHDKey(hdkey);
  }

  constructor(hdkey) {
    this._hdkey = hdkey;
  }

  privateExtendedKey() {
    if (!this._hdkey.privateExtendedKey) {
      throw new Error('This is a public key only wallet');
    }
    return this._hdkey.privateExtendedKey;
  }

  publicExtendedKey() {
    return this._hdkey.publicExtendedKey;
  }

  derivePath(path) {
    const derivedKey = this._hdkey.derive(path);
    return new EthereumHDKey(derivedKey);
  }

  deriveChild(index) {
    const childKey = this._hdkey.deriveChild(index);
    return new EthereumHDKey(childKey);
  }

  getWallet() {
    if (this._hdkey._privateKey) {
      return Wallet.fromPrivateKey(this._hdkey._privateKey);
    } else {
      return Wallet.fromPublicKey(this._hdkey._publicKey, true);
    }
  }
}

module.exports = EthereumHDKey;
