'use client'
import Image from "next/image";
import styles from "./page.module.css";
import { useSimulateContract, useWriteContract } from 'wagmi'
import { useState,useEffect, Suspense } from "react";
import { useAccount,useSignMessage,useVerifyMessage } from 'wagmi'
import Link from "next/link";
import { Connect } from "../components/sidebar/connect";
import TopLoader from "../components/toplpader";

import PostContainer from '../components/post/all'
import CreateModal from "../components/create/create-modal";
import ReplyModal from "../components/create/reply-modal";
import SearchBar from "../components/search/search";
import TagList from "../components/explore/tags/tag";
import './style.css'
import { LowerBar } from "../components/sidebar/lowerbar";
import { ExploreIcon1 } from "../components/svg";
import dynamic from "next/dynamic";
import axios from "axios";
import { useRouter } from "next/navigation";


const SIdeBar = dynamic(() =>
  import('../components/sidebar/sidebar').then((mod) => mod.SIdeBar)
)
export default function Explore() {
 
  const router=useRouter();

  return (
    <Suspense>
      <title>Explore / GenX</title>
      <main className="body" >
      <div className="tag-head">
          <p>#Tags</p>
        </div>
        <TagList/>
        <div className="e-search-cont">
          <input placeholder="search #genx or alphab.genx" type="text" onClick={()=>router.push('./search')} />
          <div className="search-svg"  onClick={()=>router.push('./search')}>
            <ExploreIcon1/>
          </div>
        </div>
        <SIdeBar currentPath="/explore"/>
        <LowerBar currentPath="/explore"/>
        <TopLoader/>
        <CreateModal/>
        <ReplyModal/>
    </main>
    </Suspense>
  );
}
