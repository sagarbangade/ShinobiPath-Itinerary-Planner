import {
  Calendar, Map, Users, Clock, Bookmark, Wallet, User, Smartphone, Wifi, Star, Search,
} from "lucide-react";
import Footer from "../components/Footer";
import LandingPageNavbar from "../components/LandingPageNavbar";
import { useState, useEffect, useRef } from 'react';

const HomePage = () => {
  const [particles, setParticles] = useState([]);
  const containerRef = useRef(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);

  // --- Mobile Device Detection ---
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 768); // Use Tailwind's 'md' breakpoint
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // --- Particle System ---
  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();

    const createOriginalParticle = () => {
      const size = Math.random() * 5 + 2;
      const x = Math.random() * containerRect.width;
      const y = Math.random() * containerRect.height;
      const duration = Math.random() * 3 + 1;
      const delay = Math.random() * 2;

      return {
        id: `original-${Date.now() + Math.random()}`,
        style: {
          position: 'absolute',
          left: `${x}px`,
          top: `${y}px`,
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: '50%',
          backgroundColor: `rgba(255, 255, 255, ${Math.random() * 0.5 + 0.2})`,
          animation: `float-original ${duration}s ease-in-out ${delay}s infinite`, // Use float-original
          pointerEvents: 'none',
          zIndex: 1,
        }
      };
    };

    const createGlowParticle = () => {
      const size = Math.random() * 3 + 1;
      const x = Math.random() * containerRect.width;
      const y = Math.random() * containerRect.height;
      const duration = Math.random() * 5 + 3;
      const delay = Math.random() * 4;
      const opacity = Math.random() * 0.2 + 0.05;

      return {
        id: `glow-${Date.now() + Math.random()}`,
        style: {
          position: 'absolute',
          left: `${x}px`,
          top: `${y}px`,
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: '50%',
          backgroundColor: `rgba(255, 105, 0, ${opacity})`,
          animation: `float ${duration}s ease-in-out ${delay}s infinite, glow 4s ease-in-out ${delay}s infinite`,
          pointerEvents: 'none',
          zIndex: 1,
          opacity: 0,
          animationFillMode: 'forwards',
        }
      };
    };

    const initialParticles = [];
    if (!isMobile) {
      for (let i = 0; i < 20; i++) initialParticles.push(createOriginalParticle());
      for (let i = 0; i < 10; i++) initialParticles.push(createGlowParticle());
    }
    setParticles(initialParticles);

    const intervalIdOriginal = setInterval(() => {
      if (!isMobile && particles.filter(p => p.id.startsWith('original')).length < 30) {
        setParticles(prevParticles => [...prevParticles, createOriginalParticle()]);
      }
    }, 2000);

    const intervalIdGlow = setInterval(() => {
      if (!isMobile && particles.filter(p => p.id.startsWith('glow')).length < 15) {
        setParticles(prevParticles => [...prevParticles, createGlowParticle()]);
      }
    }, 4000);

    return () => {
      clearInterval(intervalIdOriginal);
      clearInterval(intervalIdGlow);
    };
  }, [isMobile, particles.length]);

  // --- Mouse Move Effect (Parallax) ---
  useEffect(() => {
    if (isMobile) return;

    const handleMouseMove = (event) => {
      setMousePosition({
        x: (event.clientX / window.innerWidth) * 2 - 1,
        y: (event.clientY / window.innerHeight) * 2 - 1,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isMobile]);

  // --- CSS Animations (Keyframes) ---
  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = `
      @keyframes float {
        0%   { transform: translateY(0) rotate(0deg); opacity: 0; }
        25%  { opacity: 0.7; }
        50%  { transform: translateY(-10px) rotate(10deg); }
        75%  { opacity: 0.7; }
        100% { transform: translateY(0) rotate(0deg); opacity: 0; }
      }
      @keyframes float-original {
          0% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(10deg); }
          100% { transform: translateY(0) rotate(0deg); }
      }
      @keyframes glow {
        0%   { box-shadow: 0 0 3px rgba(255, 105, 0, 0.3); }
        50%  { box-shadow: 0 0 15px rgba(255, 105, 0, 0.7); }
        100% { box-shadow: 0 0 3px rgba(255, 105, 0, 0.3); }
      }
      .gradient-text {
        background-clip: text;
        -webkit-background-clip: text;
        color: transparent;
      }
      .scroll-animate {
        opacity: 0;
        transform: translateY(30px);
        transition: opacity 0.8s ease-out, transform 0.8s ease-out;
      }
      .animate-in {
        opacity: 1;
        transform: translateY(0);
      }
      .parallax {
        transition: transform 0.2s ease-out;
      }
    `;
    document.head.appendChild(styleSheet);
  }, []);

  // --- Scroll-triggered Animations ---
  useEffect(() => {
    const observerOptions = { root: null, rootMargin: '0px', threshold: 0.15 };
    const observer = new IntersectionObserver(animateOnScroll, observerOptions);

    const elements = document.querySelectorAll('.scroll-animate');
    elements.forEach(el => observer.observe(el));

    return () => elements.forEach(el => observer.unobserve(el));
  }, []);

  const animateOnScroll = (entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in');
        observer.unobserve(entry.target);
      }
    });
  };

    // --- Calculate Kanji Position ---
  const getKanjiPosition = () => {
      if (isMobile) {
        return { top: '-40px', right: '10px', fontSize: '3rem' }; // Smaller and closer for mobile
      }
      // Values for larger screens
      return { top: '-50px', right: '150px', fontSize: '9rem' };
    };

    const kanjiPosition = getKanjiPosition();


  return (
    <div ref={containerRef} className="min-h-screen bg-gray-950 text-white relative overflow-hidden">
      {/* Particles */}
      {particles.map(particle => (
        <div key={particle.id} style={particle.style} />
      ))}

      <LandingPageNavbar />

       {/* --- Hero Section --- */}
      <header className="relative z-10 pt-32 sm:pt-40 pb-24 sm:pb-32">
        <div className="container mx-auto px-4 text-center">
          <div className="relative ">
            <h1
              className="text-5xl  sm:text-6xl md:text-7xl lg:text-8xl font-extrabold mb-8 sm:mb-10 tracking-widest relative gradient-text bg-gradient-to-r from-orange-500 via-yellow-400 to-orange-600 parallax"
              style={{ transform: `translate(${mousePosition.x * 20}px, ${mousePosition.y * 20}px)` }}
            >
              ShinobiPath
              {/* Kanji Character with Dynamic Positioning */}
              <span
                className="absolute text-gray-300 opacity-30"
                style={{
                  fontFamily: "'Brush Script MT', cursive",
                  top: kanjiPosition.top,
                  right: kanjiPosition.right,
                  fontSize: kanjiPosition.fontSize,
                }}
              >
                忍
              </span>
            </h1>
            <p
              className="text-base sm:text-lg md:text-2xl lg:text-3xl mb-16 sm:mb-20 text-gray-300 max-w-3xl sm:max-w-4xl lg:max-w-5xl mx-auto leading-relaxed parallax"
              style={{ transform: `translate(${mousePosition.x * 10}px, ${mousePosition.y * 10}px)` }}
            >
              Become the master of your travel destiny. Harness the power of the ninja: plan with unparalleled
              precision, navigate with unmatched agility, and experience journeys beyond the ordinary.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 justify-center">
            <button className="bg-gradient-to-r from-orange-600 to-yellow-500 text-white px-8 sm:px-12 py-4 sm:py-5 rounded-full font-semibold hover:from-yellow-500 hover:to-orange-600 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50 shadow-xl text-base sm:text-xl">
              Unleash Your Journey
            </button>
            <button className="border-2 border-orange-500 text-orange-500 px-8 sm:px-12 py-4 sm:py-5 rounded-full font-semibold hover:bg-orange-500 hover:text-white transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50 text-base sm:text-xl">
              Explore the Secrets
            </button>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-32 sm:h-48 bg-gradient-to-t from-gray-950 to-transparent -z-10" />
      </header>

      {/* --- Features Section --- */}
      <section className="py-20 sm:py-28 relative z-10 bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl sm:text-5xl font-bold text-center mb-16 sm:mb-24 text-white scroll-animate">
            Elite Ninja Arsenal
          </h2>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 md:gap-16 lg:gap-20">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-black p-8 sm:p-10 md:p-12 rounded-3xl sm:rounded-4xl shadow-2xl relative overflow-hidden scroll-animate transition-transform transform hover:scale-105"
              >
                <div className="absolute inset-0 opacity-15" style={{
                  backgroundImage: `url('/img/japanese-wave.png')`,
                  backgroundRepeat: 'repeat',
                  backgroundSize: '100px sm:150px',
                }}></div>
                <div
                  className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-gradient-to-br from-orange-700 via-yellow-500 to-orange-600 rounded-full flex items-center justify-center mb-8 sm:mb-10 text-white relative z-10 transition-transform"
                  style={{ transform: `rotate(${mousePosition.x * 10}deg)` }}
                >
                  {feature.icon}
                </div>
                <h3 className="text-2xl sm:text-3xl font-semibold mb-4 sm:mb-6 text-orange-400 relative z-10">
                  {feature.title}
                </h3>
                <p className="text-gray-400 relative z-10 leading-relaxed text-base sm:text-lg">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- How It Works Section --- */}
      <section className="py-20 sm:py-28 relative z-10">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl sm:text-5xl font-bold text-center mb-16 sm:mb-24 scroll-animate">
            The Way of the Shadow Warrior
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16 lg:gap-20">
            {steps.map((step, index) => (
              <div key={index} className="text-center group scroll-animate">
                <div className="relative inline-block rounded-full overflow-hidden group-hover:shadow-lg transition-shadow duration-300">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-orange-700 via-yellow-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6 sm:mb-8 text-white text-2xl sm:text-3xl lg:text-4xl font-bold">
                    {index + 1}
                  </div>
                </div>
                <h3 className="text-2xl sm:text-3xl font-semibold mb-4 sm:mb-6">{step.title}</h3>
                <p className="text-gray-400 leading-relaxed text-base sm:text-lg">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- Testimonials Section --- */}
      <section className="py-20 sm:py-28 relative z-10 bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl sm:text-5xl font-bold text-center mb-16 sm:mb-24 text-white scroll-animate">
            Echoes from the Shadows
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16 lg:gap-20">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-black p-8 sm:p-10 md:p-12 rounded-3xl sm:rounded-4xl shadow-2xl relative scroll-animate"
              >
                <div className="flex gap-2 sm:gap-3 mb-6 sm:mb-10">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-6 h-6 sm:w-7 sm:h-7 text-yellow-500 fill-current" />
                  ))}
                </div>
                <p className="text-gray-400 mb-6 sm:mb-10 italic leading-relaxed text-base sm:text-lg">
                  “{testimonial.text}”
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gray-800 rounded-full mr-4 sm:mr-6 overflow-hidden">
                    <img src="/img/avatar-placeholder.jpg" alt="User Avatar" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="font-semibold text-base sm:text-lg">{testimonial.name}</p>
                    <p className="text-sm sm:text-base text-gray-500">{testimonial.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- CTA Section --- */}
      <section className="bg-gradient-to-r from-red-700 via-orange-600 to-yellow-500 py-20 sm:py-28 relative z-10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl sm:text-5xl font-bold mb-8 sm:mb-10 text-white scroll-animate">
            Embrace the Path of the Shinobi
          </h2>
          <p className="text-xl sm:text-2xl mb-12 sm:mb-20 text-gray-100 max-w-3xl sm:max-w-4xl mx-auto leading-relaxed scroll-animate">
            Join the ranks of the elite. Plan with ultimate precision. Travel with unmatched freedom.
          </p>
          <button className="bg-gray-950 text-white px-10 sm:px-14 py-4 sm:py-6 rounded-full font-semibold hover:bg-black transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50 shadow-xl text-lg sm:text-2xl scroll-animate">
            Begin Your Legend
          </button>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};
