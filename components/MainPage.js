import React, { useContext, useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Modal,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { ethers } from 'ethers';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Feather from 'react-native-vector-icons/Feather';
import SecureStorage from 'rn-secure-storage';
import RNSecureStorage from 'rn-secure-storage';
import { AccountsContext } from './AccountsContext';
import Navigation from './Navigation';
import Svg, { Circle, Text as SvgText } from 'react-native-svg';

export default function MainPage({ navigation, route }) {
  const { accounts, generateNewAccounts, addAccount } = useContext(AccountsContext);
  const [selectedTab, setSelectedTab] = useState('Tokens');
  const [selectedNetwork, setSelectedNetwork] = useState(null);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [newAccountName, setNewAccountName] = useState('');
  const [showCreateAccount, setShowCreateAccount] = useState(false);
  const [tokens, setTokens] = useState([]);
  const [collectibles, setCollectibles] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(accounts[0]);
  const [balance, setBalance] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editAccountName, setEditAccountName] = useState('');
  const [editAccountIndex, setEditAccountIndex] = useState(-1);

  const [showNetworkModal, setShowNetworkModal] = useState(false);
  const [showAddNetworkModal, setShowAddNetworkModal] = useState(false);
  const [newNetworkName, setNewNetworkName] = useState('');
  const [newNetworkUrl, setNewNetworkUrl] = useState('');
  const [newNetworkSuffix, setNewNetworkSuffix] = useState('');

  const scrollViewRef = useRef(null);

  const handleEditAccount = (account, index) => {
    setIsEditing(true);
    setEditAccountName(account.name);
    setEditAccountIndex(index);
  };

  const saveEditedAccountName = async () => {
    if (editAccountIndex !== -1 && editAccountName.trim() !== '') {
      const updatedAccounts = [...generateNewAccounts];
      updatedAccounts[editAccountIndex].name = editAccountName;

      await SecureStorage.setItem('new accounts', JSON.stringify(updatedAccounts));
      setIsEditing(false);
      setEditAccountIndex(-1);
      setEditAccountName('');
    }
  };

  const abi = [
    'function name() view returns (string)',
    'function symbol() view returns (string)',
    'function decimals() view returns (uint8)',
    'function balanceOf(address) view returns (uint256)',
    'function approve(address spender, uint256 value) external returns (bool)',
    'function transfer(address to, uint256 amount) returns (bool)',
    'function ownerOf(uint256 tokenId) external view returns (address owner)',
    'function transferFrom(address from, address to, uint256 tokenId) external;',
  ];

  const abi721 = [
    {
      constant: true,
      inputs: [
        {
          name: '_owner',
          type: 'address',
        },
      ],
      name: 'balanceOf',
      outputs: [
        {
          name: 'balance',
          type: 'uint256',
        },
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function',
    },
    {
      constant: false,
      inputs: [
        {
          name: '_from',
          type: 'address',
        },
        {
          name: '_to',
          type: 'address',
        },
        {
          name: '_tokenId',
          type: 'uint256',
        },
      ],
      name: 'transferFrom',
      outputs: [],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      constant: true,
      inputs: [
        {
          name: '_tokenId',
          type: 'uint256',
        },
      ],
      name: 'ownerOf',
      outputs: [
        {
          name: 'owner',
          type: 'address',
        },
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function',
    },
    {
      constant: true,
      inputs: [
        {
          name: '_interfaceId',
          type: 'bytes4',
        },
      ],
      name: 'supportsInterface',
      outputs: [
        {
          name: '',
          type: 'bool',
        },
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [
        {
          name: '_name',
          type: 'string',
        },
        {
          name: '_symbol',
          type: 'string',
        },
      ],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'constructor',
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          name: '_from',
          type: 'address',
        },
        {
          indexed: true,
          name: '_to',
          type: 'address',
        },
        {
          indexed: true,
          name: '_tokenId',
          type: 'uint256',
        },
      ],
      name: 'Transfer',
      type: 'event',
    },
  ];

  const networks = [
    {
      name: 'Sepolia',
      networkurl: 'https://sepolia.infura.io/v3/215d4e9d78b5430fb64f66b61d84c1e9',
      suffix: 'ETH',
      chainId: '0xaa36a7',
    },
    {
      name: 'Ethereum Mainnet',
      networkurl: 'https://mainnet.infura.io/v3/215d4e9d78b5430fb64f66b61d84c1e9',
      suffix: 'ETH',
      chainId: '0x1',
    },
    {
      name: 'Polygon Mainnet',
      networkurl: 'https://polygon-mainnet.infura.io/v3/215d4e9d78b5430fb64f66b61d84c1e9',
      suffix: 'MATIC',
      chainId: '0x89',
    },
    {
      name: 'Amoy',
      networkurl: 'https://polygon-amoy.infura.io/v3/215d4e9d78b5430fb64f66b61d84c1e9',
      suffix: 'MATIC',
      chainId: '0x89',
    },
    {
      name: 'BNB Chain Mainnet',
      networkurl: 'https://bsc-dataseed.binance.org/',
      suffix: 'BNB',
      chainId: '0x38',
    },
    {
      name: 'BNB testnet',
      networkurl: 'https://data-seed-prebsc-1-s1.binance.org:8545/',
      suffix: 'BNB',
      chainId: '0x61',
    },
  ];

  // console.log('tokens === ',tokens);

  useEffect(() => {
    const getStoredNetworks = async () => {
      try {
        const storedNetworks = await SecureStorage.getItem('networks');
        if (storedNetworks) {
          const parsedNetworks = JSON.parse(storedNetworks);
          setNetworks(parsedNetworks);
        }
      } catch (error) {
        console.error('Error fetching networks:', error);
      }
    };

    getStoredNetworks();
  }, []);

  useEffect(() => {
    if (!selectedNetwork) {
      setSelectedNetwork(networks[0]);
    }
  }, [networks]);

  const provider = selectedNetwork
    ? new ethers.providers.JsonRpcProvider(selectedNetwork.networkurl)
    : null;

  useEffect(() => {
    setSelectedAccount(accounts[0]);
  }, [accounts]);

  useEffect(() => {
    const fetchTokens = async () => {
      try {
        const storedTokens = await SecureStorage.getItem('tokenss');
        if (storedTokens) {
          const parsedTokens = JSON.parse(storedTokens);
          const networkSuffix = selectedNetwork ? selectedNetwork.name : '';
          const filteredTokens = parsedTokens.filter(token => token.network === networkSuffix);

          const tokenBalances = await Promise.all(
            filteredTokens.map(async (token) => {
              try {
                const contract = new ethers.Contract(token?.address, abi, provider);
                const balance = await contract.balanceOf(selectedAccount?.address);
                return {
                  ...token,
                  balance: ethers.utils.formatUnits(balance, token.decimals || 18),
                };
              } catch (error) {
                console.error('Error fetching token balance:', error);
                return {
                  ...token,
                  balance: '0.00',
                };
              }
            })
          );

          setTokens(tokenBalances);
        }
      } catch (error) {
        console.error('Error fetching tokens:', error);
      }
    };

    if (selectedAccount) {
      fetchTokens();
      const interval = setInterval(fetchTokens, 10000);
      const unsubscribe = navigation.addListener('focus', fetchTokens);

      return () => {
        clearInterval(interval);
        unsubscribe();
      };
    }
  }, [navigation, selectedNetwork, selectedAccount]);

  useEffect(() => {
    const fetchCollectibles = async () => {
      try {
        const storedCollectibles = await SecureStorage.getItem('collectibless');
        if (storedCollectibles) {
          const parsedCollectibles = JSON.parse(storedCollectibles);
          const collectibleBalances = await Promise.all(
            parsedCollectibles.map(async (coll) => {
              const contract = new ethers.Contract(coll.address, abi721, provider);
              const balance = await contract.balanceOf(selectedAccount.address);
              return {
                ...coll,
                balance: ethers.utils.formatUnits(balance, 0),
              };
            })
          );
          setCollectibles(collectibleBalances);
        }
      } catch (error) {
        console.error('Error fetching Collectibles:', error);
      }
    };

    if (selectedAccount) {
      fetchCollectibles();
      const interval = setInterval(fetchCollectibles, 10000);
      const unsubscribe = navigation.addListener('focus', fetchCollectibles);

      return () => {
        clearInterval(interval);
        unsubscribe();
      };
    }
  }, [navigation, selectedNetwork, selectedAccount]);

  useEffect(() => {
    const fetchBalance = async () => {
      if (selectedAccount) {
        const balance = await getBalance(selectedAccount.address);
        setBalance(balance);
      }
    };

    fetchBalance();
    const interval = setInterval(fetchBalance, 2000);

    return () => clearInterval(interval);
  }, [selectedAccount, selectedNetwork, isEditing, navigation]);

  const handleCreateAccount = async () => {
    try {
      const storedAccounts = await SecureStorage.getItem('accounts');
      if (!storedAccounts) {
        console.error('No accounts found in local storage');
        return;
      }

      let parsedAccounts = JSON.parse(storedAccounts);
      if (!parsedAccounts || parsedAccounts.length === 0) {
        console.error('No valid accounts found in local storage');
        return;
      }

      parsedAccounts.sort((a, b) => {
        const aName = a.name.match(/Account (\d+)/);
        const bName = b.name.match(/Account (\d+)/);
        if (aName && bName) {
          return parseInt(aName[1], 10) - parseInt(bName[1], 10);
        }
        return 0;
      });

      let fetchedAccountIndex;
      try {
        const storedFetchedAccountIndex = await SecureStorage.getItem('fetchedAccountIndex');
        fetchedAccountIndex = storedFetchedAccountIndex
          ? parseInt(storedFetchedAccountIndex, 10)
          : 0;
      } catch (error) {
        console.error('Error retrieving fetchedAccountIndex from local storage:', error);
        fetchedAccountIndex = 0;
      }

      if (fetchedAccountIndex >= parsedAccounts.length) {
        console.log('All accounts have already been generated');
        return;
      }

      const nextAccount = parsedAccounts[fetchedAccountIndex];

      const accountExists = generateNewAccounts.some(
        (account) => account.address === nextAccount.address
      );

      if (accountExists) {
        console.log('Account already exists:', nextAccount);
        Alert.alert('Account already exists:');
        return;
      }

      addAccount(nextAccount);

      await SecureStorage.setItem('fetchedAccountIndex', (fetchedAccountIndex + 1).toString());

      setTimeout(() => {
        if (scrollViewRef.current) {
          scrollViewRef.current.scrollToEnd({ animated: true });
        }
      }, 100);
    } catch (error) {
      console.error('Error fetching account:', error);
    }
  };

  const getBalance = async (address) => {
    const balance = await provider.getBalance(address);
    return ethers.utils.formatEther(balance);
  };

  const handleAccountSelect = (account) => {
    setSelectedAccount(account);
    setNewAccountName(account?.name);
    setShowAccountModal(false);
  };

  const validateRpcUrl = async (url) => {
    try {
      const provider = new ethers.providers.JsonRpcProvider(url);
      await provider.getBlockNumber();
      return true;
    } catch (error) {
      return false;
    }
  };

  const handleAddNetwork = async () => {
    const isValidRpcUrl = await validateRpcUrl(newNetworkUrl);
    if (!isValidRpcUrl) {
      Alert.alert('Error', 'Invalid RPC URL');
      return;
    }

    const newNetwork = {
      name: newNetworkName,
      networkurl: newNetworkUrl,
      suffix: newNetworkSuffix,
    };
    const updatedNetworks = [...networks, newNetwork];
    setNetworks(updatedNetworks);
    await SecureStorage.setItem('networks', JSON.stringify(updatedNetworks));
    setShowAddNetworkModal(false);
    setNewNetworkName('');
    setNewNetworkUrl('');
    setNewNetworkSuffix('');
  };

  const onTokenSendClick = (token) => {
    navigation.navigate('SendToken', {
      selectedAccount,
      accounts,
      selectedForToken: token,
      selectedNetwork,
    });
  };

  const onNFTSendClick = (collectible) => {
    navigation.navigate('SendToken', {
      selectedAccount,
      accounts,
      selectedForCollectible: collectible,
      selectedNetwork,
    });
  };

  const handleImportNewAccount = () => {
    navigation.navigate('ImportAccount', { selectedAccount });
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

  return (
    <>
      <View style={styles.container}>
        <Image
          source={require('../assets/Shape1.png')}
          style={styles.backgroundImage}
        />
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Profile', { selectedAccount })}
          >
            <Image
              source={require('../assets/girl.png')}
              style={styles.profileImage}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.networkContainer}
            onPress={() => setShowNetworkModal(true)}
          >
            <Text style={styles.networkButtonText}>
              {selectedNetwork ? selectedNetwork.name : 'Select a network'}{' '}
              <FontAwesome
                style={styles.downArrow}
                name="chevron-down"
                size={12}
                color="#FFF"
              />
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.accountButton}
          onPress={() => setShowAccountModal(true)}
        >
          <Text style={styles.accountButtonText}>
            {selectedAccount?.name ? selectedAccount?.name : 'Create account'}
          </Text>
          <FontAwesome name="chevron-down" size={12} color="#FFF" />
        </TouchableOpacity>

        <View style={styles.balanceTextWrapper}>
          <Text style={styles.balanceText}>
            {balance && !isNaN(parseFloat(balance))
              ? parseFloat(balance).toFixed(4)
              : '0.0000'}{' '}
            {selectedNetwork?.suffix}
          </Text>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() =>
              navigation.navigate('SendToken', {
                selectedAccount,
                accounts,
                selectedNetwork,
              })
            }
          >
            <FontAwesome name="arrow-up" size={24} color="#c0c0c0" />
            <Text style={styles.buttonText}>Send</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() =>
              navigation.navigate('Recieve', {
                selectedAccount,
              })
            }
          >
            <FontAwesome name="arrow-down" size={24} color="#c0c0c0" />
            <Text style={styles.buttonText}>Receive</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            onPress={() => setSelectedTab('Tokens')}
            style={selectedTab === 'Tokens' ? styles.activeTab : styles.tab}
          >
            <Text style={styles.tabText}>Tokens</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setSelectedTab('Collectibles')}
            style={
              selectedTab === 'Collectibles' ? styles.activeTab : styles.tab
            }
          >
            <Text style={styles.tabText}>Collectibles</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.contentContainer}>
          {selectedTab === 'Tokens' && (
            <View style={styles.tokenContainer}>
              {tokens.map((token, index) => (
                <View key={index} style={styles.tokenBox}>
                  <View style={styles.tokenRow}>
                    <Feather
                      name="arrow-up-right"
                      size={30}
                      color="#c0c0c0"
                      onPress={() => onTokenSendClick(token)}
                    />
                    {typeof token.image === 'string' &&
                      token.image.startsWith('http') ? (
                      <Image
                        source={{ uri: token.image }}
                        style={styles.tokenImage}
                      />
                    ) : (
                      <View style={styles.fallbackIconContainer}>
                        {generateFallbackIcon(token.name)}
                      </View>
                    )}
                    <View style={styles.tokenInfo}>
                      <Text style={styles.tokenName}>{token.name}</Text>
                      <Text style={styles.tokenSubtext}>{token.symbol}</Text>
                    </View>
                    <Text style={styles.tokenAmount}>{token.balance}</Text>
                  </View>
                </View>
              ))}
              <TouchableOpacity
                style={styles.addButton}
                onPress={() =>
                  navigation.navigate('AddToken', { selectedNetwork })
                }
              >
                <FontAwesome name="plus" size={16} color="#c0c0c0" />
                <Text style={styles.addButtonText}>Add Tokens</Text>
              </TouchableOpacity>
            </View>
          )}

          {selectedTab === 'Collectibles' && (
            <View style={styles.tokenContainer}>
              {collectibles.map((collectible, index) => (
                <View key={index} style={styles.tokenBox}>
                  <View style={styles.tokenRow}>
                    <Feather
                      name="arrow-up-right"
                      size={30}
                      color="#c0c0c0"
                      onPress={() => onNFTSendClick(collectible)}
                    />
                    <View style={styles.tokenInfo}>
                      <Text style={styles.tokenName}>{collectible?.name}</Text>
                      <Text style={styles.tokenSubtext}>{collectible?.uri}</Text>
                    </View>
                    <Text style={styles.tokenAmount}>{collectible?.balance}</Text>
                  </View>
                </View>
              ))}
              <TouchableOpacity
                style={styles.addButton}
                onPress={() =>
                  navigation.navigate('AddCollectibles', { selectedNetwork })
                }
              >
                <FontAwesome name="plus" size={16} color="#c0c0c0" />
                <Text style={styles.addButtonText}>Add Collectibles</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>

        <Modal
          visible={showAccountModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowAccountModal(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Accounts</Text>
              <ScrollView style={styles.accountScrollView} ref={scrollViewRef}>
                {generateNewAccounts.map((account, index) => (
                  <View key={index} style={styles.accountRow}>
                    {isEditing && editAccountIndex === index ? (
                      <TextInput
                        style={styles.input}
                        value={editAccountName}
                        onChangeText={setEditAccountName}
                      />
                    ) : (
                      <>
                        <TouchableOpacity
                          onPress={() => handleAccountSelect(account)}
                        >
                          <View style={styles.accountNameRow}>
                            <Text style={styles.accountName}>{account.name}</Text>
                            <TouchableOpacity
                              onPress={() => handleEditAccount(account, index)}
                            >
                              <FontAwesome name="edit" size={16} color="#FFF" />
                            </TouchableOpacity>
                          </View>
                          <Text style={styles.accountAddress}>
                            {account.address}
                          </Text>
                        </TouchableOpacity>
                      </>
                    )}
                  </View>
                ))}
              </ScrollView>
              {isEditing && (
                <TouchableOpacity
                  style={styles.createButton}
                  onPress={saveEditedAccountName}
                >
                  <Text style={styles.createButtonText}>Save</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.createButton}
                onPress={handleCreateAccount}
              >
                <FontAwesome name="plus" size={16} color="#FFF" />
                <Text style={styles.createButtonText}>Create Account</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => {
                  setShowAccountModal(false);
                  setIsEditing(false);
                }}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => handleImportNewAccount()}
              >
                <Text style={styles.closeButtonText}>Import New Account</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <Modal
          visible={showCreateAccount}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowCreateAccount(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Create Account</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter account name"
                value={newAccountName}
                onChangeText={setNewAccountName}
              />
              <TouchableOpacity style={styles.createButton}>
                <Text style={styles.createButtonText}>Save Account</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowCreateAccount(false)}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <Modal
          visible={showNetworkModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowNetworkModal(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Networks</Text>
              <ScrollView style={styles.networkScrollView}>
                {networks.map((network, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.networkRow}
                    onPress={() => {
                      setSelectedNetwork(network);
                      setShowNetworkModal(false);
                    }}
                  >
                    <Text style={styles.networkName}>{network.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => setShowAddNetworkModal(true)}
              >
                <FontAwesome name="plus" size={16} color="#c0c0c0" />
                <Text style={styles.addButtonText}>Add Network</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowNetworkModal(false)}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <Modal
          visible={showAddNetworkModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowAddNetworkModal(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Add Network</Text>
              <TextInput
                style={styles.input}
                placeholder="Network Name"
                value={newNetworkName}
                onChangeText={setNewNetworkName}
              />
              <TextInput
                style={styles.input}
                placeholder="Network URL (RPC)"
                value={newNetworkUrl}
                onChangeText={setNewNetworkUrl}
              />
              <TextInput
                style={styles.input}
                placeholder="Currency Symbol"
                value={newNetworkSuffix}
                onChangeText={setNewNetworkSuffix}
              />
              <TouchableOpacity style={styles.createButton} onPress={handleAddNetwork}>
                <Text style={styles.createButtonText}>Add Network</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowAddNetworkModal(false)}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

      </View>
      <Navigation selectedAccount={selectedAccount} selectedNetwork={selectedNetwork} />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C1C1C',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  backgroundImage: {
    position: 'absolute',
    top: 70,
    right: 0,
    width: '30%',
    height: '30%',
    zIndex: -1,
  },
  networkText: {
    color: '#fff',
    marginRight: 5,
  },
  networkButtonText: {
    color: '#FFF',
    marginRight: 5,
  },
  networkContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: '#333',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
    width: '30%',
    position: 'relative',
    zIndex: 2,
  },

  tokenImage: {
    width: 40,
    height: 40,
    marginRight: -10,
    borderRadius: 25,
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    backgroundColor: '#333',
    width: '100%',
    zIndex: 2000,
    borderRadius: 5,
  },
  dropdownItem: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#444',
  },
  downArrow: {
    marginLeft: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  accountButton: {
    backgroundColor: '#333',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    alignSelf: 'center',
  },
  accountButtonText: {
    color: '#FFF',
    marginRight: 5,
  },
  balanceTextWrapper: {
    textAlign: 'center',
    marginVertical: 20,
  },
  balanceText: {
    color: '#A0ED8D',
    fontVariantNumeric: 'lining-nums proportional-nums',
    fontFamily: 'Poppins',
    fontSize: 40,
    fontStyle: 'normal',
    marginLeft: 20,
    fontWeight: '300',
    lineHeight: 56,
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 20,
  },
  fallbackIconContainer: {
    width: 40,
    height: 40,
    marginRight: -10,
    borderRadius: 25,
    marginBottom: 7
    // Add other styles if needed
  },
  actionButton: {
    display: 'flex',
    padding: 8,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    borderRadius: 8,
    backgroundColor: '#333',
  },
  buttonText: {
    color: '#FFF',
    marginTop: 5,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  tab: {
    paddingVertical: 10,
  },
  activeTab: {
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: '#FFF',
  },
  tabText: {
    color: '#FFF',
    fontSize: 16,
  },
  contentContainer: {
    flex: 1,
  },
  tokenContainer: {
    marginTop: 20,
  },
  tokenBox: {
    backgroundColor: '#333',
    borderRadius: 10,
    padding: 10,
    marginVertical: 10,
  },
  tokenRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tokenInfo: {
    flex: 1,
    marginLeft: 20,
  },
  tokenName: {
    color: '#FFF',
    fontSize: 16,
  },
  tokenSubtext: {
    color: '#666',
    fontSize: 12,
  },
  tokenAmount: {
    color: '#FFF',
  },
  coreImage: {
    width: 35,
    height: 35,
    marginLeft: 5,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  addButtonText: {
    color: '#FFF',
    marginLeft: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '80%',
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
  accountScrollView: {
    maxHeight: 200,
  },
  accountRow: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  accountNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountName: {
    color: '#FFF',
    fontSize: 16,
    marginRight: 10,
  },
  accountAddress: {
    color: 'gray',
    marginTop: 5,
  },
  input: {
    backgroundColor: '#333',
    color: '#FFF',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginBottom: 20,
    width: '100%',
  },
  createButton: {
    backgroundColor: '#c0c0c0',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  createButtonText: {
    color: '#1C1C1C',
    marginLeft: 10,
  },
  closeButton: {
    marginTop: 10,
  },
  closeButtonText: {
    color: '#FFF',
  },
  networkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  networkName: {
    color: '#FFF',
    fontSize: 16,
    alignItems: 'center',
    justifyContent: 'center'
  },
  networkScrollView: {
    maxHeight: 200,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#333',
    paddingVertical: 10,
  },
  navButton: {
    alignItems: 'center',
  },
  navButtonText: {
    color: '#FFF',
    marginTop: 5,
  },
});






// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#1C1C1C',
//     paddingTop: 50,
//     paddingHorizontal: 20,
//   },
//   networkContainer: {
//     flexDirection: 'column',
//     alignItems: 'center',
//     backgroundColor: '#333',
//     paddingVertical: 5,
//     paddingHorizontal: 10,
//     borderRadius: 20,
//     width: '30%',
//   },
//   dropdown: {
//     position: 'relative',
//     backgroundColor: '#333',
//     marginTop: 5, // adjust as needed to position the dropdown
//     // borderWidth: 1,
//     // borderRadius: 5,
//     // zIndex: 1,
//   },
//   dropdownItem: {
//     backgroundColor: '#333',
//     paddingHorizontal: 10,
//     paddingVertical: 8,
//   },
//   networkText: {
//     color: '#fff',
//     marginRight: 5,
//   },
//   networkButtonText: {
//     color: '#FFF',
//     marginRight: 5,
//   },
//   downArrow: {
//     marginLeft: 100,
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//   },
//   profileImage: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//   },
//   accountButton: {
//     backgroundColor: '#333',
//     borderRadius: 20,
//     paddingVertical: 8,
//     paddingHorizontal: 12,
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 20,
//     alignSelf: 'center',
//   },
//   accountButtonText: {
//     color: '#FFF',
//     marginRight: 5,
//   },
//   balanceText: {
//     color: '#FFF',
//     fontSize: 24,
//     textAlign: 'center',
//     marginVertical: 20,
//   },
//   usdText: {
//     color: '#FFF',
//     fontSize: 16,
//     textAlign: 'center',
//   },
//   pluspercentageText: {
//     color: '#00FF00',
//   },
//   buttonRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     marginVertical: 20,
//   },
//   actionButton: {
//     alignItems: 'center',
//   },
//   buttonText: {
//     color: '#FFF',
//     marginTop: 5,
//   },
//   tabContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     borderBottomWidth: 1,
//     borderBottomColor: '#333',
//   },
//   tab: {
//     paddingVertical: 10,
//   },
//   activeTab: {
//     paddingVertical: 10,
//     borderBottomWidth: 2,
//     borderBottomColor: '#FFF',
//   },
//   tabText: {
//     color: '#FFF',
//     fontSize: 16,
//   },
//   contentContainer: {
//     flex: 1,
//   },
//   tokenContainer: {
//     marginTop: 20,
//   },
//   tokenBox: {
//     backgroundColor: '#333',
//     borderRadius: 10,
//     padding: 10,
//     marginVertical: 10,
//   },
//   tokenRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   tokenIcon: {
//     width: 40,
//     height: 40,
//     marginRight: 10,
//   },
//   tokenInfo: {
//     flex: 1,
//     marginLeft: 20,
//   },
//   tokenName: {
//     color: '#FFF',
//     fontSize: 16,
//   },
//   tokenSubtext: {
//     color: '#666',
//     fontSize: 12,
//   },
//   tokenAmount: {
//     color: '#FFF',
//   },
//   addButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginVertical: 20,
//   },
//   addButtonText: {
//     color: '#FFF',
//     marginLeft: 5,
//   },
//   modalContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: 'rgba(0,0,0,0.5)',
//   },
//   modalContent: {
//     width: '80%',
//     backgroundColor: '#1C1C1C',
//     padding: 20,
//     borderRadius: 10,
//     alignItems: 'center',
//   },
//   modalTitle: {
//     color: '#FFF',
//     fontSize: 18,
//     marginBottom: 20,
//   },
//   accountScrollView: {
//     maxHeight: 200, // Limit the height of the scroll view
//   },
//   accountRow: {
//     flexDirection: 'column',
//     alignItems: 'center', // Center the entire row
//     justifyContent: 'center', // Center the entire row
//     paddingVertical: 10,
//     borderBottomWidth: 1,
//     borderBottomColor: '#333',
//   },
//   accountNameRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center', // Center the content within the row
//   },
//   accountName: {
//     color: '#FFF',
//     fontSize: 16,
//     marginRight: 10, // Add some space between the name and the edit icon
//   },
//   accountAddress: {
//     color: 'gray',
//     marginTop: 5,
//   },
//   input: {
//     backgroundColor: '#333',
//     color: '#FFF',
//     borderRadius: 20,
//     paddingVertical: 10,
//     paddingHorizontal: 15,
//     marginBottom: 20,
//     width: '100%',
//   },
//   createButton: {
//     backgroundColor: '#c0c0c0',
//     borderRadius: 20,
//     paddingVertical: 10,
//     paddingHorizontal: 20,
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 20,
//   },
//   createButtonText: {
//     color: '#1C1C1C',
//     marginLeft: 10,
//   },
//   closeButton: {
//     marginTop: 10,
//   },
//   closeButtonText: {
//     color: '#FFF',
//   },
// });

// import React, {useState, useEffect, useRef} from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   Image,
//   Modal,
//   TextInput,
//   ScrollView,
//   Alert,
// } from 'react-native';
// import {ethers} from 'ethers';
// import FontAwesome from 'react-native-vector-icons/FontAwesome';
// import Compass from 'react-native-vector-icons/FontAwesome5';
// import Feather from 'react-native-vector-icons/Feather';
// import SecureStorage from 'rn-secure-storage';
// //  import WalletConnect from '@walletconnect/client';
// //  import QRCodeModal from '@walletconnect/qrcode-modal';
// // import coreImage from '../assets/coreImage.jpg'; // Import the core image
// import coreImage from '../assets/coreImage1.png';

// export default function MainPage({navigation, route}) {
//   const [selectedTab, setSelectedTab] = useState('Tokens');
//   const [showDropdown, setShowDropdown] = useState(false);
//   const [selectedNetwork, setSelectedNetwork] = useState(null);
//   const [showAccountModal, setShowAccountModal] = useState(false);
//   const [accounts, setAccounts] = useState([]);
//   const [newAccountName, setNewAccountName] = useState('');
//   const [showCreateAccount, setShowCreateAccount] = useState(false);
//   const [generateNewAccounts, setGenerateNewAccounts] = useState([]);
//   const [tokens, setTokens] = useState([]);
//   const [collectibles, setCollectibles] = useState([]);
//   const [selectedAccount, setSelectedAccount] = useState(null);
//   const [balance, setBalance] = useState('');
//   const [fetchedAccount, setFetchedAccount] = useState(null);
//   const [fetchedAccountIndex, setFetchedAccountIndex] = useState(-1);
//   const [balanceToken, setBalanceToken] = useState('error');
//   const [balanceCollectibles, setBalanceCollectibles] = useState('error');
//   const [selectedForToken, setSelectedForToken] = useState('');
//   const [selectedForCollectible, setSelectedForCollectible] = useState('');
//   const [dropdownNetworkVisible, setDropdownNetworkVisible] = useState(false);
//   const [isEditing, setIsEditing] = useState(false);
//   const [editAccountName, setEditAccountName] = useState('');
//   const [editAccountIndex, setEditAccountIndex] = useState(-1);

//   const scrollViewRef = useRef(null);
//   const connector = useRef(null);

//   const handleEditAccount = (account, index) => {
//     setIsEditing(true);
//     setEditAccountName(account.name);
//     setEditAccountIndex(index);
//   };

//   const saveEditedAccountName = async () => {
//     if (editAccountIndex !== -1 && editAccountName.trim() !== '') {
//       const updatedAccounts = [...generateNewAccounts];
//       updatedAccounts[editAccountIndex].name = editAccountName;

//       setGenerateNewAccounts(updatedAccounts);
//       setAccounts(updatedAccounts);

//       await SecureStorage.setItem(
//         'new accounts',
//         JSON.stringify(updatedAccounts),
//       );
//       setIsEditing(false);
//       setEditAccountIndex(-1);
//       setEditAccountName('');
//     }
//   };

//   const abi = [
//     'function name() view returns (string)',
//     'function symbol() view returns (string)',
//     'function decimals() view returns (uint8)',
//     'function balanceOf(address) view returns (uint256)',
//     'function approve(address spender, uint256 value) external returns (bool)',
//     'function transfer(address to, uint256 amount) returns (bool)',
//     'function ownerOf(uint256 tokenId) external view returns (address owner)',
//     'function transferFrom(address from, address to, uint256 tokenId) external;',
//   ];

//   const abi721 = [
//     {
//       constant: true,
//       inputs: [
//         {
//           name: '_owner',
//           type: 'address',
//         },
//       ],
//       name: 'balanceOf',
//       outputs: [
//         {
//           name: 'balance',
//           type: 'uint256',
//         },
//       ],
//       payable: false,
//       stateMutability: 'view',
//       type: 'function',
//     },
//     {
//       constant: false,
//       inputs: [
//         {
//           name: '_from',
//           type: 'address',
//         },
//         {
//           name: '_to',
//           type: 'address',
//         },
//         {
//           name: '_tokenId',
//           type: 'uint256',
//         },
//       ],
//       name: 'transferFrom',
//       outputs: [],
//       payable: false,
//       stateMutability: 'nonpayable',
//       type: 'function',
//     },
//     {
//       constant: true,
//       inputs: [
//         {
//           name: '_tokenId',
//           type: 'uint256',
//         },
//       ],
//       name: 'ownerOf',
//       outputs: [
//         {
//           name: 'owner',
//           type: 'address',
//         },
//       ],
//       payable: false,
//       stateMutability: 'view',
//       type: 'function',
//     },
//     {
//       constant: true,
//       inputs: [
//         {
//           name: '_interfaceId',
//           type: 'bytes4',
//         },
//       ],
//       name: 'supportsInterface',
//       outputs: [
//         {
//           name: '',
//           type: 'bool',
//         },
//       ],
//       payable: false,
//       stateMutability: 'view',
//       type: 'function',
//     },
//     {
//       inputs: [
//         {
//           name: '_name',
//           type: 'string',
//         },
//         {
//           name: '_symbol',
//           type: 'string',
//         },
//       ],
//       payable: false,
//       stateMutability: 'nonpayable',
//       type: 'constructor',
//     },
//     {
//       anonymous: false,
//       inputs: [
//         {
//           indexed: true,
//           name: '_from',
//           type: 'address',
//         },
//         {
//           indexed: true,
//           name: '_to',
//           type: 'address',
//         },
//         {
//           indexed: true,
//           name: '_tokenId',
//           type: 'uint256',
//         },
//       ],
//       name: 'Transfer',
//       type: 'event',
//     },
//   ];

//   const networks = [
//     {
//       name: 'Sepolia',
//       networkurl:
//         'https://sepolia.infura.io/v3/215d4e9d78b5430fb64f66b61d84c1e9',
//       suffix: 'ETH',
//     },
//     {
//       name: 'Core',
//       networkurl: 'https://rpc.coredao.org',
//       suffix: 'CORE',
//     },
//     {
//       name: 'Ethereum Mainnet',
//       networkurl:
//         'https://mainnet.infura.io/v3/215d4e9d78b5430fb64f66b61d84c1e9',
//       suffix: 'ETH',
//     },

//     {
//       name: 'Amoy',
//       networkurl:
//         'https://polygon-amoy.infura.io/v3/215d4e9d78b5430fb64f66b61d84c1e9',
//       suffix: 'MATIC',
//     },

//     {
//       name: 'BSC',
//       networkurl: 'https://data-seed-prebsc-1-s1.binance.org:8545',
//       suffix: 'BNB',
//     },
//   ];

//   const provider = selectedNetwork
//     ? new ethers.providers.JsonRpcProvider(selectedNetwork?.networkurl)
//     : null;
//   // console.log('Main Page Ptrovider ==== ',provider)

//   useEffect(() => {
//     // Select Sepolia network if no network is selected
//     if (!selectedNetwork) {
//       setSelectedNetwork(networks[0]);
//     }
//   }, []);

//   useEffect(() => {
//     const fetchTokens = async () => {
//       try {
//         const storedTokens = await SecureStorage.getItem('tokenss');
//         if (storedTokens) {
//           const parsedTokens = JSON.parse(storedTokens);

//           const tokenBalances = await Promise.all(
//             parsedTokens.map(async token => {
//               try {
//                 const contract = new ethers.Contract(
//                   token?.address,
//                   abi,
//                   provider,
//                 );
//                 const balance = await contract.balanceOf(
//                   selectedAccount?.address,
//                 );
//                 return {
//                   ...token,
//                   balance: ethers.utils.formatUnits(
//                     balance,
//                     token.decimals || 18,
//                   ),
//                 };
//               } catch (error) {
//                 console.error('Error fetching token balance:', error);
//                 return {
//                   ...token,
//                   balance: '0.00',
//                 };
//               }
//             }),
//           );

//           setTokens(tokenBalances);
//           setBalanceToken(tokenBalances);
//         }
//       } catch (error) {
//         console.error('Error fetching tokens:', error);
//       }
//     };

//     fetchTokens();
//     const interval = setInterval(fetchTokens, 10000);

//     const unsubscribe = navigation.addListener('focus', () => {
//       fetchTokens();
//     });

//     return () => {
//       clearInterval(interval);
//       unsubscribe();
//     };
//   }, [navigation, selectedAccount]);

//   useEffect(() => {
//     const fetchCollectibles = async () => {
//       try {
//         const storedCollectibles = await SecureStorage.getItem('collectibless');
//         if (storedCollectibles) {
//           const parsedCollectibles = JSON.parse(storedCollectibles);
//           setCollectibles(parsedCollectibles);
//           const collectibleBalances = await Promise.all(
//             parsedCollectibles.map(async coll => {
//               const contract = new ethers.Contract(
//                 coll.address,
//                 abi721,
//                 provider,
//               );
//               const balance = await contract.balanceOf(selectedAccount.address);
//               return {
//                 ...coll,
//                 balance: ethers.utils.formatUnits(balance, 0),
//               };
//             }),
//           );
//           setCollectibles(collectibleBalances);
//           setBalanceCollectibles(collectibleBalances);
//         }
//       } catch (error) {
//         console.error('Error fetching Collectibles:', error);
//       }
//     };

//     fetchCollectibles();
//     const interval = setInterval(fetchCollectibles, 10000);

//     const unsubscribe = navigation.addListener('focus', () => {
//       fetchCollectibles();
//     });

//     return () => {
//       clearInterval(interval);
//       unsubscribe();
//     };
//   }, [navigation, selectedAccount]);

//   useEffect(() => {
//     const fetchBalance = async () => {
//       if (selectedAccount) {
//         const balance = await getBalance(selectedAccount.address);
//         setBalance(balance);
//       }
//     };

//     fetchBalance();
//     const interval = setInterval(fetchBalance, 2000);

//     return () => clearInterval(interval);
//   }, [selectedAccount,selectedNetwork, isEditing, navigation]);

//   const toggleDropdown = () => {
//     setShowDropdown(!showDropdown);
//   };

//   const toggleNetwokDropdown = () => {
//     setDropdownNetworkVisible(!dropdownNetworkVisible);
//   };

//   const selectNetwork = networkName => {
//     const selected = networks.find(network => network.name === networkName);
//     if (selected) {
//       setSelectedNetwork(selected);
//       setDropdownNetworkVisible(false);
//     }
//     setShowDropdown(false);
//   };
//   // const getBalance = async (address, provider) => {
//   //   try {
//   //     if (!provider) {
//   //       throw new Error('Provider is not initialized');
//   //     }
//   //     const balance = await provider.getBalance(address);
//   //     return ethers.utils.formatEther(balance);
//   //   } catch (error) {
//   //     console.error('Error fetching balance:', error.message);
//   //     return '0.00';
//   //   }
//   // };

//   const getBalance = async address => {
//     const balance = await provider.getBalance(address);
//     return ethers.utils.formatEther(balance);
//   };

//   useEffect(() => {
//     const getStoredAccounts = async () => {
//       try {
//         const storedAccounts = await SecureStorage.getItem('new accounts');
//         if (storedAccounts) {
//           const parsedAccounts = JSON.parse(storedAccounts);
//           setGenerateNewAccounts(parsedAccounts);
//           setAccounts(parsedAccounts);
//         }
//       } catch (error) {
//         console.error('Error fetching accounts:', error);
//       }
//     };

//     getStoredAccounts();
//   }, [selectedAccount, generateNewAccounts]);

//   useEffect(() => {
//     const initializeFirstAccount = async () => {
//       try {
//         const storedAccounts = await SecureStorage.getItem('new accounts');
//         if (!storedAccounts) {
//           await handleCreateAccount();
//         }
//         setShowCreateAccount(false);
//       } catch (error) {
//         console.error('Error initializing first account:', error);
//       }
//     };

//     initializeFirstAccount();
//   }, [navigation, selectedAccount]);
//   const handleImportNewAccount = () => {
//     navigation.navigate('ImportAccount');
//   };

//   const handleCreateAccount = async () => {
//     try {
//       const storedAccounts = await SecureStorage.getItem('accounts');
//       if (!storedAccounts) {
//         console.error('No accounts found in local storage');
//         return;
//       }

//       let parsedAccounts = JSON.parse(storedAccounts);
//       if (!parsedAccounts || parsedAccounts.length === 0) {
//         console.error('No valid accounts found in local storage');
//         return;
//       }

//       parsedAccounts.sort((a, b) => {
//         const aName = a.name.match(/Account (\d+)/);
//         const bName = b.name.match(/Account (\d+)/);
//         if (aName && bName) {
//           return parseInt(aName[1], 10) - parseInt(bName[1], 10);
//         }
//         return 0;
//       });

//       let fetchedAccountIndex;
//       try {
//         const storedFetchedAccountIndex = await SecureStorage.getItem(
//           'fetchedAccountIndex',
//         );
//         fetchedAccountIndex = storedFetchedAccountIndex
//           ? parseInt(storedFetchedAccountIndex, 10)
//           : 0;
//       } catch (error) {
//         console.error(
//           'Error retrieving fetchedAccountIndex from local storage:',
//           error,
//         );
//         fetchedAccountIndex = 0;
//       }

//       if (fetchedAccountIndex >= parsedAccounts.length) {
//         console.log('All accounts have already been generated');
//         return;
//       }

//       const nextAccount = parsedAccounts[fetchedAccountIndex];

//       const accountExists = generateNewAccounts.some(
//         account => account.address === nextAccount.address,
//       );

//       if (accountExists) {
//         console.log('Account already exists:', nextAccount);
//         Alert.alert('Account already exists:');
//         return;
//       }

//       setFetchedAccount(nextAccount);
//       setFetchedAccountIndex(fetchedAccountIndex);

//       const updatedAccounts = [...accounts, nextAccount];
//       setAccounts(updatedAccounts);
//       setGenerateNewAccounts([...generateNewAccounts, nextAccount]);

//       setNewAccountName(nextAccount.name);

//       await SecureStorage.setItem(
//         'new accounts',
//         JSON.stringify([...generateNewAccounts, nextAccount]),
//       );

//       await SecureStorage.setItem(
//         'fetchedAccountIndex',
//         (fetchedAccountIndex + 1).toString(),
//       );

//       setTimeout(() => {
//         if (scrollViewRef.current) {
//           scrollViewRef.current.scrollToEnd({animated: true});
//         }
//       }, 100);
//     } catch (error) {
//       console.error('Error fetching account:', error);
//     }
//   };

//   const handleAccountSelect = account => {
//     setSelectedAccount(account);
//     setNewAccountName(account?.name);
//     setShowAccountModal(false);
//   };

//   const onTokenSendClick = token => {
//     setSelectedForToken(token);
//     navigation.navigate('SendToken', {
//       selectedAccount,
//       accounts,
//       selectedForToken: token,
//       selectedNetwork,
//     });
//   };

//   const onNFTSendClick = collectible => {
//     setSelectedForCollectible(collectible);
//     navigation.navigate('SendToken', {
//       selectedAccount,
//       accounts,
//       // selectedForToken: token,
//       selectedForCollectible: collectible,
//       selectedNetwork,
//     });
//   };

//   const handleDeletePassword = async () => {
//     try {
//       await SecureStorage.removeItem('newPassword');
//       Alert.alert('Success', 'Password has been deleted.');
//     } catch (error) {
//       console.error('Failed to delete the password:', error);
//       Alert.alert('Error', 'Failed to delete the password.');
//     }
//   };

//   // const handleWalletConnect = async url => {
//   //   try {
//   //     connector.current = new WalletConnect({
//   //       bridge: 'https://bridge.walletconnect.org', // Required
//   //       qrcodeModal: QRCodeModal,
//   //     });

//   //     if (!connector.current.connected) {
//   //       await connector.current.createSession();
//   //     }

//   //     connector.current.on('connect', (error, payload) => {
//   //       if (error) {
//   //         throw error;
//   //       }
//   //       const {accounts} = payload.params[0];
//   //       console.log('Connected', accounts);
//   //     });

//   //     connector.current.on('session_update', (error, payload) => {
//   //       if (error) {
//   //         throw error;
//   //       }
//   //       const {accounts} = payload.params[0];
//   //       console.log('Updated', accounts);
//   //     });

//   //     connector.current.on('disconnect', (error, payload) => {
//   //       if (error) {
//   //         throw error;
//   //       }
//   //       console.log('Disconnected');
//   //     });

//   //     navigation.navigate('WebView', {url, selectedAccount});
//   //   } catch (error) {
//   //     console.error('WalletConnect error:', error);
//   //   }
//   // };

//   return (
//     <View style={styles.container}>
//       <View style={styles.header}>
//         <TouchableOpacity
//           onPress={() =>
//             navigation.navigate('Profile', {
//               selectedAccount,
//             })
//           }>
//           <Image
//             source={require('../assets/girl.png')}
//             style={styles.profileImage}
//           />
//         </TouchableOpacity>
//         <TouchableOpacity
//           style={styles.networkContainer}
//           onPress={toggleNetwokDropdown}>
//           <Text style={styles.networkButtonText}>
//             {selectedNetwork ? selectedNetwork.name : 'Select a network'}{' '}
//             <FontAwesome
//               style={styles.downArrow}
//               name="chevron-down"
//               size={12}
//               color="#FFF"
//             />
//           </Text>
//           {dropdownNetworkVisible && (
//             <View style={styles.dropdown}>
//               {networks.map((network, index) => (
//                 <TouchableOpacity
//                   key={index}
//                   style={styles.dropdownItem}
//                   onPress={() => selectNetwork(network.name)}>
//                   <Text style={styles.networkText}>{network.name}</Text>
//                 </TouchableOpacity>
//               ))}
//             </View>
//           )}
//         </TouchableOpacity>
//       </View>

//       <TouchableOpacity
//         style={styles.accountButton}
//         onPress={() => setShowAccountModal(true)}>
//         <Text style={styles.accountButtonText}>
//           {newAccountName ? selectedAccount?.name : 'Select an Account'}
//         </Text>

//         <FontAwesome name="chevron-down" size={12} color="#FFF" />
//       </TouchableOpacity>

//       <Text style={styles.balanceText}>
//         {balance} {selectedNetwork?.suffix}{' '}
//         {selectedNetwork?.name === 'Core' && (
//           <Image source={coreImage} style={styles.coreImage} />
//         )}
//       </Text>

//       <View style={styles.buttonRow}>
//         <TouchableOpacity
//           style={styles.actionButton}
//           onPress={() =>
//             navigation.navigate('SendToken', {
//               selectedAccount,
//               accounts,
//               selectedNetwork,
//             })
//           }>
//           <FontAwesome name="arrow-up" size={24} color="#c0c0c0" />
//           <Text style={styles.buttonText}>Send</Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={styles.actionButton}
//           onPress={() =>
//             navigation.navigate('Recieve', {
//               selectedAccount,
//             })
//           }>
//           <FontAwesome name="arrow-down" size={24} color="#c0c0c0" />
//           <Text style={styles.buttonText}>Receive</Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={styles.actionButton}
//           onPress={() => navigation.navigate('Discover', {selectedAccount})}>
//           <Compass name="compass" size={24} color="#c0c0c0" />
//           <Text style={styles.buttonText}>Discover</Text>
//         </TouchableOpacity>
//       </View>

//       <View style={styles.tabContainer}>
//         <TouchableOpacity
//           onPress={() => setSelectedTab('Tokens')}
//           style={selectedTab === 'Tokens' ? styles.activeTab : styles.tab}>
//           <Text style={styles.tabText}>Tokens</Text>
//         </TouchableOpacity>
//         <TouchableOpacity
//           onPress={() => setSelectedTab('Collectibles')}
//           style={
//             selectedTab === 'Collectibles' ? styles.activeTab : styles.tab
//           }>
//           <Text style={styles.tabText}>Collectibles</Text>
//         </TouchableOpacity>
//       </View>

//       <ScrollView style={styles.contentContainer}>
//         {selectedTab === 'Tokens' && (
//           <View style={styles.tokenContainer}>
//             {tokens.map((token, index) => (
//               <View key={index} style={styles.tokenBox}>
//                 <View style={styles.tokenRow}>
//                   <Feather
//                     name="arrow-up-right"
//                     size={30}
//                     color="#c0c0c0"
//                     onPress={() => onTokenSendClick(token)}
//                   />
//                   <View style={styles.tokenInfo}>
//                     <Text style={styles.tokenName}>{token.name}</Text>
//                     <Text style={styles.tokenSubtext}>{token.symbol}</Text>
//                   </View>
//                   <Text style={styles.tokenAmount}>{token.balance}</Text>
//                 </View>
//               </View>
//             ))}
//             <TouchableOpacity
//               style={styles.addButton}
//               onPress={() =>
//                 navigation.navigate('AddToken', {selectedNetwork})
//               }>
//               <FontAwesome name="plus" size={16} color="#c0c0c0" />
//               <Text style={styles.addButtonText}>Add Tokens</Text>
//             </TouchableOpacity>
//           </View>
//         )}

//         {selectedTab === 'Collectibles' && (
//           <View style={styles.tokenContainer}>
//             {collectibles.map((collectible, index) => (
//               <View key={index} style={styles.tokenBox}>
//                 <View style={styles.tokenRow}>
//                   <Feather
//                     name="arrow-up-right"
//                     size={30}
//                     color="#c0c0c0"
//                     onPress={() => onNFTSendClick(collectible)}
//                   />
//                   <View style={styles.tokenInfo}>
//                     <Text style={styles.tokenName}>{collectible?.name}</Text>
//                     <Text style={styles.tokenSubtext}>{collectible?.uri}</Text>
//                   </View>
//                   <Text style={styles.tokenAmount}>{collectible?.balance}</Text>
//                 </View>
//               </View>
//             ))}
//             <TouchableOpacity
//               style={styles.addButton}
//               onPress={() =>
//                 navigation.navigate('AddCollectibles', {selectedNetwork})
//               }>
//               <FontAwesome name="plus" size={16} color="#c0c0c0" />
//               <Text style={styles.addButtonText}>Add Collectibles</Text>
//             </TouchableOpacity>
//             {/* <TouchableOpacity
//               style={styles.deleteButton}
//               onPress={handleDeletePassword}>
//               <Text style={styles.deleteButtonText}>Delete Password</Text>
//             </TouchableOpacity> */}
//           </View>
//         )}
//       </ScrollView>

//       <Modal
//         visible={showAccountModal}
//         animationType="slide"
//         transparent={true}
//         onRequestClose={() => setShowAccountModal(false)}>
//         <View style={styles.modalContainer}>
//           <View style={styles.modalContent}>
//             <Text style={styles.modalTitle}>Accounts</Text>
//             <ScrollView style={styles.accountScrollView} ref={scrollViewRef}>
//               {generateNewAccounts.map((account, index) => (
//                 <View key={index} style={styles.accountRow}>
//                   {isEditing && editAccountIndex === index ? (
//                     <TextInput
//                       style={styles.input}
//                       value={editAccountName}
//                       onChangeText={setEditAccountName}
//                     />
//                   ) : (
//                     <>
//                       <TouchableOpacity
//                         onPress={() => handleAccountSelect(account)}>
//                         <View style={styles.accountNameRow}>
//                           <Text style={styles.accountName}>{account.name}</Text>
//                           <TouchableOpacity
//                             onPress={() => handleEditAccount(account, index)}>
//                             <FontAwesome name="edit" size={16} color="#FFF" />
//                           </TouchableOpacity>
//                         </View>
//                         <Text style={styles.accountAddress}>
//                           {account.address}
//                         </Text>
//                       </TouchableOpacity>
//                     </>
//                   )}
//                 </View>
//               ))}
//             </ScrollView>
//             {isEditing && (
//               <TouchableOpacity
//                 style={styles.createButton}
//                 onPress={saveEditedAccountName}>
//                 <Text style={styles.createButtonText}>Save</Text>
//               </TouchableOpacity>
//             )}
//             <TouchableOpacity
//               style={styles.createButton}
//               onPress={handleCreateAccount}>
//               <FontAwesome name="plus" size={16} color="#FFF" />
//               <Text style={styles.createButtonText}>Create Account</Text>
//             </TouchableOpacity>
//             <TouchableOpacity
//               style={styles.closeButton}
//               onPress={() => {
//                 setShowAccountModal(false);
//                 setIsEditing(false);
//               }}>
//               <Text style={styles.closeButtonText}>Close</Text>
//             </TouchableOpacity>
//             <TouchableOpacity
//               style={styles.closeButton}
//               onPress={() => handleImportNewAccount()}>
//               <Text style={styles.closeButtonText}>Import New Account</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </Modal>

//       <Modal
//         visible={showCreateAccount}
//         animationType="slide"
//         transparent={true}
//         onRequestClose={() => setShowCreateAccount(false)}>
//         <View style={styles.modalContainer}>
//           <View style={styles.modalContent}>
//             <Text style={styles.modalTitle}>Create Account</Text>
//             <TextInput
//               style={styles.input}
//               placeholder="Enter account name"
//               value={newAccountName}
//               onChangeText={setNewAccountName}
//             />
//             <TouchableOpacity style={styles.createButton}>
//               <Text style={styles.createButtonText}>Save Account</Text>
//             </TouchableOpacity>
//             <TouchableOpacity
//               style={styles.closeButton}
//               onPress={() => setShowCreateAccount(false)}>
//               <Text style={styles.closeButtonText}>Close</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </Modal>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#1C1C1C',
//     paddingTop: 50,
//     paddingHorizontal: 20,
//     zIndex: 1, // Ensure the container has a lower zIndex
//   },
// networkContainer: {
//   flexDirection: 'column',
//   alignItems: 'center',
//   backgroundColor: '#333',
//   paddingVertical: 5,
//   paddingHorizontal: 10,
//   borderRadius: 20,
//   width: '30%',
//   position: 'relative', // Ensure the parent has relative positioning
//   zIndex: 2, // Ensure the network container has a lower zIndex than the dropdown
// },
// dropdown: {
//   position: 'absolute',
//   top: '100%', // Position it below the network container
//   backgroundColor: '#333',
//   width: '100%', // Match the width of the parent
//   zIndex: 2000, // Ensure it appears above other elements
//   borderRadius: 5, // Optional: add some border radius for styling
// },
// dropdownItem: {
//   paddingHorizontal: 10,
//   paddingVertical: 8,
//   flexDirection: 'row',
//   alignItems: 'center',
//   borderBottomWidth: 1,
//   borderBottomColor: '#444', // Optional: add a bottom border for separation
// },
// networkText: {
//   color: '#fff',
//   marginRight: 5,
// },
// networkButtonText: {
//   color: '#FFF',
//   marginRight: 5,
// },
// downArrow: {
//   marginLeft: 100,
// },
//   coreImage: {
//     width: 20,
//     height: 20,
//     marginLeft: 10,
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     zIndex: 1000, // Ensure the header has a lower zIndex than the dropdown
//   },
//   profileImage: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//   },
//   accountButton: {
//     backgroundColor: '#333',
//     borderRadius: 20,
//     paddingVertical: 8,
//     paddingHorizontal: 12,
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 20,
//     alignSelf: 'center',
//   },
//   accountButtonText: {
//     color: '#FFF',
//     marginRight: 5,
//   },
//   balanceText: {
//     color: '#FFF',
//     fontSize: 24,
//     textAlign: 'center',
//     marginVertical: 20,
//   },
//   buttonRow: {
//     position: 'relative',
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     marginVertical: 20,
//     zIndex: 1, // Ensure the button row has a lower zIndex than the dropdown
//   },
//   actionButton: {
//     alignItems: 'center',
//   },
//   buttonText: {
//     color: '#FFF',
//     marginTop: 5,
//   },
//   tabContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     borderBottomWidth: 1,
//     borderBottomColor: '#333',
//   },
//   tab: {
//     paddingVertical: 10,
//   },
//   activeTab: {
//     paddingVertical: 10,
//     borderBottomWidth: 2,
//     borderBottomColor: '#FFF',
//   },
//   tabText: {
//     color: '#FFF',
//     fontSize: 16,
//   },
//   contentContainer: {
//     flex: 1,
//   },
//   tokenContainer: {
//     marginTop: 20,
//   },
//   tokenBox: {
//     backgroundColor: '#333',
//     borderRadius: 10,
//     padding: 10,
//     marginVertical: 10,
//   },
//   tokenRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   tokenIcon: {
//     width: 40,
//     height: 40,
//     marginRight: 10,
//   },
//   tokenInfo: {
//     flex: 1,
//     marginLeft: 20,
//   },
//   tokenName: {
//     color: '#FFF',
//     fontSize: 16,
//   },
//   tokenSubtext: {
//     color: '#666',
//     fontSize: 12,
//   },
//   tokenAmount: {
//     color: '#FFF',
//   },
//   addButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginVertical: 20,
//   },
//   addButtonText: {
//     color: '#FFF',
//     marginLeft: 5,
//   },
//   modalContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: 'rgba(0,0,0,0.5)',
//   },
//   modalContent: {
//     width: '80%',
//     backgroundColor: '#1C1C1C',
//     padding: 20,
//     borderRadius: 10,
//     alignItems: 'center',
//   },
//   modalTitle: {
//     color: '#FFF',
//     fontSize: 18,
//     marginBottom: 20,
//   },
//   accountScrollView: {
//     maxHeight: 200, // Limit the height of the scroll view
//   },
//   accountRow: {
//     flexDirection: 'column',
//     alignItems: 'center', // Center the entire row
//     justifyContent: 'center', // Center the entire row
//     paddingVertical: 10,
//     borderBottomWidth: 1,
//     borderBottomColor: '#333',
//   },
//   accountNameRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center', // Center the content within the row
//   },
//   accountName: {
//     color: '#FFF',
//     fontSize: 16,
//     marginRight: 10, // Add some space between the name and the edit icon
//   },
//   accountAddress: {
//     color: 'gray',
//     marginTop: 5,
//   },
//   input: {
//     backgroundColor: '#333',
//     color: '#FFF',
//     borderRadius: 20,
//     paddingVertical: 10,
//     paddingHorizontal: 15,
//     marginBottom: 20,
//     width: '100%',
//   },
//   createButton: {
//     backgroundColor: '#c0c0c0',
//     borderRadius: 20,
//     paddingVertical: 10,
//     paddingHorizontal: 20,
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 20,
//   },
//   createButtonText: {
//     color: '#1C1C1C',
//     marginLeft: 10,
//   },
//   closeButton: {
//     marginTop: 10,
//   },
//   closeButtonText: {
//     color: '#FFF',
//   },
// });

// // const styles = StyleSheet.create({
// //   container: {
// //     flex: 1,
// //     backgroundColor: '#1C1C1C',
// //     paddingTop: 50,
// //     paddingHorizontal: 20,
// //   },
// //   networkContainer: {
// //     flexDirection: 'column',
// //     alignItems: 'center',
// //     backgroundColor: '#333',
// //     paddingVertical: 5,
// //     paddingHorizontal: 10,
// //     borderRadius: 20,
// //     width: '30%',
// //   },
// //   dropdown: {
// //     position: 'relative',
// //     backgroundColor: '#333',
// //     marginTop: 5, // adjust as needed to position the dropdown
// //   },
// //   dropdownItem: {
// //     backgroundColor: '#333',
// //     paddingHorizontal: 10,
// //     paddingVertical: 8,
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //   },
// networkText: {
//   color: '#fff',
//   marginRight: 5,
// },
// networkButtonText: {
//   color: '#FFF',
//   marginRight: 5,
// },
// //   downArrow: {
// //     marginLeft: 100,
// //   },
// //   coreImage: {
// //     width: 20,
// //     height: 20,
// //     marginLeft: 10,
// //   },
// //   header: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     justifyContent: 'space-between',
// //   },
// //   profileImage: {
// //     width: 40,
// //     height: 40,
// //     borderRadius: 20,
// //   },
// //   accountButton: {
// //     backgroundColor: '#333',
// //     borderRadius: 20,
// //     paddingVertical: 8,
// //     paddingHorizontal: 12,
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     marginTop: 20,
// //     alignSelf: 'center',
// //   },
// //   accountButtonText: {
// //     color: '#FFF',
// //     marginRight: 5,
// //   },
// //   balanceText: {
// //     color: '#FFF',
// //     fontSize: 24,
// //     textAlign: 'center',
// //     marginVertical: 20,
// //   },
// //   buttonRow: {
// //     flexDirection: 'row',
// //     justifyContent: 'space-around',
// //     marginVertical: 20,
// //   },
// //   actionButton: {
// //     alignItems: 'center',
// //   },
// //   buttonText: {
// //     color: '#FFF',
// //     marginTop: 5,
// //   },
// //   tabContainer: {
// //     flexDirection: 'row',
// //     justifyContent: 'space-around',
// //     borderBottomWidth: 1,
// //     borderBottomColor: '#333',
// //   },
// //   tab: {
// //     paddingVertical: 10,
// //   },
// //   activeTab: {
// //     paddingVertical: 10,
// //     borderBottomWidth: 2,
// //     borderBottomColor: '#FFF',
// //   },
// //   tabText: {
// //     color: '#FFF',
// //     fontSize: 16,
// //   },
// //   contentContainer: {
// //     flex: 1,
// //   },
// //   tokenContainer: {
// //     marginTop: 20,
// //   },
// //   tokenBox: {
// //     backgroundColor: '#333',
// //     borderRadius: 10,
// //     padding: 10,
// //     marginVertical: 10,
// //   },
// //   tokenRow: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //   },
// //   tokenIcon: {
// //     width: 40,
// //     height: 40,
// //     marginRight: 10,
// //   },
// //   tokenInfo: {
// //     flex: 1,
// //     marginLeft: 20,
// //   },
// //   tokenName: {
// //     color: '#FFF',
// //     fontSize: 16,
// //   },
// //   tokenSubtext: {
// //     color: '#666',
// //     fontSize: 12,
// //   },
// //   tokenAmount: {
// //     color: '#FFF',
// //   },
// //   addButton: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     justifyContent: 'center',
// //     marginVertical: 20,
// //   },
// //   addButtonText: {
// //     color: '#FFF',
// //     marginLeft: 5,
// //   },
// //   modalContainer: {
// //     flex: 1,
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //     backgroundColor: 'rgba(0,0,0,0.5)',
// //   },
// //   modalContent: {
// //     width: '80%',
// //     backgroundColor: '#1C1C1C',
// //     padding: 20,
// //     borderRadius: 10,
// //     alignItems: 'center',
// //   },
// //   modalTitle: {
// //     color: '#FFF',
// //     fontSize: 18,
// //     marginBottom: 20,
// //   },
// //   accountScrollView: {
// //     maxHeight: 200, // Limit the height of the scroll view
// //   },
// //   accountRow: {
// //     flexDirection: 'column',
// //     alignItems: 'center', // Center the entire row
// //     justifyContent: 'center', // Center the entire row
// //     paddingVertical: 10,
// //     borderBottomWidth: 1,
// //     borderBottomColor: '#333',
// //   },
// //   accountNameRow: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     justifyContent: 'center', // Center the content within the row
// //   },
// //   accountName: {
// //     color: '#FFF',
// //     fontSize: 16,
// //     marginRight: 10, // Add some space between the name and the edit icon
// //   },
// //   accountAddress: {
// //     color: 'gray',
// //     marginTop: 5,
// //   },
// //   input: {
// //     backgroundColor: '#333',
// //     color: '#FFF',
// //     borderRadius: 20,
// //     paddingVertical: 10,
// //     paddingHorizontal: 15,
// //     marginBottom: 20,
// //     width: '100%',
// //   },
// //   createButton: {
// //     backgroundColor: '#c0c0c0',
// //     borderRadius: 20,
// //     paddingVertical: 10,
// //     paddingHorizontal: 20,
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     marginTop: 20,
// //   },
// //   createButtonText: {
// //     color: '#1C1C1C',
// //     marginLeft: 10,
// //   },
// //   closeButton: {
// //     marginTop: 10,
// //   },
// //   closeButtonText: {
// //     color: '#FFF',
// //   },
// // });
