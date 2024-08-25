'use client'
import Image from "next/image";
import styles from "./page.module.css";
import { useSimulateContract, useWriteContract } from 'wagmi'
import { useState, useEffect, Suspense, useContext } from "react";
import { useAccount, useSignMessage, useVerifyMessage } from 'wagmi'
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import "./style.css";
import "@/app/[username]/userprofile.css"
import axios from "axios";
import { HomeIcon, ImageEdit } from "@/app/components/svg";
import { UserContext } from "@/app/userContext";
import { usersProfile } from "@/app/components/interface";
import { findUsernameInLikeList } from "../../post/postFunction";

type data={
    name:string;
    username:string;
    image_url:string;
    bio:string;
  }


export const FollowingList = ({List,userData}:{List:data[],userData:usersProfile}) =>{
  const searchParams = useSearchParams();
  const searchTerm = searchParams.get('following');
  const userContext = useContext(UserContext);
  if (!userContext) {
    throw new Error('UserContext is not provided');
  }
  const {  setUserData } = userContext;

const router = useRouter();

async function follow(to:string) {
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
  async function seeProfile(username:any){
router.push(`/${username}`);
  }

  return (
    <>
      {(searchTerm === 'true') && <div className="follower-body">
       { true ?<div className="follower-cont">
        <div className="follower-top">
            <div className="back-bt-cont">
              <Link href={'?'}> <button className="back-bt"><span>&times;</span> </button></Link>
              <h3>Following List</h3>
            </div>
          </div>
          <div className="follower-body-cont">
          {List?.map((data: data, index) => (
         <div onClick={(e)=>{seeProfile(data?.username)}} className="followers-box" key={index}>
            <div className="followers-profile">
                <div className="fp-img-cont">
                    <Image className="fprofile-img" src={data.image_url} height={200} width={200} alt={data.username}/>
                </div>
            <h4>{data.name} <br/>
                <span>{data.username}</span>
            </h4>
            {userData?.username !== data.username && <button className="f-button" onClick={(e)=> {e.preventDefault();e.stopPropagation();follow(data?.username)}}> {(findUsernameInLikeList(userData?.following_list,data?.username))?'Unfollow':'Follow'}</button>}
            </div>
            <p className="f-bio">{data.bio}</p>
         </div>
        ))}
          </div>
         
        </div>:<div className="loader-u"><div className="loader-logo-cont">
        <Image className="loader-logo" src={'/gslogo.png'} alt="gensquare" width={1000} height={1000} />
      </div><br/>
    <h1>GenX</h1>
    </div>}
      </div>}
    </>
  );
}
