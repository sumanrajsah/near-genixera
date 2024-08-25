'use server'
import { MongoClient, ServerApiVersion } from 'mongodb';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { findUsernameInLikeList, findUsernameInRepostList } from '@/app/components/post/postFunction';

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

export async function PUT(req: Request) {
  let final;
  try {
    const postData = await req.json();
    // console.log(postData)

    await client.connect();
    const database = client.db("gensquare");
    const posts = database.collection("posts");

    const postD = await posts.findOne({ _id: postData.post_id })
    const isViewed = findUsernameInRepostList(postD?.view,postData.username)
    if (isViewed) {
      const post = await posts.updateOne({ _id: postData.post_id }, { $pull: { view: postData.username } });

      final = post;
    }
    else {
      const post = await posts.updateOne({ _id: postData.post_id }, { $push: { view: postData.username } });

      final = post;

    }
      
      
    return NextResponse.json({ success: final?.acknowledged });

}
  catch (error) {
    console.log(error);
  }
  finally {
    await client.close();
  }




  return NextResponse.json({ success: false, message: 'unauthorized access' });

}




