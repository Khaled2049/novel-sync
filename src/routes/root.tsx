import { useState, useEffect } from "react";
import {
  Book,
  BookOpen,
  Globe,
  MessageCircle,
  Users,
  Star,
  Zap,
  Heart,
  TrendingUp,
  Award,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";

const HomePage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isVisible, setIsVisible] = useState<Record<string, boolean>>({});
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const novels = [
    {
      title: "The Lost Kingdom",
      author: "John Doe",
      description:
        "An epic fantasy adventure that takes you through mystical realms and ancient prophecies.",
      cover:
        "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=600&fit=crop",
      genre: "Fantasy",
      rating: 4.8,
    },
    {
      title: "Future Visions",
      author: "Alice Johnson",
      description:
        "A mind-bending journey into tomorrow's possibilities and technological wonders.",
      cover:
        "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&h=600&fit=crop",
      genre: "Sci-Fi",
      rating: 4.9,
    },
    {
      title: "Midnight Chronicles",
      author: "Emma Blake",
      description:
        "Dark mysteries unfold in this thrilling tale of suspense and intrigue.",
      cover:
        "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=600&fit=crop",
      genre: "Mystery",
      rating: 4.7,
    },
  ];

  const features = [
    {
      title: "AI-Powered Writing",
      description:
        "Collaborate with advanced AI to craft compelling narratives and overcome writer's block.",
      icon: <Zap className="w-8 h-8" />,
      gradient: "from-amber-500 to-amber-500",
    },
    {
      title: "Global Community",
      description:
        "Connect with readers and writers worldwide in our vibrant literary ecosystem.",
      icon: <Globe className="w-8 h-8" />,
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      title: "Smart Feedback",
      description:
        "Get intelligent insights and constructive feedback to elevate your storytelling.",
      icon: <MessageCircle className="w-8 h-8" />,
      gradient: "from-green-500 to-emerald-500",
    },
    {
      title: "Draft Protection",
      description:
        "Auto-save and version control ensure your creative work is always secure.",
      icon: <Book className="w-8 h-8" />,
      gradient: "from-orange-500 to-red-500",
    },
    {
      title: "Book Clubs+",
      description:
        "Join curated discussions and exclusive author events in premium book clubs.",
      icon: <Users className="w-8 h-8" />,
      gradient: "from-indigo-500 to-amber-500",
    },
    {
      title: "Spoiler-Free Zone",
      description:
        "Enjoy reviews and discussions without spoilers using our intelligent filtering system.",
      icon: <BookOpen className="w-8 h-8" />,
      gradient: "from-teal-500 to-blue-500",
    },
  ];

  const testimonials = [
    {
      text: "NovelSync transformed my writing process. The AI collaboration feature helped me break through creative barriers I never thought possible.",
      author: "Sarah Chen",
      role: "Bestselling Author",
      rating: 5,
    },
    {
      text: "The community here is incredible. I've found beta readers, critique partners, and lifelong friends through this platform.",
      author: "Marcus Rivera",
      role: "Indie Writer",
      rating: 5,
    },
    {
      text: "As a reader, I love discovering new stories here. The recommendation system is spot-on, and the spoiler-free reviews are genius.",
      author: "Elena Kowalski",
      role: "Avid Reader",
      rating: 5,
    },
  ];

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % novels.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible((prev) => ({
            ...prev,
            [entry.target.id]: entry.isIntersecting,
          }));
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll("[data-animate]").forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const FloatingElements = () => (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-amber-400 rounded-full animate-pulse opacity-60"></div>
      <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-blue-400 rounded-full animate-bounce opacity-60"></div>
      <div className="absolute top-1/2 left-3/4 w-3 h-3 bg-amber-400 rounded-full animate-pulse opacity-40"></div>
      <div
        className="absolute w-4 h-4 bg-gradient-to-r from-amber-400 to-amber-400 rounded-full opacity-30 transition-all duration-300 ease-out"
        style={{
          left: mousePosition.x / 50 + "px",
          top: mousePosition.y / 50 + "px",
        }}
      ></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-amber-900 to-slate-900 text-white overflow-hidden">
      <FloatingElements />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-900/20 to-amber-900/20"></div>
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-amber-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-amber-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute bottom-1/4 left-1/2 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        </div>

        <div className="relative z-10 text-center px-6 max-w-6xl mx-auto">
          <div className="mb-8 animate-fade-in">
            <Sparkles className="w-16 h-16 mx-auto mb-6 text-yellow-400 animate-spin-slow" />
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-amber-200 to-amber-200 bg-clip-text text-transparent leading-tight">
            <span className="block animate-slide-up">Welcome to</span>
            <span className="block animate-slide-up-delayed bg-gradient-to-r from-amber-400 to-amber-400 bg-clip-text text-transparent">
              NovelSync
            </span>
          </h1>

          <p className="text-xl md:text-2xl mb-8 text-gray-300 animate-fade-in-delayed max-w-3xl mx-auto leading-relaxed">
            Where stories come alive and writers thrive. Join the future of
            collaborative storytelling.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-delayed-2">
            <button className="group relative px-8 py-4 bg-gradient-to-r from-amber-600 to-amber-600 rounded-full font-semibold text-lg overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-amber-500/25">
              <span className="relative z-10">Start Writing</span>
              <div className="absolute inset-0 bg-gradient-to-r from-amber-700 to-amber-700 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
            </button>

            <Link to="/explore">
              <button className="group px-8 py-4 border-2 border-amber-400 rounded-full font-semibold text-lg transition-all duration-300 hover:bg-amber-400 hover:text-white hover:scale-105">
                <span className="flex items-center justify-center">
                  <BookOpen className="w-5 h-5 mr-2" />
                  Explore Stories
                </span>
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Stories */}
      <section className="py-20 relative">
        <div className="container mx-auto px-6">
          <div
            id="featured-stories"
            data-animate
            className={`transition-all duration-1000 ${
              isVisible["featured-stories"]
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 bg-gradient-to-r from-white to-amber-200 bg-clip-text text-transparent">
              Featured Stories
            </h2>

            <div className="max-w-4xl mx-auto">
              <div className="relative h-96 md:h-[500px] rounded-2xl overflow-hidden">
                {novels.map((novel, index) => (
                  <div
                    key={index}
                    className={`absolute inset-0 transition-all duration-700 ${
                      index === currentSlide
                        ? "opacity-100 scale-100"
                        : "opacity-0 scale-95"
                    }`}
                  >
                    <div className="relative h-full bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent"></div>
                      <img
                        src={novel.cover}
                        alt={novel.title}
                        className="absolute right-0 top-0 h-full w-1/2 object-cover"
                      />

                      <div className="relative z-10 p-8 md:p-12 h-full flex flex-col justify-center max-w-xl">
                        <div className="flex items-center mb-4">
                          <span className="px-3 py-1 bg-amber-500 rounded-full text-sm font-medium mr-3">
                            {novel.genre}
                          </span>
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < Math.floor(novel.rating)
                                    ? "text-yellow-400 fill-current"
                                    : "text-gray-400"
                                }`}
                              />
                            ))}
                            <span className="ml-2 text-sm text-gray-300">
                              {novel.rating}
                            </span>
                          </div>
                        </div>

                        <h3 className="text-3xl md:text-4xl font-bold mb-2">
                          {novel.title}
                        </h3>
                        <p className="text-amber-300 mb-4 text-lg">
                          by {novel.author}
                        </p>
                        <p className="text-gray-300 text-lg leading-relaxed mb-6">
                          {novel.description}
                        </p>

                        <button className="self-start px-6 py-3 bg-white text-black rounded-full font-semibold hover:bg-gray-100 transition-colors duration-300">
                          Read Now
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-center mt-6 space-x-2">
                {novels.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentSlide
                        ? "bg-amber-500 scale-125"
                        : "bg-gray-600 hover:bg-gray-500"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-6">
          <div
            id="features"
            data-animate
            className={`transition-all duration-1000 ${
              isVisible["features"]
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 bg-gradient-to-r from-white to-amber-200 bg-clip-text text-transparent">
              Powerful Features
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="group relative p-8 rounded-2xl bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-sm border border-gray-700 hover:border-amber-500 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-amber-500/10"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div
                    className={`w-16 h-16 rounded-xl bg-gradient-to-r ${feature.gradient} p-3 mb-6 group-hover:scale-110 transition-transform duration-300`}
                  >
                    {feature.icon}
                  </div>

                  <h3 className="text-xl font-bold mb-4 group-hover:text-amber-300 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-gray-300 leading-relaxed">
                    {feature.description}
                  </p>

                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-amber-500/0 to-amber-500/0 group-hover:from-amber-500/5 group-hover:to-amber-500/5 transition-all duration-500"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 relative">
        <div className="container mx-auto px-6">
          <div
            id="testimonials"
            data-animate
            className={`transition-all duration-1000 ${
              isVisible["testimonials"]
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 bg-gradient-to-r from-white to-amber-200 bg-clip-text text-transparent">
              What Writers Say
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className="relative p-8 rounded-2xl bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-sm border border-gray-700 hover:border-amber-500 transition-all duration-500 hover:scale-105"
                >
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-5 h-5 text-yellow-400 fill-current"
                      />
                    ))}
                  </div>

                  <p className="text-gray-300 mb-6 italic leading-relaxed">
                    "{testimonial.text}"
                  </p>

                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-amber-500 rounded-full flex items-center justify-center mr-4">
                      <span className="text-white font-bold">
                        {testimonial.author
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold">{testimonial.author}</p>
                      <p className="text-sm text-gray-400">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-6 text-center">
          <div
            id="cta"
            data-animate
            className={`transition-all duration-1000 ${
              isVisible["cta"]
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            <div className="relative p-12 rounded-3xl bg-gradient-to-r from-amber-900/30 to-amber-900/30 backdrop-blur-sm border border-amber-500/20 max-w-4xl mx-auto">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-amber-500/10 rounded-3xl"></div>

              <div className="relative z-10">
                <Award className="w-16 h-16 mx-auto mb-6 text-yellow-400" />
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  Ready to Start Your Journey?
                </h2>
                <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                  Join thousands of writers and readers in the most innovative
                  storytelling platform ever created.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button className="group relative px-8 py-4 bg-gradient-to-r from-amber-600 to-amber-600 rounded-full font-semibold text-lg overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-amber-500/25">
                    <span className="relative z-10 flex items-center justify-center">
                      <Heart className="w-5 h-5 mr-2" />
                      Join NovelSync
                    </span>
                  </button>

                  <button className="px-8 py-4 border-2 border-amber-400 rounded-full font-semibold text-lg transition-all duration-300 hover:bg-amber-400 hover:text-white hover:scale-105">
                    Learn More
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Beta Notice */}
      <div className="bg-gradient-to-r from-orange-900/20 to-red-900/20 border-t border-orange-500/20 py-4">
        <div className="container mx-auto px-6 text-center">
          <p className="text-orange-300 flex items-center justify-center">
            <TrendingUp className="w-4 h-4 mr-2" />
            Beta Version - Crafting the future of storytelling, one update at a
            time
          </p>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }

        .animate-fade-in-delayed {
          animation: fade-in 1s ease-out 0.3s both;
        }

        .animate-fade-in-delayed-2 {
          animation: fade-in 1s ease-out 0.6s both;
        }

        .animate-slide-up {
          animation: slide-up 1s ease-out;
        }

        .animate-slide-up-delayed {
          animation: slide-up 1s ease-out 0.2s both;
        }

        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default HomePage;
