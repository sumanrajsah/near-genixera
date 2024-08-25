'use client'
import Image from "next/image";
import styles from "./page.module.css";
import { useSimulateContract, useWriteContract } from 'wagmi'
import { useState,useEffect, useCallback } from "react";
import { useAccount,useSignMessage,useVerifyMessage } from 'wagmi'
import Link from "next/link";
import { SIdeBar } from "@/app/components/sidebar/sidebar";
import './hash.css';
import CreateModal from "@/app/components/create/create-modal";
import axios from "axios";
import PostContainer from "@/app/components/post/all";
import PostBox from "@/app/components/post/postBox";
import { Posts, usersProfile } from "@/app/components/interface";
import ReplyModal from "@/app/components/create/reply-modal";
import { LowerBar } from "@/app/components/sidebar/lowerbar";
import TopLoader from "@/app/components/toplpader";
import { HomeIcon } from "@/app/components/svg";
import { useRouter } from "next/navigation";


interface PostInfo{
  _id:any;
  author_address:string;
  author_username:string;
  content_url:string;
  post_type:string;
  time:Number;
  media_url:string;
  on_chain:Boolean;
  parent_post:string;
  view:[];
  repost_list:[];
  reply_list:[];
  like_list:[];
  tags:[];
  visibility:boolean;
  user_data:{profile:usersProfile};
  parent_post_data:PostInfo;
  chain_data:{
    chain_id:string;
    tx_hash:string
  }
}

export default function HashTags({params}:any) {
    const [posts, setPosts] = useState<PostInfo[]>([]);
    const account = useAccount();
    const [load,setLoad]=useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
  
    
    useEffect(() => {
      if(account.address){
      const mainElement = document.querySelector('.hashtagsbody');
  
      if (!mainElement) {
        console.error("Main element with class 'hashtagsbody' not found.");
        return;
      }
    
      const handleScroll = () => {
  
        var scrollTop = mainElement.scrollTop;
        if (
          scrollTop + mainElement.clientHeight+5 >= mainElement.scrollHeight
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

    useEffect(() => {
        const fetchData = async () => {
          try {
            const response = await axios.get(`/api/hashtags?tag=${params.tags}&page=${currentPage}&limit=5`);
            // console.log('Response:', response.data.AllPost);
            if (response.data.success) {
              setTotalPages(response.data.totalPages);
              if (currentPage <= 1) {
                // setCurrentPage(currentPage+1);
                setPosts(response.data.post); // Append new posts
                // setTotalPosts(response.data.metadata.totalCount);
                // console.log(posts,currentPage,totalPosts);
                
              } else {
                setPosts((prevPost) => [...prevPost, ...response.data.post]);
              }
            }
          } catch (error) {
            console.error('Error:', error);
          }
        };
      
        // Fetch data initially
        fetchData();
      }, [params,currentPage]);

      const moreData = useCallback(() => {
        if (currentPage < totalPages) {
          setCurrentPage((prev) => prev + 1);
        }
      }, [currentPage, totalPages]);
    
      useEffect(() => {
        if (load) {
          moreData();
        }
      }, [load, moreData]);
      const router =useRouter();
      function back(){
        router.back();
      }

      const title= `GenX / ${params.tags}`

  return (
      <main className="hashtagsbody" >
        <title>{title}</title>
               <div className="back-cont-t">
          <button className="back-button-t" name='icon' onClick={back}><HomeIcon/> </button>
          <h3>Back</h3>
        </div>
        <div className="hash-posts-cont">
        {posts.map((post:PostInfo,index) => (
          <PostBox key={index} post={post}/>
        ))}</div>
        <SIdeBar currentPath="/hashtags"/>
        <LowerBar currentPath="/hashtags"/>
        <ReplyModal/>
        <CreateModal/>
        <TopLoader/>
    </main>
  );
}
