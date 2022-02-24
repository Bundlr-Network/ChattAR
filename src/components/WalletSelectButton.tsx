import React from 'react';
import { ArweaveWebWallet } from 'arweave-wallet-connector';
import "./walletSelectButton.css";

import { WebBundlr } from "@bundlr-network/client"
import WalletConnectProvider from "@walletconnect/web3-provider";
import { providers } from "ethers"
import { Web3Provider } from "@ethersproject/providers";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom"
import * as nearAPI from "near-api-js"
import { WalletConnection } from "near-api-js";
// import { globalStateContext } from '../App';



const { keyStores, connect } = nearAPI;


declare var window: any


const webWallet = new ArweaveWebWallet({
  name: 'PublicSquare Tutorial',
  logo: 'https://jfbeats.github.io/ArweaveWalletConnector/placeholder.svg',
}, 'arweave.app');

const NONE = "None";
const AR_CONNECT = "ArConnect";
const ARWEAVE_APP = "ArweaveApp";
// const META_MASK = "MetaMask";
// const 

export const WalletSelectButton = (props) => {
  const [showModal, setShowModal] = React.useState(false);
  const [activeWallet, setActiveWalelt] = React.useState(NONE);
  const [addressText, setAddressText] = React.useState("xxxxx...xxx");

  async function onWalletSelected(walletName) {
    let address = await window.arweaveWallet.getActiveAddress();
    if (address) {
      const firstFive = address.substring(0, 5);
      const lastFour = address.substring(address.length - 4);
      setAddressText(`${firstFive}..${lastFour}`);
      props.onWalletConnect();
    }
    setActiveWalelt(walletName);
  }

  return (
    <>
      <WalletButton onClick={() => setShowModal(true)} walletName={activeWallet} walletAddress={addressText} />
      {showModal && <WalletModal onClose={() => setShowModal(false)} onConnected={walletName => onWalletSelected(walletName)} />}
    </>
  );
};



const connectWeb3 = async (connector: any) => {
  // if (provider) {
  //   await clean();
  // }
  const p = new providers.Web3Provider(connector);
  await p._ready();
  return p
}

  /**
   * Map of providers with initialisation code - c is the configuration object from currencyMap
   */
   const providerMap = {
    "MetaMask": async (c: any) => {
      if (!window?.ethereum?.isMetaMask) return;
      await window.ethereum.enable();
      const provider = await connectWeb3(window.ethereum);
      const chainId = `0x${c.chainId.toString(16)}`
      try { // additional logic for requesting a chain switch and conditional chain add.
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId }],
        })
      } catch (e: any) {
        if (e.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId, rpcUrls: c.rpcUrls, chainName: c.chainName
            }],
          });
        }
      }
      return provider;
    },
    "WalletConnect": async (c: any) => { return await connectWeb3(await (new WalletConnectProvider(c)).enable()) },
    "Phantom": async (c: any) => {
      if (window.solana.isPhantom) {
        await window.solana.connect();
        const p = new PhantomWalletAdapter()
        await p.connect()
        return p;
      }else{
        throw new Error("Phantom isn't loaded")
      }
    },
    "wallet.near.org": async (c: any) => {
      const near = await connect(c);
      const wallet = new WalletConnection(near, "bundlr");
      if (!wallet.isSignedIn()) {
        console.log({ status: "info", title: "You are being redirected to authorize this application..." })
        window.setTimeout(() => { wallet.requestSignIn() }, 4000)
        // wallet.requestSignIn();
      }
      else if (!await c.keyStore.getKey(wallet._networkId, wallet.getAccountId())) {
        console.log({ status: "warning", title: "Click 'Connect' to be redirected to authorize access key creation." })
      }
      return wallet
    }

  } as any

   const ethProviders = ["MetaMask", "WalletConnect"]

  const currencyMap = {
    "solana": {
      providers: ["Phantom"], opts: {}
    },
    "matic": {
      providers: ethProviders,
      opts: {
        chainId: 137,
        chainName: 'Polygon Mainnet',
        rpcUrls: ["https://polygon-rpc.com"],
      },
    },
    "arbitrum": {
      providers: ethProviders,
      opts: {
        chainName: "Arbitrum One",
        chainId: 42161,
        rpcUrls: ["https://arb1.arbitrum.io/rpc"]
      }
    },
    "bnb": {
      providers: ethProviders,
      opts: {
        chainName: "Binance Smart Chain",
        chainId: 56,
        rpcUrls: ["https://bsc-dataseed.binance.org/"]
      }
    },
    "avalanche": {
      providers: ethProviders,
      opts: {
        chainName: "Avalanche Network",
        chainId: 43114,
        rpcUrls: ["https://api.avax.network/ext/bc/C/rpc"]
      }
    },
    "boba": {
      providers: ethProviders,
      opts: {
        chainName: "BOBA L2",
        chainId: 288,
        rpcUrls: ["https://mainnet.boba.network"]
      }
    },
    "near": {
      providers: ["wallet.near.org"],
      opts: {
        networkId: "mainnet",
        keyStore: new keyStores.BrowserLocalStorageKeyStore(),
        nodeUrl: "https://rpc.mainnet.near.org",
        walletUrl: "https://wallet.mainnet.near.org",
        helperUrl: "https://helper.mainnet.near.org",
        explorerUrl: "https://explorer.mainnet.near.org",
      }
    }
  } as any

  const toProperCase = (s: string) => { return s.charAt(0).toUpperCase() + s.substring(1).toLowerCase() }



