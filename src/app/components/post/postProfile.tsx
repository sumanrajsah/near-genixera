'use client'
import Image from "next/image";
import styles from "./page.module.css";
import { useSimulateContract, useWriteContract } from 'wagmi'
import { useState,useEffect, useContext } from "react";
import { useAccount,useSignMessage,useVerifyMessage } from 'wagmi'
import Link from "next/link";
import axios from 'axios';
import { usersProfile } from "../interface";
import { useRouter } from "next/navigation";
import './posts.css';
import { UserContext } from "@/app/userContext";
import MediaFetcher from "../mediafetcher";




export default function PostProfile({author_name,author_username,author_img,time}:{author_name:string,author_username:string,author_img:string,time:string}) {

    const [message, setMessage] = useState<usersProfile | null>(null);
    const router = useRouter();
    const account = useAccount();


    function showProfile(){
    
      router.push(`/${author_username}`);
      }
      const truncate = (str:string, num:any) => {
        if (str.length > num) {
          return str.slice(0, num) + '...';
        }
        return str;
      };
      const [PostMediaBlob, setPostMediaBlob] = useState<Blob | null>(null);
  return (
      <div className="postProfile" >
        <MediaFetcher cid={author_img.split('/')[4]} setMediaBlob={setPostMediaBlob} />
       <Link href={`/${author_username}`} className="postp-image" onClick={(e) => {e.stopPropagation();showProfile()}}>
       {author_img && PostMediaBlob? <Image className="postp-img" src={URL.createObjectURL(PostMediaBlob)}alt={author_username} height={1000} width={1000}/>:
        <Image className="postp-img" style={{border:'2px solid #D2BD00',borderRadius:'100%'}} src={'/profile2.svg'} alt='GenX' height={1000} width={1000}/>}
        </Link>
        <Link href={`/${author_username}`} className="nu-cont">
 <p className="name" onClick={(e) => {e.stopPropagation();showProfile()}}>{author_name? truncate(author_name, 20) : ''}</p>
 <p className="username" onClick={(e) => {e.stopPropagation();showProfile()}}>   {author_username? truncate(author_username, 20) : ''}</p>
   </Link>
        <p className="time">~{time? time : ''}</p>
    </div>
  );
}
