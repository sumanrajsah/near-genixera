import { cookieStorage, createStorage, http } from '@wagmi/core'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import {  polygonAmoy, sepolia, auroraTestnet, mainnet } from '@reown/appkit/networks'

// Get projectId from https://cloud.walletconnect.com
export const projectId = process.env.NEXT_PUBLIC_ID

if (!projectId) throw new Error('Project ID is not defined')
 
  
  export const networks = [polygonAmoy,sepolia,auroraTestnet,mainnet]

//Set up the Wagmi Adapter (Config)
export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage
  }),
  ssr: true,
  projectId,
  networks
})

export const config = wagmiAdapter.wagmiConfig