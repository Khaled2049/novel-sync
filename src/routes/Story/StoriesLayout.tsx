import { Outlet, useLocation, Link } from "react-router-dom";

import {
  Book,
  ListTodo,
  PenTool,
  Trophy,
  Award,
  Calendar,
  BookOpen,
  Megaphone,
} from "lucide-react";
import AllStories from "./AllStories";
import Categories from "@/components/explore/Categories";
import BookLists from "@/components/explore/BookLists";
import Announcements from "@/components/explore/Announcements";
import Challenges from "@/components/explore/Challenges";
import Leaderboards from "@/components/explore/Leaderboards";
import WritingResources from "@/components/explore/WritingResources";
import Events from "@/components/explore/Events";

interface Tab {
  id: string;
  path: string;
  label: string;
  icon: React.ReactNode;
  component: React.ReactNode;
}

const tabs: Tab[] = [
  {
    id: "stories",
    label: "Stories",
    icon: <BookOpen className="w-5 h-5" />,
    component: <AllStories />,
    path: "/explore/stories",
  },
  {
    id: "categories",
    label: "Categories",
    path: "/explore/categories",
    icon: <Book className="w-5 h-5" />,
    component: <Categories />,
  },
  {
    id: "book-lists",
    label: "Book Lists",
    icon: <ListTodo className="w-5 h-5" />,
    component: <BookLists />,
    path: "/explore/book-lists",
  },
  {
    id: "Announcements",
    label: "Announcements",
    icon: <Megaphone className="w-5 h-5" />,
    component: <Announcements />,
    path: "/explore/announcements",
  },
  {
    id: "challenges",
    label: "Challenges",
    icon: <Trophy className="w-5 h-5" />,
    component: <Challenges />,
    path: "/explore/challenges",
  },
  {
    id: "leaderboards",
    label: "Leaderboards",
    icon: <Award className="w-5 h-5" />,
    component: <Leaderboards />,
    path: "/explore/leaderboards",
  },
  {
    id: "writing-resources",
    label: "Writing Resources",
    icon: <PenTool className="w-5 h-5" />,
    component: <WritingResources />,
    path: "/explore/writing-resources",
  },
  {
    id: "events",
    label: "Events",
    icon: <Calendar className="w-5 h-5" />,
    component: <Events />,
    path: "/explore/events",
  },
];

const StoriesLayout = () => {
  const location = useLocation();

  return (
    <div className="bg-amber-50 min-h-screen py-24">
      <div className="container mx-auto px-4">
        <div className="w-full mb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex flex-col space-y-4 py-4">
              {/* Main navigation */}
              <nav className="flex space-x-4 overflow-x-auto pb-2">
                {tabs.map((tab) => (
                  <Link
                    key={tab.id}
                    to={tab.path}
                    className={`
                      flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium
                      transition-colors duration-150 ease-in-out min-w-fit
                      ${
                        tab.path === location.pathname ||
                        (location.pathname === "/stories" &&
                          tab.path === "/stories")
                          ? "bg-amber-100 text-amber-700"
                          : "text-gray-600 hover:bg-gray-100"
                      }
                    `}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </div>

        <Outlet />
      </div>
    </div>
  );
};

export default StoriesLayout;
