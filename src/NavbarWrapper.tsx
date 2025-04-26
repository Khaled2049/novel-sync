import { Outlet } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

export const NavbarWrapper = () => {
  return (
    <div className="flex flex-col">
      <Navbar />
      <main className="flex-grow overflow-y-auto">
        <div className="max-h-[calc(100vh-theme(space.16))]">
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  );
};
