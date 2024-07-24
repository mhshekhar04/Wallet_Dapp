import '@walletconnect/react-native-compat';
import { WagmiConfig } from 'wagmi';
import { mainnet, polygon, arbitrum } from 'viem/chains';
import { createWeb3Modal, defaultWagmiConfig, Web3Modal } from '@web3modal/wagmi-react-native';

const projectId = 'bee34d84398661ca0bbc1cc9a3167f91';

const metadata = {
  name: 'walletconnect',
  description: 'a dapp with dex functionalities',
  url: 'https://web5solution.com/',
  icons: ['https://web5solution.com/static/media/rightimage.683f44a3874c90454173.png'],
  redirect: {
    native: 'walletconnect://',
    universal: 'https://web5solution.com/',
  },
};

const chains = [mainnet, polygon, arbitrum];

const wagmiConfig = defaultWagmiConfig({ chains, projectId, metadata });

createWeb3Modal({
  projectId,
  chains,
  wagmiConfig,
  enableAnalytics: true,
});

export { wagmiConfig };
