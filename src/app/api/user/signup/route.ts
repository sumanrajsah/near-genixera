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
    const query = postData;

    //check wallet address already registered
    const uwa= await users.findOne({_id:postData.wallet_address})
    if(uwa){
      return NextResponse.json({ success:false,message:'wallet address already registered'});
    }
    //check email address alreay registered
    const email= await users.findOne({"profile.emailAddress":postData.profile.email_address})
    if(email){
      return NextResponse.json({ success:false,message:'email already registered'});
    }
    // check username already registered
    const username= await users.findOne({"profile.username":postData.profile.username})
    if(username){
      return NextResponse.json({ success:false,message:'username already used'});
    }
    const expiryTimestamp = Date.now() + (365 * 24 * 60 * 60 * 1000);
    cookies().set('wallet_address',`${postData.wallet_address}`, { expires: expiryTimestamp });
    i= users.countDocuments(query);
   // console.log("check",i);
     h = await users.insertOne(postData);
   // console.log(h);
    return NextResponse.json({ success:true,h,i,message:'Successfully Registered'});
  } catch (error) {
    console.log(error);
    return NextResponse.json({ success:false,message:'unsuccessful'});
  } 
  finally {
    await client.close();
  }

}
// export async function GET() {
//   let h,u;
//   try {
//     await client.connect();
//     const database = client.db("gensquare");
//     const users = database.collection("users");
//     const add=cookies().get('walletAddress');
//     console.log(add.value);
//     const query = { walletAddress: `${add.value}` };
//     h= await users.countDocuments(query);
//     u= await users.findOne(query);
//     console.log(h);}
//     catch (error) {
//       console.log(error);
//     } 
//     return NextResponse.json({ success:true,h,u});
// }


