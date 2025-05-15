'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const contents = [
  {
    title: "Our Mission",
    description: "To empower farmers with innovative tools and technology that enhance productivity, sustainability, and efficiency, shaping the future of farming."
  },
  {
    title: "Vision",
    description: "Our vision is to revolutionize farming with AI-driven solutions that boost efficiency, empower farmers, and ensure a sustainable future for agriculture."
  },
  {
    title: "About Us",
    description: "We are a team of final-year students dedicated to transforming agriculture through AI and platforms built around the real needs of today’s farmers."
  }
];

export default function DynamicCard() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex(prev => (prev + 1) % contents.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handlePrev = () => {
    setIndex(prev => (prev - 1 + contents.length) % contents.length);
  };

  const handleNext = () => {
    setIndex(prev => (prev + 1) % contents.length);
  };

  const { title, description, link } = contents[index];

  return (
    <div className="flex flex-col gap-2">
      {/* Arrows */}
      <div className="w-[20vw] h-[5vh] flex gap-2 justify-end ">
        <img className="invert w-6 cursor-pointer" src="left_arrow.png" alt="LeftArrow" onClick={handlePrev} />
        <img className="invert w-6 cursor-pointer" src="right_arrow.png" alt="RightArrow" onClick={handleNext} />
      </div>

      {/* Card */}
      <div className="bg-white/10 w-[20vw] h-[28vh] backdrop-blur-xs text-white rounded-xl pt-4 pl-4 pr-5 border border-white/20 transition duration-500 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl leading-none">•</span>
            <h2 className="text-xl">{title}</h2>
          </div>
          <p className="text-sm leading-relaxed text-white/80">
            {description}
          </p>
        </div>

        {/* Learn More */}
        <Link href='/about'>
          <div className="flex items-center gap-1 group cursor-pointer w-fit mb-3">
            <span className="text-sm underline underline-offset-4 group-hover:brightness-90 transition">
              Learn More
            </span>
            <span className="text-lg group-hover:translate-x-1 transition">
              <img className="invert w-6" src="right_arrow.png" alt="RightArrow" />
            </span>
          </div>
        </Link>
      </div>
    </div>
  );
}
