import {
  Calendar,
  Map,
  Users,
  Clock,
  Bookmark,
  Wallet,
  User,
  Smartphone,
  Wifi,
  ChevronRight,
  Star,
} from "lucide-react";
import Footer from "../components/Footer";
import LandingPageNavbar from "../components/LandingPageNavbar";

const HomePage = () => {
  return (
    <div className="min-h-screen bg-white">
      <LandingPageNavbar />
      {/* Hero Section */}
      <header className="relative bg-blue-600 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-3xl">
            <h1 className="text-5xl font-bold mb-6">
              Plan Your Perfect Journey
            </h1>
            <p className="text-xl mb-8">
              Create, collaborate, and organize your travel itineraries with
              ease. Your next adventure starts here.
            </p>
            <div className="flex gap-4">
              <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
                Get Started Free
              </button>
              <button className="border border-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                Watch Demo
              </button>
            </div>
          </div>
        </div>
        <div className="absolute right-0 top-0 w-1/3 h-full hidden lg:block">
          <div className="bg-blue-500 h-full rounded-l-3xl opacity-50"></div>
        </div>
      </header>

      {/* Features Grid */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Everything You Need for Perfect Travel Planning
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-xl font-bold">
                  {index + 1}
                </div>
                <h3 className="text-xl font-semibold mb-4">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            What Our Travelers Say
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 text-yellow-400 fill-current"
                    />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">{testimonial.text}</p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-full mr-3"></div>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">
                      {testimonial.location}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Ready to Start Planning Your Next Adventure?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of travelers who are creating unforgettable journeys
            with our planning tools.
          </p>
          <button className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
            Start Planning Now
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

// Data
const features = [
  {
    icon: <Calendar className="w-6 h-6 text-blue-600" />,
    title: "Drag & Drop Planning",
    description:
      "Easily organize your itinerary with our intuitive drag-and-drop interface. Add and rearrange activities effortlessly.",
  },
  {
    icon: <Map className="w-6 h-6 text-blue-600" />,
    title: "Interactive Maps",
    description:
      "Visualize your entire journey with integrated maps showing routes, attractions, and points of interest.",
  },
  {
    icon: <Users className="w-6 h-6 text-blue-600" />,
    title: "Collaborative Planning",
    description:
      "Share and edit itineraries with friends and family in real-time for group trip planning.",
  },
  {
    icon: <Clock className="w-6 h-6 text-blue-600" />,
    title: "Smart Scheduling",
    description:
      "Set reminders and get notifications for activities, reservations, and important events.",
  },
  {
    icon: <Bookmark className="w-6 h-6 text-blue-600" />,
    title: "Travel Templates",
    description:
      "Choose from various templates designed for different travel styles and customize them.",
  },
  {
    icon: <Wallet className="w-6 h-6 text-blue-600" />,
    title: "Budget Tracking",
    description:
      "Keep track of your expenses and stay within budget with our financial planning tools.",
  },
  {
    icon: <User className="w-6 h-6 text-blue-600" />,
    title: "Personal Profiles",
    description:
      "Create your profile, save trips, and get personalized recommendations based on your preferences.",
  },
  {
    icon: <Smartphone className="w-6 h-6 text-blue-600" />,
    title: "Mobile Ready",
    description:
      "Access your travel plans on any device with our fully responsive mobile application.",
  },
  {
    icon: <Wifi className="w-6 h-6 text-blue-600" />,
    title: "Offline Access",
    description:
      "Download your itineraries for offline viewing when you're on the go without internet.",
  },
];

const steps = [
  {
    title: "Create Your Account",
    description:
      "Sign up in seconds and start planning your perfect trip right away.",
  },
  {
    title: "Add Your Destinations",
    description:
      "Choose your destinations and let us help you build the perfect route.",
  },
  {
    title: "Customize Your Plan",
    description:
      "Add activities, set times, and share with your travel companions.",
  },
];

const testimonials = [
  {
    text: "This platform made planning our family vacation so much easier. The collaborative features are fantastic!",
    name: "Sarah Johnson",
    location: "New York, USA",
  },
  {
    text: "As a frequent traveler, this is exactly what I needed. The offline access feature is a game-changer.",
    name: "Michael Chen",
    location: "Singapore",
  },
  {
    text: "The budget tracking feature helped us stay on track during our European tour. Highly recommended!",
    name: "Emma Thompson",
    location: "London, UK",
  },
];

export default HomePage;
