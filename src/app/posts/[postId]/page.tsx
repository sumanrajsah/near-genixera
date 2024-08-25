'use client'
import Image from "next/image";
import styles from "./page.module.css";
import { useSimulateContract, useWriteContract } from 'wagmi'
import { useState, useEffect } from "react";
import { useAccount, useSignMessage, useVerifyMessage } from 'wagmi'
import Link from "next/link";
import './style.css'
import axios from "axios";
import { Posts, usersProfile } from "@/app/components/interface"; // Example import for the Posts type
import TopLoader from "@/app/components/toplpader";
import { SIdeBar } from "@/app/components/sidebar/sidebar";
import ReplyModal from "@/app/components/create/reply-modal";
import { HomeIcon } from "@/app/components/svg";
import { useRouter } from "next/navigation";
import PostBox from "@/app/components/post/postBox";
import ReplyContainer from "@/app/components/post-info/fetch-post";
import Loader from "@/app/components/loader";

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



export default function Post({ params }: any) {

  const [posts, setPosts] = useState<PostInfo | null>(null);
  const [reply, setReply] = useState<PostInfo[]>([]);
  const [dataAvail,setDataAvail]=useState(false);
  

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`/api/posts?id=${params.postId}`);
        if (response.data.foundPost) {
          setPosts(response.data.foundPost[0]); // Store directly as JSON object
          setReply(response.data.foundPost[0]?.replied_posts); // Store directly as JSON object
          setDataAvail(true);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [params.postId]); // Include necessary dependencies
  const router = useRouter();
  function back() {
    router.back();
  }

  return (
    <>
   {dataAvail? <main className="body-s">
      <TopLoader />
      <div className="back-cont-post">
        <button className="back-button-post" onClick={back}><HomeIcon /> </button>
        <h3>Back</h3>
      </div>
        <div className="post-cont-s">
          {posts && <PostBox post={posts} />}
          <h3>Reply</h3>
          {(posts?.reply_list?.length ?? 0 > 0) ? <ReplyContainer posts={reply} /> : <p>no reply yet</p>}

        </div>
      <SIdeBar currentPath="/posts" />
      <ReplyModal />
    </main>:<Loader/>}
    </>
  );
}
