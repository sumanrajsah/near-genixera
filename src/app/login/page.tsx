'use client'
import Image from "next/image";
import styles from "./page.module.css";
import { Connect } from "../components/sidebar/connect";
import { useState, useEffect, Suspense, useContext } from "react";
import { useSimulateContract, useWriteContract } from 'wagmi'
import { abi } from '../components/abi'
import { useAccount, useSignMessage, useVerifyMessage } from 'wagmi'
import axios from "axios";
import { useRouter } from "next/navigation";
import "./style.css";
import Link from "next/link";
import TopLoader from "../components/toplpader";
import { Audio,Oval, TailSpin } from 'react-loader-spinner'
import { UserContext } from "../userContext";


export default function Login() {
  const account = useAccount();
  const router = useRouter();
  const [signupStatus, setSignUpStatus] = useState('');
  const userContext = useContext(UserContext);
  const { signMessageAsync, status } = useSignMessage();
  if (!userContext) {
    throw new Error('UserContext is not provided');
  }
  const { userData, setUserData } = userContext;

  const SMessage = `Welcome to EraX! \n Click to sign in and accept that you are sign in to our platform with. \n \n This request will not trigger a blockchain transaction or cost any gas fees.\n \n wallet address: ${account.address}.`;
  const signMessage = async () => {
    const signature = await signMessageAsync({ message: SMessage });
    try {
      const userData = {
        wallet_address: `${account.address}`,
        LoginHash: signature, SigningMessage: SMessage
      };
      axios.post('/api/user/login', userData)
        .then(response => {
          console.log('Response:', response.data.message);
          if (response.data.success) {
            setUserData(response.data.userData.profile);
            setTimeout(() => {
              router.push('/home');
            }, 1000);
          }
          if (response.data.message) {
            setSignUpStatus(response.data.message);
            setTimeout(() => {
              setSignUpStatus('');
            }, 5000);

          }
          if (response.data.message === 'Login unsuccessful') {
            setTimeout(() => {
              router.push('/Signup');
            }, 2000);
          }
        })
        .catch(error => {
          console.error('Error:', error);
        });
    }
    catch (error) {
      console.log(error);
    }
    //

  }



  return (
    <Suspense fallback={<div><TailSpin
      visible={true}
      height="100"
      width="100"
      color="#D2BD00"
      ariaLabel="oval-loading"
      wrapperStyle={{}}
      wrapperClass=""
      radius={2}
      strokeWidth={1}
      />Wait...</div>}>
    <main className="body" >
      <TopLoader />
      <div className="left">
        <Image className="left-logo" src={'/gslogo.png'} alt="gensquare" width={1000} height={1000} />
      </div>
      {account.isReconnecting  ?
      <div className="right"><TailSpin
      visible={true}
      height="100"
      width="100"
      color="#D2BD00"
      ariaLabel="oval-loading"
      wrapperStyle={{}}
      wrapperClass=""
      radius={2}
      strokeWidth={1}
      />Wait...</div>
      :<div className="right">
        <h1>Enter to New Era</h1>
        {!(account.isConnected) ? <Connect /> : <Connect />}
        {(account.isConnected) ? <button className="login-button" onClick={signMessage}>Sign In</button> : ''}



        <h4>OR</h4>

        <hr className="hr" />

        <h4>Don&apos;t have account?</h4>
        <Link href={'/Signup'}>
          <button className="login-button">Create Account</button>
        </Link>

      </div>}
      <h3 className="login-m" hidden={!signupStatus}>{signupStatus}</h3>
    </main>
    </Suspense>
  );
}
