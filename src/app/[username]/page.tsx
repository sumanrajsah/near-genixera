'use client'
import Image from "next/image";
import { useState, useEffect, useContext, useCallback } from "react";
import { useAccount } from 'wagmi'
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";
import TopLoader from "../components/toplpader";
import { SIdeBar } from "../components/sidebar/sidebar";
import CreateModal from "../components/create/create-modal";
import './userprofile.css';
import { usersProfile } from "../components/interface";
import ReplyContainer from "../components/post-info/fetch-post";
import SearchBar from "../components/search/search";
import { HomeIcon } from "../components/svg";
import { EditProfile } from "../components/editprofile/edit";
import { findUsernameInLikeList } from "../components/post/postFunction";
import { UserContext } from "../userContext";
import ReplyModal from "../components/create/reply-modal";
import { FollowerList } from "../components/props/profileinfo/follower";
import { FollowingList } from "../components/props/profileinfo/following";
import { LowerBar } from "../components/sidebar/lowerbar";
import Loader from "../components/loader";
import MediaFetcher from "../components/mediafetcher";

type data = {
  name: string;
  username: string;
  image_url: string;
  bio: string;
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
  parent_post_data: PostInfo;
  chain_data:{
    chain_id:string;
    tx_hash:string
  }

}

type Tab = 'Posts' | 'Replies' | 'Likes' | 'Repost';
export default function Profile({ params }: any) {
  const account = useAccount();
  const [message, setMessage] = useState<usersProfile | null>(null);
  const [backgroundImage, setBackgroundImage] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [profileName, setProfileName] = useState('');
  const [username, setUsername] = useState('');
  const [Bio, setBio] = useState('');
  const [followers, setFollowers] = useState(0);
  const [followersList, setFollowersList] = useState<data[]>([]);
  const [followingList, setFollowingList] = useState<data[]>([]);
  const [following, setFollowing] = useState(0);
  const [isFollow, setIsFollow] = useState(false);
  const [post, setPost] = useState<PostInfo[]>([]);
  const [replyList, setReply] = useState<PostInfo[]>([]);
  const [likes, setLikes] = useState<PostInfo[]>([]);
  const [repost, setRepost] = useState<PostInfo[]>([]);
  const [showBg, setshowBg] = useState(false);
  const [showPImg, setshowPImg] = useState(false);
  const [userDataAvailable, setUserDataAvailable] = useState(false);
  const [userData, setUserData] = useState<usersProfile | null>(null);


  const [wallet, setWallet] = useState('');
  const router = useRouter();
  const userContext = useContext(UserContext);



  useEffect(() => {
    if (userContext) {
      setUserData(userContext.userData);
     
    }

  }, [userContext])

  const [loader, setLoader] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const [activeTab, setActiveTab] = useState<Tab>('Posts');
  useEffect(() => {
    if (account.address) {
      const mainElement = document.querySelector('.body-profile');

      if (!mainElement) {
        console.error("Main element with class 'body-profile' not found.");
        return;
      }

      const handleScroll = () => {

        var scrollTop = mainElement.scrollTop;
        if (
          scrollTop + mainElement.clientHeight + 5 >= mainElement.scrollHeight
        ) {

          setLoader(true);
        }
      };

      mainElement.addEventListener('scroll', handleScroll);

      return () => {
        mainElement.removeEventListener('scroll', handleScroll);
        setLoader(false)
      };
    }
  }, [loader, account]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let response: any;
        response = await axios.get(`/api/profile/info?username=${params.username}&type=${activeTab}&limit=5&page=${currentPage}`);

        // console.log('Response:', response.data.AllPost);
        if (response.data.success && response.data.post) {
          setTotalPages(response.data.totalPages);
          if (currentPage > response.data.totalPages) {
            setCurrentPage(1);
          }
          if (currentPage <= 1) {
            // setCurrentPage(currentPage+1);
            if (activeTab === 'Posts') {
              setPost(response.data.post[0]?.post_data);
            }
            else if (activeTab === 'Replies' && (response.data.post[0]?.post_data.length) > 0) {

              setReply(response.data.post[0]?.post_data);
            }
            else if (activeTab === 'Likes') {

              setLikes(response.data.post[0]?.post_data);
            }
            else if (activeTab === 'Repost') {

              setRepost(response.data.post[0]?.post_data);
            }

          } else {
            if (activeTab === 'Posts') {
              setPost((prevPost) => [...prevPost, ...response.data.post[0]?.post_data]);
            }
            else if (activeTab === 'Replies') {
              setReply((prevPost) => [...prevPost, ...response.data.post[0]?.post_data]);
            }
            else if (activeTab === 'Likes') {
              setLikes((prevPost) => [...prevPost, ...response.data.post[0]?.post_data]);
            }
            else if (activeTab === 'Repost') {
              setRepost((prevPost) => [...prevPost, ...response.data.post[0]?.post_data]);
            }
          }
        }
      } catch (error) {
        console.error('getError:', error);
      }
    };

    // Fetch data initially
    fetchData();
  }, [params, currentPage, activeTab]);

  const moreData = useCallback(() => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    if (loader) {
      moreData();
    }
  }, [loader, moreData]);

  useEffect(() => {

    const getprofile = async () => {

      try {

        axios.get(`/api/profile?username=${params.username}`)
          .then(response => {

            if (response.data.userData) {
              setMessage(response.data.userData);
              setBackgroundImage(response.data.userData.background_image_url);
              setProfileImage(response.data.userData.image_url);
              setProfileName(response.data.userData.name);
              setUsername(response.data.userData.username);
              setBio(response.data.userData.Bio);
              setFollowers(response.data.userData.followers_list.length);
              setFollowersList(response.data.data[0].follower_data);
              setFollowingList(response.data.data[0].following_data);
              setFollowing(response.data.userData.following_list.length);
              setWallet(response.data.walletAddress);
              setUserDataAvailable(true)
              // console.log(response.data.post[0].post_data)
            }
            else {
              router.push("/");
            }
          })
          .catch(error => {
            console.error('Error:', error);
          });
      }
      catch (e) { }
    }
    getprofile();


  }, [params.username, router])
  // const response = await Register({userhash, username, Email});
  // console.log(response);
  useEffect(() => {
    if (message?.followers_list && Array.isArray(message?.followers_list)) {
      if (findUsernameInLikeList(message?.followers_list, userData?.username)) {
        setIsFollow(true)
      }
      // console.log(findUsernameInLikeList(message?.followers_list, userData?.username))
    }
  }, [message, userData])


  // A function to change the active tab when a button is clicked
  const handleTabClick = (tab: Tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
    setTotalPages(0);
  };

  async function follow() {
    let data = { user: userData?.username, to: username }
    try {

      axios.put('/api/user/follow', data)
        .then(response => {
          // console.log('Response:', response.data.success);
          if (response.data.success) {
            { isFollow ? setFollowers((prev) => prev - 1) : setFollowers((prev) => prev + 1) }
            setIsFollow(!isFollow);
          }
        })
        .catch(error => {
          console.error('Error:', error);
        });
    }
    catch (e) { }
  }

  const [MediaBlob, setMediaBlob] = useState<Blob | null>(null);
  const [MediaBlob1, setMediaBlob1] = useState<Blob | null>(null);

