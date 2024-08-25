'use client'
import Image from "next/image";
import styles from "./page.module.css";
import { useSimulateContract, useWriteContract } from 'wagmi'
import { useState,useEffect, Suspense } from "react";
import { useAccount,useSignMessage,useVerifyMessage } from 'wagmi'
import Link from "next/link";
import axios from "axios";
import './style.css'
import Loader from "../../loader";

interface tag{
    _id:string;
    count:number;
}

export default function TagList() {

    const [tags,setTags]=useState<tag[]>([]);
    const [loading,setLoading]=useState(true)

    const fetchTags = async () => {
    
        try {
          const response = await axios.get(`/api/hashtags`);
          if (response.data.AllTags) {
            setLoading(false)
            setTags(response.data.AllTags);
            }
          } 
         catch (error) {
          console.error('Error fetching posts:', error);
        }
    }
    useEffect(()=>{
        fetchTags();
      },[])

  return (
<div className="tag-cont">
    {!loading?<Suspense>
    {tags.map((tag,index)=>(
<Link href={`/hashtags/${tag._id.replace(/#/g,'')}`} className="tag-box" key={index}>
    <p className="tag-id">{tag._id}</p>
    <p className="tag-count">{tag.count} posts</p>
</Link>
    ))}
    </Suspense>:<Loader/>}
</div>
  );
}
