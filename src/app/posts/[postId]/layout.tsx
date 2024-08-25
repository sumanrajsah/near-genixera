import axios from "axios";
import type { Metadata } from "next";
import { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
  params: {
    postId: string;
  };
}

const PostLayout: React.FC<LayoutProps> = async ({ children, params}) => {

    const userdata= await getUserData(`${params.postId}`)
  return (
    <div>
      {children}
    </div>
  );
};

async function getUserData(postId:string){
    const data = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/posts?id=${postId}`,{
        method:'GET'
    });
  const resMetadata = await data.json();
  return resMetadata;
}

export async function generateMetadata({ params }: { params: LayoutProps["params"] }) {

const resMetadata = await getUserData(`${params.postId}`)
let description;
if(resMetadata.foundPost[0]?.content_url){
  try{
const data = await fetch(`${process.env.NEXT_PUBLIC_API_IPFS_URL}/${(resMetadata.foundPost[0]?.content_url).split('/')[4]}`)
description = await data.json();
  }catch(e){
    console.log(e)
  }
}
else{
  description='post'
}
  return {
    title: `Post / ${resMetadata.foundPost[0]?.author_username}`,
    description: `${description?.content}`,
    openGraph: {
      title: `Post /  ${resMetadata.foundPost[0]?.author_username}`,
      description: `${description?.content}`,
      url: `${process.env.NEXT_PUBLIC_API_BASE_URL}/${params.postId}`,
      siteName: 'GenX',
      images: [
        {
          url: `${resMetadata?.foundPost[0]?.media_url}`,
          width: 800,
          height: 600,
          alt: 'Image description',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `Post /  ${resMetadata.foundPost[0]?.author_username}`,
      description: `${description?.content}`,
      creator: '@lpha_b',
      images: [
        {
          url:`${resMetadata?.foundPost[0]?.media_url}`,
          width: 800,
          height: 600,
          alt: 'Image description',
        },
      ],
    },
  };
}

export default PostLayout;
