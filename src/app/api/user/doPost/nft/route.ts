'use server'
import { MongoClient, ServerApiVersion } from 'mongodb';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
// Use the JWT key
import pinataSDK from '@pinata/sdk'
import { metaData, Posts } from '@/app/components/interface';
import { Readable } from 'stream';
import {create} from 'kubo-rpc-client'
import initializeHelia from '@/app/lib/helia';
import { unixfs } from '@helia/unixfs'


const pinata = new pinataSDK({ pinataJWTKey: process.env.NEXT_PUBLIC_PINATA_JWT });


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
    const postsDb = database.collection("posts");

    const update = await postsDb.updateMany({_id:postData.id},{$set:{chain_data:{chain_id:postData.chain_id,tx_hash:postData.tx_hash},on_chain:true}})
    console.log(update)
   
        return NextResponse.json({ success: true, message: 'Successfully posted' });
}catch(e){
    console.log(e)
    return NextResponse.json({ success: false, message: 'unsuccessfully',e:e });
}
}