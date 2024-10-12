import type { Metadata } from "next";
import '@fontsource/poppins';
import "./globals.css";
import { Wagmi } from "./wagmi";
import { headers } from 'next/headers'
import { cookieToInitialState } from 'wagmi'
import { config } from './config'
import { RainbowKitProvider, Theme } from "@rainbow-me/rainbowkit";
import '@rainbow-me/rainbowkit/styles.css';
import { UserProvider } from "./userContext";
import Web3ModalProvider from "./wagmi2";
import initializeHelia from "./lib/helia";

const myCustomTheme: Theme = {
  blurs: {
    modalOverlay: '...',
  },
  colors: {
    accentColor: '...',
    accentColorForeground: '#D2BD00',
    actionButtonBorder: '#D2BD00',
    actionButtonBorderMobile: '#D2BD00',
    actionButtonSecondaryBackground: '...',
    closeButton: '#D2BD00',
    closeButtonBackground: '...',
    connectButtonBackground: '...',
    connectButtonBackgroundError: '...',
    connectButtonInnerBackground: '...',
    connectButtonText: '...',
    connectButtonTextError: '...',
    connectionIndicator: '#D2BD00',
    downloadBottomCardBackground: '...',
    downloadTopCardBackground: '...',
    error: '...',
    generalBorder: '#D2BD00',
    generalBorderDim: '#D2BD00',
    menuItemBackground: '#342F00',
    modalBackdrop: '#0E0C01',
    modalBackground: '#0E0C01',
    modalBorder: '#D2BD00',
    modalText: '#D2BD00',
    modalTextDim: '#D2BD00',
    modalTextSecondary: '#D2BD00',
    profileAction: '...',
    profileActionHover: '#342F00',
    profileForeground: '...',
    selectedOptionBorder: '#D2BD00',
    standby: '...',
  },
  fonts: {
    body: '...',
  },
  radii: {
    actionButton: '10px',
    connectButton: '...',
    menuButton: '10px',
    modal: '20px',
    modalMobile: '20px',
  },
  shadows: {
    connectButton: '#342F00',
    dialog: '#342F00',
    profileDetailsAction: '#342F00',
    selectedOption: '#342F00',
    selectedWallet: '#342F00',
    walletLogo: '#342F00',
  },
};

export const metadata: Metadata = {
  title: "GenX",
  description: "Future Application",
  openGraph:{
    title:"GenX",
    description: "Future Application",

  }
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookies = headers().get('cookie')

try{
}catch(e){}
  return (
    <html lang="en">
      <body >
        {/* <Wagmi >
          <RainbowKitProvider modalSize="compact" theme={myCustomTheme}>
            <UserProvider>
              {children}
            </UserProvider>
          </RainbowKitProvider>
        </Wagmi> */}
        <Web3ModalProvider cookies={cookies}>
        <UserProvider>
              {children}
            </UserProvider>
        </Web3ModalProvider>
      </body>
    </html>
  );
}
