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
  const type= searchParams.get('type');
  const query= searchParams.get('query');
  const username = searchParams.get('username');
  
  let h,users,tags,post;
  try {
    await client.connect();
    const database = client.db("gensquare");
    const posts = database.collection("posts");
    const usersColl = database.collection("users");
    h= await posts.countDocuments();
    const tagAgg=
        [
            {
              $unwind: '$tags'
            },
            {
              $match: {
                tags: {
                  $regex: query?.split(' ').join('|'),
                  $options: 'i'
                }
              }
            },
            {
              $group: {
                _id: '$tags',
                count: { $sum: 1 }
              }
            },
            {
                $limit: 50
              }
          ]

    const userAgg= [
        {
          $unwind: '$profile.username'
        },
        {
          $match: {
            "profile.username": {
              $regex: `${username}`,
              $options: 'i'
            }
          }
        },
        {
          $addFields: {
            image: '$profile.image_url',
            name:'$profile.name'
          }
        },
        {
          $group: {
            _id: '$profile.username',
            name:{$first:'$name'},
            image_url: { $first: '$image' }

          }
        },
        {
            $limit: 10
          }
      ]      
    const peopleAgg= [
        {
          $unwind: '$profile.username'
        },
        {
          $match: {
            "profile.username": {
              $regex: `${query}`,
              $options: 'i'
            }
          }
        },
        {
          $addFields: {
            image: '$profile.image_url',
            name:'$profile.name',
            bio:'$profile.Bio'
          }
        },
        {
          $group: {
            _id: '$profile.username',
            name:{$first:'$name'},
            image_url: { $first: '$image' },
            bio:{$first:'$bio'}

          }
        },
        {
            $limit: 20
          }
      ]  
      
      const postAgg=[
        {
          $match: {
              $or: [
                  { tags: { $regex: `${query}`, $options: 'i' } },
                  { author_username: { $regex: `${query}`, $options: 'i' } }
                ]
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
            }
          }
        },
        {
          $project: {
            'content_url': 1,
            'author_address': 1,
            'author_username':1,
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
          }
        },
        {
            $limit: 50
          }
    ]
          if(type==='Tags'){
    tags= await posts.aggregate(tagAgg).toArray();
    return NextResponse.json({ success:true,h,tags});
  }
          else if(type==='People'){
    users= await usersColl.aggregate(peopleAgg).toArray();
    return NextResponse.json({ success:true,h,users});
  }
          else if(type==='Posts'){
    post= await posts.aggregate(postAgg).toArray();
    return NextResponse.json({ success:true,h,post});
  }
          else if(username!==null){
    users= await usersColl.aggregate(userAgg).toArray();
    return NextResponse.json({ success:true,h,users});
  }
 
    // 
  }
    catch (error) {
      console.log(error);
    } 

    

  
    return NextResponse.json({ success:false,message:'unauthorized access'});

}


