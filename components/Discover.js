import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Navigation from './Navigation';

const dexLinks = [
  { name: '1inch.io', url: 'https://app.1inch.io/#/1/swap/ETH/DAI' },
  { name: 'Curve', url: 'https://curve.fi/#/ethereum/swap' },
  { name: 'Pancakeswap', url: 'https://pancakeswap.finance/swap' },
  { name: 'Aerodrome', url: 'https://aerodrome.finance/swap' },
  { name: 'Gmx', url: 'https://app.gmx.io/#/trade' },
];

export default function Discover({ navigation, route }) {
  const { selectedAccount, selectedNetwork } = route.params;
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = () => {
    let url = searchQuery.trim();
    if (!/^https?:\/\//i.test(url)) {
      url = `https://${url}`;
    }
    navigation.navigate('WebViewScreen', { url, selectedAccount, selectedNetwork });
  };

  const handleLinkPress = (url) => {
    navigation.navigate('WebViewScreen', { url, selectedAccount, selectedNetwork });
  };

  return (
    <>
      <View style={styles.container}>
        <TextInput
          style={styles.searchBar}
          placeholder="Paste link here..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          keyboardType="url"
          autoCapitalize="none"
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>Go</Text>
        </TouchableOpacity>
        <ScrollView>
          {dexLinks.map((dex) => (
            <TouchableOpacity
              key={dex.name}
              style={styles.link}
              onPress={() => handleLinkPress(dex.url)}
            >
              <Text style={styles.linkText}>{dex.name}</Text>
              <FontAwesome name="external-link" size={16} color="#c0c0c0" />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      <Navigation selectedAccount={selectedAccount} />
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
  searchBar: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 16,
    paddingLeft: 8,
    color: '#FFF',
    backgroundColor: '#333',
  },
  searchButton: {
    backgroundColor: '#c0c0c0',
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  searchButtonText: {
    color: '#1C1C1C',
  },
  link: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#333',
    padding: 15,
    borderRadius: 5,
    marginVertical: 5,
  },
  linkText: {
    color: '#FFF',
    fontSize: 16,
  },
});
