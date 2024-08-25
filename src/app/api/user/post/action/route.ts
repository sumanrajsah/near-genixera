'use server'
import { MongoClient, ServerApiVersion } from 'mongodb';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { findUsernameInLikeList, findUsernameInRepostList } from '@/app/components/post/postFunction';
import { repost } from '@/app/components/interface';

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

interface Id {
  _id: any;
}

export async function POST(req: Request) {
  let final;
  try {
    const postData = await req.json();
    // console.log(postData)

    await client.connect();
    const database = client.db("gensquare");
    const posts = database.collection("posts");
    const reposts = database.collection("reposts");
    const user = database.collection("users");
    const add = cookies().get('wallet_address')?.value;
    // console.log(add);

    const generatePostId = (postId: any) => {
      const timestamp = Date.now(); // Get current timestamp
      const repostId = `${postId}${timestamp}`; // Combine user ID, timestamp, and random string
      return repostId;
    };
   

    const id: Id = {
      _id: add,
    }

    if (postData.action === 'like') {
      const postD = await posts.findOne({ _id: postData.post_id })
      const isLiked = findUsernameInLikeList(postD?.like_list,postData.username)
      if (isLiked) {
        const post = await posts.updateOne({ _id: postData.post_id }, { $pull: { like_list: postData.username } });
        const u = await user.updateOne(id, { $pull: { "profile.like_list": postData.post_id } });
        final = post;
      }
      else {

        const post = await posts.updateOne({ _id: postData.post_id }, { $push: { like_list: postData.username } });
        const u = await user.updateOne(id, { $push: { "profile.like_list": postData.post_id } });
        final = post;

      }
    }
    if (postData.action === 'repost') {
      const postD = await posts.findOne({ _id: postData.post_id })
      const isReposted = findUsernameInRepostList(postD?.repost_list,postData.username)
      if (isReposted) {
        const post = await posts.updateOne({ _id: postData.post_id }, { $pull: { repost_list: postData.username } });
        const u = await user.updateOne(id, { $pull: { "profile.repost_list": postData.post_id } });
        const r= await reposts.deleteOne({post_id:postData.post_id,repost_username:postData.username})

        final = post;
      }
      else {
        const post = await posts.updateOne({ _id: postData.post_id }, { $push: { repost_list: postData.username } });
        const u = await user.updateOne(id, { $push: { "profile.repost_list": postData.post_id } });
        const repost_ID: any = generatePostId(postData.post_id);
        const query:repost={_id:repost_ID,post_id:postData.post_id,repost_username:postData.username,time:Date.now()}
        const r=await reposts.insertOne(query)
        final = post;

      }
    }
    return NextResponse.json({ success: final?.acknowledged });
    // 
  }
  catch (error) {
    console.log(error);
  }
  finally {
    await client.close();
  }




  return NextResponse.json({ success: false, message: 'unauthorized access' });

}




