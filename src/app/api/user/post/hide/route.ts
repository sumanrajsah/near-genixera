'use server'
import { MongoClient, ServerApiVersion } from 'mongodb';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

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

export async function PUT(req:NextRequest) {
 
  let final;
  try {
    const postData = await req.json();
    await client.connect();
    const database = client.db("gensquare");
    const users = database.collection("users");
    const posts = database.collection("posts");

    const postD = await posts.findOne({ _id: postData.post_id })
    if(postD?.visibility === true){
    final = await posts.updateOne({ _id: postData.post_id }, { $set: { visibility: false } });
  }else{
      final = await posts.updateOne({ _id: postData.post_id }, { $set: { visibility: true } });

    }

   
  return NextResponse.json({ success:final?.acknowledged});
    // 
  }
    catch (error) {
      console.log(error);
    } 

    

  
    return NextResponse.json({ success:false,message:'unauthorized access'});

}


