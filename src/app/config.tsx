
"use client"
import { http, createConfig, cookieStorage, createStorage } from 'wagmi'
import { mainnet, sepolia, polygon, polygonMumbai } from 'wagmi/chains'
import { injected, metaMask, safe, walletConnect } from 'wagmi/connectors'
import { getDefaultConfig } from '@rainbow-me/rainbowkit';

const projectId = process.env.NEXT_PUBLIC_ID;
let config:any;

if(projectId){
 config = getDefaultConfig({
    appName: 'My RainbowKit App',
    projectId: projectId,
    chains: [mainnet, sepolia],

    ssr: true,
    storage: createStorage({
        storage: cookieStorage,
    }),  
    transports: {
        [mainnet.id]: http(),
        [sepolia.id]: http(),
    },
})
}

export {config};