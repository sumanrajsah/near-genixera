'use server'
import { MongoClient, ServerApiVersion } from 'mongodb';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

import { Readable } from 'stream';
import { FilebaseClient } from '@filebase/client';


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

async function getCookieData() {
  const cookieData = cookies().getAll()
  return new Promise((resolve) =>
    setTimeout(() => {
      resolve(cookieData)
    }, 1000)
  )
}
async function uploadImageToIPFS(base64Data: string): Promise<string> {
  const filebaseClient = new FilebaseClient({ token: process.env.NEXT_PUBLIC_FILEBASE_API })
  const dta = base64Data.split(',')[1];
  const binaryData = Buffer.from(dta, 'base64');

  const readableStreamForFile = new Readable();
  readableStreamForFile.push(binaryData);
  readableStreamForFile.push(null);
  const metaname = '-' + Date.now();
  const options: any = {
    pinataMetadata: {
      name: metaname,
      keyvalues: {
        customKey: 'customValue',
        customKey2: 'customValue2'
      }
    },
    pinataOptions: {
      cidVersion: 0
    }
  };
  const mediafile = new File([binaryData],'t');
  const cid = await filebaseClient.storeBlob(mediafile)
  return `http://ipfs.io/ipfs/${cid}`;
}

export async function PUT(req:Request) {
  let h,profile, add,token;
  try {
    const newData = await req.json();

    await client.connect();
    const database = client.db("gensquare");
    const users = database.collection("users");
    // const c= cookies().getAll();
    const c:any= await getCookieData();
  
    

    // console.log(c)
    // console.log(c.find(element=>element.name=== 'wallet_address')?.value);
    add=c.find((element:any)=>element.name=== 'wallet_address')?.value;
    token=c.find((element:any)=>element.name=== 'signInHash')?.value;
    const query:any = { _id: `${add}` };
    if(newData.newBgImg && newData.newPImg){
      const bgImage = await uploadImageToIPFS(newData.bgImage);
      const pImage = await uploadImageToIPFS(newData.pImage);
      h= await users.updateMany(query,{$set:{"profile.name":newData.name,"profile.Bio":newData.bio,"profile.dob":newData.dob,"profile.website":newData.website,"profile.location":newData.location,"profile.occupation":newData.occupation,"profile.background_image_url":bgImage,"profile.image_url":pImage}});
    }
    else if(newData.newBgImg){
      const bgImage = await uploadImageToIPFS(newData.bgImage);
      h= await users.updateMany(query,{$set:{"profile.name":newData.name,"profile.Bio":newData.bio,"profile.dob":newData.dob,"profile.website":newData.website,"profile.location":newData.location,"profile.occupation":newData.occupation,"profile.background_image_url":bgImage}});

    }
    else if(newData.newPImg){
      const pImage = await uploadImageToIPFS(newData.pImage);
      h= await users.updateMany(query,{$set:{"profile.name":newData.name,"profile.Bio":newData.bio,"profile.dob":newData.dob,"profile.website":newData.website,"profile.location":newData.location,"profile.occupation":newData.occupation,"profile.image_url":pImage}});

    }else{
      h= await users.updateMany(query,{$set:{"profile.name":newData.name,"profile.Bio":newData.bio,"profile.dob":newData.dob,"profile.website":newData.website,"profile.location":newData.location,"profile.occupation":newData.occupation,"profile.background_image_url":newData.bgImage,"profile.image_url":newData.pImage}});
    }
    // 
  }
    catch (error) {
      console.log(error);
    } 

    if(h ){
    return NextResponse.json({ success:true,h});
    
  }
    return NextResponse.json({ success:false,message:'failed'});

}


