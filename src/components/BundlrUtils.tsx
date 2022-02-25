import WalletConnectProvider from "@walletconnect/web3-provider";
import { providers } from "ethers"
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom"
import * as nearAPI from "near-api-js"
import { WalletConnection } from "near-api-js";
const { keyStores, connect } = nearAPI;


declare var window: any



export const connectWeb3 = async (connector: any) => {

    const p = new providers.Web3Provider(connector);
    await p._ready();
    return p
}
  
    /**
     * Map of providers with initialisation code - c is the configuration object from currencyMap
     */
     export const providerMap = {
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
  
    export const currencyMap = {
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
  
    export const toProperCase = (s: string) => { return s.charAt(0).toUpperCase() + s.substring(1).toLowerCase() }