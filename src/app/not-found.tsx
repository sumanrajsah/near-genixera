'use client'
import Image from "next/image";
import {useEffect} from "react";
import { useRouter } from "next/navigation";
import "./style.css";

export default function NotFound(){
    const router = useRouter();

    useEffect(() => {
        const redirectTimer = setTimeout(() => {
            router.push("/");
        }, 3000); // Redirect after 3 seconds

        // Clean up the timer to prevent memory leaks
        return () => clearTimeout(redirectTimer);
    }, [router]);

    return(
        <div className="not-found">
            <Image className="nf-logo" src={'/gslogo.png'} alt="genixera" width={1000} height={1000}/>
            <br/>
            <h1>Oops! Page Not Found</h1>
            <p>redirecting to Home page in 3 Seconds...</p>
        </div>
    );
};
