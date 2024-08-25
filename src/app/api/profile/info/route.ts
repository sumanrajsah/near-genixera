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
  const type = searchParams.get('type');
  const pageParam = parseInt(searchParams.get('page') || '1', 10);
  const limitParam = parseInt(searchParams.get('limit') || '2', 10);
  let userData,profile,posts;
  try {
    await client.connect();
    const database = client.db("gensquare");
    const users = database.collection("users");
    const postsCollection = database.collection("posts");
    userData= await users.findOne({"profile.username":`${query}`});

    const page = Math.max(pageParam, 1); // Ensure positive and minimum 1
    const limit = Math.max(limitParam, 1);
    const skip = (page - 1) * limit;
if(query !=null){
    const postPipeline = [
        {
          '$match': {
            'profile.username': query
          }
        },
        {
          '$lookup': {
            'from': 'posts',
            'localField': 'profile.post_id',
            'foreignField': '_id',
            'as': 'post_data'
          }
        },
        {
          '$unwind': {
            'path': '$post_data',
            'preserveNullAndEmptyArrays': true
          }
        },
        {
          '$lookup': {
            'from': 'users',
            'localField': 'post_data.author_address',
            'foreignField': '_id',
            'as': 'post_user'
          }
        },
        {
          '$unwind': {
            'path': '$post_user',
            'preserveNullAndEmptyArrays': true
          }
        },
        {
          '$group': {
            '_id': '$_id',
            'post_data': {
              '$addToSet': {
                '_id': '$post_data._id',
                'content_url': '$post_data.content_url',
                'media_url': '$post_data.media_url',
                'time': '$post_data.time',
                'post_type': '$post_data.post_type',
                'on_chain': '$post_data.on_chain',
                'likes': '$post_data.likes',
                'repost': '$post_data.repost',
                'author_address': '$post_data.author_address',
                'author_username': '$post_user.profile.username',
                'tags': '$post_data.tags',
                'comments': '$post_data.comments',
                'like_list': '$post_data.like_list',
                'reply_list': '$post_data.reply_list',
                'repost_list': '$post_data.repost_list',
                'view': '$post_data.view',
                'visibility': '$post_data.visibility',
                'user_data': {
                  'profile': {
                    'name': '$post_user.profile.name',
                    'username': '$post_user.profile.username',
                    'image_url': '$post_user.profile.image_url'
                  }
                }
              }
            }
          }
        },
        {
          '$project': {
            'post_data': 1
          }
        },
        {
          '$unwind': '$post_data' // Flatten the post_data array to apply sorting
        },
        {
          '$sort': {
            'post_data.time': -1
          }
        },
        {
          '$skip': skip
        },
        {
          '$limit': limit
        },
        {
          '$group': {
            '_id': '$_id',
            'post_data': {
              '$push': '$post_data'
            }
          }
        }
      ];
      
      // Make sure to replace `query`, `skip`, and `limit` with their actual values before executing the pipeline.
      
      const replyPipeline = [
        {
          '$match': {
            'profile.username': query
          }
        },
        {
          '$lookup': {
            'from': 'posts',
            'localField': 'profile.reply_list',
            'foreignField': '_id',
            'as': 'post_data'
          }
        },
        {
          '$unwind': {
            'path': '$post_data',
            'preserveNullAndEmptyArrays': true
          }
        },
        {
          '$lookup': {
            'from': 'users',
            'localField': 'post_data.author_address',
            'foreignField': '_id',
            'as': 'post_user'
          }
        },
        {
          '$unwind': {
            'path': '$post_user',
            'preserveNullAndEmptyArrays': true
          }
        },
        {
          '$group': {
            '_id': '$_id',
            'post_data': {
              '$addToSet': {
                '_id': '$post_data._id',
                'content_url': '$post_data.content_url',
                'media_url': '$post_data.media_url',
                'time': '$post_data.time',
                'post_type': '$post_data.post_type',
                'on_chain': '$post_data.on_chain',
                'likes': '$post_data.likes',
                'repost': '$post_data.repost',
                'author_address': '$post_data.author_address',
                'author_username': '$post_user.profile.username',
                'tags': '$post_data.tags',
                'comments': '$post_data.comments',
                'like_list': '$post_data.like_list',
                'reply_list': '$post_data.reply_list',
                'repost_list': '$post_data.repost_list',
                'view': '$post_data.view',
                'visibility': '$post_data.visibility',
                'user_data': {
                  'profile': {
                    'name': '$post_user.profile.name',
                    'username': '$post_user.profile.username',
                    'image_url': '$post_user.profile.image_url'
                  }
                }
              }
            }
          }
        },
        {
          '$project': {
            'post_data': 1
          }
        },
        {
          '$unwind': '$post_data' // Flatten the post_data array to apply sorting
        },
        {
          '$sort': {
            'post_data.time': -1
          }
        },
        {
          '$skip': skip
        },
        {
          '$limit': limit
        },
        {
          '$group': {
            '_id': '$_id',
            'post_data': {
              '$push': '$post_data'
            }
          }
        }
      ];
      
      // Make sure to replace `query`, `skip`, and `limit` with their actual values before executing the pipeline.
      
    const likePipeline = [
      {
        '$match': {
          'profile.username': `${query}`
        }
      }, {
        '$lookup': {
          'from': 'posts', 
          'localField': 'profile.like_list', 
          'foreignField': '_id', 
          'as': 'post_data'
        }
      }, {
        '$unwind': {
          'path': '$post_data', 
          'preserveNullAndEmptyArrays': true
        }
      }, {
        '$lookup': {
          'from': 'users', 
          'localField': 'post_data.author_address', 
          'foreignField': '_id', 
          'as': 'post_user'
        }
      }, {
        '$unwind': {
          'path': '$post_user', 
          'preserveNullAndEmptyArrays': true
        }
      }, {
        '$group': {
          '_id': '$_id', 
          'post_data': {
            '$addToSet': {
              '_id': '$post_data._id', 
              'content_url': '$post_data.content_url', 
              'media_url': '$post_data.media_url', 
              'time': '$post_data.time', 
              'post_type': '$post_data.post_type', 
              'on_chain': '$post_data.on_chain', 
              'likes': '$post_data.likes', 
              'repost': '$post_data.repost', 
              'author_address': '$post_data.author_address', 
              'author_username': '$post_user.profile.username', 
              'tags': '$post_data.tags', 
              'comments': '$post_data.comments', 
              'like_list': '$post_data.like_list', 
              'reply_list': '$post_data.reply_list', 
              'repost_list': '$post_data.repost_list', 
              'view': '$post_data.view', 
              'visibility': '$post_data.visibility', 
              'user_data': {
                'profile': {
                  'name': '$post_user.profile.name', 
                  'username': '$post_user.profile.username', 
                  'image_url': '$post_user.profile.image_url'
                }
              }
            }
          },}
      }, {
        '$project': {
          'post_data':1,
        }
      } ,{
        '$unwind': '$post_data' // Flatten the post_data array to apply sorting
      },
      {
        '$sort': {
          'post_data.time': -1
        }
      },
      {
        '$skip': skip
      },
      {
        '$limit': limit
      },
      {
        '$group': {
          '_id': '$_id',
          'post_data': {
            '$push': '$post_data'
          }
        }
      }
    ];
    const repostPipeline = [

      {
        '$match': {
          'profile.username': `${query}`
        }
      }, {
        '$lookup': {
          'from': 'posts', 
          'localField': 'profile.repost_list', 
          'foreignField': '_id', 
          'as': 'post_data'
        }
      }, {
        '$unwind': {
          'path': '$post_data', 
          'preserveNullAndEmptyArrays': true
        }
      }, {
        '$lookup': {
          'from': 'users', 
          'localField': 'post_data.author_address', 
          'foreignField': '_id', 
          'as': 'post_user'
        }
      }, {
        '$unwind': {
          'path': '$post_user', 
          'preserveNullAndEmptyArrays': true
        }
      }, {
        '$group': {
          '_id': '$_id', 
          'post_data': {
            '$addToSet': {
              '_id': '$post_data._id', 
              'content_url': '$post_data.content_url', 
              'media_url': '$post_data.media_url', 
              'time': '$post_data.time', 
              'post_type': '$post_data.post_type', 
              'on_chain': '$post_data.on_chain', 
              'likes': '$post_data.likes', 
              'repost': '$post_data.repost', 
              'author_address': '$post_data.author_address', 
              'author_username': '$post_user.profile.username', 
              'tags': '$post_data.tags', 
              'comments': '$post_data.comments', 
              'like_list': '$post_data.like_list', 
              'reply_list': '$post_data.reply_list', 
              'repost_list': '$post_data.repost_list', 
              'view': '$post_data.view', 
              'visibility': '$post_data.visibility', 
              'user_data': {
                'profile': {
                  'name': '$post_user.profile.name', 
                  'username': '$post_user.profile.username', 
                  'image_url': '$post_user.profile.image_url'
                }
              }
            }
          },}
      }, {
        '$project': {
          'post_data':1,
        }
      }, {
        '$unwind': '$post_data' // Flatten the post_data array to apply sorting
      },
      {
        '$sort': {
          'post_data.time': -1
        }
      },
      {
        '$skip': skip
      },
      {
        '$limit': limit
      },
      {
        '$group': {
          '_id': '$_id',
          'post_data': {
            '$push': '$post_data'
          }
        }
      }
    ];
    
    
      if(type === 'Posts'){
    posts = await users.aggregate(postPipeline).toArray();
      const totalCount = userData?.profile.post_id?.length;
      const totalPages = Math.ceil(totalCount / limit);
      if(totalCount>0){
    return NextResponse.json({ success:true,post:posts,totalCount:totalCount,totalPages:totalPages,currentPage:page});}
    }
    else  if(type === 'Replies'){
    posts = await users.aggregate(replyPipeline).toArray();
      const totalCount = userData?.profile.reply_list?.length;
      const totalPages = Math.ceil(totalCount / limit);
      if(totalCount>0){
    return NextResponse.json({ success:true,post:posts,totalCount:totalCount,totalPages:totalPages,currentPage:page});}
    }
    else  if(type === 'Likes'){
    posts = await users.aggregate(likePipeline).toArray();
      const totalCount = userData?.profile.like_list?.length;
      const totalPages = Math.ceil(totalCount / limit);
      if(totalCount>0){
    return NextResponse.json({ success:true,post:posts,totalCount:totalCount,totalPages:totalPages,currentPage:page});}
    }
    else  if(type === 'Repost'){
    posts = await users.aggregate(repostPipeline).toArray();
      const totalCount = userData?.profile.repost_list?.length;
      const totalPages = Math.ceil(totalCount / limit);
      if(totalCount>0){
    return NextResponse.json({ success:true,post:posts,totalCount:totalCount,totalPages:totalPages,currentPage:page});}
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
