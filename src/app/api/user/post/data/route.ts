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




export async function GET(req:NextRequest) {

  const searchParams = req.nextUrl.searchParams;
  const query = searchParams.get('username');
  const id = searchParams.get('id');
  let userData,profile;
  try {
    await client.connect();
    const database = client.db("gensquare");
    const users = database.collection("users");
    const postsCollection = database.collection("posts");
    userData= await users.find().toArray();
if(query !=null){
    //check wallet address already registered
    const founduser =userData.find(user => String(user.profile.username) === query);
    if(founduser){
    userData=founduser.profile;
    const aggregationPipeline = [
        {
          $match: {
            'profile.username':`${query}`,
            'profile.post_id': {
              $exists: true,
              $ne: null
            }
          }
        },
        {
          $lookup: {
            from: 'posts',
            localField: 'profile.post_id',
            foreignField: '_id',
            as: 'post_data'
          }
        },
        {
          $project: {
            'profile.post_id': 1,
            'post_data': 1
            
          }
        },
        {
          $addFields: {
            'post_data.user_data.profile.username': founduser.profile.username,
            'post_data.user_data.profile.image_url': founduser.profile.image_url,
            'post_data.user_data.profile.name': founduser.profile.name,
          }
        }
      ];
      
    const posts = await users.aggregate(aggregationPipeline).toArray();
    return NextResponse.json({ success:true,userData,walletAddress:founduser.wallet_address,post:posts});
    }
  }
  else if(id != null){
    const founduser =userData.find(user => String(user.wallet_address) === id);
    if(founduser){
    profile=founduser.profile;
    return NextResponse.json({ success:true,profile});
    }
  }
  
  } catch (error) {
    console.log(error);
    return NextResponse.json({ success:false,message:'something went wrong'});
  } 
  finally {
    
  }
  return NextResponse.json({ success:false,message:'unauthorized'});
}
