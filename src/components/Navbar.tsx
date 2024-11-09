import { Link } from "react-router-dom";
import { useFirebaseAuth } from "../hooks/useFirebaseAuth";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../contexts/AuthContext";
import { useState, useEffect, useRef } from "react";
import { Loader, Menu, Search, User } from "lucide-react";

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
    <nav className="bg-gray-800 p-4 text-white">
      <div className="container mx-auto flex justify-between items-center">
        {/* Left Section - Logo */}
        <div className="flex items-center">
          <Link
            className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600"
            to="/"
          >
            Novel Sync
          </Link>
        </div>
        {/* Right Section - Search and User Dropdown */}
        <div className="hidden lg:flex items-center space-x-4">
          <Link
            to="/home"
            className="block px-4 py-2 text-white bg-transparent hover:bg-white hover:text-black transition duration-300 ease-in-out rounded"
          >
            Community
          </Link>
          <Link
            to="/stories"
            className="block px-4 py-2 text-white bg-transparent hover:bg-white hover:text-black transition duration-300 ease-in-out rounded"
          >
            Stories
          </Link>
          <Link
            to="/book-clubs"
            className="block px-4 py-2 text-white bg-transparent hover:bg-white hover:text-black transition duration-300 ease-in-out rounded"
          >
            Book Clubs
          </Link>

          {/* <Link
            to="/library"
            className="block px-4 py-2 text-white bg-transparent hover:bg-white hover:text-black transition duration-300 ease-in-out rounded"
          >
            Library
          </Link> */}
          {/* Search Bar */}

          {/* User Dropdown */}
          {loading ? (
            <div className="flex items-center space-x-2">
              <Loader className="w-8 h-8 animate-spin" />
            </div>
          ) : user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={toggleDropdown}
                className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
              >
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt="User Avatar"
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <User className="w-8 h-8 rounded-full" />
                )}
                <span>{user.displayName || "User"}</span>
              </button>
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white text-gray-800 rounded-md shadow-lg z-50">
                  <Link
                    to="/profile"
                    className="block px-4 py-2 hover:bg-gray-200"
                  >
                    View Profile
                  </Link>
                  <Link
                    to="/user-stories"
                    className="block px-4 py-2 hover:bg-gray-200"
                  >
                    My Stories
                  </Link>

                  <button
                    onClick={handleSignOut}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-200"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={handleSignIn}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            >
              Sign In
            </button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="lg:hidden">
          <button
            onClick={toggleMobileMenu}
            className="text-white focus:outline-none hover:text-gray-400"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`lg:hidden ${isMobileMenuOpen ? "block" : "hidden"} mt-4`}
      >
        <Link to="/profile" className="block px-4 py-2 hover:bg-gray-200">
          View Profile
        </Link>
        <Link
          to="/"
          className="block px-4 py-2 text-white bg-transparent hover:bg-white hover:text-black transition duration-300 ease-in-out rounded mb-2"
        >
          Community
        </Link>
        <Link
          to="/stories"
          className="block px-4 py-2 text-white bg-transparent hover:bg-white hover:text-black transition duration-300 ease-in-out rounded mb-2"
        >
          Stories
        </Link>

        {/* <Link
          to="/library"
          className="block px-4 py-2 text-white bg-transparent hover:bg-white hover:text-black transition duration-300 ease-in-out rounded mb-2"
        >
          Library
        </Link> */}
        {/* Mobile Search Bar */}
        <div className="relative text-gray-600 mt-4">
          <input
            type="search"
            placeholder="Search..."
            className="bg-gray-700 text-white h-10 px-5 pr-10 rounded-full text-sm focus:outline-none w-full"
          />
          <button type="submit" className="absolute right-0 top-0 mt-3 mr-4">
            <Search className="text-white" />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
