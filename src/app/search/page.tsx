'use client'
import React, { useCallback, useContext } from "react";
import Image from "next/image";
import { useSimulateContract, useWriteContract } from 'wagmi'
import { useState, useEffect, Suspense } from "react";
import { useAccount, useSignMessage, useVerifyMessage } from 'wagmi'
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
import { ExploreIcon1, HomeIcon } from "../components/svg";
import { useRouter } from "next/navigation";
import axios from "axios";
import dynamic from "next/dynamic";
import { usersProfile } from "../components/interface";
import { UserContext } from "../userContext";
import { findUsernameInLikeList } from "../components/post/postFunction";
import PostBox from "../components/post/postBox";
import MediaFetcher from "../components/mediafetcher";

type user = {
  name: string;
  _id: string;
  image_url: string;
  bio: string
}
interface PostInfo {
  _id: any;
  author_address: string;
  author_username: string;
  content_url: string;
  post_type: string;
  time: Number;
  media_url: string;
  on_chain: Boolean;
  parent_post: string;
  view: [];
  repost_list: [];
  reply_list: [];
  like_list: [];
  tags: [];
  visibility: boolean;
  user_data: { profile: usersProfile };
  parent_post_data:PostInfo;
  chain_data:{
    chain_id:string;
    tx_hash:string
  }

}
type tags = {
  _id: string;
  count: number
}

const SIdeBar = dynamic(() =>
  import('../components/sidebar/sidebar').then((mod) => mod.SIdeBar)
)

type Tab = 'Posts' | 'People' | 'Tags';

export default function Search() {

  const [query, setQuery] = useState('');
  const [user, setSearchUsers] = useState<user[]>([]);
  const [post, setPost] = useState<PostInfo[]>([])
  const [tags, setTags] = useState<tags[]>([])
  const [activeTab, setActiveTab] = useState<Tab>('Posts');
  const router = useRouter();

  const userContext = useContext(UserContext);
  if (!userContext) {
    throw new Error('UserContext is not provided');
  }
  const { userData, setUserData } = userContext;

  useEffect(() => {
    const inputElement = document.getElementById('search-input');
    if (inputElement) {
      inputElement.focus();
    }
  }, []);




  async function search(query: string) {
    try {
      const response = await axios.get(`/api/search?type=${activeTab}&query=${query}`)

      // console.log('Response:', response.data.success);
      if (response.data.success) {
        if (activeTab === 'People') setSearchUsers(response.data.users);
        else if (activeTab === 'Tags') setTags(response.data.tags);
        else if (activeTab === 'Posts') setPost(response.data.post);
      }


    }
    catch (error) {
      console.log(error);
    }
  }

  const handleInputChange = (e: any) => {
    setQuery(e.target.value);
    if (e.target.value) {
      search(e.target.value);
    } else {
      setSearchUsers([])
    }
  }
  async function seeProfile(username: any) {
    router.push(`/${username}`);
  }
  const handleTabClick = (tab: Tab) => {
    setActiveTab(tab);
    search(query);
  };

  async function follow(to: string) {
    let data = { user: userData.username, to: to }
    try {

      axios.put('/api/user/follow', data)
        .then(response => {
          // console.log('Response:', response.data.success);
          if (response.data.success) {
            console.log(response.data.userData.profile);
            setUserData(response.data.userData.profile);
          }
        })
        .catch(error => {
          console.error('Error:', error);
        });
    }
    catch (e) { }
  }

  const handleKeyPress = (event: any) => {
    if (event.key === 'Enter' || event.code === 'Enter' || event.keyCode === 13) {
      search(query);
    }
  };
  const searchCallback = useCallback(search, [activeTab]);

  useEffect(() => {
    if (query.length > 0) {
      searchCallback(query);
    }
  }, [query, activeTab, searchCallback]);
  const [MediaBlob, setMediaBlob] = useState<Blob | null>(null);

  return (
    <Suspense>
      <title>Search / GenX</title>
      <main className="body" >

        <div className="search-b">
          {activeTab === 'People' && (
            <div className="s-result-cont">

              {user.map((result, index) => (
                <div className="sp-cont" key={index} onClick={(e) => seeProfile(result?._id)}>
                  <div className="s-result-box">
                    <div className="s-result-img-cont">
                      {result && <MediaFetcher cid={(result?.image_url).split('/')[4]} setMediaBlob={setMediaBlob} />}
                      {result.image_url && MediaBlob ? <Image className="s-result-img" src={URL.createObjectURL(MediaBlob)} height={200} width={200} alt={result?._id} />
                        : <Image className="s-result-img" src={'/gslogo.png'} height={200} width={200} alt={result?._id} />}
                    </div>
                    <h4>{(result?.name).slice(0, 20)}{(result?.name).length > 20 ? '...' : ''} <br /> <span>{(result?._id).slice(0, 20)}{(result?._id).length > 20 ? '...' : ''}</span>
                    </h4>
                    {userData?.username !== result?._id && <button className="f-button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); follow(result?._id) }}> {(findUsernameInLikeList(userData?.following_list, result?._id)) ? 'Unfollow' : 'Follow'}</button>}
                  </div>
                  <p>{result?.bio}</p>
                </div>
              ))}

            </div>
          )}

          {activeTab === 'Tags' && <div className="s-tag-cont"> 
            <div className="tags-cont">
            {tags.map((tag, index) => (
              <Link href={`/hashtags/${(tag._id).slice(1)}`} className="s-tag-box" key={index}>
                <p className="s-tag-id">{tag?._id}</p>
                <p className="s-tag-count">{tag?.count} posts</p>
              </Link>
            ))}</div>
          </div>}
          {activeTab === 'Posts' && <div className="s-post-cont">
            {post.map((p, index) => (
              <PostBox post={p} key={index} />
            ))}
          </div>}
        </div>
        <div className="s-search-cont">
          <button className="back-button-s" onClick={() => { router.back() }}><HomeIcon /> </button>
          <input placeholder="search" type="text" id="search-input" onChange={handleInputChange} onKeyDown={handleKeyPress} />
          <div className="s-search-svg" onClick={() => search(query)}>
            <ExploreIcon1 />
          </div>
        </div>
        <div className="s-tab-cont">
          <p onClick={() => handleTabClick('Posts')} style={activeTab === 'Posts' ? { background: '#1D1C14' } : {}}>Posts</p>
          <p onClick={() => handleTabClick('People')} style={activeTab === 'People' ? { background: '#1D1C14' } : {}}>People</p>
          <p onClick={() => handleTabClick('Tags')} style={activeTab === 'Tags' ? { background: '#1D1C14' } : {}}>Tags</p>
        </div>
        <SIdeBar currentPath="/" />
        <TopLoader />
        <CreateModal />
        <ReplyModal />
      </main>
    </Suspense>
  );
}
