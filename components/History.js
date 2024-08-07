import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Alert, TouchableOpacity, ScrollView } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { ethers } from 'ethers';
import Navigation from './Navigation';

const History = ({ route, navigation }) => {
  const { selectedAccount } = route.params;
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const address = selectedAccount.address; // Using the selectedAccount's address
  const apiKey = 'QBH6N9HDJP7XPSDBJ3TJS6RGGSKKI9Q2AT'; // Replace with your Etherscan API key
  const recentTransactionsCount = 25;

  useEffect(() => {
    const fetchTransactionHistory = async () => {
      try {
        // Get current block number
        const currentBlock = await getCurrentBlockNumber();

        const url = `https://api-sepolia.etherscan.io/api` +
                    `?module=account` +
                    `&action=txlist` +
                    `&address=${address}` +
                    `&startblock=${currentBlock - 9999}` + // Fetch transactions from last 10000 blocks
                    `&endblock=${currentBlock}` + // Fetch transactions up to current block
                    `&page=1` +
                    `&offset=${recentTransactionsCount}` +
                    `&sort=desc` +
                    `&apikey=${apiKey}`;

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setActivities(data.result); // Set transaction history data
        setLoading(false); // Set loading state to false
      } catch (error) {
        console.error('Error fetching transaction history:', error);
        setError('Failed to fetch transaction history');
        setLoading(false); // Set loading state to false
      }
    };

    fetchTransactionHistory();
  }, []);

  const getCurrentBlockNumber = async () => {
    try {
      const response = await fetch('https://api-sepolia.etherscan.io/api?module=proxy&action=eth_blockNumber&apikey=YourApiKeyToken');
      if (!response.ok) {
        throw new Error('Failed to fetch current block number');
      }
      const data = await response.json();
      return parseInt(data.result, 16);
    } catch (error) {
      console.error('Error fetching current block number:', error);
      return null;
    }
  };

  const renderItem = ({ item }) => {
    const isSender = item.from.toLowerCase() === address.toLowerCase();
    const valueInEth = ethers.utils.formatEther(item.value);

    return (
      <View style={styles.transactionItem}>
        <Text style={styles.transactionDate}>{new Date(item.timeStamp * 1000).toLocaleDateString()} at {new Date(item.timeStamp * 1000).toLocaleTimeString()}</Text>
        <View style={styles.transactionRow}>
          <FontAwesome name={isSender ? "arrow-up" : "arrow-down"} size={20} color={isSender ? "red" : "green"} />
          <View style={styles.transactionDetails}>
            <Text style={styles.transactionHeader}>{isSender ? 'Sent' : 'Received'}</Text>
            <Text style={styles.transactionStatus}>{item.isError === "0" ? "Confirmed" : "Cancelled"}</Text>
          </View>
          <View style={styles.transactionAmount}>
            <Text style={styles.transactionValue}>{parseFloat(valueInEth).toFixed(7)}</Text>
            <Text style={styles.transactionValueUSD}>${(parseFloat(valueInEth) * 238.2).toFixed(7)}</Text>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#FEBF32" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <>
      <View style={styles.container}>
        <Text style={styles.header}>Transaction History</Text>
        <FlatList
          data={activities}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderItem}
          style={styles.list}
        />
      </View>
      <Navigation selectedAccount={selectedAccount} />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C1C1C',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingVertical: 20,
    paddingHorizontal: 10,
  },
  header: {
    fontSize: 24,
    color: '#FFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1C1C1C',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1C1C1C',
  },
  errorText: {
    color: '#F00',
    fontSize: 18,
  },
  list: {
    marginTop: 10,
  },
  transactionItem: {
    backgroundColor: '#242731',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  transactionDate: {
    color: '#FFF',
    fontSize: 14,
    marginBottom: 10,
  },
  transactionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionDetails: {
    flex: 1,
    marginLeft: 10,
  },
  transactionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 5,
  },
  transactionStatus: {
    fontSize: 16,
    color: '#FEBF32',
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  transactionValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  transactionValueUSD: {
    fontSize: 14,
    color: '#666',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#333',
    paddingVertical: 10,
    width: '100%',
  },
  navButton: {
    alignItems: 'center',
  },
  navButtonText: {
    color: '#FFF',
    marginTop: 5,
  },
});

export default History;
