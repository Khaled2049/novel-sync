import { Outlet } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

export const NavbarWrapper = () => {
  return (
    // This outer div can manage the overall page layout
    <div className="relative min-h-screen">
      <Navbar />

      <main className="pt-15 pb-16">
        <Outlet />
      </main>

      <div className="absolute bottom-0 w-full">
        <Footer />
      </div>
    </div>
  );
};
