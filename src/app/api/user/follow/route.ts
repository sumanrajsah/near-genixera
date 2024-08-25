'use server'
import { MongoClient, ServerApiVersion } from 'mongodb';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { findUsernameInLikeList } from '@/app/components/post/postFunction';

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
let user= await users.findOne({ "profile.username": postData.user });
let res= findUsernameInLikeList(user?.profile.following_list,postData.to)
// console.log(postData,res);
    if(!res){
  final=  await users.updateOne(
        { "profile.username": postData.user },
        { $push: { "profile.following_list": postData.to } }
      );
   final= await users.updateOne(
        { "profile.username": postData.to },
        { $push: { "profile.followers_list": postData.user } }
      );
    }
    else{
  final=  await users.updateOne(
        { "profile.username": postData.user },
        { $pull: { "profile.following_list": postData.to } }
      );
   final= await users.updateOne(
        { "profile.username": postData.to },
        { $pull: { "profile.followers_list": postData.user } }
      );
    }
   user= await users.findOne({ "profile.username": postData.user });
   
  return NextResponse.json({ success:final?.acknowledged,userData:user});
    // 
  }
    catch (error) {
      console.log(error);
    } 

    

  
    return NextResponse.json({ success:false,message:'unauthorized access'});

}


