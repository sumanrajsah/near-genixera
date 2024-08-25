'use server'
import { MongoClient, ServerApiVersion } from 'mongodb';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
// Use the JWT key
import pinataSDK from '@pinata/sdk'
import { Readable } from 'stream'; // Import Readable stream from the 'stream' module

const fs = require('fs');
const pinata = new pinataSDK({ pinataJWTKey: process.env.NEXT_PUBLIC_PINATA_JWT});


const uri =process.env.NEXT_PUBLIC_MONGODB_URI;
let client:MongoClient

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
if (uri) {
  client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });
} else {
  // Handle the case where uri is undefined
  console.error("URI is undefined");
}

export async function POST(req:Request) {
    let h,i;
    try {
      // Connect the client to the server	(optional starting in v4.7)
      const res = await pinata.testAuthentication()
      console.log(res)
      const postData = await  req.json();
      const base64Data = postData;
      const dta = base64Data.split(',')[1];
      const binaryData = Buffer.from(dta, 'base64');

      const readableStreamForFile = new Readable();
      readableStreamForFile.push(binaryData);
      readableStreamForFile.push(null);

     const options:any = {
        pinataMetadata: {
            name: `${Date.now()}`,
            keyvalues: {
                customKey: 'customValue',
                customKey2: 'customValue2'
            }
        },
        pinataOptions: {
            cidVersion: 0
        }
    };

     const resData = await pinata.pinFileToIPFS(readableStreamForFile,options)
console.log('errortype',resData.IpfsHash)

if(resData){

  return NextResponse.json({ success:true,url:`https://ipfs.io/ipfs/${resData.IpfsHash}`});
}
 
    } catch (error) {
      console.log(error);
      return NextResponse.json({ success:false});
    } 
    finally {
      await client.close();
    }
    return NextResponse.json({success:false,message:'unsuccessful' });
}