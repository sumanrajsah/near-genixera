"use client"
import * as React from 'react'
import '@rainbow-me/rainbowkit/styles.css';
import { Connector, useAccount, useConnect } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit';
import "./connect.css";
import { useWalletInfo, useWeb3Modal } from '@web3modal/wagmi/react'
import Image from 'next/image';
import { WalletIcon } from '../svg';

export const Connect = () => {
    const account = useAccount()
    // const {walletInfo}=useWalletInfo()

    // const {open,close}=useWeb3Modal()
    return (
        <ConnectButton.Custom>
            {({
                account,
                chain,
                openAccountModal,
                openChainModal,
                openConnectModal,
                authenticationStatus,
                mounted,
            }) => {
                // Note: If your app doesn't use authentication, you
                // can remove all 'authenticationStatus' checks
                const ready = mounted && authenticationStatus !== 'loading';
                const connected =
                    ready &&
                    account &&
                    chain &&
                    (!authenticationStatus ||
                        authenticationStatus === 'authenticated');

                return (
                    <div
                        {...(!ready && {
                            'aria-hidden': true,
                            'style': {
                                opacity: 0,
                                pointerEvents: 'none',
                                userSelect: 'none',
                            },
                        })}
                    >
                        {(() => {
                            if (!connected) {
                                return (
                                    <button onClick={openConnectModal} type="button" className='connect-button'>
                                      <WalletIcon/>  Connect / LogIn 
                                    </button>
                                );
                            }

                            if (chain.unsupported) {
                                return (
                                    <button onClick={openChainModal} type="button">
                                        Wrong network
                                    </button>
                                );
                            }

                            return (
                                <div style={{ display: 'flex', gap: 12 }}>
                                    <button
                                        onClick={openChainModal}
                                        style={{ display: 'flex', alignItems: 'center' }}
                                        type="button"
                                        className='chain-button'
                                    >
                                        {chain.hasIcon && (
                                            <div
                                                style={{
                                                    background: chain.iconBackground,
                                                    width: 25,
                                                    height: 25,
                                                    borderRadius: 999,
                                                    overflow: 'hidden',
                                                    marginRight: 4,
                                                }}
                                            >
                                                {chain.iconUrl && (
                                                    <Image height={100} width={100}
                                                        alt={chain.name ?? 'Chain icon'}
                                                        src={chain.iconUrl}
                                                        style={{ width: 25, height: 25 }}
                                                    />
                                                )}
                                            </div>
                                        )}
                                        {chain.name}
                                    </button>

                                    <button onClick={openAccountModal} type="button" className='chain-button'>
                                        {account.displayName}
                                        {account.displayBalance
                                            ? ` (${account.displayBalance})`
                                            : ''}
                                    </button>
                                </div>
                            );
                        })()}
                    </div>
                );
            }}
        </ConnectButton.Custom>
        // <w3m-connect-button/>
      //   <>
        
      // {!(account.isConnected)&&  <button onClick={(e)=>{open({view:'Connect'})}} className='connect-button'> <WalletIcon/>Connect / LogIn </button>}
      // {(account.isConnected)&&  <button onClick={(e)=>{open({view:'Account'})}} className='account-button'>{(account.address)?.slice(0,5)+'...'+(account.address)?.slice(-5)}</button>}
      
      //   </>
    );
};
