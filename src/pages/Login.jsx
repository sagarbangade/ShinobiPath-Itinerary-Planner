import { signInWithGoogle } from "../firebase/firebaseConfig";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { auth } from "../firebase/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import LandingPageNavbar from "../components/LandingPageNavbar";
import Footer from "../components/Footer";

const Login = () => {
  const navigate = useNavigate();

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate("/dashboard");
      }
    });
  }, [navigate]);

  return (
    <div className="bg-gradient-to-r from-indigo-50 to-blue-100 min-h-screen flex flex-col"> {/* Gradient background, full screen height, flex column for footer */}
      <LandingPageNavbar />

      <div className="flex-grow flex items-center justify-center"> {/* Center content vertically and take up available space */}
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md"> {/* Responsive width, more padding */}
          <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Login to Continue</h1> {/* Larger, darker heading */}

          <p className="text-gray-600 mb-4 text-center">Sign in with your Google account to access the dashboard.</p> {/* Added explanatory text */}

          <button
            onClick={signInWithGoogle}
            className="w-full bg-teal-400 hover:bg-teal-600 text-white font-medium py-3 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-200" // Full width button, better styling
          >
            <div className="flex items-center justify-center"> {/* Center icon and text */}
              <img src="https://cdn-icons-png.flaticon.com/256/2875/2875331.png" alt="Google Logo" className="w-6 h-6 mr-2" /> {/* Added Google logo */}
              <span>Sign in with Google</span>
            </div>
          </button>

          <div className="mt-6 text-center text-gray-500"> {/* Added a separator */}
            <hr className="border-gray-300" />
          </div>
         
        </div>
      </div>
      <Footer /> {/* Footer at the bottom */}
    </div>
  );
};

export default Login;