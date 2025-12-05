import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

export const NavbarWrapper = () => {
  const location = useLocation();
  const isEditorPage = location.pathname.startsWith("/create");
  const isReaderPage = location.pathname.startsWith("/story");
  const isAuthPage = location.pathname.startsWith("/sign-in") || location.pathname.startsWith("/sign-up") || location.pathname.startsWith("/forgot-password");

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Navbar />

      <main
        className={`w-full h-full ${
          isEditorPage || isAuthPage ? "overflow-hidden" : "overflow-y-auto"
        }`}
      >
        <Outlet />
      </main>

      {!isEditorPage && !isReaderPage && <Footer />}
    </div>
  );
};
