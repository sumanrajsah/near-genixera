'use client'
import Image from "next/image";
import { useSimulateContract, useWriteContract } from 'wagmi'
import { useState, useEffect, useRef, useCallback, useContext } from "react";
import { useAccount, useSignMessage, useVerifyMessage } from 'wagmi'
import Link from "next/link";
import { Connect } from "./connect";
import TopLoader from "../toplpader";
import axios from "axios";
import { useRouter } from "next/navigation";
import './lowerbar.css'
import './sidebar.css'
import ProfileBar from "./profileBar";
import { CreateIcon, ExploreIcon1, ExploreIcon2, HomeIcon1, HomeIcon2, MoreIcon2, NFTIcon1, NFTIcon2 } from "../svg";
import { usersProfile } from "../interface";
import { useMediaQuery } from 'react-responsive';
import { UserContext } from "@/app/userContext";

interface PathProps {
  currentPath: string;
}


export const LowerBar: React.FC<PathProps> = ({ currentPath }) => {
  const isMobile = useMediaQuery({ query: '(max-width: 700px)' });
  const account = useAccount()
  const router = useRouter();
  const [hasLoggedOut, setLogout] = useState(false);
  const userContext = useContext(UserContext);
  if (!userContext) {
    throw new Error('UserContext is not provided');
  }
  const { userData, setUserData } = userContext;


  const [isSidebarVisible, setIsSidebarVisible] = useState(false);

  // This function will toggle the visibility of the sidebar
  const handleShowSidebar = () => {
    const sidebar = document.querySelector('.lsidebar') as HTMLElement | null;

    if (sidebar) {
      // Toggle the sidebar's visibility
      sidebar.style.display = isSidebarVisible ? 'none' : 'block';
      setIsSidebarVisible(!isSidebarVisible); // Update the state to reflect the new visibility status
    } else {
      console.error('Sidebar not found');
    }
  };

  const showSide = useRef<HTMLDivElement>(null);


  // Function to close the post dropdown when clicking outside of it
  function handleClickOut(event: MouseEvent) {
    if (showSide.current && !showSide.current.contains(event.target as Node)) {
      setIsSidebarVisible(false);
    }
  }
  useEffect(() => {
    // Add event listener when component mounts
    document.addEventListener("mousedown", handleClickOut);

    // Cleanup event listener when component unmounts
    return () => {
      document.removeEventListener("mousedown", handleClickOut);
    };
  }, []);

  useEffect(() => {
    if(!isMobile) return;
    console.log('hello')
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
  }, [account.address,isMobile,setUserData]);

  const handleClick = () => {
    router.push(`/${userData?.username}`)
  };

  return (
    <>
      <div className="lsidebar" style={{ left: isSidebarVisible ? '0px' : '-1000px' }}>
        <div className="lprofile-cont" onClick={handleShowSidebar} >
          <ProfileBar />
        </div>
        <br />

        <div className="menu" onClick={(e) => e.stopPropagation()}>
          <div className={`menu-button ${currentPath === '/profile' ? 'activeButton' : ''}`} onClick={handleClick}>
            {(currentPath === '/profile') && <Image src={'/profile2.svg'} className="menu-svg" height={1000} width={1000} alt='upload image' />}
            {(currentPath !== '/profile') && <Image src={'/profile1.svg'} className="menu-svg" height={1000} width={1000} alt='upload image' />}
            <button className="menu-button">
              Profile</button></div>
          <Link href={'/profile'} className={`menu-button ${currentPath === '/profile' ? 'activeButton' : ''}`}>
            {(currentPath === '/profile') && <Image src={'/profile2.svg'} className="menu-svg" height={1000} width={1000} alt='upload image' />}
            {(currentPath !== '/profile') && <Image src={'/profile1.svg'} className="menu-svg" height={1000} width={1000} alt='upload image' />}
            <button className="menu-button">
              GEN2</button></Link>
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
        </div>
      </div>


      <div className="lbody" >


        <div className="lmenu" ref={showSide}>
          <Link href={'/home'} className={`lmenu-button ${currentPath === '/home' ? 'lactiveButton' : ''}`}>
            {(currentPath === '/home') && <HomeIcon2 />}
            {(currentPath !== '/home') && <HomeIcon1 />}
          </Link>

          <Link href={'/explore'} className={`lmenu-button ${currentPath === '/explore' ? 'lactiveButton' : ''}`}>
            {(currentPath === '/explore') && <ExploreIcon2 />}
            {(currentPath !== '/explore') && <ExploreIcon1 />}
          </Link>

          <Link href={'?create=true'} > <button className="lcreate-button">
            <CreateIcon />
          </button></Link>

          <Link href={'/marketplace'} className="lmenu-button">
            {(currentPath === '/marketplace') && <NFTIcon2 />}
            {(currentPath !== '/marketplace') && <NFTIcon1 />}
          </Link>
          <button className="lmore-button" onClick={handleShowSidebar}>
            <MoreIcon2 />
          </button>
        </div>
      </div>


    </>
  );
}
