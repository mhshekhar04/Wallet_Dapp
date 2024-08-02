import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, TextInput, Alert, Image, ScrollView, Modal, ActivityIndicator,
} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { ethers } from 'ethers';
import RNSecureStorage from 'rn-secure-storage';
import CryptoJS from 'crypto-js';
import Svg, { Circle, Text as SvgText } from 'react-native-svg';
import LottieView from 'lottie-react-native';

const AGGREGATOR_API_BASE = 'https://aggregator.icecreamswap.com';

const abi = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function balanceOf(address) view returns (uint256)',
  'function approve(address spender, uint256 value) external returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
];

const SwapPage = ({ navigation, route }) => {
  const { selectedAccount, selectedNetwork } = route.params;

  const decryptedPrivateKey = CryptoJS.AES.decrypt(selectedAccount.encryptedPrivateKey, 'your-secret-key').toString(CryptoJS.enc.Utf8);
  const provider = new ethers.providers.JsonRpcProvider(selectedNetwork?.networkurl);
  const signer = new ethers.Wallet(decryptedPrivateKey, provider);

  const [fromToken, setFromToken] = useState(null);
  const [toToken, setToToken] = useState(null);
  const [tokens, setTokens] = useState([]);
  const [slippage, setSlippage] = useState(0.5);
  const [amount, setAmount] = useState('1');
  const [toTokensList, setToTokensList] = useState([]);
  const [isFromModalVisible, setIsFromModalVisible] = useState(false);
  const [isToModalVisible, setIsToModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [tokenAddress, setTokenAddress] = useState('');
  const [isSwapping, setIsSwapping] = useState(false);
  const [isSwapComplete, setIsSwapComplete] = useState(false);

  useEffect(() => {
    fetchTokens();
    fetchToTokens();
  }, [selectedNetwork, selectedAccount]);

  const fetchTokens = async () => {
    try {
      const storedTokens = await RNSecureStorage.getItem('tokenss');
      if (storedTokens) {
        const parsedTokens = JSON.parse(storedTokens);
        const networkSuffix = selectedNetwork ? selectedNetwork.name : '';
        const filteredTokens = parsedTokens.filter(token => token.network === networkSuffix);

        const tokenBalances = await Promise.all(
          filteredTokens.map(async (token) => {
            try {
              const contract = new ethers.Contract(token?.address, abi, provider);
              const balance = await contract.balanceOf(selectedAccount?.address);
              const decimal = await contract.decimals();
              console.log('token decimal',decimal)
              return {
                ...token,
                balance: parseFloat(ethers.utils.formatUnits(balance, decimal || 18)).toFixed(4),
              };
            } catch (error) {
              console.error('Error fetching token balance:', error);
              return {
                ...token,
                balance: '0.0000',
              };
            }
          })
        );

        setTokens(tokenBalances);
        if (tokenBalances.length > 0) {
          setFromToken(tokenBalances[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching tokens:', error);
    }
  };

  const fetchToTokens = async () => {
    try {
      const response = await fetch('https://api.coingecko.com/api/v3/coins/list');
      const data = await response.json();
      const topTokens = data.slice(0, 500).map(token => ({
        symbol: token.symbol.toUpperCase(),
        name: token.name,
        address: token.id,
      }));
      setToTokensList(topTokens);
      setToToken(topTokens[0]);
    } catch (error) {
      console.error('Error fetching tokens from API:', error);
    }
  };

  const apiRequestUrl = (chainId, src, dst, amount, slippage, from) => {
    return `${AGGREGATOR_API_BASE}/${chainId}?src=${src}&dst=${dst}&amount=${amount}&slippage=${slippage}&from=${from}`;
  };

  const getSwapQuote = async () => {
    try {
      if (!fromToken || !toToken || !amount) {
        Alert.alert('Error', 'Please select tokens and enter the amount to swap.');
        return null;
      }

      const fromTokenAddress = fromToken.address;
      const toTokenAddress = toToken.address;
      const amountIn = ethers.utils.parseUnits(amount, fromToken.decimals).toString();
      const fromAddress = selectedAccount.address;
      const chainId = parseInt(selectedNetwork.chainId, 16);

      const url = apiRequestUrl(chainId, fromTokenAddress, toTokenAddress, amountIn, slippage, fromAddress);
      console.log(url);

      const response = await fetch(url);
      const responseText = await response.text();
      if (!response.ok) {
        throw new Error(responseText);
      }

      const data = JSON.parse(responseText);
      fromToken.allowanceTarget = data.allowanceTarget;

      return data;
    } catch (error) {
      console.error('Error fetching swap quote:', error);
      Alert.alert('Error', `Failed to fetch swap quote: ${error.message}`);
      return null;
    }
  };

  const handleTokenAddressChange = async (address) => {
    setTokenAddress(address);

    if (ethers.utils.isAddress(address)) {
      try {
        const contract = new ethers.Contract(address, abi, provider);
        const [name, symbol, decimals] = await Promise.all([
          contract.name(),
          contract.symbol(),
          contract.decimals(),
        ]);

        setToToken({
          address,
          name,
          symbol,
          decimals,
        });
      } catch (error) {
        console.error('Error fetching token details:', error);
      }
    } else {
      setToToken(null);
    }
  };

  const approveToken = async (spender, amount) => {
    try {
      const contract = new ethers.Contract(fromToken.address, abi, signer);
      const tx = await contract.approve(spender, amount);
      console.log(`Approval Transaction Hash: ${tx.hash}`);
      await tx.wait();
      console.log('Approval transaction confirmed');
    } catch (error) {
      console.log("Error in approval transaction:", error);
      throw error;
    }
  };

  const handleSwap = async () => {
    try {
      if (!fromToken || !toToken || !amount) {
        Alert.alert('Error', 'Please select tokens and enter the amount to swap.');
        return;
      }

      console.log('Tokens and amount selected:', { fromToken, toToken, amount });

      const amountInWei = ethers.utils.parseUnits(amount, fromToken.decimals);
      console.log('Amount in Wei:', amountInWei.toString());
      

      const balance = await provider.getBalance(selectedAccount.address);
      console.log('Account balance:', ethers.utils.formatEther(balance));

      if (balance.lt(amountInWei)) {
        Alert.alert('Error', 'Insufficient ETH balance to perform the swap.');
        return;
      }

      setIsSwapping(true);
      const quote = await getSwapQuote();
      if (!quote) return;

      const spenderAddress = quote.tx.to;
      console.log('Spender address:', spenderAddress);

      const contract = new ethers.Contract(fromToken.address, abi, signer);
      const currentAllowance = await contract.allowance(selectedAccount.address, spenderAddress);
      console.log('Current allowance:', currentAllowance.toString());

      if (currentAllowance.lt(amountInWei)) {
        console.log('Approving token for swap...');
        const approvalTx = await contract.approve(spenderAddress, amountInWei);
        console.log('Approval transaction sent:', approvalTx.hash);
        await approvalTx.wait();
        console.log('Approval transaction confirmed');
      } else {
        console.log('Sufficient allowance, no need to approve');
      }

      const gasEstimate = await provider.estimateGas({
        to: quote.tx.to,
        data: quote.tx.data,
        value: quote.tx.value ? ethers.BigNumber.from(quote.tx.value) : ethers.BigNumber.from(0),
        from: selectedAccount.address
      });
      console.log('Estimated gas limit:', gasEstimate.toString());

      const gasPrice = await provider.getGasPrice();
      console.log('Current gas price:', ethers.utils.formatUnits(gasPrice, 'gwei'), 'gwei');

      const transactionCost = gasEstimate.mul(gasPrice);
      if (balance.lt(transactionCost.add(amountInWei))) {
        Alert.alert('Error', 'Insufficient funds for the transaction. Please add more native token to your account.');
        return;
      }

      console.log('Sending swap transaction...');
      const swapTx = await signer.sendTransaction({
        to: quote.tx.to,
        data: quote.tx.data,
        value: quote.tx.value ? ethers.BigNumber.from(quote.tx.value) : ethers.BigNumber.from(0),
        gasLimit: gasEstimate,
        gasPrice
      });
      console.log('Swap transaction sent:', swapTx.hash);
      await swapTx.wait();
      console.log('Swap transaction confirmed');
      setIsSwapping(false); // Stop swapping animation
      setIsSwapComplete(true); // Start swapped animation

      setTimeout(() => {
        setIsSwapComplete(false); // Stop swapped animation
        Alert.alert('Success', `Swapped ${amount} ${fromToken.symbol} to ${toToken.symbol} successfully!`);
        navigation.navigate('MainPage');
      }, 2000); // Show swapped animation for 2 seconds

    } catch (error) {
      console.error('Error performing swap:', error);
      if (error.code === ethers.errors.CALL_EXCEPTION) {
        console.error('Transaction failed with CALL_EXCEPTION. Please check the contract call and parameters.');
      }
      setIsSwapping(false);
      Alert.alert('Something went wrong  , try again or chnage the token');
    }
  };

  const generateFallbackIcon = name => {
    const firstLetter = name.charAt(0).toUpperCase();
    return (
      <Svg height="50" width="50">
        <Circle cx="25" cy="25" r="20" fill="#FEBF32" />
        <SvgText
          x="25"
          y="35"
          textAnchor="middle"
          fill="#FFFFFF"
          fontSize="24"
          fontWeight="bold">
          {firstLetter}
        </SvgText>
      </Svg>
    );
  };

  const filteredToTokens = toTokensList.filter(token =>
    token.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Swap Tokens</Text>

      <View style={styles.section}>
        <Text style={styles.sectionHeader}>From</Text>
        <TouchableOpacity style={styles.selectButton} onPress={() => setIsFromModalVisible(true)}>
          <Text style={styles.selectButtonText}>
            {fromToken ? `${fromToken.name} (${fromToken.symbol})` : 'Select your token'}
          </Text>
          <FontAwesome name="chevron-down" size={16} color="#FFF" />
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          placeholder="Amount"
          placeholderTextColor="#ABAFC4"
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
        />
      </View>

      <View style={styles.swapIconContainer}>
        {!isSwapping && !isSwapComplete && (
          <FontAwesome name="exchange" size={30} color="#FFF" />
        )}
        {isSwapping && (
          <LottieView
            source={require('../assets/swapping.json')}
            autoPlay
            loop
            style={styles.lottieAnimation}
          />
        )}
        {isSwapComplete && (
          <LottieView
            source={require('../assets/swapped.json')}
            autoPlay
            loop={false}
            style={styles.lottieAnimation}
          />
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionHeader}>To</Text>
        <TouchableOpacity style={styles.selectButton} onPress={() => setIsToModalVisible(true)}>
          <Text style={styles.selectButtonText}>
            {toToken ? `${toToken.name} (${toToken.symbol})` : 'Select token'}
          </Text>
          <FontAwesome name="chevron-down" size={16} color="#FFF" />
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          placeholder="Or enter token address"
          placeholderTextColor="#ABAFC4"
          value={tokenAddress}
          onChangeText={handleTokenAddressChange}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Slippage Tolerance</Text>
        <View style={styles.slippageContainer}>
          {[0.1, 0.5, 1, 2.5].map((value) => (
            <TouchableOpacity
              key={value}
              style={[
                styles.slippageButton,
                slippage === value ? styles.activeSlippageButton : null,
              ]}
              onPress={() => setSlippage(value)}
            >
              <Text style={styles.slippageText}>{value}%</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity
        style={styles.swapButton}
        onPress={handleSwap}
        disabled={isSwapping}
      >
        {isSwapping ? (
          <ActivityIndicator size="small" color="#FFF" />
        ) : (
          <Text style={styles.swapButtonText}>Swap</Text>
        )}
      </TouchableOpacity>

      <Modal visible={isFromModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Your Token</Text>
            <ScrollView style={styles.modalScrollView}>
              {tokens.map((token, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.tokenRow}
                  onPress={() => {
                    setFromToken(token);
                    setIsFromModalVisible(false);
                  }}
                >
                  {typeof token.image === 'string' && token.image.startsWith('http') ? (
                    <Image source={{ uri: token.image }} style={styles.tokenImage} />
                  ) : (
                    <View style={styles.fallbackIconContainer}>
                      {generateFallbackIcon(token.name)}
                    </View>
                  )}
                  <View style={styles.tokenInfo}>
                    <Text style={styles.tokenName}>{token.name}</Text>
                    <Text style={styles.tokenSubtext}>{token.symbol}</Text>
                  </View>
                  <Text style={styles.tokenBalance}>{token.balance}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.closeButton} onPress={() => setIsFromModalVisible(false)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={isToModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Token</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search token"
              placeholderTextColor="#ABAFC4"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <ScrollView style={styles.modalScrollView}>
              {filteredToTokens.map((token, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.tokenRow}
                  onPress={() => {
                    setToToken(token);
                    setIsToModalVisible(false);
                  }}
                >
                  <Text style={styles.tokenName}>{token.name}</Text>
                  <Text style={styles.tokenSubtext}>{token.symbol}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.closeButton} onPress={() => setIsToModalVisible(false)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C1C1C',
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 30,
    textAlign: 'center',
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  tokenRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#2A2A2A',
    borderRadius: 5,
  },
  tokenImage: {
    width: 40,
    height: 40,
    marginRight: 10,
  },
  fallbackIconContainer: {
    width: 40,
    height: 40,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: '#FEBF32',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tokenInfo: {
    flex: 1,
  },
  tokenName: {
    color: '#FFF',
    fontSize: 16,
  },
  tokenSubtext: {
    color: '#ABAFC4',
    fontSize: 14,
  },
  tokenBalance: {
    color: '#FFF',
    fontSize: 16,
  },
  input: {
    backgroundColor: '#333',
    color: '#FFF',
    padding: 15,
    borderRadius: 5,
    marginTop: 10,
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#333',
    padding: 15,
    borderRadius: 5,
  },
  selectButtonText: {
    color: '#FFF',
    fontSize: 16,
  },
  slippageContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  slippageButton: {
    backgroundColor: '#333',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 5,
  },
  activeSlippageButton: {
    backgroundColor: '#FEBF32',
  },
  slippageText: {
    color: '#FFF',
    textAlign: 'center',
  },
  swapButton: {
    backgroundColor: '#FEBF32',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  swapButtonText: {
    color: '#1C1C1C',
    fontWeight: 'bold',
    fontSize: 16,
  },
  swapIconContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  lottieAnimation: {
    width: 100,
    height: 100,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#1C1C1C',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    color: '#FFF',
    fontSize: 20,
    marginBottom: 20,
  },
  modalScrollView: {
    width: '100%',
    maxHeight: 300,
  },
  closeButton: {
    backgroundColor: '#FEBF32',
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
    width: '100%',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#1C1C1C',
    fontWeight: 'bold',
  },
  searchInput: {
    backgroundColor: '#333',
    color: '#FFF',
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
    width: '100%',
  },
});

export default SwapPage;
