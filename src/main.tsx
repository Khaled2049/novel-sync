import "./index.css";
import ReactDOM from "react-dom/client";
import {
  Root,
  Signin,
  // Signup,
  StoryDetail,
  BookClubs,
  Home,
  UserStories,
  AllStories,
  BookClubDetails,
  Library,
  BookDetails,
  Characters,
  Plot,
  Places,
  CreateStory,
  Dashboard,
  Profile,
  Campaigns,
} from "./routes/index";
import { AuthProvider } from "./contexts/AuthContext";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { NavbarWrapper } from "./NavbarWrapper";

import PrivateRoute from "./routes/PrivateRoute";
import PrivacyPolicy from "./components/PrivacyPolicy";
import TermsOfUse from "./components/TermsOfUse";
import ForgotPassword from "./routes/Auth/forgot-password";
import StoriesLayout from "./routes/Story/StoriesLayout";

import Categories from "./components/explore/Categories";
import BookLists from "./components/explore/BookLists";
import Challenges from "./components/explore/Challenges";
import Events from "./components/explore/Events";
import Leaderboards from "./components/explore/Leaderboards";
import WritingResources from "./components/explore/WritingResources";
import Announcements from "./components/explore/Announcements";
import { CampaignProvider } from "./contexts/campaignContext";
import { ThirdwebProvider } from "@thirdweb-dev/react";
import { ThemeProvider } from "./contexts/ThemeContext";
import CampaignDetails from "./routes/Campaigns/CampaignDetails";

const router = createBrowserRouter([
  {
    path: "/",
    element: <NavbarWrapper />,
    children: [
      {
        path: "/",
        element: <Root />,
      },
      {
        path: "/privacy-policy",
        element: <PrivacyPolicy />,
      },
      {
        path: "/terms-of-use",
        element: <TermsOfUse />,
      },
      {
        path: "/stories",
        element: <AllStories />,
      },
      {
        path: "/campaigns",
        element: <Campaigns />,
      },
      {
        path: "/campaign-details/:id", // Add this route
        element: <CampaignDetails />,
      },
      {
        path: "/explore",
        element: <StoriesLayout />,
        children: [
          { index: true, element: <AllStories /> },
          {
            path: "categories",
            element: <Categories />,
          },
          {
            path: "book-lists",
            element: <BookLists />,
          },
          {
            path: "announcements",
            element: <Announcements />,
          },
          {
            path: "challenges",
            element: <Challenges />,
          },
          {
            path: "leaderboards",
            element: <Leaderboards />,
          },
          {
            path: "writing-resources",
            element: <WritingResources />,
          },
          {
            path: "events",
            element: <Events />,
          },
          {
            path: "stories",
            element: <AllStories />,
          },
        ],
      },
      {
        path: "/library",
        element: <Library />,
      },
      {
        path: "/library/book/:id",
        element: <BookDetails />,
      },
      {
        path: "/book-clubs",
        element: <BookClubs />,
      },
      {
        path: "/book-clubs/:id",
        element: <BookClubDetails />,
      },
      {
        path: "/Home",
        element: <Home />,
      },
      {
        path: "/sign-in",
        element: <Signin />,
      },
      // {
      //   path: "/sign-up",
      //   element: <Signup />,
      // },
      {
        path: "/profile",
        element: <Profile />,
      },
      {
        path: "/forgot-password",
        element: <ForgotPassword />,
      },
      {
        path: "/create/:storyId",
        element: <PrivateRoute />,
        children: [
          { index: true, element: <CreateStory /> },
          { path: "dashboard", element: <Dashboard /> },
          { path: "characters", element: <Characters /> },
          { path: "plot", element: <Plot /> },
          { path: "places", element: <Places /> },
        ],
      },
      {
        path: "/user-stories",
        element: <UserStories />,
      },
      {
        path: "/story/:id",
        element: <StoryDetail />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <ThemeProvider>
    <AuthProvider>
      <ThirdwebProvider activeChain="sepolia">
        <CampaignProvider>
          <RouterProvider router={router} />
        </CampaignProvider>
      </ThirdwebProvider>
    </AuthProvider>
  </ThemeProvider>
);
