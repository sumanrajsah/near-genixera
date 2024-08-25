'use client'
import { useEffect, useState } from "react";
import './search.css'
import { ExploreIcon1, Search } from "../svg";
import axios from "axios";
import Image from "next/image";
import { useRouter } from "next/navigation";
 

type user={
  name:string;
  _id:string;
  image_url:string;
}

export const SearchBar = () => {

  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<user[]>([]);
const router = useRouter();

async function search(query:string){
  try {
  const response= await  axios.get(`/api/search?username=${query}`)
      
        // console.log('Response:', response.data.success);
        if(response.data.success){
          setSearchResults(response.data.users);
        }

      
  }
  catch (error) {
    console.log(error);
  }
}

const handleInputChange = (e:any) => {
  setQuery(e.target.value);
  if(e.target.value){
  search(e.target.value);
  }else{
    setSearchResults([])
  }
}



async function seeProfile(username:any){
  router.push(`/${username}`);
    }
  
  return (
<div className="search-body">
    <div className="search-box-cont">
      <div className="s-svg">
        <ExploreIcon1/>
      </div>
        <input placeholder="search user" className="search-input"onChange={handleInputChange} value={query}  />
    </div>
        {searchResults.length > 0 && (
    <div className="result-cont">
        <div>
          {searchResults.map((result, index) => (
            <div className="result-box" key={index} onClick={(e)=>seeProfile(result?._id)}>
                              <div className="result-img-cont">
                              {result.image_url?<Image className="result-img" src={`${process.env.NEXT_PUBLIC_API_IPFS_URL}/${result?.image_url.split('/')[4]}`} height={200} width={200} alt={result?._id}/>
                    :<Image className="result-img" src={'/gslogo.png'} height={200} width={200} alt={result?._id}/>}
                </div>
              <h4>{(result?.name).slice(0,20)}{(result?.name).length>20?'...':''} <br/> <span>{(result?._id).slice(0,20)}{(result?._id).length>20?'...':''}</span></h4>
            </div>
          ))}
        </div>
      </div>
      )}
    </div>

  );
};

export default SearchBar;