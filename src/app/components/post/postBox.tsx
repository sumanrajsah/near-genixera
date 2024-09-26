'use client'
import Image from "next/image";
import { useState, useEffect, useRef, useCallback, useContext } from "react";
import Link from "next/link";
import './postBox.css'
import React from "react";
import ReactAudioPlayer from 'react-audio-player';
import ReactPlayer from 'react-player'
import axios from "axios";
import PostProfile from "./postProfile";
import '@fontsource/poppins';
import { useRouter } from "next/navigation";
import { Posts, usersProfile } from "../interface";
import { Comment, EthIcon, FollowIcon, HideIcon, Liked, Likes, LinkIcon, MediaIcon, MetaDataIcon, ReportIcon, Repost, Share, ViewIcon } from "../svg";
import { findUsernameInLikeList, findUsernameInRepostList, formatTime } from "./postFunction";
import { UserContext } from "@/app/userContext";
import TopLoader from "../toplpader";
import LazyLoad from 'react-lazy-load';
import ParentBox from "./parentBox";
import VideoFetcher from "../mediafetcher";
import MediaFetcher from "../mediafetcher";
import { verifiedFetch } from "@helia/verified-fetch";
import { useAccount } from "wagmi";
import { throttle } from "lodash";


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


export default function PostBox({ post }: { post: PostInfo }) {
  const router = useRouter();
  const [content, setContent] = useState('');
  const [lessContent, setLessContent] = useState('');
  const [fullContent, setFullContent] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [isContentLong, setIsContentLong] = useState(false);
  const [showPostDrop, setShowPostDrop] = useState(false)
  const [isLiked, setIsLiked] = useState(false);
  const [isRespoted, setIsReposted] = useState(false);
  const [postData, setPostData] = useState<Posts | null>();
  const [like, setLike] = useState(0);
  const [view, setview] = useState(0);
  const [repost, setRepost] = useState(0);
  const [reply, setReply] = useState(0);
  const [isFollow, setIsFollow] = useState(false);
  const [hide,setHide]=useState(false);
  const [zoomImg,setZoomImg]=useState(false);
  const [imgUrl,setImgUrl]=useState('')
  const [videoUrl,setVideoUrl]=useState('')
  const userContext = useContext(UserContext);
  const account =useAccount();
  const [postAnalysis,setAnalysis]=useState('')
  if (!userContext) {
    throw new Error('UserContext is not provided');
  }
  const { userData, setUserData } = userContext;

  const getCount = (count: number): string => {

    if (typeof count !== 'number') {
      console.error(`Invalid count value: ${count}`);
      return '0';
    }

    if (count > 999999) {
      return (count / 1000000).toFixed(1) + 'M'; // Use "M" notation for millions
    } else if (count > 999) {
      return (count / 1000).toFixed(1) + 'k'; // Use "k" notation for thousands
    } else {
      return count.toString(); // Otherwise, convert to string
    }
  };

  useEffect(() => {
    setPostData(post);
    setLike(post?.like_list? post.like_list.length : 0);
    setRepost(post?.repost_list? post.repost_list.length : 0);
    setReply(post?.reply_list? post.reply_list.length : 0);
    setview(post?.view? post.view.length : 0);
  if(userData){
    if (findUsernameInLikeList(userData.following_list, post?.author_username) === post?.author_username) {
      setIsFollow(true)
    }
  if(post.like_list){
    if (findUsernameInLikeList(post?.like_list, userData?.username) === userData.username) {
      setIsLiked(true)
    } else {
      setIsLiked(false)
    }
  }
  if(post.repost_list){
    if (findUsernameInRepostList(post?.repost_list, userData?.username) === userData.username) {
      setIsReposted(true)
    } else {
      setIsReposted(false)
    }}
  }
  }, [post, userData])

  const truncateString = (str: string, num: number) => {
    if (str.length > num) {
      return str.substring(0, num) + '...';
    }
    return str;
  };

  useEffect(() => {
    async function fetch(){
    if(post && post.content_url) {
    const ipfsUrl =post.content_url
    try{
    const response = await verifiedFetch(`ipfs://${ipfsUrl.split('/')[4]}`);
    const c = await response.json()
    setContent(truncateString(c.content, 200));
          setIsContentLong(c.content.length > 200);
          setLessContent(truncateString(c.content, 200));
          setFullContent(c.content);
    }catch(e){
      console.error(e)
    }
    }
  } fetch()
      
  }, [post.content_url,post.media_url,post])

  //like function
  const actionPost = throttle(async  (action: string) => {

    console.log(isLiked)
    let data;
    if (action === 'like') {
      if (isLiked) {
        data = { post_id: post._id, action: 'like', isLiked: true, username: userData.username };
        setIsLiked(false);
        setLike((prev) => prev - 1)
      }
      else {
        setIsLiked(true);
        setLike((prev) => prev + 1)
        data = { post_id: post._id, action: 'like', isLiked: false, username: userData.username };
      }
    }
    if (action === 'repost') {

      if (isRespoted) {
        setIsReposted(false)
        setRepost((prev) => prev - 1)
        data = { post_id: post._id, action: 'repost', isReposted: true, username: userData.username };
      }
      else {
        setIsReposted(true)
        setRepost((prev) => prev + 1)
        data = { post_id: post._id, action: 'repost', isResposted: false, username: userData.username };
      }
    }
    try {
      axios.post('/api/user/post/action', data)
        .then(response => {
          // console.log('Response:', response.data.success);

        })
        .catch(error => {
          console.error('Error:', error);
        });
      // const response = await Register({userhash, username, Email});
      // console.log(response);
    }
    catch (error) {
      console.log(error);
    }
  },2000)
  const displayText = formatTime(new Date(post.time as string | number));

  // console.log(displayText);


  // console.log(post.like_list)
  // console.log(displayText);

  function showPost() {
    const selection = window.getSelection();
    if ((selection && selection.toString()) || showPostDrop) {
      // Text is selected, do nothing
      return;
    }
window.location.href=`/posts/${post._id}`;
    // router.push(`/posts/${post._id}`);
  }

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Function to close the post dropdown when clicking outside of it
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowPostDrop(false);
      }
    }

    // Add event listener when component mounts
    document.addEventListener("mousedown", handleClickOutside);

    // Cleanup event listener when component unmounts
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        setIsInView(entry.isIntersecting);
      },
      {
        threshold: 0.8, // Adjust the threshold based on how much of the video must be in view
      }
    );

    if (videoRef.current) {
      observer.observe(videoRef.current);
    }
    const vcont = videoRef;
    // Clean up the observer when the component is unmounted
    return () => {
      if (vcont.current) {
        observer.unobserve(vcont.current);
      }
    };
  }, []); // Empty dependency array to ensure the effect runs only once

  useEffect(() => {
    const vcont = videoRef;
    if (vcont.current) {
      if (isInView) {
        vcont.current.play(); // Autoplay when in view
        // vcont.current.muted=false;
      } else {
        vcont.current.pause(); // Pause when out of view
        // videoRef.current.muted=true;
      }
    }
  }, [isInView]);

  const axiosSource = axios.CancelToken.source();

  const postRef = useRef(null);
  const [postInView, setPostInView] = useState(false);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        setPostInView(entry.isIntersecting);
      },
      {
        threshold: 1, // Adjust the threshold based on how much of the video must be in view
      }
    );

    const postElement = postRef.current; // Create a local variable

    if (postElement) {
      observer.observe(postElement);
    }

    // Clean up the observer when the component is unmounted
    return () => {
      if (postElement) {
        observer.unobserve(postElement);
      }
    };
  }, [postRef]); // Empty dependency array to ensure the effect runs only once

  const updateView = useCallback(() => {
    if(userData && post){
    if((findUsernameInLikeList(post?.view,userData.username) !== userData.username) && post?.author_username !== userData.username){
    const data = { post_id: post._id,username:userData.username };
    axios.put('/api/user/post/impression', data)
      .then(response => {
        // console.log('Response:', response.data.success);
      })
      .catch(error => {
        console.error('Error:', error);
      });}}
  }, [post,userData]);

  const fetchPostData = useCallback(async () => {
    try {
      axios.get(`/api/posts?id=${post._id}`, {
        cancelToken: axiosSource.token,
      })
        .then(response => {
          // console.log('Response:', response.data.success);
          if (response.data.success) {
            setPostData(response.data.foundPost);
            setLike(response.data.foundPost.like_list?.length);
            setview(response.data.foundPost.view.length);
          }
        })
        .catch(error => {
          console.error('Error:', error);
        });
    } catch (error) {
      console.log(error);
    }
    return () => {
      axiosSource.cancel('Operation canceled due to component unmount');
    };

  }, [post._id, axiosSource]);
  const viewTimeoutRef = useRef<number | null>(null);
  const hasUpdatedViewRef = useRef(false);

  const intervalIdRef = useRef<number |null>(null);

  useEffect(() => {
    if (postRef.current && postInView &&!hasUpdatedViewRef.current) {
      hasUpdatedViewRef.current = true;
      updateView();
  
      const timeout = window.setTimeout(() => {
        if (!intervalIdRef.current) {
          intervalIdRef.current = window.setInterval(() => {
            fetchPostData();
          }, 60000);
        }
      }, 2000); // 2 seconds delay
  
      viewTimeoutRef.current = timeout;
    } else {
      if (intervalIdRef.current!== null) {
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
      }
      if (viewTimeoutRef.current!== null) {
        clearTimeout(viewTimeoutRef.current);
        viewTimeoutRef.current = null;
      }
    }
    return () => {
      if (intervalIdRef.current!== null) {
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
      }
      if (viewTimeoutRef.current!== null) {
        clearTimeout(viewTimeoutRef.current);
        viewTimeoutRef.current = null;
      }
    };
  }, [postInView, axiosSource, fetchPostData, updateView]);

  const viewMedia = () => {
    window.open(`${process.env.NEXT_PUBLIC_API_IPFS_URL}/${(post.media_url).split('/')[4]}`, '_blank', 'noopener,noreferrer');
  }
  const viewMetadata = () => {
    window.open(`${process.env.NEXT_PUBLIC_API_IPFS_URL}/${(post.content_url).split('/')[4]}`, '_blank', 'noopener,noreferrer');
  }


  async function follow() {
    let data = { user: userData.username, to: post.author_username }
    try {

      axios.put('/api/user/follow', data)
        .then(response => {
          // console.log('Response:', response.data.success);
          if (response.data.success) {
            setIsFollow(!isFollow);
          }
        })
        .catch(error => {
          console.error('Error:', error);
        });
    }
    catch (e) { }
  }
  async function hideOrUnhide() {
    let data = { post_id:post._id }
    try {

      axios.put('/api/user/post/hide', data)
        .then(response => {
          // console.log('Response:', response.data.success);
          if (response.data.success) {
            setHide(!hide);
          }
        })
        .catch(error => {
          console.error('Error:', error);
        });
    }
    catch (e) { }
  }
