import { auth } from "../firebase/firebaseConfig";
import { signOut } from "firebase/auth";
import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";

const Navbar = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="bg-teal-600 p-4 shadow-md">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between">
        {" "}
        {/* Key change: justify-between */}
        {/* Logo/Brand Name */}
        <div className="flex items-center space-x-3">
          <img
            src="/src/assets/Logo/logo.png"
            alt="ShinobiPath Logo"
            className="h-10"
          />
          <NavLink
            to="/"
            className="text-white text-3xl font-semibold hover:text-teal-300 transition duration-300"
          >
            ShinobiPath
          </NavLink>
        </div>
        {/* Mobile Menu Button */}
        <button
          onClick={toggleMobileMenu}
          type="button"
          className="inline-flex items-center p-2 text-white rounded-lg md:hidden hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-300"
        >
          <svg
            className="w-6 h-6"
            aria-hidden="true"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
              clipRule="evenodd"
            ></path>
          </svg>
        </button>
        {/* Navigation Links */}
        <div
          className={`${
            isMobileMenuOpen ? "block" : "hidden"
          } md:block md:w-auto w-full`}
          id="navbar-default"
        >
          <ul className="flex flex-col p-4 mt-4 border border-gray-100 rounded-lg bg-teal-600 md:flex-row md:space-x-8 md:mt-0 md:text-sm md:font-medium md:border-0 md:bg-teal-600">
            {" "}
            {/* Increased space-x */}
            <li>
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  `block py-2 pl-3 pr-4 text-white rounded hover:bg-teal-700 md:hover:bg-transparent md:border-0 md:hover:text-teal-300 md:p-0 ${
                    isActive ? "text-teal-300" : ""
                  }`
                }
                onClick={isMobileMenuOpen ? toggleMobileMenu : null}
              >
                Dashboard
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/itineraries"
                className={({ isActive }) =>
                  `block py-2 pl-3 pr-4 text-white rounded hover:bg-teal-700 md:hover:bg-transparent md:border-0 md:hover:text-teal-300 md:p-0 ${
                    isActive ? "text-teal-300" : ""
                  }`
                }
                onClick={isMobileMenuOpen ? toggleMobileMenu : null}
              >
                Itinerary
              </NavLink>
            </li>
            <li>
              <button
                onClick={handleLogout}
                className="block w-full py-2 pl-3 pr-4 text-white rounded hover:bg-teal-700 md:hover:bg-transparent md:border-0 md:hover:text-teal-300 md:p-0 md:w-auto"
              >
                Logout
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
