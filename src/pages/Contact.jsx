import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, MessageSquare, Send } from 'lucide-react';
import Footer from '../components/Footer';
import LandingPageNavbar from '../components/LandingPageNavbar';

const Contact = () => {
  const [formStatus, setFormStatus] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormStatus('success');
    // Reset form after showing success message
    setTimeout(() => {
      setFormStatus('');
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 3000);
  };

  // Inline Alert component
  const Alert = ({ children, className }) => (
    <div className={`${className} p-4 rounded-md shadow-md`}>
      {children}
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      <LandingPageNavbar />

      {/* Hero Section */}
      <header className="bg-blue-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">Get in Touch</h1>
          <p className="text-xl max-w-2xl mx-auto">
            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>
      </header>

      {/* Contact Options */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {contactOptions.map((option, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  {option.icon}
                </div>
                <h3 className="text-xl font-semibold mb-4">{option.title}</h3>
                <p className="text-gray-600 mb-4">{option.description}</p>
                <a href={option.link} className="text-blue-600 hover:text-blue-700 font-medium">
                  {option.linkText}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Send Us a Message</h2>
            
            {formStatus === 'success' && (
              <Alert className="mb-6 bg-green-50 text-green-800 border-green-200">
                Thank you for your message! We'll get back to you soon.
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Email
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="john@example.com"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="How can we help?"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={6}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Tell us more about your inquiry..."
                />
              </div>
              
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-4 px-8 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <Send className="w-5 h-5" />
                Send Message
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Office Locations */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Our Offices</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {offices.map((office, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-sm">
                <img
                  src={`/api/placeholder/400/200`}
                  alt={`${office.city} Office`}
                  className="w-full h-48 object-cover rounded-lg mb-6"
                />
                <h3 className="text-xl font-semibold mb-4">{office.city}</h3>
                <p className="text-gray-600 mb-4">{office.address}</p>
                <div className="flex items-center text-gray-600 mb-2">
                  <Phone className="w-5 h-5 mr-2" />
                  <span>{office.phone}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Mail className="w-5 h-5 mr-2" />
                  <span>{office.email}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Link */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Have More Questions?</h2>
          <p className="text-xl mb-8">
            Check out our frequently asked questions for quick answers to common queries.
          </p>
          <button className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
            Visit FAQ Page
          </button>
        </div>
      </section>
      <Footer />
    </div>
  );
};

// Data
const contactOptions = [
  {
    icon: <MessageSquare className="w-8 h-8 text-blue-600" />,
    title: "Chat With Us",
    description: "Get instant help from our customer support team through live chat.",
    link: "#",
    linkText: "Start Chat"
  },
  {
    icon: <Mail className="w-8 h-8 text-blue-600" />,
    title: "Email Us",
    description: "Send us an email and we'll get back to you within 24 hours.",
    link: "mailto:support@travelplanner.com",
    linkText: "support@travelplanner.com"
  },
  {
    icon: <Clock className="w-8 h-8 text-blue-600" />,
    title: "24/7 Support",
    description: "Our support team is available round the clock to help you.",
    link: "#",
    linkText: "View Hours"
  }
];

const offices = [
  {
    city: "New York",
    address: "123 Travel Street, NY 10001",
    phone: "+1 (555) 123-4567",
    email: "nyc@travelplanner.com"
  },
  {
    city: "London",
    address: "456 Journey Lane, London EC1A 1BB",
    phone: "+44 20 7123 4567",
    email: "london@travelplanner.com"
  },
  {
    city: "Singapore",
    address: "789 Wanderlust Road, Singapore 018956",
    phone: "+65 6789 0123",
    email: "singapore@travelplanner.com"
  }
];

export default Contact;
