import React from 'react'
import Link from "next/link"

const Navbar = () => {
    return (
        <div>
            <nav className='h-[9vh] w-full'>
                <div className='mx-auto flex justify-between items-center p-10 h-full w-full border-white'>
                    <div className='flex gap-20'>
                    <div>
                        <a href="/">
                            <span className='mt-3 text-xl text-white hover:text-[#c7e747]'>FarmSight</span>
                        </a>
                    </div>
                    <div className='text-white'>
                        <div>+918136506708</div>
                        <div>support@farmsight.com</div>
                    </div>
                    </div>
                    {/* <div className="flex gap-10 text-white">
                        <Link href="/">
                            <button className="cursor-pointer hover:underline">Home</button>
                        </Link>
                        <Link href="/about">
                            <button className="cursor-pointer hover:underline">About Us</button>
                        </Link>
                        <Link href="/blog">
                            <button className="cursor-pointer hover:underline">Blog</button>
                        </Link>
                        <Link href="/community">
                            <button className="cursor-pointer hover:underline">Community</button>
                        </Link>

                    </div> */}
                    <div className="flex text-black gap-5 items-center">
                        <Link href='/login'>
                            <button type="button" className="text-white cursor-pointer hover:underline">SignUp</button>
                        </Link>
                        <Link href='/login'>
                            <button type="button" className="text-black bg-[#c7e747] font-medium rounded-full text-sm px-5 py-2.5 text-center me-2 mb-2 cursor-pointer hover:brightness-90 transition duration-300 flex items-center gap-2 ">
                                <span className="w-2 h-2 bg-black rounded-full"></span>
                                <span>Log in</span>
                            </button>
                        </Link>
                    </div>
                </div>
            </nav>
        </div>
    )
}

export default Navbar
