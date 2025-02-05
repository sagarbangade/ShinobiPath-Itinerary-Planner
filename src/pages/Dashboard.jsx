import Footer from "../components/Footer";
import Navbar from "../components/Navbar";

const Dashboard = () => {
  return (
    <div>
      <Navbar />
      <div className="min-h-screen bg-gray-100">
        <div className="p-4 text-center">
          <h1 className="text-2xl font-bold">Welcome to Your Travel Planner</h1>
          <p>Plan, organize, and manage your travel itinerary with ease!</p>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Dashboard;
