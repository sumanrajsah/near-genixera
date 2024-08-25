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

export async function POST(req:Request) {
    let h,i;
    try {
      // Connect the client to the server	(optional starting in v4.7)
      const postData = await req.json();
     // console.log(postData)
      await client.connect();
      const database = client.db("gensquare");
      const users = database.collection("users");
      const query = postData.profile;
  
    // check username already registered
    const username= await users.findOne({"profile.username":postData.username})
    if(username){
      return NextResponse.json({ success:true,message:'Not'});
    }

      
    } catch (error) {
      return NextResponse.json({ success:"error"});
    } 
    finally {
      await client.close();
    }
    return NextResponse.json({success:false,message:'Available' });
}