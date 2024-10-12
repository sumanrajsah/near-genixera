'use client'
import Image from "next/image";

import { useState,useEffect, useContext } from "react";
import { useAccount,useSignMessage,useVerifyMessage } from 'wagmi'
import Link from "next/link";
import './signup.css';
import TopLoader from "../components/toplpader";
import { Connect } from "../components/sidebar/connect";
import { Users,usersProfile } from "../components/interface";
import axios from 'axios'
import { useRouter } from "next/navigation";
import { HomeIcon } from "../components/svg";
import { UserContext } from "../userContext";




export default function Signup() {

  const account=useAccount();
    const router = useRouter();
    const [Email, setEmail] = useState('');
    const [SignInMessage, setSignMessage] = useState('');
    const [username, setUsername] = useState('');
    const [message, setMessage] = useState('');
    const [signupStatus,setSignUpStatus] = useState('');
    const [checkEmail,setCheckEmail] = useState('');
    const [checkUser,setCheckUser] = useState('');
    const [signupSuccess,setSignupSuccess] = useState('');
    const [isVerified,setVerified] = useState(false);
    const [u,setU] = useState(false);
    const [ee,setE] = useState(false);
    const [registered,setRegistered]=useState(false);
    
const ext='.genx';
const userContext = useContext(UserContext);
if (!userContext) {
  throw new Error('UserContext is not provided');
}
const { userData, setUserData } = userContext;
 

    const { signMessageAsync,status } = useSignMessage();
    const handleSubmit = async (e:any) => {
      e.preventDefault();
      if (!username || !Email ) {
        // If any field is empty, do not proceed
        setMessage('Invalid Input')
        setTimeout(() => {
          setMessage('');
        }, 10000);

        return;
      }
  handleCheck(e);
  if(!ee || !u){
    return;
  }





    const signature=  await signMessageAsync({ message:`Welcome to EraX! \n Click to sign in and accept that you are sign up to our platform with. \n \n This request will not trigger a blockchain transaction or cost any gas fees.\n \n wallet address: ${account.address} \n\n email address: ${Email}` });
    const Profile:usersProfile={
      name:'',
      Bio:'',
      occupation:'',
      dob:'',
      location:'',
      website:'',
      created_on:Date.now(),
      email_address:Email,
      username:username.toLowerCase()+ext,
      no_of_followers:0,
      followers_list:[],
      following_list:[],
      post_list:[],
      reply_list:[],
      image_url:'',
      background_image_url:'',
      like_list:[],
    }
      const userData:Users = {
        _id:`${account.address}`,
        wallet_address:`${account.address}`,
        sign_up_hash:signature,
        profile:Profile,
      };
      //  console.log(userData);
    
      try{
       
        axios.post('/api/user/signup', userData)
  .then(response => {
    if(response.data.success){
      setTimeout(() => {
      router.push(`/`);
    }, 1000);
    }
    if(response.data.message){
      setSignUpStatus(response.data.message);
      setSignupSuccess(response.data.message);
      setUserData(Profile)
      setTimeout(() => {
        setSignUpStatus('');
        setSignupSuccess('')
      }, 10000);

    }
  })
  .catch(error => {
    console.error('Error:', error);
  });
        // const response = await Register({userhash, username, Email});
        // console.log(response);
      }
      catch (error){
console.log(error);
      }
      // Example: you can send this data to your backend for further processing
    };
    const isAnyFieldEmpty = !username || !Email;
  
    const signMessage = async ()=>{
      const signature = await signMessageAsync({ message:'Welcome to gensquare' });
      if(signature){
        setVerified(true);
      
      try{
        const userData={  wallet_address:`${account.address}`};
           axios.post('/api/user/checkAddress', userData)
     .then(response => {
       if(response.data.success){
        setRegistered(true);
         setTimeout(() => {
         window.location.href='/';
       }, 3000);
       }
       if(response.data.message){
         setSignUpStatus(response.data.message);
         setTimeout(() => {
           setSignUpStatus('');
         }, 5000);
   
       }
     })
     .catch(error => {
       console.error('Error:', error);
     });
           // const response = await Register({userhash, username, Email});
           // console.log(response);
         }
         catch (error){
   console.log(error);
         }
         //
      console.log(signature);
      setSignMessage(signature);
        }
    }

    const handleCheck = async (e:any) => {
    if(Email){

      const format= /\S+@\S+\.\S+/;
      if (!format.test(Email.toLowerCase())) {
        setCheckEmail('enter correct form of email');
        setTimeout(() => {
            setCheckEmail('');
        }, 5000);
        return;
    }

      try{
        const userData={  email_address:`${Email}`};
        // console.log(userData)
           axios.post('/api/user/checkemail', userData)
     .then(response => {
       if(response.data.success==false){
        setE(true);
       }
       if(response.data.message){
         setCheckEmail(response.data.message);
         setTimeout(() => {
           setCheckEmail('');
         }, 10000);
   
        //  return ;
       }
     })
     .catch(error => {
       console.error('Error:', error);
     });
           // const response = await Register({userhash, username, Email});
           // console.log(response);
         }
         catch (error){
   console.log(error);
         }
         //
    }
    if(username && (username.length>=3)){
      const specialChars = /[!@#$%^&*(),.?":{}|<>]/;

      if (specialChars.test(username)) {
          setCheckUser('Username cannot contain special characters');
          setTimeout(() => {
              setCheckUser('');
          }, 5000);
          return;
      }
      try{
        const userData={  username:`${username.toLowerCase()+ext}`};
        // console.log(userData)
           axios.post('/api/user/checkUsername', userData)
     .then(response => {
       if(response.data.success == false){
       setU(true);
       }
       if(response.data.message){
         setCheckUser(response.data.message);
         setTimeout(() => {
           setCheckUser('');
         }, 10000);
   
       }
     })
     .catch(error => {
       console.error('Error:', error);
     });
           // const response = await Register({userhash, username, Email});
           // console.log(response);
         }
         catch (error){
   console.log(error);
         }
         //
    }
  }
   

  return (
      <main className="body-s" >
        <title>GenX / SignUp</title>
        <TopLoader/>
        <div className="back-cont">
         <Link href={'/'}> <button className="back-button"><HomeIcon/> </button></Link>
          <h2>Back</h2>
        </div>
        <div className="left-signup">
          <Image className="left-signup-logo" src={'/gslogo.png'} alt="gensquare" width={1000} height={1000}/>
        </div>
     {!signupSuccess ?   <div className="right-signup" >
       { (isVerified)&& (account.status=== 'connected') ?<h1 hidden={registered}>Register</h1>:<h2 hidden={account.status=== 'connected'}>Please connect wallet</h2>}
       {signupStatus&&<p className="alert-m" >{signupStatus}</p>}
      
       { (status === 'idle')||(status === 'error')?<Connect/>:''}
       <br/>
       <h3 hidden={account.status=== 'disconnected'||isVerified}>Click Sign In to Verify your wallet</h3>
        {(isVerified)&& (account.status=== 'connected') &&(!registered)? <div className="form-cont" >
          <p className="alert-m">{message}</p>
        <form >
        <div className="form-data">
          <input
          className="form-input"
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            placeholder="username"
          />
          {username&&(username.length<=3)&&<p>At least 3 characters</p>}
           {checkUser&&<>{(checkUser==='Available'?<p style={{color:"green",fontWeight:900}}>&#10004;{checkUser}</p>:<p style={{color:"red"}}>&#10008; Not Available Username</p>)}</>}
          <input
          className="form-input"
            type="email"
            id="email"
            value={Email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Email"
          />
          
            {checkEmail&&<>{(checkEmail==='Available'?<p style={{color:"green",fontWeight:900}}>&#10004;{checkEmail}</p>:<p style={{color:"red"}}>&#10008; Not Available Email</p>)}</>}
        </div>
        <br/>
        <div>

        </div>
      </form>
        <button type="submit" onClick={handleSubmit} className="form-submit" disabled={isAnyFieldEmpty }  >Sign Up</button>
        </div>:<button className="login-button-s" onClick={signMessage} hidden={account.status==='disconnected'||registered}>sign in</button>}
        <h4 hidden={account.status=== 'disconnected'||isVerified}>OR</h4>

<hr hidden={account.status=== 'disconnected'||isVerified} className="hr"/>
        <h4 hidden={account.status=== 'disconnected'||isVerified}>already have account?</h4>
        <Link href={'/'} hidden={account.status=== 'disconnected'||isVerified}>
        <button className="login-button-s">LogIn</button>
       </Link>
       </div>: 
       <div className="redirect-m">
       <h1 className="signup-m" >{signupSuccess}</h1>
        <h4>Redirecting to GenX App</h4>
       </div>}
      
    </main>
  );
}
