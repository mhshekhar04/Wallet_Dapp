import {useNavigation} from '@react-navigation/native';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {AccountsContext} from './AccountsContext';
import SecureStorage from 'rn-secure-storage';
import React, {useContext, useState, useEffect, useRef} from 'react';
<<<<<<< Updated upstream
=======

>>>>>>> Stashed changes
const VerifiedSeedPhrase = () => {
  const {accounts, generateNewAccounts, addAccount} =
    useContext(AccountsContext);
  const scrollViewRef = useRef(null);
  const navigation = useNavigation();
  const mainPage = async () => {
    try {
      const storedAccounts = await SecureStorage.getItem('accounts');
      if (!storedAccounts) {
        console.error('No accounts found in local storage');
        return;
      }
<<<<<<< Updated upstream
=======

>>>>>>> Stashed changes
      let parsedAccounts = JSON.parse(storedAccounts);
      if (!parsedAccounts || parsedAccounts.length === 0) {
        console.error('No valid accounts found in local storage');
        return;
      }
<<<<<<< Updated upstream
=======

>>>>>>> Stashed changes
      parsedAccounts.sort((a, b) => {
        const aName = a.name.match(/Account (\d+)/);
        const bName = b.name.match(/Account (\d+)/);
        if (aName && bName) {
          return parseInt(aName[1], 10) - parseInt(bName[1], 10);
        }
        return 0;
      });
<<<<<<< Updated upstream
=======

>>>>>>> Stashed changes
      let fetchedAccountIndex;
      try {
        const storedFetchedAccountIndex = await SecureStorage.getItem(
          'fetchedAccountIndex',
        );
        fetchedAccountIndex = storedFetchedAccountIndex
          ? parseInt(storedFetchedAccountIndex, 10)
          : 0;
      } catch (error) {
        console.error(
          'Error retrieving fetchedAccountIndex from local storage:',
          error,
        );
        fetchedAccountIndex = 0;
      }
<<<<<<< Updated upstream
=======

>>>>>>> Stashed changes
      if (fetchedAccountIndex >= parsedAccounts.length) {
        console.log('All accounts have already been generated');
        return;
      }
<<<<<<< Updated upstream
      const nextAccount = parsedAccounts[fetchedAccountIndex];
      const accountExists = generateNewAccounts.some(
        account => account.address === nextAccount.address,
      );
=======

      const nextAccount = parsedAccounts[fetchedAccountIndex];

      const accountExists = generateNewAccounts.some(
        account => account.address === nextAccount.address,
      );

>>>>>>> Stashed changes
      if (accountExists) {
        console.log('Account already exists:', nextAccount);
        Alert.alert('Account already exists:');
        return;
      }
<<<<<<< Updated upstream
      addAccount(nextAccount);
=======

      addAccount(nextAccount);

>>>>>>> Stashed changes
      await SecureStorage.setItem(
        'fetchedAccountIndex',
        (fetchedAccountIndex + 1).toString(),
      );
<<<<<<< Updated upstream
=======

>>>>>>> Stashed changes
      setTimeout(() => {
        if (scrollViewRef.current) {
          scrollViewRef.current.scrollToEnd({animated: true});
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
      <Text style={styles.header}>Success!</Text>
      <Text style={styles.description}>
        You've successfully protected your wallet. Remember to keep your seed
        phrase safe, it's your responsibility!
      </Text>
      <Text style={styles.description}>
        "Navigator cannot recover your wallet if you lose it."
      </Text>
      <TouchableOpacity style={styles.verifyButton} onPress={mainPage}>
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
    paddingTop: 24,
    paddingHorizontal: 20,
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
  header: {
    fontFamily: 'Poppins',
    fontSize: 40,
    fontWeight: '300',
    lineHeight: 56,
    textAlign: 'center',
    background:
      'linear-gradient(91deg, #A9CDFF 0%, #72F6D1 21.87%, #A0ED8D 55.73%, #FED365 81.77%, #FAA49E 100%)',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    color: 'transparent',
    marginBottom: 16,
  },
  description: {
    width: 295,
    fontSize: 14,
    lineHeight: 24,
    textAlign: 'center',
    color: '#FFF',
    marginBottom: 16,
  },
  verifyButton: {
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
export default VerifiedSeedPhrase;