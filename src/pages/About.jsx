import React from "react";
import { Map, Heart, Users, Award, Globe, Zap } from "lucide-react";
import Footer from "../components/Footer";
import LandingPageNavbar from "../components/LandingPageNavbar";

const About = () => {
  return (
    <div className="min-h-screen bg-white">
      <LandingPageNavbar />

      {/* Hero Section */}
      <header className="bg-blue-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">Our Mission</h1>
          <p className="text-xl max-w-2xl mx-auto">
            We're on a journey to transform travel planning from a tedious task
            into an exciting part of your adventure.
          </p>
        </div>
      </header>

      {/* Story Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Our Story</h2>
            <p className="text-gray-600 mb-8">
              Founded in 2024 by a group of passionate travelers, TravelPlanner
              was born from a simple observation: planning trips should be as
              enjoyable as the journey itself. After experiencing firsthand the
              challenges of coordinating group trips and managing complex
              itineraries, we set out to create a solution that would make
              travel planning seamless and collaborative.
            </p>
            <p className="text-gray-600">
              Today, we're proud to help thousands of travelers around the world
              create unforgettable experiences, one itinerary at a time. Our
              platform combines intuitive design with powerful features, making
              it easy for anyone to plan their perfect trip.
            </p>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Our Values</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  {value.icon}
                </div>
                <h3 className="text-xl font-semibold mb-4">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Meet Our Team
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <div key={index} className="text-center">
                <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-6"></div>
                <h3 className="text-xl font-semibold mb-2">{member.name}</h3>
                <p className="text-blue-600 mb-4">{member.role}</p>
                <p className="text-gray-600">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Join Our Journey</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            We're always looking for passionate people to join our team and help
            make travel planning better for everyone.
          </p>
          <button className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
            View Open Positions
          </button>
        </div>
      </section>
      <Footer />
    </div>
  );
};

// Data
const values = [
  {
    icon: <Heart className="w-8 h-8 text-blue-600" />,
    title: "Passion for Travel",
    description:
      "We believe travel broadens horizons and brings people together. Every feature we build is inspired by real travelers' needs.",
  },
  {
    icon: <Users className="w-8 h-8 text-blue-600" />,
    title: "Community First",
    description:
      "Our community of travelers drives everything we do. We're committed to creating tools that make their journeys better.",
  },
  {
    icon: <Zap className="w-8 h-8 text-blue-600" />,
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
    name: "Sarah Chen",
    role: "Co-Founder & CEO",
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
