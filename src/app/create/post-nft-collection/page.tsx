'use client'
import React, { useContext, useRef, useState } from "react"
import Image from "next/image";
import './style.css'
import { TailSpin } from "react-loader-spinner";
import { useAccount, useDeployContract, useTransaction, useTransactionConfirmations, useWaitForTransactionReceipt } from "wagmi";
import { abi } from "@/app/components/abi";
import { bytecode } from "./data";
import { Connect } from "@/app/components/sidebar/connect";
import axios from "axios";
import Link from "next/link";
import { config } from "@/app/config2";
import { getTransactionConfirmations, getTransactionReceipt, switchChain } from "@wagmi/core";
import { auroraTestnet, polygonAmoy, sepolia } from "wagmi/chains";
import { UserContext } from "@/app/userContext";
import { SIdeBar } from "@/app/components/sidebar/sidebar";
import { LowerBar } from "@/app/components/sidebar/lowerbar";

type postNftColMetadata={
    contract_name:string;
    image_url:string;
    chain_id:string;
    contract_symbol:string;
    contract_address:string;
    owner:string;
    tx_hash:string;
}

export default function CreatePostNFTCollection() {
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [image, setImage] = useState<string | ArrayBuffer | null>(null);
    const [contractName,setContractName]=useState('')
    const [contractSymbol,setContractSymbol]=useState('')
    const [isCreating,setIsCreating]=useState(false);
    const [isDeployed,setDeployed]=useState(false);
    const account = useAccount();
    const { deployContractAsync,data } = useDeployContract();
    const userContext = useContext(UserContext);
    if (!userContext) {
      throw new Error('useContext must be used within a UserProvider');
    }
    const { userData } = userContext;


    const handleContainerClick = () => {
        // Trigger the hidden file input
        fileInputRef.current?.click();
    };

    const handleImageUpload = (event: any) => {
        const files = event.target.files;
        const file = files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result);

            };
            reader.readAsDataURL(file);
        }
    };
    async function checkTx(hash:any) {
        let tx;
        if(account.chainId ===1313161555 ){
            const response = await fetch(`https://explorer.testnet.aurora.dev/api/v2/transactions/${hash}`)
            const res= await response.json();
            // console.log(res.status)
            tx= res.status==='ok'?1:0;

        }else
         tx= await getTransactionConfirmations(config, {
            hash: hash,
            chainId:account.chainId
          })
          return Number(tx);
        }
        
    
    async function deployPostCollection(address: any) {
        setIsCreating(true); // Indicate that the creation process has started
        try {
            console.log(account.chainId)
            const hash:string = await deployContractAsync({
                abi: abi,
                args: [address, contractName, contractSymbol],
                bytecode: `0x${bytecode}`,
            });
    
    

            while (!(await checkTx(hash))) {
            //  console.log(await checkTx(hash))
                await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before checking again
            }
            let txData;
            if(account.chainId ===1313161555 && hash && await checkTx(hash)){
                const response = await axios.get(`https://explorer.testnet.aurora.dev/api/v2/transactions/${hash.toString()}`);
                txData={contractAddress:response.data.created_contract.hash}
    
            }else{
            txData= await getTransactionReceipt(config, {
                hash: hash as any,
                chainId:account.chainId
              })
            }
    
            if ( txData) {
                const imageIpfsCid = await axios.post('/api/user/upload/media', { image: image });
                //console.log(imageIpfsCid);
                if (imageIpfsCid.data.success) {
                    const postNftData: postNftColMetadata = {
                        contract_name: contractName,
                        image_url: `${imageIpfsCid.data.url}`,
                        contract_symbol: contractSymbol,
                        contract_address: `${txData?.contractAddress}`,
                        chain_id: `${account.chainId}`,
                        owner: `${account.address}`,
                        tx_hash: `${hash}`,
                    };
    
                    const response = await axios.post('/api/user/create/postnftcollection', postNftData);
                    if (response.data.success) {
                        console.log("Post NFT collection created successfully.");
                        window.location.href=`/${userData.username}`
                    }
                } else {
                    console.error("Image upload failed.");
                }
            } else {
                console.error("Transaction failed.");
            }
        } catch (e) {
            console.error("Error during deployment:", e);
        }
        finally {
            setIsCreating(false); // Ensure this runs regardless of success or failure
           
        }
    }
    

    return (
 <div className="post-nft-col-cont">
<h1>POST NFT COLLECTION</h1>
            <div className="post-nft-col-box">
                <label>Logo Image</label>
                <div className="uploadContainer" onClick={handleContainerClick}>
                    <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        onChange={handleImageUpload}
                    />
                    <div className="imagePreview">
                        {image ? (
                            <Image
                                src={image as string}
                                alt="Uploaded"
                                width={1000} height={1000}
                            />
                        ) : (
                            <p>
                                Upload Your Image (350px x 350px) <br /> No image uploaded yet
                            </p>
                        )}
                    </div>
                </div>
                <div className="input-cont">
                    <label>Contract Name</label>
                    <input placeholder="My Post Collection Name" value={contractName} type="text" onChange={(e)=>{setContractName(e.target.value)}} />
                </div>
                <div className="input-cont">
                    <label>Token Symbol</label>
                    <input placeholder="MPCN" type="text" value={contractSymbol} onChange={(e)=>{setContractSymbol(e.target.value)}} />
                </div>
                <div className="chain-select-cont">
                    <label>Blockchain</label>
                    <div className="chain-box" style={{borderColor:(account.chainId===11155111?'#D2BD00':'')}} onClick={async ()=>{await switchChain(config,{chainId:sepolia.id})}}>
                        <Image src={'/eth.svg'} className="chain-logo" height={100} width={100} alt='ETH'/>
                        <p>Ethereum</p>
                    </div>
                    <div className="chain-box" style={{borderColor:(account.chainId===80002?'#D2BD00':'')}} onClick={async ()=>{await switchChain(config,{chainId:polygonAmoy.id})}}>
                        <Image src={'/pol.svg'} className="chain-logo" height={100} width={100} alt='POL'/>
                        <p>POLYGON</p>
                    </div>
                    <div className="chain-box" style={{borderColor:(account.chainId===1313161555?'#D2BD00':'')}} onClick={async ()=>{await switchChain(config,{chainId:auroraTestnet.id})}}>
                        <Image src={'/aurora.svg'} className="chain-logo" height={100} width={100} alt='AURORA'/>
                        <p>AURORA</p>
                    </div>
                </div>
            </div>
            <button className="continue-button"  onClick={() => {deployPostCollection(account.address) }
      }>Continue</button>
            {isCreating&& <div style={{background:'#000000a4',position:'absolute',display:'flex',flexDirection:'column',justifyContent:'center',alignItems:'center',color:'#D2BD00',width:'100%',height:'100%'}}>
                <div style={{position:'fixed',display:'flex',flexDirection:'column',justifyContent:'center',alignItems:'center',borderRadius:'20px',background:'black',height:'auto',width:'auto',padding:'50px'}}>
            <TailSpin
      visible={true}
      height="100"
      width="100"
      color="#D2BD00"
      ariaLabel="oval-loading"
      wrapperStyle={{}}
      wrapperClass=""
      radius={2}
      strokeWidth={1}
      /><br/>
     { !isDeployed?<p>
      {!data?'Confirm Transaction in Wallet':'wait while Deploying Your Contract'}<br/>
      {data&&<Link href={`https://sepolia.etherscan.io/tx/${data}`} target="_blank">check tx status</Link>}
      </p>:
    <p>Successfully Deployed your Collection Contract<br/>wait while create colelction</p>}
      
         </div>   </div>}
         <SIdeBar key="sidebar" currentPath={'/'}/>
         <LowerBar key="lowerbar" currentPath={'/'}/>
           
        </div>
       
    )
}