"use client"

import { Search, ChevronDown, Bell, Filter, Download, ChevronRight, Calendar } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useEffect, useState } from "react"
import { fetchCrops } from "@/utils/api"
import WeatherDialog from '@/components/WeatherDialog';
import CropDataDashboard from "@/components/chart"


interface Crop {
  id: string;
  crop_name: string;
  crop_year: number;
  season: string;
  area: number;
  annual_rainfall: number;
  fertilizer: number;
  pesticide: number;
  predicted_yield?: number;
  created_at: string;
  updated_at?: string | null;
  tags: string[];
}
export default function Dashboard() {
  const [crops, setCrops] = useState<Crop[]>([]);
  useEffect(() => {
    (async () => {
      const data = await fetchCrops()
      console.log(data, "data");
      setCrops(data.crops)
    })()

  }, []);



  // weather dialog box
  const [weatherOpen, setWeatherOpen] = useState(false);

  const [isCollapsed, setIsCollapsed] = useState(true);
  const handleWeatherClick = () => {
    setWeatherOpen(true);
  };

  return (

    <div className="flex h-screen bg-gray-50">



      {/* Sidebar */}
      <div className={`border-r bg-white transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
        {/* Header with Hamburger */}
        <div className="p-4 border-b flex items-center justify-between">
          {!isCollapsed && (
            <div>
              <h1 className="font-bold text-lg">Smart Kisaan</h1>
              <p className="text-xs text-gray-500">For Farmers</p>
            </div>
          )}
          <button onClick={() => setIsCollapsed(!isCollapsed)} className="text-gray-700 ml-3 hover:text-black">
            {/* Hamburger Icon */}
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-menu">
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>

        <ScrollArea className="h-[calc(100vh-100px)]">
          <div className="p-4">
            <div className="mb-6">
              {!isCollapsed && <p className="text-xs font-semibold text-gray-500 mb-2">GENERAL</p>}
              <div className="space-y-1">
                <a href="/">
                  <Button
                    variant="ghost"
                    className="w-full cursor-pointer justify-start bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800"
                  >
                    <span className="mr-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mr-2"
                      >
                        <rect width="18" height="18" x="3" y="3" rx="2" />
                        <path d="M9 9h.01" />
                        <path d="M15 9h.01" />
                        <path d="M9 15h.01" />
                        <path d="M15 15h.01" />
                      </svg>
                    </span>
                    {!isCollapsed && "Dashboard"}
                  </Button>
                </a>

                <a href="/crops/addnewcrop">
                  <Button variant="ghost" className="w-full cursor-pointer justify-start">
                    <span className="mr-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mr-2"
                      >
                        <path d="M21 7v6h-6" />
                        <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7" />
                      </svg>
                    </span>
                    {!isCollapsed && "Add New Crop"}
                  </Button>
                </a>

                <Button onClick={() => setWeatherOpen(true)} variant="ghost" className="w-full cursor-pointer justify-start">
                  <span className="mr-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mr-2"
                    >
                      <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
                    </svg>
                  </span>
                  {!isCollapsed && "Weather Forecast"}
                </Button>
                <WeatherDialog open={weatherOpen} onOpenChange={setWeatherOpen} />
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>


      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white border-b px-6 py-3 flex items-center justify-between">
          <div className="flex justify-center items-center">
            {isCollapsed && (
              <div>
                <h1 className="font-bold text-lg">Smart Kisaan</h1>
                <p className="text-xs text-gray-500">For Farmers</p>
              </div>
            )}
          </div><div></div>
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder.svg?height=32&width=32" alt="Profile" />
                    <AvatarFallback>BY</AvatarFallback>
                  </Avatar>
                  <div className="text-left">
                    <p className="text-sm font-medium">Bablu Yadav</p>
                    <p className="text-xs text-gray-500">Kisaan</p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuItem>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="p-6">

        <CropDataDashboard />
        </main>
      </div >
    </div >
  )
}
