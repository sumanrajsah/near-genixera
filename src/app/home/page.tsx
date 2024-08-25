'use client'
import Image from "next/image";
import styles from "./page.module.css";
import { useSimulateContract, useWriteContract } from 'wagmi'
import { useState,useEffect,useRef,useCallback, Suspense } from "react";
import { useAccount,useSignMessage,useVerifyMessage } from 'wagmi'
import Link from "next/link";
import { Connect } from "../components/sidebar/connect";
import TopLoader from "../components/toplpader";
import './home.css'

import PostContainer from '../components/post/all'
import CreateModal from "../components/create/create-modal";
import axios from "axios";
import ReplyModal from "../components/create/reply-modal";
import { Posts } from "../components/interface";
import { useInView } from 'react-intersection-observer';
import SearchBar from "../components/search/search";
import { LowerBar } from "../components/sidebar/lowerbar";
import PostBox from "../components/post/postBox";
import Verify from "../components/verify";
import { useRouter } from "next/navigation";
import dynamic from 'next/dynamic'


const SIdeBar = dynamic(() =>
  import('../components/sidebar/sidebar').then((mod) => mod.SIdeBar)
)

type tTab='For You'|'Following';

export default function Home() {

  const account = useAccount();
  const [load,setLoad]=useState(false);
  const [activeTab,setActiveTab]=useState<tTab>('Following')
  const router = useRouter();

  
  useEffect(() => {
    if(account.address){
    const mainElement = document.querySelector('.body-h');

    if (!mainElement) {
      console.error("Main element with class 'body-h' not found.");
      return;
    }
  
    const handleScroll = () => {

      var scrollTop = mainElement.scrollTop;
      if (
        scrollTop + mainElement.clientHeight+20 >= mainElement.scrollHeight
      ) {
        
        setLoad(true);
      }
    };
  
    mainElement.addEventListener('scroll', handleScroll);
  
    return () => {
      mainElement.removeEventListener('scroll', handleScroll);
      setLoad(false)
    };
  }
  }, [load,account]);
  
  

  
  return (
    <Suspense>
      <title>Home / GenX</title>
      <main className="body-h"  onClick={(e) => e.stopPropagation()}>
        <TopLoader/>
         <PostContainer load={load} tab={activeTab}/>

        <div className="top"  onClick={(e) => {e.stopPropagation()}}>
        <Image className="top-logo" src={'/gslogo.png'} alt="gensquare" width={1000} height={1000} onClick={()=>window.location.reload()}/>
        <div className="top-cont">
          <button className="top-button1" onClick={()=>setActiveTab('Following')} style={{background:activeTab === 'Following'?'#4d4828':''}}>
            Following
          </button>
          <button className="top-button2" onClick={()=>setActiveTab('For You')} style={{background:activeTab === 'For You'?'#4d4828':''}}>
            For You
          </button>
        </div>
        </div>
         <SIdeBar key="sidebar" currentPath={'/home'}/>
         <LowerBar key="lowerbar" currentPath={'/home'}/>
         <CreateModal/>
         <ReplyModal/>
         <SearchBar/>

    </main>
    </Suspense>
  );
}
