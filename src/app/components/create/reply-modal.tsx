'use client'
import Image from "next/image";
import styles from "./page.module.css";
import { useSimulateContract, useWriteContract } from 'wagmi'
import { useState,useEffect,useRef, useContext } from "react";
import { useAccount,useSignMessage,useVerifyMessage } from 'wagmi'
import Link from "next/link";
import './modal.css'
import { useRouter,useSearchParams } from "next/navigation";
import {UploadComponents} from "./components/uploadComp";
import ProfileBar from "../sidebar/profileBar";
import axios from 'axios'
import ReactAudioPlayer from 'react-audio-player';
import { Oval } from "react-loader-spinner";
import { UserContext } from "@/app/userContext";



export default function ReplyModal() {
    const searchParams = useSearchParams();
    const searchTerm = searchParams.get('comment');
    const to = searchParams.get('to');
    const post_id = searchParams.get('id');
    const router = useRouter();
    const account = useAccount();
    const [isFocused, setIsFocused] = useState(false);
    const [posting,setPosting] =useState(false);
    const [content, setContent] = useState('');
    const [success, setSuccess] = useState(false);
    const [text, setText] = useState<string>('');
    const [tag, setTag] = useState<string[]>([]);
    const [audio, setAudio] = useState<string | ArrayBuffer | null>(null);
    const [gif, setGif] = useState<string | ArrayBuffer | null>(null);
    const [video, setVideo] = useState<string | ArrayBuffer | null>(null);
    const [image, setImage] = useState<string | ArrayBuffer | null>(null);
    const [warning,setWarning]=useState('');
    const userContext = useContext(UserContext);
    if (!userContext) {
      throw new Error('UserContext is not provided');
    }
    const { userData } = userContext;


    const handleFocus = () => {
      setIsFocused(true);
    };
  
    const handleBlur = () => {
      setIsFocused(false);
    };
  
    const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      console.log('Input value:', event.target.value);
      setText(event.target.value);
      const inputValue = event.target.value;
      let tagsArray = inputValue
        .split(/[\s\n]+/)
        .filter(word => word.startsWith('#') && word.trim() !== '#')
        .map(tag => tag.trim());
        
        const lastCharacter = inputValue[inputValue.length - 1];
        if (lastCharacter === '#' || lastCharacter === ' ' || lastCharacter === '\n') {
          tagsArray = tagsArray.slice(0, 5);
        }
      

      console.log('tags array:', tagsArray);
      setTag(tagsArray);
      // You can do something with the input value here
    };

    
    
  
    const handleFileChange = (files: FileList | null) => {
      const file = files?.[0];
      if (file) {
        const size =file.size/1000000
        if(size>5.1) {
          setWarning('Image size is larger than 5 Mb')
          setTimeout(() => {
            setWarning('')
          }, 1000);
          return
        };
        const reader = new FileReader();
        reader.onloadend = () => {
          setImage(reader.result);
          setGif(null);
          setAudio(null);
        };
        reader.readAsDataURL(file);
      }
    };
    
    // Function to handle gif file change
    const handleGifChange = (files: FileList | null) => {
      const file = files?.[0];
      if (file) {
        const size =file.size/1000000
        if(size>5.1) {
          setWarning('Gif size is larger than 5 Mb')
          setTimeout(() => {
            setWarning('')
          }, 1000);
          return
        };
        const reader = new FileReader();
        reader.onloadend = () => {
          setGif(reader.result);
          setImage(null);
          setAudio(null);
        };
        reader.readAsDataURL(file);
      }
    };
    
    // Function to handle audio file change
    const handleAudioChange = (files: FileList | null) => {
      const file = files?.[0];
      if (file) {
        const size =file.size/1000000
        if(size>5.1) {
          setWarning('Audio size is larger than 5 Mb')
          setTimeout(() => {
            setWarning('')
          }, 1000);
          return
        };
        const reader = new FileReader();
        reader.onloadend = () => {
          setAudio(reader.result);
          setImage(null);
          setGif(null);
        };
        reader.readAsDataURL(file);
      }
    };
    const handleVideoChange = (files: FileList | null) => {
      const file = files?.[0];
      if (file) {
        const size =file.size/1000000
        if(size>10.1) {
          setWarning('Video size is larger than 10 Mb')
          setTimeout(() => {
            setWarning('')
          }, 1000);
          return
        };
        const reader = new FileReader();
        reader.onloadend = () => {
          setVideo(reader.result);
          setImage(null);
          setAudio(null);
          setGif(null);
        };
        reader.readAsDataURL(file);
      }
    };
  

    const [createPost,setCreatePost] = useState(false);
    const togglePost = () => {
      setCreatePost(!createPost);
      setImage(null);
      setGif(null);
      setText('');
      setAudio(null);
      setVideo(null);
    };

    const handlePost = async (e:any) => {
setPosting(true);
      try{
        let userData;
        if(image){
       userData={ post_content:text,author:`${account.address}`,post_type:'image',media_file:image,post_tags:tag,post_id:post_id,to:to};
        }
        else if(gif){
       userData={ post_content:text,author:`${account.address}`,post_type:'gif',media_file:gif,post_tags:tag,post_id:post_id,to:to};
        }
       else if(audio){
       userData={ post_content:text,author:`${account.address}`,post_type:'audio',media_file:audio,post_tags:tag,post_id:post_id,to:to};
        }
        else{
          userData={ post_content:text,author:`${account.address}`,post_type:'text',media_file:'',post_tags:tag,post_id:post_id,to:to};
        }
           axios.post('/api/user/post/reply', userData)
     .then(response => {
       console.log('Response:', response.data.message);
       setPosting(false);
       if(response.data.success){
        setPosting(false);
        setSuccess(true);
         setTimeout(() => {
         router.push('/');
       }, 3000);
         setTimeout(() => {
          setSuccess(false);
       }, 2000);
       }
       if(response.data.message){
        //  setSignUpStatus(response.data.message);
        //  setTimeout(() => {
        //    setSignUpStatus('');
        //  }, 5000);
        setPosting(false);
       }
     })
     .catch(error => {
       console.error('Error:', error);
       setPosting(false);
     });
           // const response = await Register({userhash, username, Email});
           // console.log(response);
         }
         catch (error){
          setPosting(false);
   console.log(error);
         }
    }

    const closeModal = useRef<HTMLDivElement>(null);

