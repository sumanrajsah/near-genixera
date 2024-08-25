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
        '$match': {
          'profile.username': `${query}`
        }
      }, {
        '$lookup': {
          'from': 'users', 
          'localField': 'profile.followers_list', 
          'foreignField': 'profile.username', 
          'as': 'follower_user'
        }
      }, {
        '$unwind': {
          'path': '$follower_user', 
          'preserveNullAndEmptyArrays': true
        }
      }, {
        '$lookup': {
          'from': 'users', 
          'localField': 'profile.following_list', 
          'foreignField': 'profile.username', 
          'as': 'following_user'
        }
      }, {
        '$unwind': {
          'path': '$following_user', 
          'preserveNullAndEmptyArrays': true
        }
      }, {
        '$group': {
          '_id': '$_id', 
          'following_data':{
            $addToSet:{
              'name': '$following_user.profile.name', 
              'username': '$following_user.profile.username', 
              'bio': '$following_user.profile.Bio', 
              'image_url': '$following_user.profile.image_url'
            }
          },
          'follower_data':{
            $addToSet:{
              'name': '$follower_user.profile.name', 
              'username': '$follower_user.profile.username', 
              'bio': '$follower_user.profile.Bio', 
              'image_url': '$follower_user.profile.image_url'
            }
          }}},{
        '$project': {
          'follower_data':1,
          'following_data':1,
        }
      }
    ];
    
    
      
    const data = await users.aggregate(aggregationPipeline).toArray();
    return NextResponse.json({ success:true,userData,walletAddress:founduser.wallet_address,data:data});
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
