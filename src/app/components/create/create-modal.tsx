'use client'
import Image from "next/image";
import styles from "./page.module.css";
import { useSimulateContract, useWriteContract } from 'wagmi'
import { useState, useEffect, useRef, useContext } from "react";
import { useAccount, useSignMessage, useVerifyMessage } from 'wagmi'
import Link from "next/link";
import './modal.css'
import { useRouter, useSearchParams } from "next/navigation";
import { UploadComponents } from "./components/uploadComp";
import ProfileBar from "../sidebar/profileBar";
import axios from 'axios'
import ReactAudioPlayer from 'react-audio-player';
import { Audio, Oval } from 'react-loader-spinner'
import { usersProfile } from "../interface";
import { UserContext } from "@/app/userContext";
import { abi } from "../abi";
import { switchChain } from "@wagmi/core";
import { config } from "@/app/config2";
import { auroraTestnet, polygonAmoy, sepolia } from "viem/chains";


type postNftCol={
  contract_name:string;
  image_url:string;
  chain_id:string;
  contract_symbol:string;
  contract_address:string;
  owner:string;
  tx_hash:string;
}

const GXPNETH={
  contract_address:'',
  chain_id:11155111
}
const GXPNPOL={
  contract_address:'',
  chain_id:80002
}
const GXPNAURORA={
  contract_address:'',
  chain_id:131316555
}

