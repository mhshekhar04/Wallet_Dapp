import {useNavigation, useRoute} from '@react-navigation/native';
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
import FontAwesome from 'react-native-vector-icons/FontAwesome';

const Navigation = ({selectedAccount,selectedNetwork}) => {
  const route = useRoute();
  //   const {selectedAccount} = route.params || {};
  const navigation = useNavigation();

//   console.log('Navigation Selected Account', selectedAccount);
  return (
    <View style={styles.bottomNav}>
      <TouchableOpacity
        style={styles.navButton}
        onPress={() => navigation.navigate('MainPage')}>
        <FontAwesome name="home" size={24} color="#c0c0c0" />
        <Text style={styles.navButtonText}>Home</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.navButton}
        onPress={() => {
          if (route.name !== 'Profile') {
            navigation.navigate('Profile', {selectedAccount});
          }
        }}>
        <FontAwesome name="user" size={24} color="#c0c0c0" />
        <Text style={styles.navButtonText}>Profile</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.navButton}
        onPress={() => navigation.navigate('Discover', {selectedAccount,selectedNetwork})}>
        <FontAwesome name="compass" size={24} color="#c0c0c0" />
        <Text style={styles.navButtonText}>Discover</Text>
      </TouchableOpacity>
    </View>
  );
};
export default Navigation;

const styles = StyleSheet.create({
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