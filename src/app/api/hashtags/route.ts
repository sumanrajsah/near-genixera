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
  let h,postsAll, add,token;
  try {
    const postData = await req.json();
    // console.log(postData)
    await client.connect();
    const database = client.db("gensquare");
    const posts = database.collection("posts");
    h= await posts.countDocuments();
    postsAll= await posts.find({tags:{ $in: ['#'+postData.tags] } }).toArray();
    const AllPost:any =postsAll;
    // await postsAll.forEach(doc => {
    //     // console.log(doc);
    //     AllPost.push(doc);
    //   });
    return NextResponse.json({ success:true,h,AllPost});
    // 
  }
    catch (error) {
      console.log(error);
    } 
    finally {
      await client.close();
    }
    
    

  
    return NextResponse.json({ success:false,message:'unauthorized access'});

}


export async function GET(req:NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const query = searchParams.get('tag');
  const pageParam = parseInt(searchParams.get('page') || '1', 10);
  const limitParam = parseInt(searchParams.get('limit') || '2', 10);
  let AllTags,TagList, post;
  try {
    // const postData = await req.json();
    await client.connect();
    const database = client.db("gensquare");
    const users = database.collection("users");
    const posts = database.collection("posts");

    const page = Math.max(pageParam, 1); // Ensure positive and minimum 1
    const limit = Math.max(limitParam, 1);
    const skip = (page - 1) * limit;
  
    if(query){
      const aggregate = [
        {
          '$unwind': '$tags'
        },
        {
          '$match': {
            'tags': {
              '$in': [`#${query}`]
            }
          }
        },
        {
          '$lookup': {
            'from': 'users',
            'localField': 'author_address',
            'foreignField': '_id',
            'as': 'user_data'
          }
        },
        {
          '$unwind': {
            'path': '$user_data',
            'preserveNullAndEmptyArrays': true
          }
        },
        {
          '$group': {
            '_id': '$_id',
            'content_url': { '$first': '$content_url' },
            'author_address': { '$first': '$author_address' },
            'author_username': { '$first': '$author_username' },
            'media_url': { '$first': '$media_url' },
            'time': { '$first': '$time' },
            'post_type': { '$first': '$post_type' },
            'on_chain': { '$first': '$on_chain' },
            'likes': { '$first': '$likes' },
            'repost': { '$first': '$repost' },
            'tags': { '$first': '$tags' },
            'comments': { '$first': '$comments' },
            'like_list': { '$first': '$like_list' },
            'reply_list': { '$first': '$reply_list' },
            'repost_list': { '$first': '$repost_list' },
            'view': { '$first': '$view' },
            'visibility': { '$first': '$visibility' },
            'user_data': {
              '$first': {
                'profile': {
                  'name': '$user_data.profile.name',
                  'username': '$user_data.profile.username',
                  'image_url': '$user_data.profile.image_url'
                }
              }
            }
          }
        },
        {
          '$sort': { 'time': -1 } // Sort posts by time in descending order
        },
        {
          '$skip': skip // Skip the appropriate number of documents
        },
        {
          '$limit': limit // Limit the number of returned documents
        }
      ];
      
      // Make sure to replace `query`, `skip`, and `limit` with their actual values before executing the pipeline.
      
  
      post =  await posts.aggregate(aggregate).toArray();
      const totalCount = await posts.countDocuments({
        tags: `#${query}`
      });
      const totalPages = Math.ceil(totalCount / limit);
  
     
    return NextResponse.json({ success:true,post,totalCount:totalCount,totalPages:totalPages,currentPage:page});
    }
    AllTags= await posts.aggregate([
      {$unwind:"$tags"},
      {$group:{_id:"$tags",count:{$sum:1}}},
      { $sort: { count: -1 } }
    ]).toArray();
    TagList=AllTags.map(group=>group._id);
   
  return NextResponse.json({ success:true,AllTags,TagList});
    // 
  }
    catch (error) {
      console.log(error);
    } 

    

  
    return NextResponse.json({ success:false,message:'unauthorized access'});

}

