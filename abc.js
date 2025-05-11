import React from "react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

const COLORS = ["#FF8C00", "#4CAF50", "#2196F3", "#FFC107"];

const pieData = [
  { name: "Rice", value: 20 },
  { name: "Vegetables", value: 65 },
  { name: "Fruit", value: 10 },
  { name: "Flower", value: 5 },
];

const barData = [
  { name: "Jan", growth: 3 },
  { name: "Feb", growth: 4 },
  { name: "Mar", growth: 5 },
  { name: "Apr", growth: 6.5 },
  { name: "May", growth: 8.5 },
  { name: "Jun", growth: 6 },
];

function App() {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white p-4 shadow">
        <h1 className="text-xl font-bold mb-4">🌾 Agrifuture</h1>
        <nav className="space-y-2">
          <div className="font-semibold text-green-700">General</div>
          <ul className="space-y-1">
            <li className="text-sm text-gray-700">📊 Dashboard</li>
            <li className="text-sm text-gray-700">💰 Financial</li>
            <li className="text-sm text-gray-700">☀️ Weather Forecast</li>
          </ul>
          <div className="font-semibold mt-4 text-green-700">Management</div>
          <ul className="space-y-1">
            <li>🌾 Field</li>
            <li>💧 Water Usage</li>
            <li>📅 Harvest Plan</li>
            <li>🦠 Pest & Disease</li>
            <li>🌱 Soil & Crop</li>
            <li>⚙️ Equipment</li>
          </ul>
        </nav>
      </aside>

      {/* Main Dashboard */}
      <main className="flex-1 p-6 overflow-y-scroll">
        <div className="flex justify-between items-center mb-6">
          <input className="p-2 border rounded w-1/3" placeholder="Search Data..." />
          <div className="flex items-center gap-4">
            <button className="bg-green-600 text-white px-4 py-2 rounded">Download</button>
            <div className="rounded-full bg-gray-300 w-10 h-10" />
          </div>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-3 gap-6">
          {/* Harvest Growth */}
          <div className="bg-white p-4 rounded shadow col-span-1">
            <h2 className="font-bold mb-2">Harvest Growth</h2>
            <BarChart width={300} height={200} data={barData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="growth" fill="#4CAF50" />
            </BarChart>
          </div>

          {/* Seed Stock */}
          <div className="bg-white p-4 rounded shadow col-span-1">
            <h2 className="font-bold mb-2">Plant Seeds Stock</h2>
            <ul className="text-sm space-y-2">
              <li>Tomato - <span className="text-red-600">5</span> seeds</li>
              <li>Rice - 20 seeds</li>
              <li>Cabbage - 50 seeds</li>
              <li>Chilli - 120 seeds</li>
              <li>Potato - 205 seeds</li>
            </ul>
          </div>

          {/* Total Harvest */}
          <div className="bg-white p-4 rounded shadow col-span-1">
            <h2 className="font-bold mb-2">Total Harvest</h2>
            <PieChart width={200} height={200}>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={60}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
            <p className="text-center mt-2 font-semibold">1,456 Kg Total</p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
