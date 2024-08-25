'use client'
import Image from "next/image";
import { useSimulateContract, useWriteContract } from 'wagmi'
import { useState,useEffect } from "react";
import { useAccount,useSignMessage,useVerifyMessage } from 'wagmi'
import Link from "next/link";
import './reply.css'
import { Posts as PostType, Posts, usersProfile } from "../interface";
import React from "react";
import TopLoader from "../toplpader";
import axios from "axios";
import PostBox from "../post/postBox";

interface PostInfo{
  _id:any;
  author_address:string;
  author_username:string;
  content_url:string;
  post_type:string;
  time:Number;
  media_url:string;
  on_chain:Boolean;
  view:[];
parent_post:string;
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


export default function ReplyContainer({ posts}:{posts:PostInfo[]}) {

  // const [posts, setPosts] = useState<Posts[] | null>([]);
  // const [ids, setIds] = useState(Ids); // Replace with your array of IDs

  // useEffect(() => {
  //   const fetchPosts = async () => {
  //     try {
  //       const responses = await Promise.all(
  //         ids.map(id => axios.get(`/api/posts?id=${id}`))
  //       );
        
  //       const foundPosts = responses
  //         .map(response => response.data.foundPost)
  //         .filter(post => post); // Filter out any null or undefined posts

  //       setPosts(foundPosts);
  //     } catch (error) {
  //       console.error('Error fetching data:', error);
  //     }
  //   };

  //   fetchPosts();
  // }, [ids]);
// console.log(posts);
  return (
      <div className="posts-body-r" >
         <TopLoader/>
         <div className="post-cont-r">
         {posts?.map((post, index) => (
          <PostBox key={index} post={post} />
        ))}
        <h1 className="tagged-r">.</h1>
         </div>
    </div>
  );
}
