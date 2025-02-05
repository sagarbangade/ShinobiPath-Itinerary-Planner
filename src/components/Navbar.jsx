import { auth } from "../firebase/firebaseConfig";
import { signOut } from "firebase/auth";
import { NavLink, useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login"); // Redirect to login after logout
  };

  return (
    <div className="bg-teal-600 p-4 shadow-md">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
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

        {/* Navigation Links */}
        <div className="space-x-6 text-white font-medium text-lg">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `hover:text-teal-300 transition duration-300 ${
                isActive ? "text-teal-300" : ""
              }`
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/itineraries"
            className={({ isActive }) =>
              `hover:text-teal-300 transition duration-300 ${
                isActive ? "text-teal-300" : ""
              }`
            }
          >
            Itinerary
          </NavLink>

          <button
            onClick={handleLogout}
            className="bg-white text-blue-500 px-4 py-2 rounded"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
