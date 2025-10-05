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
  Award,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";

const HomePage = () => {
  const [isVisible, setIsVisible] = useState<Record<string, boolean>>({});
  const [_mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const features = [
    {
      title: "AI-Powered Writing",
      description:
        "Collaborate with advanced AI to craft compelling narratives and overcome writer's block.",
      icon: <Zap className="w-8 h-8" />,
      gradient: " ",
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
      gradient: "from-indigo-500 ",
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

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-black text-black dark:text-white overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center">
        <div className="relative z-10 text-center px-6 max-w-6xl mx-auto mt-20">
          <div className="mb-8 animate-fade-in">
            <Sparkles className="w-16 h-16 mx-auto mb-6 text-dark-green dark:text-light-green animate-spin-slow" />
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-black to-dark-green dark:from-white dark:to-light-green bg-clip-text text-transparent leading-tight">
            <span className="block animate-slide-up">Welcome to</span>
            <span className="block animate-slide-up-delayed bg-gradient-to-r from-dark-green to-light-green bg-clip-text text-transparent">
              NovelSync
            </span>
          </h1>

          <p className="text-xl md:text-2xl mb-8 text-black/80 dark:text-white/80 animate-fade-in-delayed max-w-3xl mx-auto leading-relaxed">
            Where stories come alive and writers thrive. Join the future of
            collaborative storytelling.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-delayed-2">
            <button className="group relative px-8 py-4 bg-gradient-to-r from-dark-green to-light-green rounded-full font-semibold text-lg overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl text-white">
              <span className="relative z-10">Start Writing</span>
              <div className="absolute inset-0 bg-gradient-to-r from-light-green to-dark-green transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
            </button>

            <Link to="/explore">
              <button className="group px-8 py-4 border-2 border-dark-green dark:border-light-green text-dark-green dark:text-light-green rounded-full font-semibold text-lg transition-all duration-300 hover:bg-dark-green dark:hover:bg-light-green hover:text-white dark:hover:text-black hover:scale-105">
                <span className="flex items-center justify-center">
                  <BookOpen className="w-5 h-5 mr-2" />
                  Explore Stories
                </span>
              </button>
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <section className="py-20">
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
              <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 bg-gradient-to-r from-black to-dark-green dark:from-white dark:to-light-green bg-clip-text text-transparent">
                Powerful Features
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className="group relative p-8 rounded-2xl bg-gradient-to-br from-white/90 to-light-green/10 dark:from-black/90 dark:to-dark-green/10 backdrop-blur-sm border border-black/20 dark:border-white/20 hover:border-dark-green dark:hover:border-light-green transition-all duration-500 hover:scale-105 hover:shadow-2xl"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div
                      className={`w-16 h-16 rounded-xl bg-gradient-to-r from-dark-green to-light-green p-3 mb-6 group-hover:scale-110 transition-transform duration-300`}
                    >
                      <div className="text-white">{feature.icon}</div>
                    </div>

                    <h3 className="text-xl font-bold mb-4 text-black dark:text-white transition-colors duration-300">
                      {feature.title}
                    </h3>
                    <p className="text-black/70 dark:text-white/70 leading-relaxed">
                      {feature.description}
                    </p>

                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-dark-green/0 to-light-green/0 group-hover:from-dark-green/5 group-hover:to-light-green/5 transition-all duration-500"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20">
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
              <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 bg-gradient-to-r from-black to-dark-green dark:from-white dark:to-light-green bg-clip-text text-transparent">
                What Writers Say
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {testimonials.map((testimonial, index) => (
                  <div
                    key={index}
                    className="relative p-8 rounded-2xl bg-gradient-to-br from-white/90 to-light-green/10 dark:from-black/90 dark:to-dark-green/10 backdrop-blur-sm border border-black/20 dark:border-white/20 transition-all duration-500 hover:scale-105"
                  >
                    <div className="flex mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-5 h-5 text-dark-green dark:text-light-green fill-current"
                        />
                      ))}
                    </div>

                    <p className="text-black/70 dark:text-white/70 mb-6 italic leading-relaxed">
                      "{testimonial.text}"
                    </p>

                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gradient-to-r from-dark-green to-light-green rounded-full flex items-center justify-center mr-4">
                        <span className="text-white font-bold">
                          {testimonial.author
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-black dark:text-white">
                          {testimonial.author}
                        </p>
                        <p className="text-sm text-black/60 dark:text-white/60">
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
        <section className="py-20">
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
              <div className="relative p-12 rounded-3xl bg-gradient-to-r from-white/90 to-light-green/20 dark:from-black/90 dark:to-dark-green/20 backdrop-blur-sm border border-black/20 dark:border-white/20 max-w-4xl mx-auto">
                <div className="absolute inset-0 bg-gradient-to-r from-dark-green/10 to-light-green/10 rounded-3xl"></div>

                <div className="relative z-10">
                  <Award className="w-16 h-16 mx-auto mb-6 text-dark-green dark:text-light-green" />
                  <h2 className="text-3xl md:text-4xl font-bold mb-6 text-black dark:text-white">
                    Ready to Start Your Journey?
                  </h2>
                  <p className="text-xl text-black/70 dark:text-white/70 mb-8 max-w-2xl mx-auto">
                    Join thousands of writers and readers in the most innovative
                    storytelling platform ever created.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button className="group relative px-8 py-4 bg-gradient-to-r from-dark-green to-light-green text-white rounded-full font-semibold text-lg overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                      <span className="relative z-10 flex items-center justify-center">
                        <Heart className="w-5 h-5 mr-2" />
                        Join NovelSync
                      </span>
                    </button>

                    <button className="px-8 py-4 border-2 border-dark-green dark:border-light-green text-dark-green dark:text-light-green rounded-full font-semibold text-lg transition-all duration-300 hover:bg-dark-green dark:hover:bg-light-green hover:text-white dark:hover:text-black hover:scale-105">
                      Learn More
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </section>

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
