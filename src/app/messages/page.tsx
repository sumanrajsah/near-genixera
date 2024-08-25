'use client'
import Image from "next/image";
import styles from "./page.module.css";
import { useSimulateContract, useWriteContract } from 'wagmi'
import { useState,useEffect,useRef,useCallback, Suspense } from "react";
import { useAccount,useSignMessage,useVerifyMessage } from 'wagmi'
import Link from "next/link";
import { Connect } from "../components/sidebar/connect";
import TopLoader from "../components/toplpader";
import {SIdeBar} from "../components/sidebar/sidebar";
import PostContainer from '../components/post/all'
import CreateModal from "../components/create/create-modal";
import axios from "axios";
import ReplyModal from "../components/create/reply-modal";
import { Posts } from "../components/interface";
import { useInView } from 'react-intersection-observer';
import SearchBar from "../components/search/search";
import { LowerBar } from "../components/sidebar/lowerbar";
import './style.css'


export default function Messages() {


  
  return (
    <Suspense>
      <main className="body-m"  >
        Messages
        <TopLoader/>
         <SIdeBar currentPath={'/messages'}/>
         <LowerBar currentPath={'/messages'}/>
         <SearchBar/>
         <CreateModal/>
         <ReplyModal/>

    </main>
    </Suspense>
  );
}
