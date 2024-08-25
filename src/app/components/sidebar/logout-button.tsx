'use client'
import Image from "next/image";
import styles from "./page.module.css";
import { useSimulateContract, useWriteContract } from 'wagmi'
import { useState,useEffect } from "react";
import { useAccount,useSignMessage,useVerifyMessage,useDisconnect } from 'wagmi'
import Link from "next/link";
import { Connect } from "./connect";
import TopLoader from "../toplpader";
import axios from "axios";
import { useRouter } from "next/navigation";
import './sidebar.css'
import { LogoutIcon } from "../svg";

interface LogoutButtonProps {
  onLogout: (arg: any) => void; // Define the type of the onLogout prop
}

export const LogoutButton: React.FC<LogoutButtonProps> = ({onLogout})=> {
    const [logoutM,setLogoutM] = useState('')
    const router = useRouter();
    const {disconnect}= useDisconnect();
    const logout = async ()=>{
        try{
            
            // console.log(userData)
               axios.get('/api/user/logout')
         .then(response => {
           console.log('Response:', response.data.logout,response.data.success);
           if(response.data.success){
            disconnect();
            setTimeout(() => {
                window.location.href='/login'
              }, 500);
           }
           if(response.data.logout){
            setLogoutM(response.data.logout);
            onLogout(response.data.logout);
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
    }

  return (

       <p className="logout-button" onClick={logout}> <LogoutIcon/> Logout</p>
  );
}
