import "./index.css";
import ReactDOM from "react-dom/client";
import {
  Root,
  Signin,
  Signup,
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
} from "./routes/index";
import { AuthProvider } from "./contexts/AuthContext";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { NavbarWrapper } from "./NavbarWrapper";

import { AIProvider } from "./contexts/AIContext";
import { EditorProvider } from "./contexts/EditorContext";

import PrivateRoute from "./routes/PrivateRoute";
import PrivacyPolicy from "./components/PrivacyPolicy";
import TermsOfUse from "./components/TermsOfUse";

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
        path: "/library",
        element: <Library />,
      },
      {
        path: "/library/book/:id",
        element: <BookDetails />,
      },
      {
        path: "/book-clubs",
        element: <BookClubs />, // This will be the main component for the book clubs
      },
      {
        path: "/book-clubs/:id",
        element: <BookClubDetails />, // This will be the main component for the book clubs
      },
      {
        path: "/Home",
        element: <Home />,
      },
      {
        path: "/sign-in",
        element: <Signin />,
      },
      {
        path: "/sign-up",
        element: <Signup />,
      },
      {
        path: "/profile",
        element: <Profile />,
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
  <AuthProvider>
    <AIProvider>
      <EditorProvider>
        <RouterProvider router={router} />
      </EditorProvider>
    </AIProvider>
  </AuthProvider>
);