export default function CreateModal() {
  const searchParams = useSearchParams();
  const searchTerm = searchParams.get('create');
  const router = useRouter();
  const account = useAccount();
  const [isFocused, setIsFocused] = useState(false);
  const [posting, setPosting] = useState(false);
  const [content, setContent] = useState('');
  const [success, setSuccess] = useState(false);
  const [text, setText] = useState<string>('');
  const [tag, setTag] = useState<string[]>([]);
  const [audio, setAudio] = useState<string | ArrayBuffer | null>(null);
  const [gif, setGif] = useState<string | ArrayBuffer | null>(null);
  const [video, setVideo] = useState<string | ArrayBuffer | null>(null);
  const [image, setImage] = useState<string | ArrayBuffer | null>(null);
  const [warning, setWarning] = useState('');
  const [postNftContract,setPostNftContract]=useState<postNftCol[]>([])
  const [contractAddress,setContractAddress]=useState<any>()
  const [chainId,setChainId]=useState<any>();
  const [isContractSelected,setContract]=useState(false)

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
      const size = file.size / 1000000
      if (size > 5.1) {
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
        setVideo(null);
      };
      reader.readAsDataURL(file);
    }
  };

  // Function to handle gif file change
  const handleGifChange = (files: FileList | null) => {
    const file = files?.[0];
    if (file) {
      const size = file.size / 1000000
      if (size > 5.1) {
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
        setVideo(null);
      };
      reader.readAsDataURL(file);
    }
  };
  const handleVideoChange = (files: FileList | null) => {
    const file = files?.[0];
    if (file) {
      const size = file.size / 1000000
      if (size > 10.1) {
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

  // Function to handle audio file change
  const handleAudioChange = (files: FileList | null) => {
    const file = files?.[0];
    if (file) {
      const size = file.size / 1000000
      if (size > 5.1) {
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
        setVideo(null);
      };
      reader.readAsDataURL(file);
    }
  };



  const [createPost, setCreatePost] = useState(false);
  const [createNftPost, setCreateNftPost] = useState(false);
  const togglePost = () => {
    setCreatePost(false);
    setContractAddress('');
    setChainId(0);
    setImage(null);
    setGif(null);
    setText('');
    setAudio(null);
    setVideo(null);
  };
  const toggleNftPost = () => {
    setCreatePost(false);
    setCreateNftPost(true);
  };
  useEffect(()=>{
    async function getContract() {
      try{
        const response = await axios.get(`/api/post-nft-collection?id=${account.address}`);
        if(response.data.success){
          console.log(response.data.postsNftCol[0].post_nft_collections);
          setPostNftContract(response.data.postsNftCol[0].post_nft_collections)
        }
      }catch(e){
        console.log(e)
      }
    }
    getContract();
  },[account.address])

  const handlePost = async (e: any) => {
    setPosting(true);
    try {
      let userData;
      if (image) {
        userData = { post_content: text, author: `${account.address}`, post_type: 'image', media_file: image, post_tags: tag };
      }
      else if (gif) {
        userData = { post_content: text, author: `${account.address}`, post_type: 'gif', media_file: gif, post_tags: tag };
      }
      else if (audio) {
        userData = { post_content: text, author: `${account.address}`, post_type: 'audio', media_file: audio, post_tags: tag };
      }
      else if (video) {
        userData = { post_content: text, author: `${account.address}`, post_type: 'video', media_file: video, post_tags: tag };
      }
      else {
        userData = { post_content: text, author: `${account.address}`, post_type: 'text', media_file: '', post_tags: tag };
      }
      axios.post('/api/user/doPost', userData)
        .then(response => {
          console.log('Response:', response.data.message);
          setPosting(false);
          if (response.data.success) {
            setPosting(false);
            setSuccess(true);
            setTimeout(() => {
              window.location.href = '/home';
            }, 3000);
            setTimeout(() => {
              setSuccess(false);
            }, 2000);
          }
          if (response.data.message) {
            setPosting(false);
          }
        })
        .catch(error => {
          console.error('Error:', error);
          setPosting(false);
        });
    }
    catch (error) {
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

  useEffect(() => {
    const postButton = document.getElementById('post-b');

    if (posting && postButton) {
      postButton.style.background = "black";
    }
    else {
      if (postButton) {
        postButton.style.background = "#D2BD00";
      }
    }
  }, [posting]);

  
  const { data,status, writeContractAsync } = useWriteContract()

  async function MintNft(id:any,uri:any){
  const hash =  await writeContractAsync({
      address: '0x6bE544f3903EebBD8c0da61fD1081D3E22B383a3',
      abi,
      functionName: 'safeMint',
      args: ['0xd9214679A04cFDA120EFA769249D676fF0DB5501',BigInt(`${id}`),`${uri}`],
    })
    
     return hash;
  }
  async function mint(){

    setPosting(true);
    try {
      let userData;
      if (image) {
        userData = { post_content: text, author: `${account.address}`, post_type: 'image', media_file: image, post_tags: tag };
      }
      else if (gif) {
        userData = { post_content: text, author: `${account.address}`, post_type: 'gif', media_file: gif, post_tags: tag };
      }
      else if (audio) {
        userData = { post_content: text, author: `${account.address}`, post_type: 'audio', media_file: audio, post_tags: tag };
      }
      else if (video) {
        userData = { post_content: text, author: `${account.address}`, post_type: 'video', media_file: video, post_tags: tag };
      }
      else {
        userData = { post_content: text, author: `${account.address}`, post_type: 'text', media_file: '', post_tags: tag };
      }
      axios.post('/api/user/doPost', userData)
        .then(async response => {
          console.log('Response:', response.data.message);
         
          if (response.data.success) {
          
          const hash =  await writeContractAsync({
            address: contractAddress,
            abi,
            functionName: 'safeMint',
            args: [`0x${account.address?.slice(2)}`,BigInt(`${response.data.postinfo.insertedId}`),`${response.data.uri}`],
          })
          if(hash){
            const data={id:response.data.postinfo.insertedId,chain_id:chainId,tx_hash:hash}
            const r = await axios.post('api/user/doPost/nft',data)
            if(r.data.success){
              window.location.href='/home'
            }
          }
          
          }
      
        })
        .catch(error => {
          console.error('Error:', error);
          setPosting(false);
          setWarning('something went wrong')
        });
    }
    catch (error) {
      setPosting(false);
      console.log(error);
    }
   
  }


  return (
    <>
      {(searchTerm == 'true') && <main className="modal-body"  >
        {(posting) ? 'Creating...' : <div className="modal-cont" ref={closeModal}>
          {createNftPost && contractAddress && <h4 style={{ color: 'green' }}>This Post permanently stored on chain </h4>}
          {createNftPost && !contractAddress && <h4 style={{ color: '#D2BD00' }}>Choose Post Collection (Contract)</h4>}
          {(!createNftPost && createPost) && <h4 style={{ color: 'green' }}>This Post stored in our database </h4>}
          {warning && <h4 style={{ color: 'red' }}>{warning}</h4>}
          {/* <div className="p-cont">
            <div className="p-image">
              {userData?.username ? <Image height={50} width={50} src={!(userData?.image_url)?'/profile2.svg':`${process.env.NEXT_PUBLIC_API_IPFS_URL}/${(userData?.image_url).split('/')[4]}`} alt="Profile" /> : <Oval
                visible={true}
                height="20"
                width="20"
                color="#D2BD00"
                ariaLabel="oval-loading"
                wrapperStyle={{}}
                wrapperClass=""
                strokeWidth={10}
              />}
            </div>
            <h3>{userData?.username}</h3>
          </div> */}
         {createNftPost&& !contractAddress&& <div className="select-contract-cont">
  <div className="select-contract-box"  onClick={async()=>{setChainId(11155111);setContractAddress('');await switchChain(config,{chainId:sepolia.id})}}>Sepolia-Contract</div>
  <div className="select-contract-box"  onClick={async()=>{setChainId(80002);setContractAddress('');await switchChain(config,{chainId:polygonAmoy.id})}}>Polygon Amoy-Contract</div>
  <div className="select-contract-box"  onClick={async()=>{setChainId(131316555);setContractAddress('');await switchChain(config,{chainId:auroraTestnet.id})}}>Aurora Testnet-Contract</div>
    {postNftContract.map((nftContract:postNftCol,index)=>(
  <div key={index} className="select-contract-box"  onClick={async ()=>{setChainId(nftContract.chain_id);setContractAddress(nftContract.contract_address);await switchChain(config,{chainId:Number(nftContract.chain_id)})}}>{nftContract.contract_name} ({nftContract.contract_symbol})-{nftContract.contract_address?.slice(0,5)}...{nftContract.contract_address?.slice(-5)}</div>
    ))}
</div>}

          {!createPost && !createNftPost && <div className="create-cont" >
            <div className="create-post-nft" onClick={()=>setCreatePost(true)}>Post</div>
            <div className="create-post-nft" onClick={toggleNftPost}>P-NFT</div>
            <Link href={'/create/post-nft-collection'} className="create-post-nft"  >
           P-NFT Collection</Link>
          </div>}

          {createPost &&
            <div className="creating-post" >
              <div className="input-field"> <textarea disabled={posting} id="feed" className={`customInput ${isFocused || content.trim() !== '' ? 'focused' : ''}`}
                onFocus={handleFocus}
                onBlur={handleBlur}
                onChange={handleInputChange}
                placeholder="welcome"
              ></textarea><br />

                {image && <div className="preview-image"> <Image height={100} width={100} className="preview-image" src={image as string} alt='Preview' /></div>}
                {gif && <div className="preview-image"> <Image width={100} height={100} className="preview-image" src={gif as string} alt='Preview' /></div>}
                {audio && <ReactAudioPlayer
                  src={audio as string}
                  autoPlay
                  loop
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
              <hr className="hr" />
              <div className="upload-buttons">
                <UploadComponents onImageUpload={handleFileChange} onAudioUpload={handleAudioChange} onGifUpload={handleGifChange} onVideoUpload={handleVideoChange} notUpload={posting} />
                {!createNftPost && (text || image || gif || video || audio) && <button className="post-button" id="post-b" onClick={handlePost} disabled={posting}>{(posting) ?
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
                {createNftPost && (text || image || gif || video || audio) &&contractAddress&& <button className="post-button" onClick={mint } disabled={posting}>{(posting) ? 'Loading...' : 'Create'}</button>}
              </div>
            </div>}
          {createNftPost && contractAddress &&
            <div className="creating-post" >
              <div className="input-field"> <textarea disabled={posting} id="feed" className={`customInput ${isFocused || content.trim() !== '' ? 'focused' : ''}`}
                onFocus={handleFocus}
                onBlur={handleBlur}
                onChange={handleInputChange}
                placeholder="welcome"
              ></textarea><br />

                {image && <div className="preview-image"> <Image height={100} width={100} className="preview-image" src={image as string} alt='Preview' /></div>}
                {gif && <div className="preview-image"> <Image width={100} height={100} className="preview-image" src={gif as string} alt='Preview' /></div>}
                {audio && <ReactAudioPlayer
                  src={audio as string}
                  autoPlay
                  loop
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
              <hr className="hr" />
              <div className="upload-buttons">
                <UploadComponents onImageUpload={handleFileChange} onAudioUpload={handleAudioChange} onGifUpload={handleGifChange} onVideoUpload={handleVideoChange} notUpload={posting} />
                {!createNftPost && (text || image || gif || video || audio) &&contractAddress&& <button className="post-button" id="post-b" onClick={handlePost} disabled={posting}>{(posting) ?
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
                {createNftPost && (text || image || gif || video || audio) && <button className="post-button" onClick={mint } disabled={posting}>{(posting) ? 'Loading...' : 'Create'}</button>}
              </div>
            </div>}

          <Link href={'?'} > <button className="close-modal" onClick={() => { togglePost(); setCreateNftPost(false) }} ><span>&times;</span></button></Link>
        </div>}
        {success && <h3 className="success-m" >Successfully posted</h3>}

      </main>}
    </>
  );
}