if(!userDataAvailable) return<Loader/>;
  return (
    <> <div className="body-profile" >




        {showBg && message && <div className="show-bg-img-cont" onClick={(e) => (setshowBg(false))}>
          <button className="close-bt" onClick={(e) => (setshowBg(false))}><span>&times;</span> </button>
          <Image className="show-bg-img" src={`/api/image/${backgroundImage.split('/')[4]}`} height={500} width={1500} alt="genx" hidden={!backgroundImage} onClick={(e) => e.stopPropagation()} />
        </div>}
        {showPImg && message && <div className="show-p-img-cont" onClick={(e) => (setshowPImg(false))}>
          <button className="close-bt" onClick={(e) => (setshowPImg(false))}><span>&times;</span> </button>
          <Image className="show-p-img" src={`/api/image/${profileImage.split('/')[4]}`} height={500} width={500} alt="genx" hidden={!backgroundImage} onClick={(e) => e.stopPropagation()} />
          <h1>{username}</h1>
        </div>}

        {message && <div className="cont-p">
          <div className="profile-cont">
            <div className="background-banner">
            {backgroundImage &&<MediaFetcher cid={(backgroundImage).split('/')[4]} setMediaBlob={setMediaBlob} />}
              {MediaBlob && <Image className="b-image" src={URL.createObjectURL(MediaBlob)} height={500} width={1500} alt="genx" hidden={!backgroundImage} onClick={(e) => (setshowBg(true))} />}
              <div className="b-image"  hidden={!!backgroundImage}  />
            </div>
            <div className="profile-image-cont">
              {profileImage && <MediaFetcher cid={(profileImage).split('/')[4]} setMediaBlob={setMediaBlob1} />}
              {MediaBlob1 &&<Image className="profile-img" src={URL.createObjectURL(MediaBlob1)} height={1000} width={1000} alt="genx" hidden={!profileImage} onClick={(e) => (setshowPImg(true))} />}
              <Image className="profile-img" src={'/profile2.svg'} height={100} width={100} hidden={!!profileImage} alt="genx" />
            </div>
            <br />
            <div className="profile-data">
              <div className="p-name">{profileName}</div>
              <div className="p-username">{username}</div>
              <br />
              <p className="user-bio">{Bio}</p>
              <p className="website-link" onClick={() => { window.open(`${message?.website}`, '_blank') }}>{message?.website}</p>
              <br />
              <p className="location"><span>Location: </span>{message?.location}</p>
              {!(account.address == wallet) && <div className="follow-button" onClick={follow}>{isFollow ? 'Unfollow' : 'Follow'}</div>}
              {(account.address == wallet) && <Link href={'?editprofile=true'} className="follow-button">Edit Profile</Link>}
            </div>
            <div className="follow-data">
              <Link href={'?followers=true'}> <p> <span>{followers}</span> Followers</p></Link>
              <Link href={'?following=true'}>   <p> <span>{following}</span> Following</p></Link>
            </div>

          </div>
          <div className="profile-bar-cont">
            <p onClick={() => handleTabClick('Posts')}  >Posts</p>
            <p onClick={() => handleTabClick('Replies')}>Replies</p>
            <p onClick={() => handleTabClick('Likes')}>Likes</p>
            <p onClick={() => handleTabClick('Repost')}>Repost</p>
          </div>
          {activeTab === 'Posts' && post && <ReplyContainer posts={post} />}
          {activeTab === 'Replies' && replyList && <ReplyContainer posts={replyList} />}
          {activeTab === 'Likes' && likes && <ReplyContainer posts={likes} />}
          {activeTab === 'Repost' && repost && <ReplyContainer posts={repost} />}
        </div>}
        <div className="back-cont-p">
          <button className="back-button-p" onClick={() => { router.back() }}><HomeIcon /> </button>
          <h3>Back</h3>
          <h4 className="post-no">{post.length} posts</h4>
        </div>
        {/* <p>{message}</p> */}
        <SIdeBar currentPath={'/profile'} />
        <LowerBar currentPath={'/profile'} />
        <EditProfile />
        {userData && userData.followers_list.length>0 && <FollowerList List={followersList} userData={userData} />}
        {userData && userData.following_list.length>0 && <FollowingList List={followingList} userData={userData} />}
        <SearchBar />
        <CreateModal />
        <ReplyModal />
        <TopLoader />
      </div>
    </>
  );
}

