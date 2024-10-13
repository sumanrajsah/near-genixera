import { useEffect, useState } from "react";
import NextTopLoader from "nextjs-toploader";
import Image from "next/image";
import './verify.css'
import { Connect } from "./sidebar/connect";

export const Verify = () => {


  return (
<div className="check-h"> <div className="check-logo-cont">
    <Image className="check-logo" src={'/gslogo.png'} alt="genixera" width={1000} height={1000} /><br/><h1>GenX</h1>
  </div>
  <div className="verify-btn-cont"><Connect/></div>
  </div>
     

  );
};

export default Verify;