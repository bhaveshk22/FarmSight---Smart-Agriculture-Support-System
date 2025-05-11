import BackgroundCarousel from "../Component/BackgroundCarousel";
import Link from "next/link";

import Navbar from "../Component/Navbar";
import DynamicCard from "../Component/DynamicCard";

export default function Home() {
    return (
        <div className="relative">
            
            <BackgroundCarousel />

            {/* <div className="absolute top-0 left-0 z-[-10] w-screen h-screen overflow-hidden">
                <img
                    src="slider_1.png"
                    className="absolute h-full w-full max-w-none object-cover object-left-top"
                    alt="Background image"
                />
            </div> */}

            <div className="relative z-2">
                <Navbar />
            </div>

            <div className="h-[45vh]"></div>

            <main className="px-[6vw] flex justify-between relative z-2">
                <div className="LeftContainer">
                    <div className="px-4 py-2 inline w-auto rounded-full bg-white/10 backdrop-blur-md text-white font-medium text-sm border border-white/20 shadow-md">
                        Sustainable Farming Tech
                    </div>
                    <div className="mt-5 text-5xl text-white w-[35vw]">
                        <h2>Bringing Innovation To your Farming Journey.</h2>
                    </div>
                    <div className="text-white mt-5 w-[35vw] opacity-90">
                        From precision agriculture to sustainable practises, we help you grow more efficiently and profitably. Join us in transforming the way you farm!
                    </div>
                    <div className="mt-7">
                        <Link href='/login'>
                            <button type="button" className="text-black bg-[#c7e747] font-medium rounded-full text-sm pl-5 pr-1 py-1 text-center me-2 mb-2 cursor-pointer hover:brightness-90 transition duration-300 flex items-center gap-2">
                                <span className="text-md">Get Started</span>
                                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-black text-white">
                                    <img className='invert w-6' src="right_arrow.png" alt="RightArrow" />
                                </span>
                            </button>
                        </Link>
                    </div>
                </div>

                <div className="RightContainer pt-12">
                    
                    <DynamicCard />

                </div>
            </main >
        </div >
    );
}
