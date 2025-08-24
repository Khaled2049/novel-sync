import { Link } from "react-router-dom";
import { useFirebaseAuth } from "../hooks/useFirebaseAuth";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../contexts/AuthContext";
import { useState, useEffect, useRef } from "react";
import { Loader, Menu, User } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

const Navbar = () => {
  const { signout } = useFirebaseAuth();
  const { user, loading } = useAuthContext();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleSignOut = async () => {
    await signout();
    navigate("/sign-in");
  };

  const handleSignIn = async () => {
    navigate("/sign-in");
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node)
    ) {
      setIsDropdownOpen(false);
    }
  };

  useEffect(() => {
    if (isDropdownOpen) {
      document.addEventListener("click", handleClickOutside);
    } else {
      document.removeEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isDropdownOpen]);

  return (
    <nav className="backdrop-blur-sm p-4 text-white fixed w-full top-0 z-50 bg-white/50 dark:bg-black/50 transition-colors duration-300">
      <div className="container mx-auto flex justify-between items-center">
        {/* Left Section - Logo */}
        <div className="flex items-center">
          <Link
            className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-dark-green to-light-green dark:from-light-green dark:to-dark-green transition-all duration-300 hover:scale-105 hover:drop-shadow-lg"
            to="/"
          >
            NovelSync
          </Link>
          <ThemeToggle />
        </div>

        {/* Right Section - Desktop */}
        <div className="hidden lg:flex items-center space-x-6">
          <Link
            to="/home"
            className="text-black dark:text-white hover:text-dark-green dark:hover:text-light-green transition duration-300"
          >
            Community
          </Link>
          <Link
            to="/explore"
            className="text-black dark:text-white hover:text-dark-green dark:hover:text-light-green transition duration-300"
          >
            Explore
          </Link>
          <Link
            to="/book-clubs"
            className="text-black dark:text-white hover:text-dark-green dark:hover:text-light-green transition duration-300"
          >
            Book Clubs
          </Link>

          {/* User Dropdown */}
          {loading ? (
            <div className="flex items-center space-x-2 text-dark-green dark:text-light-green">
              <Loader className="w-8 h-8 animate-spin" />
            </div>
          ) : user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={toggleDropdown}
                className="flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-dark-green dark:focus:ring-light-green rounded-full focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-black"
              >
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt="User Avatar"
                    className="w-10 h-10 rounded-full border-2 border-dark-green dark:border-light-green hover:border-light-green dark:hover:border-dark-green transition"
                  />
                ) : (
                  <User className="w-10 h-10 rounded-full text-white bg-dark-green dark:text-black dark:bg-light-green p-1" />
                )}
              </button>
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-black text-black dark:text-white rounded-md shadow-lg z-50 overflow-hidden border border-black/20 dark:border-white/20">
                  <div className="p-2">
                    <p className="text-sm font-semibold truncate">
                      {user.displayName || "User"}
                    </p>
                    <p className="text-xs text-black/70 dark:text-white/70 truncate">
                      {user.email}
                    </p>
                  </div>
                  <hr className="border-black/20 dark:border-white/20" />
                  <Link
                    to="/profile"
                    className="block px-4 py-2 hover:bg-black/10 dark:hover:bg-white/10"
                  >
                    View Profile
                  </Link>
                  <Link
                    to="/user-stories"
                    className="block px-4 py-2 hover:bg-black/10 dark:hover:bg-white/10"
                  >
                    My Stories
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="block w-full text-left px-4 py-2 text-red-500 hover:bg-black/10 dark:hover:bg-white/10"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={handleSignIn}
              className="bg-dark-green dark:bg-light-green hover:bg-light-green dark:hover:bg-dark-green text-white font-bold py-2 px-4 rounded-full transition-colors duration-300"
            >
              Sign In
            </button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="lg:hidden">
          <button
            onClick={toggleMobileMenu}
            className="text-black dark:text-white focus:outline-none"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`lg:hidden ${
          isMobileMenuOpen ? "max-h-screen" : "max-h-0"
        } overflow-hidden transition-[max-height] duration-500 ease-in-out bg-white dark:bg-black`}
      >
        <div className="mt-4 flex flex-col space-y-4">
          <Link
            to="/home"
            className="block px-4 py-2 text-black dark:text-white hover:bg-light-green/20 dark:hover:bg-dark-green/20 rounded"
          >
            Community
          </Link>
          <Link
            to="/explore"
            className="block px-4 py-2 text-black dark:text-white hover:bg-light-green/20 dark:hover:bg-dark-green/20 rounded"
          >
            Explore
          </Link>
          <Link
            to="/book-clubs"
            className="block px-4 py-2 text-black dark:text-white hover:bg-light-green/20 dark:hover:bg-dark-green/20 rounded"
          >
            Book Clubs
          </Link>
          <hr className="border-black/20 dark:border-white/20" />
          {user ? (
            <>
              <Link
                to="/profile"
                className="block px-4 py-2 text-black dark:text-white hover:bg-light-green/20 dark:hover:bg-dark-green/20 rounded"
              >
                View Profile
              </Link>
              <Link
                to="/user-stories"
                className="block px-4 py-2 text-black dark:text-white hover:bg-light-green/20 dark:hover:bg-dark-green/20 rounded"
              >
                My Stories
              </Link>
              <button
                onClick={handleSignOut}
                className="block w-full text-left px-4 py-2 text-red-500 hover:bg-light-green/20 dark:hover:bg-dark-green/20 rounded"
              >
                Sign Out
              </button>
            </>
          ) : (
            <button
              onClick={handleSignIn}
              className="bg-dark-green dark:bg-light-green hover:bg-light-green dark:hover:bg-dark-green text-white font-bold py-2 px-4 rounded-full transition duration-300"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