useEffect(()=>{
function getHide(){
  if(userData?.username !== post?.author_username && post?.visibility === false){
setHide(true);
  }
}
getHide();
},[userData,post])

async function ShareModel(){
console.log('share')
}
const [MediaBlob, setMediaBlob] = useState<Blob | null>(null);


  return (
   <>
   { !(userData?.username !== post?.author_username && post?.visibility === false) &&<div className="post-box-cont" onClick={(e) => e.stopPropagation()} >
<TopLoader/>
{post.parent_post&&<ParentBox post={post.parent_post_data}/>}
      <div className="posts-box" style={{borderStyle:(post.parent_post)?'dashed':'',borderTop:(post.parent_post)?'none':'',borderTopLeftRadius:(post.parent_post)?'0px':'',borderTopRightRadius:(post.parent_post)?'0px':''}} onClick={() => setShowPostDrop(false)} ref={postRef}>
        <div className="post-body" onClick={showPost}>
      {post?.on_chain && <div className="on-chain-title">
        {post?.on_chain && (post.chain_data?.chain_id === "11155111" || "1") && <>This Post Live on <EthIcon/> Ethereum Network</>}
        {post?.on_chain && (post.chain_data?.chain_id ===  "137") && <>This Post Live on Polygon Network</>}
      </div> }
          <p>{postAnalysis}</p>
          {post?.user_data?.profile && <PostProfile author_img={post.user_data.profile.image_url} author_name={post.user_data.profile.name} author_username={post.user_data.profile.username} time={displayText} />}
          <div className="post-content">
            {content && (
              <pre className="para" >
                {(expanded ? fullContent : content).split(/(#[^\s#]+|\S+\.genx)/).map((part, index) => {
                  if (part.startsWith('#')) {
                    const hashtag = part.slice(1); // Remove the '#' symbol
                    return (
                      <Link key={index} href={`/hashtags/${hashtag}`} onClick={(e) => e.stopPropagation()}>
                        <span className="tagged">{part}</span>
                      </Link>
                    );
                  } else if (part.includes('.genx')) {
                    // Remove special characters at the beginning of the part string
                    const cleanedPart = part.replace(/^[^a-zA-Z0-9]+/, '');
                    
                    return (
                      <span key={index}>
                        <Link href={`/${cleanedPart}`} onClick={(e) => e.stopPropagation()} className="tagged">
                          {part}
                        </Link>
                      </span>
                    );
                  }
                   else {
                    return <span key={index}>{part}</span>;
                  }
                })}

                {isContentLong && !expanded && <h4 onClick={(e) => (setExpanded(true))}>show full content</h4>}
                {isContentLong && expanded && <h4 onClick={(e) => (setExpanded(false))}>show less</h4>}
              </pre>
            )}

          </div>
          <MediaFetcher cid={post.media_url.split('/')[4]} setMediaBlob={setMediaBlob} />
          {(post.post_type === 'image') && <div className="view-image" onClick={(e) => {e.stopPropagation(),setZoomImg(true)}}> {MediaBlob&& <Image loading="lazy" alt='genx' className="img" src={URL.createObjectURL(MediaBlob)} height={1000} width={1000} />} </div>}
          {(post.post_type === 'gif') && <div className="view-image" onClick={(e) => {e.stopPropagation(),setZoomImg(true)}}>  {MediaBlob&&<Image loading="lazy" alt='genx' className="img" src={URL.createObjectURL(MediaBlob)} height={1000} width={1000} unoptimized/>} </div>}
           {(post.post_type === 'video')&& <div className="view-video" onClick={(e) => e.stopPropagation()}>
            <video src={`${process.env.NEXT_PUBLIC_API_IPFS_URL}/${post.media_url.split('/')[4]}`} className="video-bg" height={1000} width={1000}  />
         
          {MediaBlob&& <video className="video" muted  autoPlay ref={videoRef} onClick={(e)=>{e.stopPropagation();const ve= e.target as HTMLVideoElement;{(ve.muted)?(ve.muted=false):('')}}} controls preload="true" >
              <source src={URL.createObjectURL(MediaBlob)} type="video/mp4"/>
              <source src={URL.createObjectURL(MediaBlob)} type="video/ogg"/>
              <source src={URL.createObjectURL(MediaBlob)} type="video/wmb"/>
              your browser not supported
            </video>}
            
          
           </div> }
           
          {(post.post_type === 'audio') && <ReactAudioPlayer className="audio-player" src={`${process.env.NEXT_PUBLIC_API_IPFS_URL}/${post.media_url.split('/')[4]}`} controls />}
        </div>

      </div>
          {zoomImg&&
          <div className="zoom-img-cont" onClick={(e) => setZoomImg(false)}>
            <button className="close-bt" onClick={(e)=>(setZoomImg(false))}><span>&times;</span> </button>
           {MediaBlob &&<Image src={URL.createObjectURL(MediaBlob)} height={1000} width={1000} className="zoom-img" alt={post.author_username} onClick={(e) => e.stopPropagation()} title={post.author_username}/>}
          </div>}
      <div className="action-bar">
        <div className="action-bar-svg" title="reply">
          <Link href={`?comment=true&to=${post.author_username}&id=${post._id}`} className="comment-svg"> <div className="comment-svg">
            <Comment />
            <p>{getCount(reply)}</p>
          </div> </Link>
        </div>
        <div className="action-bar-svg" title="repost">
          <div className={`repost-svg ${isRespoted ? 'reposted' : ''}`} onClick={() => actionPost('repost')}>
            <Repost />
            <p> {getCount(repost)}</p>
          </div>
        </div>
        <div className="action-bar-svg" title="like">
          {(isLiked) ? <div className="liked-svg" onClick={() => actionPost('like')}>
            <Liked />
            <p> {getCount(like)}</p>
          </div> : <div className="like-svg" onClick={() => actionPost('like')}>
            <Likes />
            <p> {getCount(like)}</p>
          </div>}

        </div>
        <div className="action-bar-svg" title="view">
          <div className="comment-svg">
            <ViewIcon />
            <p> {getCount(view)}</p>
          </div>
        </div>
        <div className="action-bar-svg" title="share" onClick={ShareModel}>
          <div className="share-svg">
            <Share />
          </div>
        </div>
      </div>
      <div className="post-dot" onClick={() => setShowPostDrop(!showPostDrop)}>
        <div></div>
        <div></div>
        <div></div>
      </div>

      {showPostDrop && <div className="post-dropdown" ref={dropdownRef}>
        <p onClick={viewMetadata}> <MetaDataIcon /> View Metadata</p>
        {post.media_url && <p onClick={viewMedia} > <MediaIcon /> View Media</p>}
        {post.on_chain && <Link className="pd-menu" target="_blank" href={`https://sepolia.etherscan.io/tx/${post.chain_data?.tx_hash}`}><LinkIcon/>chain tx</Link>}
        {post.parent_post && <Link className="pd-menu" target="_blank" href={`/posts/${post.parent_post}`}><LinkIcon/>Parent Post</Link>}
        {userData?.username !== post.author_username && <p onClick={follow}> <FollowIcon /> {isFollow ? 'Unfollow' : 'Follow'} {post.author_username}</p>}
        {userData?.username === post.author_username && <p onClick={hideOrUnhide}> <HideIcon /> {hide?'Unhide': 'Hide'} Post</p>}
        {userData?.username !== post.author_username && <p> <ReportIcon /> Report Post</p>}
      </div>}
    </div>}</>
  );
}