const features = [
  {
    icon: <Search className="w-10 h-10 md:w-12 md:h-12" />,
    title: "Ultimate Reconnaissance",
    description:
      "Uncover hidden travel destinations and exclusive experiences with our advanced search algorithms.  Find secrets that others overlook.",
  },
  {
    icon: <Map className="w-10 h-10 md:w-12 md:h-12" />,
    title: "Shadow Step Navigation",
    description:
      "Visualize your journey with dynamic, interactive maps.  Track your precise location, mark points of interest, and move with unwavering confidence.",
  },
  {
    icon: <Users className="w-10 h-10 md:w-12 md:h-12" />,
    title: "Shadow Clan Coordination",
    description:
      "Share your travel plans and collaborate seamlessly with your companions.  Achieve perfect synchronization for group expeditions.",
  },
  {
    icon: <Clock className="w-10 h-10 md:w-12 md:h-12" />,
    title: "Mastery of Time",
    description:
      "Control your schedule with absolute precision. Set reminders, manage your time effortlessly, and never miss a critical moment.",
  },
  {
    icon: <Bookmark className="w-10 h-10 md:w-12 md:h-12" />,
    title: "Forbidden Scrolls",
    description:
      "Utilize pre-designed itinerary templates or create your own from scratch.  Adapt to any situation with the knowledge of the ancients.",
  },
  {
    icon: <Wallet className="w-10 h-10 md:w-12 md:h-12" />,
    title: "Secret Stash Management",
    description:
      "Maintain a meticulous record of your travel expenses.  Stay within your budget and ensure your resources are used with utmost efficiency.",
  },
  {
    icon: <User className="w-10 h-10 md:w-12 md:h-12" />,
    title: "Shinobi Profile",
    description:
      "Create your personalized profile.  Record your past conquests and receive tailored recommendations for your next grand adventure.",
  },
  {
    icon: <Smartphone className="w-10 h-10 md:w-12 md:h-12" />,
    title: "Signal Flare Communication",
    description:
      "Access your travel plans on any device.  Stay connected and informed, no matter where your mission takes you.",
  },
  {
    icon: <Wifi className="w-10 h-10 md:w-12 md:h-12" />,
    title: "Ghost Mode",
    description:
      "Download your itinerary for offline access.  Operate effectively even in the most remote locations, beyond the reach of any network.",
  },
];
const steps = [
  {
    title: "Craft Your Legend",
    description: "Sign up and instantly access your personalized travel planning sanctuary.",
  },
  {
    title: "Mark Your Destiny",
    description: "Add your desired destinations, explore potential routes, and gather critical intelligence.",
  },
  {
    title: "Perfect Your Technique",
    description: "Customize your itinerary, add activities, set precise timings, and share with your trusted allies.",
  },
];

const testimonials = [
  {
    text: "ShinobiPath is not just a travel planner; it's a transformation. It turned my disorganized trips into seamless, unforgettable experiences!",
    name: "Ayumi Tanaka",
    location: "Tokyo, Japan",
  },
  {
    text: "The offline access feature was indispensable during my trek through the uncharted wilderness.  A true lifesaver for any adventurer.",
    name: "Kenzo Masuda",
    location: "Kyoto, Japan",
  },
  {
    text: "The real-time collaboration capabilities made coordinating our group journey a breeze.  Finally, a way to plan together in perfect harmony!",
    name: "Sakura Ito",
    location: "Osaka, Japan",
  },
];
export default HomePage;