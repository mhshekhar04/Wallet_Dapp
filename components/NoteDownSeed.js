import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { randomBytes } from 'react-native-randombytes';
import { ethers } from 'ethers';
import LottieView from 'lottie-react-native';

const NoteDownSeed = ({ navigation }) => {
  const [seedPhrase, setSeedPhrase] = useState([]);
  const [loading, setLoading] = useState(true); // State to manage loading state

  useEffect(() => {
    generateSeedPhrase();
  }, []);

  // const generateSeedPhrase = async () => {
  //   try {
  //     // Generate secure random bytes
  //     const randomBytesArray = await new Promise((resolve, reject) => {
  //       randomBytes(16, (err, bytes) => {
  //         if (err) reject(err);
  //         else resolve(bytes);
  //       });
  //     });

  //     // Use ethers.js to generate mnemonic from random bytes
  //     const mnemonic = ethers.Wallet.fromMnemonic(
  //       ethers.utils.entropyToMnemonic(randomBytesArray),
  //     ).mnemonic.phrase;

  //     const newSeedPhrase = mnemonic.split(' ');
  //     setSeedPhrase(newSeedPhrase);
  //     console.log('Shadab Seed Phrase', newSeedPhrase);

  //     setLoading(false); // Set loading to false once seed phrase is generated
  //   } catch (error) {
  //     console.error('Error generating seed phrase:', error);
  //   }
  // };
  const generateSeedPhrase = async () => {
    try {
      console.time('Generate Random Bytes');
      // Generate secure random bytes
      const randomBytesArray = await new Promise((resolve, reject) => {
        randomBytes(16, (err, bytes) => {
          if (err) reject(err);
          else resolve(bytes);
        });
      });
<<<<<<< Updated upstream
      console.timeEnd('Generate Random Bytes');
      console.log('Random Bytes:', randomBytesArray);

      console.time('Generate Mnemonic');
      // Use ethers.js to generate mnemonic from random bytes
      const mnemonic = ethers.Wallet.fromMnemonic(
        ethers.utils.entropyToMnemonic(randomBytesArray),
      ).mnemonic.phrase;
      console.timeEnd('Generate Mnemonic');
      console.log('Mnemonic:', mnemonic);

      console.time('Split Mnemonic into Words');
      const newSeedPhrase = mnemonic.split(' ');
      console.timeEnd('Split Mnemonic into Words');
      console.log('Seed Phrase:', newSeedPhrase);

      setSeedPhrase(newSeedPhrase);
=======
  
      // Use ethers.js to generate mnemonic directly from random bytes
      const mnemonic = ethers.utils.entropyToMnemonic(randomBytesArray);
      const newSeedPhrase = mnemonic.split(' ');
  
      setSeedPhrase(newSeedPhrase);
      console.log('Shadab Seed Phrase', newSeedPhrase);
  
>>>>>>> Stashed changes
      setLoading(false); // Set loading to false once seed phrase is generated
    } catch (error) {
      console.error('Error generating seed phrase:', error);
    }
  };

  const handleNext = () => {
    navigation.replace('ConfirmSeedPhrase', { seedPhrase });
  };

  return (
    <View style={styles.container}>
      <View style={styles.rectanglesContainer}>
        <View style={styles.rectangle}></View>
        <View style={styles.rectangle}></View>
        <View style={styles.rectangle}></View>
      </View>
      <Text style={styles.title}>Note Down Your Seed Phrase</Text>
      <Text style={styles.description}>
        This is your seed phrase. Write it down on a paper and keep it in a safe
        place. You'll be asked to re-enter this phrase (in order) on the next
        step.
      </Text>
      {loading ? (
        <>
          <ActivityIndicator
            size="large"
            color="#c0c0c0"
            style={styles.loadingIndicator}
          />
          <Text style={{ color: 'white' }}>
            This may take few seconds. Do not press back
          </Text>
          <LottieView
            source={require('../assets/seed.json')}
            autoPlay
            loop
            style={styles.lottie}
          />
        </>
      ) : (
        <>
          <View style={styles.seedPhraseContainer}>
            {seedPhrase.map((word, index) => (
              <View key={index} style={styles.seedPhraseBox}>
                <Text style={styles.seedPhraseText}>{`${index + 1}. ${word}`}</Text>
              </View>
            ))}
          </View>
          <TouchableOpacity
            style={styles.button}
            onPress={handleNext}
            disabled={loading}
          >
            <Text style={styles.buttonText}>Next</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#17171A',
    alignItems: 'center',
    paddingVertical: 50,
    paddingHorizontal: 20,
  },
  rectanglesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  rectangle: {
    width: '30%',
    height: 4,
    backgroundColor: '#c0c0c0',
  },
  title: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 24,
    lineHeight: 36,
    color: '#c0c0c0',
    marginVertical: 20,
    textAlign: 'center',
  },
  description: {
    color: '#ABAFC4',
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    lineHeight: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  loadingIndicator: {
    marginVertical: 20,
  },
  lottie: {
    width: 150,
    height: 150,
  },
  seedPhraseContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginVertical: 20,
  },
  seedPhraseBox: {
    backgroundColor: '#2A2D3C',
    borderRadius: 8,
    padding: 10,
    margin: 5,
  },
  seedPhraseText: {
    color: '#FFF',
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
  },
  button: {
    backgroundColor: '#c0c0c0',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginVertical: 20,
  },
  buttonText: {
    color: '#17171A',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
  },
});

export default NoteDownSeed;
