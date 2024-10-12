'use client'
import Image from "next/image";
import styles from "./page.module.css";
import { useSimulateContract, useWriteContract, useSwitchChain } from 'wagmi'
import { watchAccount } from '@wagmi/core'
import { useState, useEffect, useContext, useRef } from "react";
import { useAccount, useSignMessage, useVerifyMessage } from 'wagmi'
import Link from "next/link";
import { Connect } from "./connect";
import TopLoader from "../toplpader";
import { SIdeBar } from "./sidebar";
import './sidebar.css'
import axios from 'axios';
import { LogoutButton } from "./logout-button";
import { usersProfile } from "../interface";
import { Audio, Oval } from 'react-loader-spinner'
import { UserContext } from "@/app/userContext";
import { AccountSettingIcon, BlockIcon } from "../svg";
import { useChainModal } from "@rainbow-me/rainbowkit";
import MediaFetcher from "../mediafetcher";
import { useAppKit } from '@reown/appkit/react';


export default function ProfileBar() {

  const [logoutMessage, setLogoutMessage] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [profileData, setProfileData] = useState<usersProfile | null>(null)
  const userContext = useContext(UserContext);
  if (!userContext) {
    throw new Error('useContext must be used within a UserProvider');
  }
  const { userData } = userContext;
  const profileBarRef = useRef<HTMLDivElement>(null);

  const handleLogout = (message: string) => {
    setLogoutMessage(message);
  };

  const { chains, switchChain } = useSwitchChain()
  const { open, close } = useAppKit()

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileBarRef.current && !profileBarRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  const { openChainModal } = useChainModal();
  const [MediaBlob, setMediaBlob] = useState<Blob | null>(null);
  return (
    <>
    <div className="profilebar-body"  ref={profileBarRef}>
      <div className="profileBar" onClick={() => setShowDropdown(!showDropdown)} >
        <div className="profile-image">
        {userData&& <MediaFetcher cid={(userData.image_url).split('/')[4]} setMediaBlob={setMediaBlob} />}
          {userData  ? <>{MediaBlob?<Image height={50} width={50} src={URL.createObjectURL(MediaBlob)} alt="Profile" />:<Image height={40} width={40} src={'/profile2.svg'} alt="genx"/>} </>: <Oval
            visible={true}
            height="20"
            width="20"
            color="#D2BD00"
            ariaLabel="oval-loading"
            wrapperStyle={{}}
            wrapperClass=""
            strokeWidth={10}
          />}
        </div>
        <h3>{userData?.username}</h3>
        <div className="dots" onClick={() => setShowDropdown(!showDropdown)}>
          <div></div>
          <div></div>
          <div></div>
        </div>
      </div>
      {showDropdown && <div className="profile-dropdown" onClick={(e) => e.stopPropagation()}>
        {/* <p className="settings">Account Setting</p> */}
        <button className="logout-button" onClick={(e)=>open({view:'Networks'})}> <BlockIcon/> Switch Chain</button>
        <button className="logout-button" > <AccountSettingIcon/> Account Setting</button>
        <LogoutButton onLogout={handleLogout} />
        <h3 className="logout-m" hidden={!logoutMessage}>{logoutMessage}</h3>
      </div>}
      
    </div>
    
    </>
  );
}
