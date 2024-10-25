'use server'
import { MongoClient, ServerApiVersion } from 'mongodb';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';



const uri = process.env.NEXT_PUBLIC_MONGODB_URI;
let client: MongoClient

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

export async function POST(req: NextRequest) {
  let h, i;
  try {
    // Connect the client to the server	(optional starting in v4.7)
   
    const postData = await req.json();

    const address = req.cookies.get('wallet_address')?.value || '';
    await client.connect();
    const database = client.db("gensquare");
    const users = database.collection("users");
    const postsDb = database.collection("post-nft-collection");

    const insert = await postsDb.insertOne(postData)
    if(insert.acknowledged){
        const addPost = await users.updateOne(
            { _id: postData.owner },
            { $push: { "profile.post_nft_collections": postData.contract_address } }
          );
    }
    
   
        return NextResponse.json({ success: true, message: 'Successfully Created' });
}catch(e){
    console.log(e)
    return NextResponse.json({ success: false, message: 'unsuccessfully',e:e });
}
}