'use server'
import { MongoClient, ServerApiVersion } from 'mongodb';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
// Use the JWT key
import pinataSDK from '@pinata/sdk'
import { metaData,Posts } from '@/app/components/interface';
import { Readable } from 'stream'; 
import {create} from 'kubo-rpc-client'

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
      const ipfs = create('/ip4/152.228.215.212/tcp/5001')
      const ipfs2 = create('/ip4/152.228.215.212/tcp/9095')
      const postData = await req.json();
     const post_time = Date.now();

     await client.connect();
     const database = client.db("gensquare");
     const users = database.collection("users");
     const postsDb= database.collection("posts");
     const uwa = await users.findOne({ _id: postData.author });
     const toPostInfo = await postsDb.findOne({ _id: postData.post_id });
// generate post id

const generatePostId = (userId:any) => {
  const timestamp = post_time; // Get current timestamp
  const randomPart = Math.random().toString(36).substr(2, 9); // Generate random string
  const postId = `${userId}-${timestamp}-${randomPart}`; // Combine user ID, timestamp, and random string
  return postId;
};
const post_ID:any = generatePostId(postData.author);

// text type post
if(uwa && toPostInfo){
if(postData.post_type === 'text'){
  const PostMetaData:metaData={
    post_id:post_ID,
    author_address:`${postData.author}`,
    author_username:uwa.profile.username,
    post_type:`${postData.post_type}`,
    time:`${post_time}`,
    media:'',
    content:`${postData.post_content}`,
    app:'genx'
  
  }
  const fileContent = JSON.stringify(PostMetaData);
  const file = new File([fileContent], 'data.json', {
    type: 'application/json',
  });
  
  const resData= await ipfs.add(file,{pin:true})
  // console.log(resData.IpfsHash);
 await ipfs2.pin.add(resData.cid);

  
        const query:Posts = {_id:post_ID,content_url:`https://ipfs.io/ipfs/${resData.cid}`,media_url:'',time:post_time,post_type:`${postData.post_type}`,on_chain:false,parent_post:postData.post_id,author_address:`${postData.author}`,    author_username:uwa.profile.username,tags:postData.post_tags,like_list:[],reply_list:[],repost_list:[],view:[],visibility:true};
    
      // check username already registered
      const postinfo= await postsDb.insertOne(query);
  

      await users.updateOne(
          { _id: uwa._id },
          { $push: {"profile.post_id": post_ID} }
      );
     await users.updateOne(
        { "profile.username":postData.to },
        { $push: {"profile.reply_list": post_ID} }
    );
      await postsDb.updateOne(
          { _id: toPostInfo._id },
          { $push: {reply_list: post_ID} }
      );
  
  
  
          if (postinfo) {
              return NextResponse.json({ success: true, message: 'Successfully posted', postinfo });
          }
}

     //upload image on pinata

     const base64Data = postData.media_file;
     const dta = base64Data.split(',')[1];
     const binaryData = Buffer.from(dta, 'base64');

     const readableStreamForFile = new Readable();
     readableStreamForFile.push(binaryData);
     readableStreamForFile.push(null);
const metaname = post_ID+'-'+Date.now();
    const options:any = {
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

   const imgfile = new File([binaryData], `${Date.now()}.png`, {
    type: 'image/png',
  });
  const MediaData = await ipfs.add(imgfile,{pin:true})
  await ipfs2.pin.add(MediaData.cid)

// upload metadata of post to pinata

const PostMetaData:metaData={
  post_id:post_ID,
  author_address:`${postData.author}`,
  author_username:uwa.profile.username,
  post_type:`${postData.post_type}`,
  time:`${post_time}`,
  media:`https://ipfs.io/ipfs/${MediaData.cid}`,
  content:`${postData.post_content}`,
  app:'genx'

}
const fileContent = JSON.stringify(PostMetaData);
const file = new File([fileContent], 'data.json', {
  type: 'application/json',
});

// const resData = await pinata.pinJSONToIPFS(PostMetaData);
const resData= await ipfs.add(file,{pin:true})
await ipfs2.pin.add(resData.cid)

      const query:Posts = {_id:post_ID,content_url:`https://ipfs.io/ipfs/${resData.cid}`, author_address:`${postData.author}`,    author_username:uwa.profile.username,media_url:`https://ipfs.io/ipfs/${MediaData.cid}`,time:post_time,post_type:`${postData.post_type}`,on_chain:false,parent_post:postData.post_id,tags:postData.post_tags,like_list:[],reply_list:[],repost_list:[],view:[],visibility:true};
  
    // check username already registered
    const postinfo= await postsDb.insertOne(query);



    await users.updateOne(
        { _id: uwa._id },
        { $push: {"profile.post_id": post_ID} }
    );
    await users.updateOne(
        { "profile.username":postData.to },
        { $push: {"profile.reply_list": post_ID} }
    );
    await postsDb.updateOne(
      { _id: toPostInfo._id },
      { $push: {"reply_list": post_ID} }
  );
  
    if (postinfo) {
        return NextResponse.json({ success: true, message: 'Successfully posted', postinfo });
    }
}


    
    

      
    } catch (error) {
      console.log(error);
      return NextResponse.json({ success:"error"});
    } 
    finally {
      // await client.close();
    }
    return NextResponse.json({success:false,message:'unsuccessful' });
}