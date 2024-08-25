import { MongoClient, ServerApiVersion } from 'mongodb';
import { NextRequest, NextResponse } from 'next/server';

const uri = process.env.NEXT_PUBLIC_MONGODB_URI;
let client: MongoClient;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
if (uri) {
  client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  });
} else {
  console.error("MongoDB URI is undefined");
}

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const pageParam = parseInt(searchParams.get('page') || '1', 10);
  const limitParam = parseInt(searchParams.get('limit') || '5', 10);
  const who = searchParams.get('who');

  const page = Math.max(pageParam, 1); // Ensure positive and minimum 1
  const limit = Math.max(limitParam, 1);

  try {
    await client.connect();
    const database = client.db("gensquare");
    const postsCollection = database.collection("posts");
    const users = database.collection("users");

    // Calculate the number of documents to skip
    const skip = (page - 1) * limit;

    // Aggregation pipeline
    const pipeline = [
      {
        $lookup: {
          from: "users", // The collection to join with
          localField: "author_address", // The field from the posts collection
          foreignField: "_id", // The field from the users collection
          as: "user_data" // The output array field
        }
      },
      {
        $unwind: "$user_data" // Unwind the resulting array to de-normalize the user data
      },
      {
        $lookup: {
          from: "reposts", // The reposts collection to join with
          localField: "_id", // The field from the posts collection
          foreignField: "post_id", // The field from the reposts collection
          as: "repost_data" // The output array field
        }
      },
      {
        $unwind: {
          path: "$repost_data",
          preserveNullAndEmptyArrays: true // Keep the post even if there are no reposts
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
        $addFields: {
          timeToSort: { $ifNull: ["$repost_data.time", "$time"] }, // Use repost time if exists, otherwise use original time
          isRepost: { $cond: { if: { $ne: ["$repost_list", []] }, then: true, else: false } } // Add a field to indicate if it's a repost
        }
      },
      {
        $project: {
          'visibility': 1,
          'author_address': 1,
          'media_url': 1,
          'tags': 1,
          'on_chain': 1,
          'chain_data':1,
          'view': 1,
          'reply_list': 1,
          'content_url': 1,
          'repost_list': 1,
          'parent_post': 1,
          '_id': 1,
          'post_type': 1,
          'time': 1,
          'author_username': 1,
          'like_list': 1,
          'likes': 1,
          'repost': 1,
          'user_data.profile.name': 1,
          'user_data.profile.username': 1,
          'user_data.profile.image_url': 1,
          'isRepost': 1,
          'repost_data': 1,
          'parent_post_data': {
            '_id':1,
            'content_url': 1,
            'author_address': 1,
            'author_username': 1,
            'media_url': 1,
            'chain_data':1,
            'time': 1,
            'post_type': 1,
            'on_chain': 1,
            'view': 1,
            'tags': 1,
            'reply_list': 1,
            'repost_list': 1,
            'like_list': 1,
            'visibility': 1,
            'user_data': {
              'profile.name': "$parent_user_data.profile.name",
              'profile.username': "$parent_user_data.profile.username",
              'profile.image_url': "$parent_user_data.profile.image_url"
            }
          },
          'timeToSort': 1
        }
      },
      {
        $sort: { 'timeToSort': -1 } // Sort by the timeToSort field
      } ,     {
        $skip: skip // Skip the appropriate number of documents
      },
      {
        $limit: limit // Limit the number of returned documents
      },
    ];


    const fpipeline = [
      {
        '$match': {
          'wallet_address': `${who}`
        }
      },
      {
        '$unwind': {
          'path': '$profile.following_list',
          'preserveNullAndEmptyArrays': true
        }
      },
      {
        '$lookup': {
          'from': 'users',
          'localField': 'profile.following_list',
          'foreignField': 'profile.username',
          'as': 'following_user'
        }
      },
      {
        '$unwind': {
          'path': '$following_user',
          'preserveNullAndEmptyArrays': true
        }
      },
      {
        '$lookup': {
          'from': 'posts',
          'localField': 'profile.following_list',
          'foreignField': 'author_username',
          'as': 'following_post'
        }
      },
      {
        '$unwind': {
          'path': '$following_post',
          'preserveNullAndEmptyArrays': true
        }
      }, {
        $lookup: {
          from: "posts", // The collection to join with
          localField: "following_post.parent_post", // The field from the posts collection
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
        $skip: skip // Skip the appropriate number of documents
      },
      {
        $limit: limit // Limit the number of returned documents
      },
      {
        '$group': 
          {
          '_id': '$following_post._id',
          'content_url': { '$first': '$following_post.content_url' },
          'author_address': { '$first': '$following_post.author_address' },
          'author_username': { '$first': '$following_post.author_username' },
          'media_url': { '$first': '$following_post.media_url' },
          'time': { '$first': '$following_post.time' },
          'post_type': { '$first': '$following_post.post_type' },
          'parent_post': { '$first': '$following_post.parent_post' },
          'on_chain': { '$first': '$following_post.on_chain' },
          'chain_data': { '$first': '$following_post.chain_data' },
          'likes': { '$first': '$following_post.likes' },
          'repost': { '$first': '$following_post.repost' },
          'tags': { '$first': '$following_post.tags' },
          'comments': { '$first': '$following_post.comments' },
          'like_list': { '$first': '$following_post.like_list' },
          'reply_list': { '$first': '$following_post.reply_list' },
          'repost_list': { '$first': '$following_post.repost_list' },
          'view': { '$first': '$following_post.view' },
          'visibility': { '$first': '$following_post.visibility' },
          'user_data': {
            '$first': {
              'username': '$following_user.profile.username',
              'name': '$following_user.profile.name',
              'image_url': '$following_user.profile.image_url'
            }
          }, 'parent_post_data': {
            '$first': {
              '_id':'$parent_post_data._id',
              'content_url': '$parent_post_data.content_url',
              'author_address': '$parent_post_data.author_address',
              'author_username': '$parent_post_data.author_username',
              'media_url': '$parent_post_data.media_url',
              'time': '$parent_post_data.time',
              'post_type': '$parent_post_data.post_type',
              'on_chain': '$parent_post_data.on_chain',
              'chain_data': '$parent_post_data.chain_data',
              'likes': '$parent_post_data.likes',
              'repost': '$parent_post_data.repost',
              'tags': '$parent_post_data.tags',
              'comments': '$parent_post_data.comments',
              'like_list': '$parent_post_data.like_list',
              'reply_list': '$parent_post_data.reply_list',
              'repost_list': '$parent_post_data.repost_list',
              'view': '$parent_post_data.view',
              'visibility': '$parent_post_data.visibility',
              'user_data': {
                'username': '$parent_user_data.profile.username',
                'name': '$parent_user_data.profile.name',
                'image_url': '$parent_user_data.profile.image_url'
              }
            }
          }
        }
      
      }, {
        $sort: { time: -1 } // Sort posts by time in descending order
      },
      {
        '$project': {
          'content_url': 1,
          'author_address': 1,
          'author_username': 1,
          'media_url': 1,
          'time': 1,
          'post_type': 1,
          'on_chain': 1,
          'chain_data':1,
          'likes': 1,
          'repost': 1,
          'tags': 1,
          'comments': 1,
          'like_list': 1,
          'reply_list': 1,
          'repost_list': 1,
          'parent_post': 1,
          'view': 1,
          'visibility': 1,
          'user_data.profile.username': '$user_data.username',
          'user_data.profile.name': '$user_data.name',
          'user_data.profile.image_url': '$user_data.image_url',
          'parent_post_data': {
            '_id':1,
            'content_url': 1,
            'author_address': 1,
            'author_username': 1,
            'media_url': 1,
            'time': 1,
            'post_type': 1,
            'on_chain': 1,
            'chain_data':1,
            'likes': 1,
            'repost': 1,
            'tags': 1,
            'comments': 1,
            'like_list': 1,
            'reply_list': 1,
            'repost_list': 1,
            'view': 1,
            'visibility': 1,
            'user_data': { // Include parent post user data in user_data
              'profile.username': '$parent_post_data.user_data.username',
              'profile.name': '$parent_post_data.user_data.name',
              'profile.image_url': '$parent_post_data.user_data.image_url'
            }
          }
        }
      }
    ];


    const countPipeline = [
      {
        '$match': {
          'wallet_address': `${who}`
        }
      },
      {
        '$unwind': {
          'path': '$profile.following_list',
          'preserveNullAndEmptyArrays': true
        }
      },
      {
        '$lookup': {
          'from': 'posts',
          'localField': 'profile.following_list',
          'foreignField': 'author_username',
          'as': 'following_post'
        }
      },
      {
        '$unwind': {
          'path': '$following_post',
          'preserveNullAndEmptyArrays': true
        }
      },
      {
        '$group': {
          '_id': null,
          'total_posts': { '$sum': 1 } // Count all posts
        }
      }
    ];

    // Execute the aggregation pipeline
    if (!who) {
      const posts = await postsCollection.aggregate(pipeline).toArray();

      // Get the total count of documents in the collection
      const totalCount = await postsCollection.countDocuments();

      const totalPages = Math.ceil(totalCount / limit);

      return NextResponse.json({
        success: true,
        posts,
        metadata: {
          currentPage: page,
          totalPages,
          totalCount,
        },
      });
    }
    else if (who !== null) {
      const posts = await users.aggregate(fpipeline).toArray();
      const totalCount = await users.aggregate(countPipeline).toArray();

      const totalPages = Math.ceil(totalCount[0].total_posts / limit);
      return NextResponse.json({
        success: true,
        posts,
        metadata: {
          currentPage: page,
          totalPages,
          totalCount: totalCount[0].total_posts,
        },
      });
    }
    else {
      return NextResponse.json({
        success: false,
        message: 'something went wrong'

      });
    }

  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json({
      success: false,
      message: "Error fetching posts",
    });
  } finally {
    // Ensure the client is closed after the operation
  }
}
