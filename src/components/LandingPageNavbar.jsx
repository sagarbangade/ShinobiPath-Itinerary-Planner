import { Link, NavLink } from "react-router-dom"; // Import Link for navigation

const LandingPageNavbar = () => {
  return (
    <div className="bg-teal-600 p-4 shadow-md">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo/Brand Name */}
        <div className="flex items-center space-x-3">
          <img src="/src/assets/Logo/logo.png" alt="ShinobiPath Logo" className="h-10" />
          <NavLink
            to="/"
            className="text-white text-3xl font-semibold hover:text-teal-300 transition duration-300"
          >
            ShinobiPath
          </NavLink>
        </div>

        {/* Navigation Links */}
        <div className="space-x-6 text-white font-medium text-lg">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `hover:text-teal-300 transition duration-300 ${isActive ? "text-teal-300" : ""}`
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/about"
            className={({ isActive }) =>
              `hover:text-teal-300 transition duration-300 ${isActive ? "text-teal-300" : ""}`
            }
          >
            About
          </NavLink>
          <NavLink
            to="/contact"
            className={({ isActive }) =>
              `hover:text-teal-300 transition duration-300 ${isActive ? "text-teal-300" : ""}`
            }
          >
            Contact
          </NavLink>
          <Link
            to="/login"
            className="bg-white text-blue-500 px-4 py-2 rounded"
          >
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LandingPageNavbar;
