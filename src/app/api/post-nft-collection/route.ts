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
    const query = searchParams.get('id');
  try {
    await client.connect();
    const database = client.db("gensquare");
    const postsCollection = database.collection("posts");
    const postsNftCollection = database.collection("post-nft-collection");
    const users = database.collection("users");

    const pipeline=[
        {
            // Match the user based on wallet address or _id
            $match: {
              wallet_address: query // Replace with the desired wallet address
            }
          },
          {
            // Unwind the post_nft_collections array to look up each contract address
            $unwind: "$profile.post_nft_collections"
          },
          {
            // Lookup the post NFT collection details from the postNftColMetadata collection
            $lookup: {
              from: "post-nft-collection", // Collection where post NFT collections are stored
              localField: "profile.post_nft_collections", // Field from user document
              foreignField: "contract_address",   // Field in postNftColMetadata
              as: "postNftCollectionDetails" // Name for the resulting array
            }
          },
          {
            // Unwind postNftCollectionDetails array to get individual details
            $unwind: "$postNftCollectionDetails"
          },
          {
            // Group by the user ID to collect all post NFT collections in a single array
            $group: {
              _id: "$_id",
              wallet_address: { $first: "$wallet_address" },
              post_nft_collections: { $push: "$postNftCollectionDetails" }
            }
          }
    ]

   
 
      const postsNftCol = await users.aggregate(pipeline).toArray();



      return NextResponse.json({
        success: true,
        postsNftCol,
      });

    

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
