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

export async function GET(req:NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const query = searchParams.get('id');
  
  let h,postsAll, add,token;
  try {
    await client.connect();
    const database = client.db("gensquare");
    const posts = database.collection("posts");
    h= await posts.countDocuments();
    const data:any={_id:`${query}`};
    const d=[
      {
        $match: {
          '_id': query
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'author_address',
          foreignField: '_id',
          as: 'user_data'
        }
      },
      {
        $unwind: {
          path: '$user_data',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: "posts", // The collection to join with
          localField: "parent_post", // The field from the posts collection
          foreignField: "_id", // The field from the posts collection
          as: "parent_post_data" // The output array field
        }
      },
      {
        $unwind: {
          path: "$parent_post_data",
          preserveNullAndEmptyArrays: true // Keep the post even if there is no parent post
        }
      },
      {
        $lookup: {
          from: "users", // The collection to join with
          localField: "parent_post_data.author_address", // The field from the posts collection
          foreignField: "_id", // The field from the users collection
          as: "parent_user_data" // The output array field
        }
      },
      {
        $unwind: {
          path: "$parent_user_data",
          preserveNullAndEmptyArrays: true // Keep the post even if there is no parent user data
        }
      },
      {
        $lookup: {
          from: 'posts',
          localField: 'reply_list',
          foreignField: '_id',
          as: 'replied_posts'
        }
      },
      {
        $unwind: {
          path: '$replied_posts',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'replied_posts.author_address',
          foreignField: '_id',
          as: 'reply_user'
        }
      },
      {
        $unwind: {
          path: '$reply_user',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $group: {
          _id: '$_id',
          content_url: { $first: '$content_url' },
          author_address: { $first: '$author_address' },
          author_username: { $first: '$author_username' },
          parent_post:{$first:'$parent_post'},
          media_url: { $first: '$media_url' },
          time: { $first: '$time' },
          post_type: { $first: '$post_type' },
          on_chain: { $first: '$on_chain' },
          likes: { $first: '$likes' },
          repost: { $first: '$repost' },
          tags: { $first: '$tags' },
          comments: { $first: '$comments' },
          like_list: { $first: '$like_list' },
          reply_list: { $first: '$reply_list' },
          repost_list: { $first: '$repost_list' },
          view: { $first: '$view' },
          visibility: { $first: '$visibility' },
          user_data: { $first: '$user_data' },
          replied_posts: {
            $addToSet: {
              _id: '$replied_posts._id',
              content_url: '$replied_posts.content_url',
              media_url: '$replied_posts.media_url',
              time: '$replied_posts.time',
              post_type: '$replied_posts.post_type',
              on_chain: '$replied_posts.on_chain',
              likes: '$replied_posts.likes',
              repost: '$replied_posts.repost',
              author_address: '$replied_posts.author_address',
              author_username: '$reply_user.profile.username',
              tags: '$replied_posts.tags',
              comments: '$replied_posts.comments',
              like_list: '$replied_posts.like_list',
              reply_list: '$replied_posts.reply_list',
              repost_list: '$replied_posts.repost_list',
              view: '$replied_posts.view',
              visibility: '$replied_posts.visibility',
              user_data:{
                profile:{
                  name:'$reply_user.profile.name',
                  username:'$reply_user.profile.username',
                  image_url:'$reply_user.profile.image_url',
                }
              }
              
            }
          },
          parent_post_data: {
            $first: {
              _id: '$parent_post_data._id',
              content_url: '$parent_post_data.content_url',
              media_url: '$parent_post_data.media_url',
              time: '$parent_post_data.time',
              post_type: '$parent_post_data.post_type',
              on_chain: '$parent_post_data.on_chain',
              likes: '$parent_post_data.likes',
              repost: '$parent_post_data.repost',
              author_address: '$parent_post_data.author_address',
              author_username: '$reply_user.profile.username',
              tags: '$parent_post_data.tags',
              comments: '$parent_post_data.comments',
              like_list: '$parent_post_data.like_list',
              reply_list: '$parent_post_data.reply_list',
              repost_list: '$parent_post_data.repost_list',
              view: '$parent_post_data.view',
              visibility: '$parent_post_data.visibility',
              user_data:{
                profile:{
                  name:'$parent_user_data.profile.name',
                  username:'$parent_user_data.profile.username',
                  image_url:'$parent_user_data.profile.image_url',
                }
              }
              
            }
          }
        }
      },
      {
        $project: {
          'content_url': 1,
          'author_address': 1,
          'author_username':1,
          'parent_post':1,
          'media_url': 1,
          'time': 1,
          'post_type': 1,
          'on_chain': 1,
          'likes': 1,
          'repost': 1,
          'tags': 1,
          'comments': 1,
          'like_list': 1,
          'reply_list': 1,
          'repost_list': 1,
          'view': 1,
          'visibility': 1,
          'user_data.profile.username': 1,
          'user_data.profile.name': 1,
          'user_data.profile.image_url': 1,
          'replied_posts': 1,
          'parent_post_data':1
        }
      }
  ]
    const foundPost= await posts.aggregate(d).toArray();


    if(query){
    return NextResponse.json({ success:true,h,foundPost});
  }
 
    // 
  }
    catch (error) {
      console.log(error);
    } 

    

  
    return NextResponse.json({ success:false,message:'unauthorized access'});

}


