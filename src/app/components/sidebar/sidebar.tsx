'use client'
import Image from "next/image";
import { useSimulateContract, useSwitchChain, useWriteContract } from 'wagmi'
import { useState, useEffect, useRef, useCallback, useContext } from "react";
import { useAccount, useSignMessage, useVerifyMessage } from 'wagmi'
import Link from "next/link";
import { Connect } from "./connect";
import TopLoader from "../toplpader";
import axios from "axios";
import { useRouter } from "next/navigation";
import './sidebar.css'
import { LogoutButton } from "./logout-button";
import ProfileBar from "./profileBar";
import { usersProfile } from "../interface";
import { useMediaQuery } from "react-responsive";
import { UserContext } from "@/app/userContext";
import Verify from "../verify";
import Loader from "../loader";

interface PathProps {
  currentPath: string;
}


export const SIdeBar: React.FC<PathProps> = ({ currentPath }) => {

  const [showSideBar, setShowSideBar] = useState(false)
  const account = useAccount();
  const[openSwitchChain,setOpenSwitchchain]=useState(false)
  const userContext = useContext(UserContext);
  if (!userContext) {
    throw new Error('UserContext is not provided');
  }
  const { userData, setUserData } = userContext;
  const a = '<';
  const { chains, switchChain } = useSwitchChain()

  function handleShowBar() {
    setShowSideBar(!showSideBar);
    var sideMenuBar = document.getElementsByClassName('side-menu-bar')[0];
    var sideMenu = document.getElementsByClassName('sbody')[0];
    if (sideMenuBar instanceof HTMLElement) {
      if (!showSideBar) {
        sideMenuBar.style.left = "0px";
        sideMenuBar.classList.add('show-sidebar');
        sideMenuBar.classList.remove('hide-sidebar');
        sideMenu.classList.add('show-sidebar-menu');
        sideMenu.classList.remove('hide-sidebar-menu');
      } else {
        sideMenuBar.style.left = "265px";
        sideMenuBar.classList.add('hide-sidebar');
        sideMenuBar.classList.remove('show-sidebar');
        sideMenu.classList.add('hide-sidebar-menu');
        sideMenu.classList.remove('show-sidebar-menu');
      }
    }
  }
  useEffect(() => {

async function handleRefresh() {
    if (!account.address) {
      return;
    }
    
    try {
      const response = await axios.get(`/api/profile?id=${account.address}`);
      if (response.data.profile) {
        setUserData(response.data.profile);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };
  
 
    handleRefresh();
  }, [account.address,setUserData]);

 
    if(account.isConnecting || account.isReconnecting){
      return<Loader/>
    }
  return (
    <>
   {(account.address === undefined )? <Verify/>:<>
      <div className="sbody" onClick={(e) => e.stopPropagation()} >
        <div className="sidebar-logo-cont">
          <Image className="sidebar-logo" src={'/gslogo.png'} alt="gensquare" width={1000} height={1000} />
        </div>


        <div className="menu">
          <Link href={'/home'} className={`menu-button ${currentPath === '/home' ? 'activeButton' : ''}`}>
            {(currentPath === '/home') && <Image src={'/home2.svg'} className="menu-svg" height={1000} width={1000} alt='upload image' />}
            {(currentPath !== '/home') && <Image src={'/home1.svg'} className="menu-svg" height={1000} width={1000} alt='upload image' />}
            <button className="menu-button">
              Home
            </button>
          </Link>
          <Link href={'/explore'} className={`menu-button ${currentPath === '/explore' ? 'activeButton' : ''}`}>
            {(currentPath === '/explore') && <Image src={'/explore2.svg'} className="menu-svg" height={1000} width={1000} alt='upload image' />}
            {(currentPath !== '/explore') && <Image src={'/explore1.svg'} className="menu-svg" height={1000} width={1000} alt='upload image' />}
            <button className="menu-button">
              Explore</button></Link>
          <Link href={'/notifications'} className={`menu-button ${currentPath === '/notifications' ? 'activeButton' : ''}`}>
            {(currentPath === '/notification') && <Image src={'/notification2.svg'} className="menu-svg" height={1000} width={1000} alt='upload image' />}
            {(currentPath !== '/notification') && <Image src={'/notification1.svg'} className="menu-svg" height={1000} width={1000} alt='upload image' />}
            <button className="menu-button">
              Notififcations</button></Link>
          <Link href={'/messages'} className={`menu-button ${currentPath === '/messages' ? 'activeButton' : ''}`}>
            {(currentPath === '/messages') && <Image src={'/messageIcon2.svg'} className="menu-svg" height={1000} width={1000} alt='upload image' />}
            {(currentPath !== '/messages') && <Image src={'/messageIcon1.svg'} className="menu-svg" height={1000} width={1000} alt='upload image' />}
            <button className="menu-button">
              Messages</button></Link>
          <Link href={'/marketplace'} className={`menu-button ${currentPath === '/marketplace' ? 'activeButton' : ''}`}>
            {(currentPath === '/marketplace') && <Image src={'/nft2.svg'} className="menu-svg" height={1000} width={1000} alt='upload image' />}
            {(currentPath !== '/marketplace') && <Image src={'/nft1.svg'} className="menu-svg" height={1000} width={1000} alt='upload image' />}
            <button className="menu-button">
              Marketplace</button></Link>
          <Link href={`/${userData?.username}`} className={`menu-button ${currentPath === '/profile' ? 'activeButton' : ''}`}>
            {(currentPath === '/profile') && <Image src={'/profile2.svg'} className="menu-svg" height={1000} width={1000} alt='upload image' />}
            {(currentPath !== '/profile') && <Image src={'/profile1.svg'} className="menu-svg" height={1000} width={1000} alt='upload image' />}
            <button className="menu-button">
              Profile</button></Link>
          <Link href={'/gen2'} className={`menu-button ${currentPath === '/gen2' ? 'activeButton' : ''}`}>
            {(currentPath === '/gen2') && <Image src={'/geslogo.svg'} className="menu-svg" height={1000} width={1000} alt='upload image' />}
            {(currentPath !== '/gen2') && <Image src={'/geslogo.svg'} className="menu-svg" height={1000} width={1000} alt='upload image' />}
            <button className="menu-button">
              GEN2</button></Link>
          <button className="more-button">
            <Image src={'/more.svg'} className="menu-svg" height={1000} width={1000} alt='upload image' />
            More</button>
        </div>
        <Link href={'?create=true'} > <button className="create-button">Create</button></Link>
        <div className="profilebar-cont" onClick={(e) => e.stopPropagation()}>
          <ProfileBar/>
        </div>
      </div>
      <div className="side-menu-bar" onClick={handleShowBar}>
        {(showSideBar) && <Image src={'/geslogo.svg'} className="side-bar-svg" height={1000} width={1000} alt='upload image' />}
        {(!showSideBar) && a}
      </div>
    </>}
    </>
  );
}