const WalletButton = (props) => {
  switch (props.walletName) {
    // case AR_CONNECT:
    //   return (<div className="walletButton" >
    //     <img src="ArConnect_Logo.png" alt="wallet icon" />
    //     <p>{props.walletAddress}</p>
    //   </div>)
    // case ARWEAVE_APP:
    //   return (<div className="walletButton altFill" >
    //     <img src="ArweaveApp_Logo.svg" alt="wallet icon" />
    //     <p>{props.walletAddress}</p>
    //   </div>)
    default:
      return (<div className="walletButton" onClick={props.onClick}>
        Select Wallet
      </div>)
  }
}

const WalletModal = (props) => {
  const {wallet, currency} = React.useContext(globalStateContext)
  console.log(currency)
  async function connectWallet(walletName) {
    switch (walletName) {
      case AR_CONNECT:
        await window.arweaveWallet.connect(['ACCESS_ADDRESS', 'SIGN_TRANSACTION']);
        break;
      case ARWEAVE_APP:
        await webWallet.connect();
        break;
      default:
        throw new Error(`Attempted to connect unknown wallet ${walletName}`);
    }
    props.onConnected(walletName);
    props.onClose();
  }

  return (
    <div className="modal" >
      <div className="scrim" onClick={() => props.onClose()} />
      <div className="container">
        <div className="popup">
          <h1 className="title">Connect Wallet</h1>
          <button className="closeButton" onClick={() => props.onClose()}>
            <svg width="14" height="14"><path d="M14 12.461 8.3 6.772l5.234-5.233L12.006 0 6.772 5.234 1.54 0 0 1.539l5.234 5.233L0 12.006l1.539 1.528L6.772 8.3l5.69 5.7L14 12.461z"></path></svg>
          </button>
          <label htmlFor="currencies">Select a currency:</label>
          <select className="currencySelector"> 
          {Object.keys(currencyMap).map((v) => {
              return (<option value={v} onClick={() => { console.log(v) }}>{toProperCase(v)}</option>) // proper/title case
            })
          }
          </select>
          <label htmlFor="provider">Select a currency:</label>
          {/* <select className="currencySelector"> 
          {Object.keys(providerMap).map((v) => {
              return ((currencyMap[currency] && currencyMap[currency].providers.indexOf(v) !== -1) ? (<MenuItem key={v} onClick={() => setSelection(v)}>{v}</MenuItem>) : undefined)
            })}
          </select> */}
        </div>
      </div>
    </div>
  )
}