'use server'
import { MongoClient, ServerApiVersion } from 'mongodb';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

import { Readable } from 'stream'; // Import Readable stream from the 'stream' module
import { FilebaseClient } from '@filebase/client'


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
    try {
      // Connect the client to the server	(optional starting in v4.7)
      const filebaseClient = new FilebaseClient({ token: process.env.NEXT_PUBLIC_FILEBASE_API })
      const postData = await  req.json();
      const base64Data = postData;
      const dta = base64Data.split(',')[1];
      const binaryData = Buffer.from(dta, 'base64');

      const readableStreamForFile = new Readable();
      readableStreamForFile.push(binaryData);
      readableStreamForFile.push(null);

      const mediafile = new File([binaryData],'t');
      const mediaCid=await filebaseClient.storeBlob(mediafile);

if(mediaCid){

  return NextResponse.json({ success:true,url:`https://ipfs.filebase.io/ipfs/${mediaCid}`});
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