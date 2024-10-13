import { useEffect, useState } from "react";
import NextTopLoader from "nextjs-toploader";
import Image from "next/image";
import './loader.css'

export const Loader = () => {


  return (
<div className="loader">
<div className="loader-u"><div className="loader-logo-cont">
    <Image className="loader-logo" src={'/gslogo.png'} alt="genixera" width={1000} height={1000} />
  </div><br/>
<h1>Genix Era</h1>
</div>
</div>
     

  );
};

export default Loader;