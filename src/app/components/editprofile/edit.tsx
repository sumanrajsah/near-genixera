'use client'
import Image from "next/image";
import styles from "./page.module.css";
import { useSimulateContract, useWriteContract } from 'wagmi'
import { useState, useEffect, Suspense, useContext } from "react";
import { useAccount, useSignMessage, useVerifyMessage } from 'wagmi'
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import "./ep.css";
import "@/app/[username]/userprofile.css"
import axios from "axios";
import { HomeIcon, ImageEdit } from "@/app/components/svg";
import { UserContext } from "@/app/userContext";
import { usersProfile } from "../interface";
import MediaFetcher from "../mediafetcher";




export const EditProfile = () =>{
  const searchParams = useSearchParams();
  const searchTerm = searchParams.get('editprofile');
  const account = useAccount();
  const [message, setMessage] = useState<usersProfile | null>(null);
  const [backgroundImage, setBackgroundImage] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [profileName, setProfileName] = useState('');
  const [username, setUsername] = useState('');
  const [Bio, setBio] = useState('');
  const [Locaton, setLocation] = useState('');
  const [Website, setWebsite] = useState('');
  const [Dob, setDob] = useState('');
  const [Occupation, setOccupation] = useState('');
  const [updating,setUpdating]=useState(false);
  const [newPImg,setNewPImg]=useState(false);
  const [newBgImg,setNewBgImg]=useState(false);
const router = useRouter();
const [dataLoad,setDataLoad]=useState(false);

const userContext = useContext(UserContext);
if (!userContext) {
  throw new Error('UserContext is not provided');
}
const { setUserData } = userContext;

useEffect(() => {
  
    const getprofile = async () => {

      try {

        axios.get(`/api/profile?id=${account.address}`)
          .then(response => {
            console.log('Response:', response.data.success);

            if (response.data.profile) {
              setMessage(response.data.profile);
              setBackgroundImage(response.data.profile.background_image_url);
              setProfileImage(response.data.profile.image_url);
              setProfileName(response.data.profile.name);
              setUsername(response.data.profile.username);
              setBio(response.data.profile.Bio);
              setWebsite(response.data.profile.website);
              setLocation(response.data.profile.location);
              setOccupation(response.data.profile.occupation);
              setDob(response.data.profile.dob);
              setDataLoad(true)
              setUserData(response.data.profile);

            }
          })
          .catch(error => {
            console.error('Error:', error);
          });
      }
      catch (e) { }
    }

        getprofile();
    }, [account.address,setUserData]);
  

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileName(e.target.value);
  };
  const handleBioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBio(e.target.value);
  }
  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocation(e.target.value);
  };
  const handleDobChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDob(e.target.value);
  };
  const handleWebsiteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWebsite(e.target.value);
  };
  const handleOccupationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOccupation(e.target.value);
  };


  const handleBgImageChange = (event:any) => {
    const files = event.target.files;
    const file = files?.[0];
      if (file) {
        const reader:any = new FileReader();
        reader.onloadend = () => {
          setBackgroundImage(reader.result);
          setNewBgImg(true);
        };
        reader.readAsDataURL(file);
      }
  };
  const handleProfileImageChange = (event:any) => {
    const files = event.target.files;
    const file = files?.[0];
      if (file) {
        const reader:any = new FileReader();
        reader.onloadend = () => {
          setProfileImage(reader.result);
          setNewPImg(true);
        };
        reader.readAsDataURL(file);
      }
  };

    const updateProfile = async () => {
      setUpdating(true);
let updatedData={name:profileName,occupation:Occupation,dob:Dob,location:Locaton,website:Website,bio:Bio,bgImage:backgroundImage,pImage:profileImage,newBgImg:newBgImg,newPImg:newPImg};
      try {

        axios.put('/api/user/update',updatedData)
          .then(response => {
            console.log('Response:', response.data.success);

            if (response.data.success) {
            setUpdating(false);
            window.location.href=`/${username}`
            }
          })
          .catch(error => {
            console.error('Error:', error);
            setUpdating(false);
          });
      }
      catch (e) { setUpdating(false);}
    }
    const [MediaBlob, setMediaBlob] = useState<Blob | null>(null);
    const [MediaBlob1, setMediaBlob1] = useState<Blob | null>(null);
  return (
    <>
      {(searchTerm === 'true') && <div className="edit-profile-body">
       { message ?<div className="ep-cont">
          <div className="ep-top">
            <div className="back-bt-cont">
              <Link href={'?'}> <button className="back-bt"><span>&times;</span> </button></Link>
              <h3>Edit Profile</h3>
            </div>
            <button className="save-bt" onClick={updateProfile}>Save</button>
          </div>
         {updating? "Updating...": <div className="ep-body">
            <div className="ep-background-img">
              {backgroundImage &&!newBgImg &&<MediaFetcher cid={(backgroundImage).split('/')[4]} setMediaBlob={setMediaBlob} />}
             {backgroundImage &&MediaBlob &&!newBgImg && <Image className="b-image" src={URL.createObjectURL(MediaBlob)} height={500} width={1500} alt="genx" hidden={!backgroundImage} />}
             {newBgImg && <Image className="b-image" src={backgroundImage} height={500} width={1500} alt="genx" hidden={!newBgImg} />}
              <label className="bg-icon-cont">
              <input  type='file' accept='image/*' onChange={handleBgImageChange} />
                <ImageEdit />
              </label>
            </div>
            <div className="profile-img-cont">
            {profileImage && !newPImg &&<MediaFetcher cid={(profileImage).split('/')[4]} setMediaBlob={setMediaBlob1} />}
            {profileImage&&MediaBlob1&&!newPImg &&  <Image className="profile-img" src={URL.createObjectURL(MediaBlob1)} height={1000} width={1000} alt="genx" hidden={!profileImage} />}
            {newPImg && <Image className="b-image" src={profileImage} height={500} width={1500} alt="genx" hidden={!newPImg} />}
              <label className="bg-icon-cont">
                
              <input  type='file' accept='image/*' onChange={handleProfileImageChange} />
                <ImageEdit />
              </label>
            </div>
            <div className="profile-data-cont">
            <div className="ep-wallet-cont">
                <p>Wallet Address</p>
                <label className="ep-username"  >{account.address}</label>
              </div>
              <div className="ep-username-cont">
                <p>Username</p>
                <label className="ep-username">{username}</label>
              </div>
              <div className="ep-name-cont">
                <p>Name</p>
                <input className="ep-name" name="ep-name" placeholder="Name" type="text" value={profileName} onChange={handleNameChange} />
              </div>

              <div className="ep-name-cont">
                <p>Bio</p>
                <input className="ep-bio" name="ep-bio" placeholder="Bio" type="text" value={Bio} onChange={handleBioChange} />
              </div>
              <div className="ep-dob-cont">
                <p>Birth Date</p>
                <input className="ep-dob" name="ep-dob" placeholder="Dob" type="date" value={Dob} onChange={handleDobChange} />
              </div>
              <div className="ep-name-cont">
                <p>Website</p>
                <input className="ep-website" name="ep-website" placeholder="link" type="text" value={Website} onChange={handleWebsiteChange} />
              </div>
              <div className="ep-dob-cont">
                <p>Location</p>
                <input className="ep-location" name="ep-location" placeholder="Country" type="text" value={Locaton} onChange={handleLocationChange} />
              </div>
              <div className="ep-dob-cont">
                <p>Occupation</p>
                <input className="ep-occu" name="ep-occu" placeholder="Occupation" type="text" value={Occupation} onChange={handleOccupationChange} />
              </div>
            </div>
          </div>}
        </div>:<div className="loader-u"><div className="loader-logo-cont">
        <Image className="loader-logo" src={'/gslogo.png'} alt="gensquare" width={1000} height={1000} />
      </div><br/>
    <h1>GenX</h1>
    </div>}
      </div>}
    </>
  );
}
