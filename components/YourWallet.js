// import React, { useEffect, useState,useRef } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   ScrollView,
// } from 'react-native';
// import FontAwesome from 'react-native-vector-icons/FontAwesome';
// import SecureStorage from 'rn-secure-storage';

// export default function YourWallet() {
//   const [accounts, setAccounts] = useState([]);
//   const scrollViewRef = useRef(null);
//   const [fetchedAccountIndex, setFetchedAccountIndex] = useState(-1);
//   const [fetchedAccount, setFetchedAccount] = useState(null);
//   const [generateNewAccounts, setGenerateNewAccounts] = useState([]);
//   const [newNewAccountName,setNewAccountName] = useState('')
//   useEffect(() => {
//     const getStoredAccounts = async () => {
//       try {
//         const storedAccounts = await SecureStorage.getItem('new accounts');
//         if (storedAccounts) {
//           const parsedAccounts = JSON.parse(storedAccounts);
//           setAccounts(parsedAccounts);
//           setGenerateNewAccounts(parsedAccounts)
//         }
//       } catch (error) {
//         console.error('Error fetching accounts:', error);
//       }
//     };

//     getStoredAccounts();
//   }, []);

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
//           'fetchedAccountIndex'
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
//           scrollViewRef.current.scrollToEnd({ animated: true });
//         }
//       }, 100);
      
//     } catch (error) {
//       console.error('Error fetching account:', error);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.header}>Your Accounts</Text>
//       <ScrollView style={styles.accountsContainer}>
//         {generateNewAccounts.map((account, index) => (
//           <View key={index} style={styles.accountBox}>
//             <View style={styles.accountInfo}>
//               <Text style={styles.accountName}>{account?.name}</Text>
//               <Text style={styles.accountAddress}>{account?.address}</Text>
//             </View>
//           </View>
//         ))}
//       </ScrollView>
//       <TouchableOpacity style={styles.createAccountSection} onPress={handleCreateAccount}> 
//         <FontAwesome name="plus-circle" size={40} color="#c0c0c0" />
//         <Text style={styles.sectionTitle}>Create Account</Text>
//       </TouchableOpacity>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#1C1C1C',
//     paddingTop: 50,
//     paddingHorizontal: 20,
//   },
//   header: {
//     color: '#FFF',
//     fontSize: 24,
//     textAlign: 'center',
//     marginBottom: 20,
//   },
//   accountsContainer: {
//     flex: 1,
//   },
//   accountBox: {
//     backgroundColor: '#333',
//     borderRadius: 10,
//     padding: 15,
//     marginBottom: 15,
//   },
//   accountInfo: {
//     marginLeft: 10,
//   },
//   accountName: {
//     color: '#FFF',
//     fontSize: 16,
//     marginBottom: 5,
//   },
//   accountAddress: {
//     color: 'gray',
//     fontSize: 14,
//   },
//   createAccountSection: {
//     backgroundColor: '#333',
//     borderRadius: 10,
//     padding: 15,
//     marginBottom: 15,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   sectionTitle: {
//     color: '#FFF',
//     fontSize: 18,
//     marginLeft: 10,
//   },
// });

import React, { useContext, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { AccountsContext } from './AccountsContext';
import SecureStorage from 'rn-secure-storage';

export default function YourWallet() {
  const { accounts, generateNewAccounts, addAccount } = useContext(AccountsContext);
  const scrollViewRef = useRef(null);

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

      if (fetchedAccountIndex >= parsedAccounts.length) {
        console.log('All accounts have already been generated');
        return;
      }

      const nextAccount = parsedAccounts[fetchedAccountIndex];

      const accountExists = generateNewAccounts.some(
        account => account.address === nextAccount.address,
      );

      if (accountExists) {
        console.log('Account already exists:', nextAccount);
        Alert.alert('Account already exists:');
        return;
      }

      await SecureStorage.setItem(
        'fetchedAccountIndex',
        (fetchedAccountIndex + 1).toString(),
      );

      addAccount(nextAccount);

      setTimeout(() => {
        if (scrollViewRef.current) {
          scrollViewRef.current.scrollToEnd({ animated: true });
        }
      }, 100);

    } catch (error) {
      console.error('Error fetching account:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Your Accounts</Text>
      <ScrollView style={styles.accountsContainer}>
        {generateNewAccounts.map((account, index) => (
          <View key={index} style={styles.accountBox}>
            <View style={styles.accountInfo}>
              <Text style={styles.accountName}>{account?.name}</Text>
              <Text style={styles.accountAddress}>{account?.address}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
      <TouchableOpacity style={styles.createAccountSection} onPress={handleCreateAccount}>
        <FontAwesome name="plus-circle" size={40} color="#c0c0c0" />
        <Text style={styles.sectionTitle}>Create Account</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C1C1C',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  header: {
    color: '#FFF',
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 20,
  },
  accountsContainer: {
    flex: 1,
  },
  accountBox: {
    backgroundColor: '#333',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  accountInfo: {
    marginLeft: 10,
  },
  accountName: {
    color: '#FFF',
    fontSize: 16,
    marginBottom: 5,
  },
  accountAddress: {
    color: 'gray',
    fontSize: 14,
  },
  createAccountSection: {
    backgroundColor: '#333',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    color: '#FFF',
    fontSize: 18,
    marginLeft: 10,
  },
});
