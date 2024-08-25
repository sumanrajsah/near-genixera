import axios from "axios";
import type { Metadata } from "next";
import { ReactNode } from "react";
import { usersProfile } from "../components/interface";

interface LayoutProps {
  children: ReactNode;
  params: {
    username: string;
  };
}

const UsernameLayout: React.FC<LayoutProps> = async ({ children, params}) => {

    const userdata= await getUserData(`${params.username}`)
  return (
    <div>
      {children}
    </div>
  );
};

async function getUserData(username:string){
    const data = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/profile?username=${username}`,{
        method:'GET'
    });
  const resMetadata = await data.json();
  return resMetadata;
}

export async function generateMetadata({ params }: { params: LayoutProps["params"] }) {

const resMetadata = await getUserData(`${params.username}`)
  return {
    title: `Profile / ${params.username}`,
    description: `${resMetadata.userData?.Bio}`,
    openGraph: {
      title: `Profile / ${params.username}`,
      description: `${resMetadata.userData?.Bio}`,
      url: `${process.env.NEXT_PUBLIC_API_BASE_URL}/${params.username}`,
      siteName: 'GenX',
      images: [
        {
          url: `${resMetadata.userData?.image_url}`,
          width: 800,
          height: 600,
          alt: 'Image description',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `Profile / ${params.username}`,
      description: `${resMetadata.userData?.Bio}`,
      creator: '@lpha_b',
      images: [
        {
          url:`${resMetadata.userData?.image_url}`,
          width: 800,
          height: 600,
          alt: 'Image description',
        },
      ],
    },
  };
}

export default UsernameLayout;
