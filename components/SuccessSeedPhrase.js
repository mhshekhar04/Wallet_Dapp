import { useNavigation } from '@react-navigation/native';
import React, { useContext, useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { AccountsContext } from './AccountsContext';
import SecureStorage from 'rn-secure-storage';
const SuccessSeedPhrase = () => {
  const { accounts, generateNewAccounts, addAccount } = useContext(AccountsContext);
  const scrollViewRef = useRef(null);
  const navigation = useNavigation();
  const nextSuccessPage = async() => {
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
    navigation.replace('MainPage');
  };
  return (
    <View style={styles.container}>
      <View style={styles.rectanglesContainer}>
        <View style={styles.rectangle}></View>
        <View style={styles.rectangle}></View>
        <View style={styles.rectangle}></View>
      </View>
      <Text style={styles.bigTitle}>Success!</Text>
      <Text style={styles.description}>
        Seed phrase confirmed successfully!
      </Text>
      <Text style={styles.infoText}>
        You've successfully protected your wallet. Remember to keep your seed phrase safe, it's your responsibility!
      </Text>
      <Text style={styles.infoText}>
      Navigator cannot recover your wallet if you loose it.
      </Text>
      <TouchableOpacity style={styles.button} onPress={nextSuccessPage}>
        <Text style={styles.buttonText}>Next</Text>
      </TouchableOpacity>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#17171A',
    alignItems: 'center',
  },
  rectanglesContainer: {
    flexDirection: 'row',
    height: 8,
    width: '100%',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  rectangle: {
    flex: 1,
    height: 8,
    borderRadius: 2,
    backgroundColor: '#222531',
    marginHorizontal: 2,
  },
  bigTitle: {
    fontFamily: 'Poppins',
    fontSize: 40,
    fontWeight: '300',
    lineHeight: 56,
    textAlign: 'center',
    color: '#C0C0C0',
    marginBottom: 16,
    marginTop: 36,
    width: '80%',
    padding: 4,
  },
  description: {
    width: '80%',
    fontSize: 14,
    lineHeight: 24,
    textAlign: 'center',
    color: '#ABAFC4',
    marginBottom: 16,
  },
  infoText: {
    width: '80%',
    fontSize: 14,
    lineHeight: 24,
    textAlign: 'center',
    color: '#FFF',
    marginBottom: 16,
  },
  button: {
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#C0C0C0',
    borderRadius: 8,
  },
  buttonText: {
    fontFamily: 'Poppins',
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
    color: '#000',
    textAlign: 'center',
  },
});
export default SuccessSeedPhrase;