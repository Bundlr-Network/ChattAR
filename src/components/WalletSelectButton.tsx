import React from 'react';

import "./walletSelectButton.css";


import { currencyMap, providerMap, toProperCase } from './BundlrUtils';

import { WebBundlr } from '@bundlr-network/client/build/web';

import toast from "react-simple-toasts";


export const WalletSelectButton = (props) => {
  const [showModal, setShowModal] = React.useState(false);
  const [addressText, setAddressText] = React.useState("xxxxx...xxx");
  const [isConnected, setIsConnected] = React.useState(false)
  async function onBundlrInit(bundlr) {
    
    let address = bundlr.address
    if (address) {
      const firstFive = address.substring(0, 5);
      const lastFour = address.substring(address.length - 4);
      setAddressText(`${firstFive}..${lastFour}`);
    }
    setIsConnected(true)
    props.onBundlrInit(bundlr)
  }

  return (
    <>
      <WalletButton onClick={() => setShowModal(true)} walletAddress={addressText} isConnected={isConnected} />
      {showModal && <WalletModal onClose={() => setShowModal(false)} onBundlrInit={onBundlrInit} onDisconnect={props.onDisconnect} />}
    </>
  );
};






const WalletButton = (props) => {
  
  if(props.isConnected){
    return (<div className="walletButton" onClick={props.onClick}>
    {props.walletAddress}
  </div>)
  }else{
    return (<div className="walletButton" onClick={props.onClick}>
    Select Wallet
  </div>)
  }
  }


const WalletModal = (props) => {
  const [selectedCurrency, setSelectedCurrency] = React.useState<string>("")
  const [selectedProvider, setSelectedProvider] = React.useState<string>("")


   async function initProvider() {
    const p = providerMap[selectedProvider] // get provider entry
    const c = currencyMap[selectedCurrency]
    console.log(`loading: ${selectedProvider} for ${selectedCurrency}`)
    const providerInstance = await p(c.opts).catch((e: Error) => { toast(`Failed to load provider ${selectedProvider}`, { time: 10000 }); console.log(e); return; })

    const bundlr = new WebBundlr("https://node2.bundlr.network", selectedCurrency, providerInstance)
    try {
      // Check for valid bundlr node
      await bundlr.utils.getBundlerAddress(selectedCurrency)
    } catch {
      toast(`Failed to connect to node2.bundlr.network`, {time: 10000} )
      return;
    }
    try {
      await bundlr.ready();
    } catch (err) {
      console.log(err);
      toast(`Failed to load provider ${selectedProvider}`, { time: 10000 })
      return;
    } //@ts-ignore
    if (!bundlr.address) {
      console.log("address is missing post init");
    }
    toast(`Connected!`)
    props.onBundlrInit(bundlr)
    props.onClose()
  };


  return (
    <div className="modal" >
      <div className="scrim" onClick={() => props.onClose()} />
      <div className="container">
        <div className="popup">
          <h1 className="title">Connect Wallet</h1>
          <button className="closeButton" onClick={() => props.onClose()}>
            <svg width="14" height="14"><path d="M14 12.461 8.3 6.772l5.234-5.233L12.006 0 6.772 5.234 1.54 0 0 1.539l5.234 5.233L0 12.006l1.539 1.528L6.772 8.3l5.69 5.7L14 12.461z"></path></svg>
          </button>
          {/* <label htmlFor="currencies">Select a currency {state.currency}</label> */}
          <select className="currencySelector" onChange={(e) => setSelectedCurrency(e.target.value)}>
          <option className="option" value="">Select a Currency</option>
            {Object.keys(currencyMap).map((v) => {
              return (<option className="option" value={v}>{toProperCase(v)}</option>)
            })
            }
          </select>
          {selectedCurrency && (<>
            {/* <label htmlFor="provider">Select a provider:</label> */}
            <select className="currencySelector" onChange={(e) => setSelectedProvider(e.target.value)}>
            <option className="option" value="">Select a Provider</option>
              {Object.keys(providerMap).map((v) => {
                return ((currencyMap[selectedCurrency] && currencyMap[selectedCurrency].providers.indexOf(v) !== -1) ? (<option className="option" value={v} >{v}</option>) : undefined)
              })}
            </select>
            {selectedProvider && (
              <>
                <button className='connectButton' onClick={initProvider}>Connect</button>
              </>
            )}
          </>)}
        </div>
      </div>
    </div>
  )
}

