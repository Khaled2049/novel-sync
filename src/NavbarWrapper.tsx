import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

export const NavbarWrapper = () => {
  const location = useLocation();
  const isEditorPage = location.pathname.startsWith("/create");

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Navbar />

      <main
        className={`w-full h-full ${
          isEditorPage ? "overflow-hidden" : "overflow-y-auto"
        }`}
      >
        <Outlet />
      </main>

      {!isEditorPage && <Footer />}
    </div>
  );
};
