'use client'
import Image from "next/image";
import { useSimulateContract, useWriteContract } from 'wagmi'
import { useState, useEffect, useRef, useCallback, useContext } from "react";
import { useAccount, useSignMessage, useVerifyMessage } from 'wagmi'
import Link from "next/link";
import './posts.css'
import { Posts, usersProfile } from "../interface";
import React from "react";
import TopLoader from "../toplpader";
import axios from "axios";
import Loader from "../loader";
import dynamic from "next/dynamic";
import { UserContext } from "@/app/userContext";

const PostBox = dynamic(()=>
  import('.//postBox').then((mod)=>mod.default)
  )
  

type scroll = {
  load: Boolean;
  tab:string;
}
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

export default function PostContainer({ load,tab }: scroll) {
  const account =useAccount();

  const [posts, setPosts] = useState<PostInfo[]>([]);
  const [fposts, setfPosts] = useState<PostInfo[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading,setLoading]=useState(false)
  const userContext = useContext(UserContext);
  if (!userContext) {
    throw new Error('UserContext is not provided');
  }
  const { userData } = userContext;



  useEffect(() => {
    const fetchPosts = async () => {
      try {
        let response;
        if(tab === 'For You'){
         response = await axios.get(`/api/posts/limit?page=${currentPage}`);
        }else if(tab === 'Following'){
        response = await axios.get(`/api/posts/limit?page=${currentPage}&who=${account.address}`);
        }
        //console.log(response.data.posts)
        if (response?.data.posts) {
          setTotalPages(response.data.metadata.totalPages);
          if (currentPage <= 1) {
            // setCurrentPage(currentPage+1);
            if(tab === 'For You'){
            setPosts(response.data.posts);
            setLoading(false)
          }
          setfPosts(response.data.posts);
          setLoading(false)
            
          } else {
            if(tab === 'For You'){
            setPosts((prevPosts) => [...prevPosts, ...response.data.posts]);
          }
          setfPosts((prevPosts) => [...prevPosts, ...response.data.posts]);
          }
        }
      } catch (error) {
        console.error('Error fetching posts:', error);
      }
    };

    fetchPosts();
  }, [currentPage,tab,account.address]);

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
  useEffect(() => {
    setCurrentPage(1);
    setPosts([]); // Clear posts to refresh the list
    setfPosts([]); // Clear posts to refresh the list
    setLoading(true)
  }, [tab]);

  if(loading) return<Loader/>;


  return (
   <> <div className="posts-body" >
      <TopLoader />

{ tab === 'For You' &&  <div className="post-cont">
        {posts.map((post: PostInfo, index) => (
          <PostBox key={index} post={post} />
        ))}
       {posts.length>0 && <p>already all catch up</p>}
      </div>}
{ tab === 'Following' && userData?.following_list.length>0 &&  <div className="post-cont">
        {fposts.map((post: PostInfo, index) => (
          <PostBox key={index} post={post} />
        ))}
         {posts.length>0 && <p>already all catch up</p>}
      </div>}
        {userData?.following_list.length==0&&<p>OOPs! Its Seems Like you are not following anyone.</p>}
    </div></>

  );
}
