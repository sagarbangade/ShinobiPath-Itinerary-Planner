import React, { useState } from "react";
import { Mail, Phone, MapPin, Clock, MessageSquare, Send } from "lucide-react";
import Footer from "../components/Footer";
import LandingPageNavbar from "../components/LandingPageNavbar";
import { Link } from "react-router-dom";

const Contact = () => {
  const [formStatus, setFormStatus] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormStatus("success");
    // Reset form after showing success message (optional)
    setTimeout(() => {
      setFormStatus("");
      setFormData({ name: "", email: "", subject: "", message: "" });
    }, 3000);
  };

  // Inline Alert component (using Tailwind classes)
  const Alert = ({ children, className }) => (
    <div className={`${className} p-4 rounded-md shadow-md`}>{children}</div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <LandingPageNavbar />

      {/* --- Hero Section --- */}
      <header className="bg-gradient-to-r from-orange-600 to-yellow-500 py-20 sm:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 sm:mb-6 text-gray-900">
            Get in Touch
          </h1>
          <p className="text-lg sm:text-xl max-w-3xl mx-auto text-gray-900">
            Have questions? We'd love to hear from you. Send us a message and
            we'll respond as soon as possible.
          </p>
        </div>
      </header>

      {/* --- Contact Options --- */}
      <section className="py-16 sm:py-20 bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
            {contactOptions.map((option, index) => (
              <div
                key={index}
                className="bg-gray-900 p-6 sm:p-8 rounded-2xl sm:rounded-3xl shadow-lg hover:shadow-xl transition-shadow text-center"
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-orange-600 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  {option.icon}
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold mb-2 sm:mb-4 text-orange-400">
                  {option.title}
                </h3>
                <p className="text-gray-400 mb-4 text-base sm:text-lg">
                  {option.description}
                </p>
                <a
                  href={option.link}
                  className="text-orange-500 hover:text-orange-600 font-medium text-base sm:text-lg"
                >
                  {option.linkText}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- Contact Form Section --- */}
      <section className="py-16 sm:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-10 sm:mb-12">
              Send Us a Message
            </h2>

            {/* Display success message */}
            {formStatus === "success" && (
              <Alert className="mb-6 bg-green-50 text-green-800 border border-green-200">
                Thank you for your message! We'll get back to you soon.
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-sm sm:text-base font-medium text-gray-300 mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-4 py-2 sm:py-3 rounded-lg border border-gray-700 bg-gray-800 text-white placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm sm:text-base font-medium text-gray-300 mb-2">
                    Your Email
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full px-4 py-2 sm:py-3 rounded-lg border border-gray-700 bg-gray-800 text-white placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm sm:text-base font-medium text-gray-300 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) =>
                    setFormData({ ...formData, subject: e.target.value })
                  }
                  className="w-full px-4 py-2 sm:py-3 rounded-lg border border-gray-700 bg-gray-800 text-white placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  placeholder="How can we help?"
                />
              </div>

              <div>
                <label className="block text-sm sm:text-base font-medium text-gray-300 mb-2">
                  Message
                </label>
                <textarea
                  required
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  rows={6}
                  className="w-full px-4 py-2 sm:py-3 rounded-lg border border-gray-700 bg-gray-800 text-white placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  placeholder="Tell us more about your inquiry..."
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-orange-600 to-yellow-500 text-white py-3 sm:py-4 px-6 sm:px-8 rounded-full font-semibold hover:from-yellow-500 hover:to-orange-600 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50 flex items-center justify-center gap-2 text-base sm:text-lg"
              >
                <Send className="w-5 h-5 sm:w-6 sm:h-6" />
                Send Message
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* --- Office Locations --- */}
      <section className="py-16 sm:py-20 bg-gray-800">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-10 sm:mb-12">
            Our Offices
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
            {offices.map((office, index) => (
              <div
                key={index}
                className="bg-gray-900 p-6 sm:p-8 rounded-2xl sm:rounded-3xl shadow-lg"
              >
                <img
                  src={`/img/office-${index + 1}.jpg`}
                  alt={`${office.city} Office`}
                  className="w-full h-40 sm:h-48 object-cover rounded-lg mb-4 sm:mb-6"
                />
                <h3 className="text-xl sm:text-2xl font-semibold mb-2 sm:mb-4 text-orange-400">
                  {office.city}
                </h3>
                <p className="text-gray-400 mb-4 text-base sm:text-lg">
                  {office.address}
                </p>
                <div className="flex items-center text-gray-400 mb-2 text-base sm:text-lg">
                  <Phone className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  <span>{office.phone}</span>
                </div>
                <div className="flex items-center text-gray-400 text-base sm:text-lg">
                  <Mail className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  <span>{office.email}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- FAQ Link --- */}
      <section className="py-16 sm:py-20 bg-gradient-to-r from-orange-600 to-yellow-500">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 sm:mb-6 text-gray-900">
            Have More Questions?
          </h2>
          <p className="text-lg sm:text-xl mb-6 sm:mb-8 text-gray-900">
            Check out our frequently asked questions for quick answers to common
            queries.
          </p>
          <Link
            to="/faq"
            className="bg-gray-900 text-white px-8 sm:px-10 py-3 sm:py-4 rounded-full font-semibold hover:bg-gray-800 transition-colors duration-300 text-base sm:text-lg"
          >
            Visit FAQ Page
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

// Data (Updated with URLs)
const contactOptions = [
  {
    icon: <MessageSquare className="w-8 h-8 sm:w-10 sm:h-10 text-white" />,
    title: "Chat With Us",
    description:
      "Get instant help from our customer support team through live chat.",
    link: "#", // Replace with your chat link
    linkText: "Start Chat",
  },
  {
    icon: <Mail className="w-8 h-8 sm:w-10 sm:h-10 text-white" />,
    title: "Email Us",
    description: "Send us an email and we'll get back to you within 24 hours.",
    link: "mailto:support@shinobipath.com", // Use your actual email
    linkText: "support@shinobipath.com",
  },
  {
    icon: <Clock className="w-8 h-8 sm:w-10 sm:h-10 text-white" />,
    title: "24/7 Support",
    description: "Our support team is available round the clock to help you.",
    link: "#", // Replace with your support page link
    linkText: "View Hours",
  },
];

const offices = [
  {
    city: "New York",
    address: "123 Shadow St, NY 10001",
    phone: "+1 (555) 123-4567",
    email: "nyc@shinobipath.com", // Updated email
  },
  {
    city: "London",
    address: "456 Stealth Ln, London EC1A 1BB",
    phone: "+44 20 7123 4567",
    email: "london@shinobipath.com", // Updated email
  },
  {
    city: "Singapore",
    address: "789 Shuriken Rd, Singapore 018956",
    phone: "+65 6789 0123",
    email: "singapore@shinobipath.com", // Updated email
  },
];

export default Contact;
