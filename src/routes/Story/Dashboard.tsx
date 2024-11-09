import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Book,
  DollarSign,
  Eye,
  ThumbsUp,
  MessageSquare,
  Feather,
  TrendingUp,
} from "lucide-react";
import { ReactNode, useEffect } from "react";

const Dashboard = () => {
  useEffect(() => {
    alert("This is a demo dashboard. Data is static and not real-time.");
  }, []);

  // Demo data
  const salesData = [
    { month: "Jan", sales: 1200 },
    { month: "Feb", sales: 1900 },
    { month: "Mar", sales: 1500 },
    { month: "Apr", sales: 2200 },
    { month: "May", sales: 2800 },
    { month: "Jun", sales: 3200 },
  ];

  const genreData = [
    { name: "Fantasy", value: 400 },
    { name: "Romance", value: 300 },
    { name: "Sci-Fi", value: 200 },
    { name: "Mystery", value: 100 },
  ];

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];
  interface StatCardProps {
    icon: ReactNode; // Icon can be any valid React node (JSX)
    title: string; // Title should be a string
    value: number | string; // Value can be either number or string
    trend: number; // Trend is a number (positive/negative for up/down arrow)
  }

  const StatCard: React.FC<StatCardProps> = ({ icon, title, value, trend }) => (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {icon}
          <h3 className="ml-2 text-lg font-semibold">{title}</h3>
        </div>
        <span
          className={`text-sm ${
            trend >= 0 ? "text-green-500" : "text-red-500"
          }`}
        >
          {trend >= 0 ? "↑" : "↓"} {Math.abs(trend)}%
        </span>
      </div>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </div>
  );

  return (
    <div className="p-6 bg-amber-50 min-h-screen">
      <h1 className="text-3xl font-bold text-amber-800 mb-6">
        Author Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={<Book size={24} />}
          title="Total Books"
          value="12"
          trend={8}
        />
        <StatCard
          icon={<DollarSign size={24} />}
          title="Monthly Revenue"
          value="$3,200"
          trend={15}
        />
        <StatCard
          icon={<Eye size={24} />}
          title="Total Views"
          value="45.2K"
          trend={5}
        />
        <StatCard
          icon={<ThumbsUp size={24} />}
          title="Likes"
          value="12.8K"
          trend={-3}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Monthly Sales</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="sales" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Genre Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={genreData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
              >
                {genreData.map((_entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Recent Feedback</h2>
          <ul className="space-y-2">
            <li className="flex items-center">
              <MessageSquare size={18} className="mr-2" />
              <span>"Loved the character development!" - Reader123</span>
            </li>
            <li className="flex items-center">
              <MessageSquare size={18} className="mr-2" />
              <span>"Couldn't put it down!" - BookWorm42</span>
            </li>
            <li className="flex items-center">
              <MessageSquare size={18} className="mr-2" />
              <span>"Exciting plot twists!" - NovelFan99</span>
            </li>
          </ul>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Writing Progress</h2>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span>Current Novel</span>
              <span className="font-semibold">65% Complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-amber-600 h-2.5 rounded-full"
                style={{ width: "65%" }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mt-2">42,000 / 65,000 words</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-2">
            <button className="w-full bg-amber-600 text-white py-2 px-4 rounded hover:bg-amber-700 transition-colors flex items-center justify-center">
              <Feather size={18} className="mr-2" />
              Continue Writing
            </button>
            <button className="w-full bg-amber-600 text-white py-2 px-4 rounded hover:bg-amber-700 transition-colors flex items-center justify-center">
              <TrendingUp size={18} className="mr-2" />
              View Analytics
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
