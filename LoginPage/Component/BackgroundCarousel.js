"use client"
import { useState, useEffect } from 'react';

export default function BackgroundCarousel() {
    // Array of background images to cycle through
    const backgroundImages = [
        "slider_1.png",
        "slider_2.png",
        "slider_3.png"
    ];

    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        // Set up interval to change the image every 5 seconds
        const intervalId = setInterval(() => {
            setCurrentImageIndex((prevIndex) =>
                (prevIndex + 1) % backgroundImages.length
            );
        }, 6000);

        // Clean up interval on component unmount
        return () => clearInterval(intervalId);
    }, []);

    return (
        <div className="absolute inset-0 min-h-screen w-full">
            {/* Background images - we render all but only show the current one */}
            {backgroundImages.map((image, index) => (
                
                <div key={image} className={`absolute inset-0 h-full w-full transition-opacity duration-1000 ease-in-out -z-10 ${index === currentImageIndex ? 'opacity-100' : 'opacity-0'}`}>

                    <img src={`/${image}`} alt={`Background ${index + 1}`} className="h-full w-full object-cover object-left-top "/>
                
                </div>
            ))}

            
        </div>
    );
}