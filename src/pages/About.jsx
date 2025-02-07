import React from "react";
import { Map, Heart, Users, Award, Globe, Zap, Search } from "lucide-react";
import Footer from "../components/Footer";
import LandingPageNavbar from "../components/LandingPageNavbar";
import { Link } from 'react-router-dom';


const About = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <LandingPageNavbar />

      {/* --- Hero Section --- */}
      <header className="bg-gradient-to-r from-orange-600 to-yellow-500 py-20 sm:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 sm:mb-6 text-gray-900">Our Mission</h1>
          <p className="text-lg sm:text-xl max-w-3xl mx-auto text-gray-900">
            We're on a journey to transform travel planning from a tedious task into an exciting part of your adventure.
          </p>
        </div>
      </header>

      {/* --- Story Section --- */}
      <section className="py-16 sm:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6 sm:mb-8">Our Story</h2>
            <p className="text-gray-300 mb-6 sm:mb-8 text-base sm:text-lg leading-relaxed">
              Founded in 2024 by a group of passionate travelers, ShinobiPath was born from a simple
              observation: planning trips should be as enjoyable as the journey itself.  After experiencing
              firsthand the challenges of coordinating group trips and managing complex itineraries, we set
              out to create a solution that would make travel planning seamless and collaborative.
            </p>
            <p className="text-gray-300 text-base sm:text-lg leading-relaxed">
              Today, we're proud to help thousands of travelers around the world create unforgettable
              experiences, one itinerary at a time. Our platform combines intuitive design with powerful
              features, making it easy for anyone to plan their perfect trip, like a true travel ninja.
            </p>
          </div>
        </div>
      </section>

      {/* --- Values Section --- */}
      <section className="py-16 sm:py-20 bg-gray-800">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-10 sm:mb-12 text-white">Our Values</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 sm:gap-10">
            {values.map((value, index) => (
              <div key={index} className="text-center">
                <div
                  className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-orange-600 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  {value.icon}
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold mb-2 sm:mb-4 text-orange-400">{value.title}</h3>
                <p className="text-gray-400 text-base sm:text-lg">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- Stats Section --- */}
     <section className="py-16 sm:py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-10 sm:mb-12 text-white">Shinobi Stats</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-orange-500 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-400 text-sm sm:text-base">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- Team Section --- */}
      <section className="py-16 sm:py-20 bg-gray-800">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-10 sm:mb-12 text-white">Meet Our Ninja Clan</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
            {team.map((member, index) => (
              <div key={index} className="text-center">
                <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gray-700 rounded-full mx-auto mb-4 sm:mb-6 overflow-hidden">
                  {/* Placeholder for team member image */}
                  <img src={`src/assets/img/sagar${index + 1}.png`} alt={member.name} className="w-full h-full object-cover" />
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold mb-2 text-white">{member.name}</h3>
                <p className="text-orange-400 mb-2 sm:mb-4 text-base sm:text-lg">{member.role}</p>
                <p className="text-gray-400 text-base sm:text-lg">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- Contact CTA --- */}
      <section className="py-16 sm:py-20 bg-gradient-to-r from-orange-600 to-yellow-500">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 sm:mb-6 text-gray-900">Join Our Journey</h2>
          <p className="text-lg sm:text-xl mb-6 sm:mb-8 max-w-3xl mx-auto text-gray-900">
            We're always looking for passionate ninjas to join our team and help make travel planning better for
            everyone.
          </p>
           <Link to="/careers" className="bg-gray-900 text-white px-8 sm:px-10 py-3 sm:py-4 rounded-full font-semibold hover:bg-gray-800 transition-colors duration-300 text-base sm:text-lg">
            View Open Positions
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

// Data
const values = [
  {
    icon: <Heart className="w-8 h-8 sm:w-10 sm:h-10 text-white" />,
    title: "Passion for Travel",
    description:
      "We believe travel broadens horizons and brings people together. Every feature we build is inspired by real travelers' needs.",
  },
  {
    icon: <Users className="w-8 h-8 sm:w-10 sm:h-10 text-white" />,
    title: "Community First",
    description:
      "Our community of travelers drives everything we do. We're committed to creating tools that make their journeys better.",
  },
  {
    icon: <Zap className="w-8 h-8 sm:w-10 sm:h-10 text-white" />,
    title: "Innovation",
    description:
      "We're constantly pushing boundaries to create smarter, more intuitive ways to plan and organize travel experiences.",
  },
];

const stats = [
  {
    number: "500K+",
    label: "Active Users",
  },
  {
    number: "1M+",
    label: "Trips Planned",
  },
  {
    number: "150+",
    label: "Countries Covered",
  },
  {
    number: "4.9",
    label: "Average Rating",
  },
];

const team = [
  {
    name: "Sagar Bangade",
    role: "Founder & CEO",
    bio: "Former travel blogger turned entrepreneur with a vision to make travel planning accessible to everyone.",
  },
  {
    name: "David Rodriguez",
    role: "Head of Product",
    bio: "Product veteran with 15 years of experience building tools that millions of people love to use.",
  },
  {
    name: "Emma Williams",
    role: "Head of Design",
    bio: "Award-winning designer passionate about creating intuitive and beautiful user experiences.",
  },
];

export default About;