useEffect(() => {
  // Function to close the post dropdown when clicking outside of it
  function handleClickOutside(event: MouseEvent) {
    if (closeModal.current && !closeModal.current.contains(event.target as Node)) {
      router.push('/');
    }
  }

  // Add event listener when component mounts
  document.addEventListener("mousedown", handleClickOutside);

  // Cleanup event listener when component unmounts
  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, [router]);


  return (
     <> 
   {(searchTerm == 'true') && <main className="modal-body"  >
        <div className="modal-cont" ref={closeModal}>
        {warning && <h4 style={{color:'red'}}>{warning}</h4>}
          <div className="p-cont">
          <div className="p-image">
          <Image height={50} width={50} src={`${process.env.NEXT_PUBLIC_API_IPFS_URL}/${(userData?.image_url).split('/')[4]}`} alt="Profile" />
          </div>
         <h3> {userData?.username}</h3>
          </div>

<div className="creating-post" >
         <p> replying to <span style={{color:'#D2BD00'}}>@{to}</span></p>
          <div className="input-field"> <textarea id="feed"  className={`customInput ${isFocused || content.trim() !== '' ? 'focused' : ''}`}
           onFocus={handleFocus}
           onBlur={handleBlur}
           onChange={handleInputChange}
           placeholder="welcome"
          ></textarea><br/>
                
        {image && <div className="preview-image"> <Image height={100} width={100} src={image as string} alt='Preview'  /></div> }
        {gif&& <div className="preview-image"> <Image height={100} width={100} src={gif as string} alt='Preview'  /></div> }
          {audio && <ReactAudioPlayer
  src={audio as string}
  autoPlay
  controls
/>}
{video &&
                  <div className="preview-video">
                    <video controls autoPlay>
                      <source src={video as string} type="video/mp4" />
                      <source src={video as string} type="video/ogg" />
                    </video>
                  </div>}
          </div>
          <hr className="hr"/>
          <div className="upload-buttons">
            <UploadComponents onImageUpload={handleFileChange} onAudioUpload={handleAudioChange} onGifUpload={handleGifChange} onVideoUpload={handleVideoChange} notUpload={posting}/>
            {(text||image||gif||video||!Audio) && <button className="post-button" id="post-b" onClick={handlePost} disabled={posting}>{(posting) ?
                  <Oval
                    visible={true}
                    height="20"
                    width="20"
                    color="#D2BD00"
                    ariaLabel="oval-loading"
                    wrapperStyle={{}}
                    wrapperClass=""
                    strokeWidth={5}
                  />
                  : 'Post'}</button>}
          </div>
            </div>
            
            <Link href={'?'} > <button className="close-modal" onClick={togglePost} ><span>&times;</span></button></Link>
        </div>
       {success && <h3 className="success-m" >Successfully posted</h3>}

    </main>}
    </>
  );
}
