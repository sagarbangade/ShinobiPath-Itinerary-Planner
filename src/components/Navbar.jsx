import { auth } from "../firebase/firebaseConfig";
import { signOut } from "firebase/auth";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Menu, X, User } from "lucide-react";
import UserProfileModal from "./UserProfileModal";

const Navbar = () => {
  const navigate = useNavigate();
  const user = auth.currentUser;

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const openProfileModal = () => {
    setIsProfileModalOpen(true);
  };

  const closeProfileModal = () => {
    setIsProfileModalOpen(false);
  };

  return (
    <nav className="bg-gray-900 shadow-lg w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex justify-between items-center">
        {/* Logo/Brand Name */}
        <div className="flex items-center">
          <img
            src="/src/assets/Logo/logo.png"
            alt="ShinobiPath Logo"
            className="h-12 mr-2 slow-spin"
          />
          <NavLink
            to="/dashboard"
            className="text-white text-xl sm:text-2xl font-semibold hover:text-orange-400 transition duration-300"
          >
            SHINOBI PATH
          </NavLink>
        </div>

        {/* Navigation Links (Desktop) */}
        <div className="hidden md:flex space-x-4 lg:space-x-8 text-white font-medium items-center">
          {/* ... (Desktop Nav Links - Same as before) */}
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `hover:text-orange-500 transition duration-300 ${
                isActive ? "text-orange-400" : ""
              }`
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/itineraries"
            className={({ isActive }) =>
              `hover:text-orange-500 transition duration-300 ${
                isActive ? "text-orange-400" : ""
              }`
            }
          >
            Travel Planner
          </NavLink>
          <NavLink
            to="/map"
            className={({ isActive }) =>
              `hover:text-orange-500 transition duration-300 ${
                isActive ? "text-orange-400" : ""
              }`
            }
          >
            Map
          </NavLink>

          {/* User Profile (Desktop) */}
          <div className="relative group">
            <button
              onClick={openProfileModal}
              className="flex items-center hover:text-orange-400 transition duration-300"
            >
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt="Profile"
                  className="w-8 h-8 rounded-full mr-2"
                />
              ) : (
                <User size={24} className="mr-2" />
              )}
              <span>{user?.displayName || "Profile"}</span>
            </button>
          </div>
          <button
            onClick={handleLogout}
            className="bg-orange-600 text-white px-4 py-2 rounded-full hover:bg-orange-700 transition duration-300"
          >
            Logout
          </button>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center">
          <button
            onClick={toggleMobileMenu}
            className="text-white hover:text-orange-400 focus:outline-none"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed top-0 left-0 w-full bg-gray-900 z-40">
          <div className="py-1 pl-1 pr-4 flex justify-between">
            <button
              onClick={openProfileModal}
              className="text-white hover:text-orange-400 transition duration-300 block px-4 py-3 text-xl flex items-center"
            >
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt="Profile"
                  className="w-8 h-8 rounded-full mr-2"
                />
              ) : (
                <User size={24} className="mr-2" />
              )}
              <span>{user?.displayName || "Profile"}</span>
            </button>
            <button
              onClick={toggleMobileMenu}
              className="text-white hover:text-orange-400 focus:outline-none"
            >
              <X size={24} />
            </button>
          </div>
          <div className="flex flex-col">
            {" "}
            {/* Removed justify-center and h-full */}
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `text-white hover:text-orange-400 transition duration-300 block px-4 py-3 text-xl ${
                  isActive ? "text-orange-400" : ""
                }`
              }
              onClick={toggleMobileMenu}
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/itineraries"
              className={({ isActive }) =>
                `text-white hover:text-orange-400 transition duration-300 block px-4 py-3 text-xl ${
                  isActive ? "text-orange-400" : ""
                }`
              }
              onClick={toggleMobileMenu}
            >
              Travel Planner
            </NavLink>
            <button
              onClick={handleLogout}
              className="bg-orange-600 text-white px-4 py-2 rounded-full hover:bg-orange-700 transition duration-300 block mt-4 mx-4 mb-4" // Added margin
            >
              Logout
            </button>
          </div>
        </div>
      )}

      {/* User Profile Modal */}
      {isProfileModalOpen && (
        <UserProfileModal
          isOpen={isProfileModalOpen}
          onClose={closeProfileModal}
        />
      )}
    </nav>
  );
};

export default Navbar;
