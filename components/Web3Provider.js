import React from 'react';
import { Web3ReactProvider } from '@web3-react/core';
import { InjectedConnector } from '@web3-react/injected-connector';
import { Web3Provider as EthersWeb3Provider } from '@ethersproject/providers';

const injected = new InjectedConnector({ supportedChainIds: [1, 3, 4, 5, 42, 56] });

function getLibrary(provider) {
  return new EthersWeb3Provider(provider);
}

const connectors = [[injected, {}]];

const Web3Provider = ({ children }) => {
  return (
    <Web3ReactProvider connectors={connectors} getLibrary={getLibrary}>
      {children}
    </Web3ReactProvider>
  );
};

export default Web3Provider;
