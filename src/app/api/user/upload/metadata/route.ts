'use server'
import { MongoClient, ServerApiVersion } from 'mongodb';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

import { Readable } from 'stream'; // Import Readable stream from the 'stream' module
import { FilebaseClient } from '@filebase/client'


export async function POST(req:Request) {
    try {
      // Connect the client to the server	(optional starting in v4.7)
      const filebaseClient = new FilebaseClient({ token: process.env.NEXT_PUBLIC_FILEBASE_API })
      const postData = await  req.json();
      const fileContent = JSON.stringify(postData);
      const file = new File([fileContent], 'data.json', {
        type: 'application/json',
      });

      const cid = await filebaseClient.storeBlob(file)

if(cid){

  return NextResponse.json({ success:true,url:`https://filebase.ipfs.io/ipfs/${cid}`});
}
 
    } catch (error) {
      console.log(error);
      return NextResponse.json({ success:false});
    } 

    return NextResponse.json({success:false,message:'unsuccessful' });
}