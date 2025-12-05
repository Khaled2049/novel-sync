import { useState, useEffect, useRef } from "react";
import {
  Zap,
  Target,
  Users,
  MessageSquare,
  Database,
  Sparkles,
  GitBranch,
  Lightbulb,
  Wand2,
  Play,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const [scrollY, setScrollY] = useState(0);
  const [_activeSection, setActiveSection] = useState(0);
  const sectionsRef = useRef<HTMLElement[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);

      // Determine active section
      const sections = sectionsRef.current;
      const current = sections.findIndex((section, _index) => {
        if (!section) return false;
        const rect = section.getBoundingClientRect();
        return (
          rect.top <= window.innerHeight / 2 &&
          rect.bottom >= window.innerHeight / 2
        );
      });

      if (current !== -1) setActiveSection(current);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const addToRefs = (el: HTMLElement | null) => {
    if (el && !sectionsRef.current.includes(el)) {
      sectionsRef.current.push(el);
    }
  };

  const heroOpacity = Math.max(0, 1 - scrollY / 600);
  const heroScale = Math.max(0.9, 1 - scrollY / 2000);

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-black text-black dark:text-white">
      {/* Hero Section - The Hook */}
      <section
        ref={addToRefs}
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
        style={{
          opacity: heroOpacity,
          transform: `scale(${heroScale})`,
        }}
      >
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-light-green/5 via-transparent to-dark-green/5"></div>
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute text-dark-green/10 dark:text-light-green/10 font-mono text-sm"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `float ${10 + Math.random() * 20}s linear infinite`,
                animationDelay: `${Math.random() * 5}s`,
              }}
            >
              {
                [
                  "const story",
                  "let imagination",
                  "async write()",
                  "return epic",
                ][Math.floor(Math.random() * 4)]
              }
            </div>
          ))}
        </div>

        <div className="relative z-10 text-center px-6 max-w-6xl mx-auto">
          <Sparkles className="w-20 h-20 mx-auto mb-8 text-dark-green dark:text-light-green animate-pulse" />

          <h1 className="text-6xl md:text-8xl font-bold mb-6 leading-tight">
            <span className="block bg-gradient-to-r from-black to-dark-green dark:from-white dark:to-light-green bg-clip-text text-transparent">
              The Future of
            </span>
            <span className="block bg-gradient-to-r from-dark-green to-light-green bg-clip-text text-transparent">
              Storytelling, Powered by AI
            </span>
          </h1>

          <p className="text-xl md:text-2xl mb-12 text-black/70 dark:text-white/70 max-w-3xl mx-auto">
            A collaborative canvas for authors and communities, built on React,
            TypeScript, and Firebase.
          </p>

          <button
            onClick={() => navigate("/explore")}
            className="group relative px-10 py-5 bg-gradient-to-r from-dark-green to-light-green rounded-full font-bold text-xl text-white overflow-hidden transition-all duration-300 hover:scale-110 hover:shadow-2xl"
          >
            <span className="relative z-10">Start Writing Now</span>
            <div className="absolute inset-0 bg-gradient-to-r from-light-green to-dark-green transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
          </button>

          <div className="mt-16 animate-bounce">
            <div className="w-6 h-10 border-2 border-dark-green dark:border-light-green rounded-full mx-auto flex items-start justify-center p-2">
              <div className="w-1.5 h-3 bg-dark-green dark:bg-light-green rounded-full animate-scroll"></div>
            </div>
          </div>
        </div>
      </section>

      {/* AI-Powered Writing Engine - The Agents */}
      <section
        ref={addToRefs}
        className="min-h-screen flex items-center justify-center py-20 px-6 bg-gradient-to-b from-transparent via-light-green/5 to-transparent dark:via-dark-green/5"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-black to-dark-green dark:from-white dark:to-light-green bg-clip-text text-transparent">
              Your Three Co-Authors
            </h2>
            <p className="text-2xl text-black/70 dark:text-white/70">
              Intelligent Agents
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Lightbulb,
                title: "Brainstorming Agent",
                description:
                  "Stuck on a twist? Our Brainstorming Agent generates fresh, complex ideas and scenarios instantly.",
                gradient: "from-yellow-500 to-orange-500",
              },
              {
                icon: Wand2,
                title: "Context Creator Agent",
                description:
                  "Takes your existing inputs (Lore, Characters, Plot) and generates the perfect next line of dialogue or description.",
                gradient: "from-purple-500 to-pink-500",
              },
              {
                icon: Target,
                title: "Book Recommendation Agent",
                description:
                  "Connecting your finished work to the right audience using deep analysis to suggest books and genres.",
                gradient: "from-blue-500 to-cyan-500",
              },
            ].map((agent, index) => (
              <div
                key={index}
                className="group relative p-8 bg-white dark:bg-neutral-900 rounded-3xl border-2 border-black/10 dark:border-white/10 hover:border-dark-green dark:hover:border-light-green transition-all duration-500 hover:scale-105 hover:shadow-2xl"
                style={{
                  animation: `slideUp 0.8s ease-out ${index * 0.2}s both`,
                }}
              >
                <div
                  className={`w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-r ${agent.gradient} p-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}
                >
                  <agent.icon className="w-full h-full text-white" />
                </div>

                <h3 className="text-2xl font-bold mb-4 text-center text-black dark:text-white">
                  {agent.title}
                </h3>

                <p className="text-black/70 dark:text-white/70 text-center leading-relaxed">
                  {agent.description}
                </p>

                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-dark-green/0 to-light-green/0 group-hover:from-dark-green/5 group-hover:to-light-green/5 transition-all duration-500"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Collaborative Ecosystem - Community */}
      <section
        ref={addToRefs}
        className="min-h-screen flex items-center justify-center py-20 px-6"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-black to-dark-green dark:from-white dark:to-light-green bg-clip-text text-transparent">
              Connect, Collaborate, Cultivate
            </h2>
            <p className="text-2xl text-black/70 dark:text-white/70">
              Your Audience
            </p>
          </div>

          <div className="relative">
            {/* Network Visualization */}
            <div className="absolute inset-0 flex items-center justify-center opacity-10">
              <svg width="100%" height="400" className="max-w-4xl">
                {[...Array(8)].map((_, i) => (
                  <line
                    key={i}
                    x1="50%"
                    y1="50%"
                    x2={`${50 + 40 * Math.cos((i * Math.PI) / 4)}%`}
                    y2={`${50 + 40 * Math.sin((i * Math.PI) / 4)}%`}
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-dark-green dark:text-light-green"
                  />
                ))}
              </svg>
            </div>

            <div className="relative grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: Users,
                  title: "Community & Following",
                  description:
                    "Build your readership by allowing followers to track your progress and celebrate your milestones.",
                  color: "from-green-500 to-emerald-500",
                },
                {
                  icon: GitBranch,
                  title: "Real-Time Collaboration",
                  description:
                    "Invite collaborators to edit, contribute, and manage sections of your project in real-time.",
                  color: "from-blue-500 to-purple-500",
                },
                {
                  icon: MessageSquare,
                  title: "Book Clubs & Socializing",
                  description:
                    "Host private Book Clubs featuring real-time texting and WebSockets for low-latency discussions.",
                  color: "from-pink-500 to-red-500",
                },
              ].map((feature, index) => (
                <div
                  key={index}
                  className="group relative p-8 bg-white dark:bg-neutral-900 rounded-3xl border-2 border-black/10 dark:border-white/10 hover:border-dark-green dark:hover:border-light-green transition-all duration-500 hover:scale-105 hover:shadow-2xl"
                >
                  <div
                    className={`w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-r ${feature.color} p-3 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <feature.icon className="w-full h-full text-white" />
                  </div>

                  <h3 className="text-2xl font-bold mb-4 text-center text-black dark:text-white">
                    {feature.title}
                  </h3>

                  <p className="text-black/70 dark:text-white/70 text-center leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Technical Foundation - Architecture */}
      <section
        ref={addToRefs}
        className="min-h-screen flex items-center justify-center py-20 px-6 bg-gradient-to-b from-transparent via-dark-green/5 to-transparent dark:via-light-green/5"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-black to-dark-green dark:from-white dark:to-light-green bg-clip-text text-transparent">
              Engineered for Speed, Stability, and Scale
            </h2>
          </div>

          <div className="relative max-w-5xl mx-auto">
            {/* Architecture Diagram */}
            <div className="bg-white dark:bg-neutral-900 rounded-3xl p-12 border-2 border-black/10 dark:border-white/10 shadow-2xl">
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center group">
                  <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 p-5 group-hover:scale-110 transition-transform duration-300">
                    <Database className="w-full h-full text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-black dark:text-white">
                    React + TypeScript
                  </h3>
                  <p className="text-black/70 dark:text-white/70">
                    Robust, maintainable performance
                  </p>
                </div>

                <div className="text-center group">
                  <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 p-5 group-hover:scale-110 transition-transform duration-300">
                    <Zap className="w-full h-full text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-black dark:text-white">
                    Firebase Backend
                  </h3>
                  <p className="text-black/70 dark:text-white/70">
                    Real-time data synchronization
                  </p>
                </div>

                <div className="text-center group">
                  <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 p-5 group-hover:scale-110 transition-transform duration-300">
                    <GitBranch className="w-full h-full text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-black dark:text-white">
                    CI/CD Pipeline
                  </h3>
                  <p className="text-black/70 dark:text-white/70">
                    GitHub Actions deployment
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Demo & CTA - Final Conversion */}
      <section
        ref={addToRefs}
        className="min-h-screen flex items-center justify-center py-20 px-6"
      >
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-black to-dark-green dark:from-white dark:to-light-green bg-clip-text text-transparent">
            See the Magic in Action
          </h2>

          <p className="text-xl text-black/70 dark:text-white/70 mb-12">
            Watch the full feature showcase (4:30 min)
          </p>

          {/* Video Container */}
          <div className="relative mb-16 group">
            <div className="aspect-video bg-gradient-to-br from-dark-green to-light-green rounded-3xl overflow-hidden shadow-2xl border-4 border-white/20 dark:border-black/20">
              <div className="w-full h-full flex items-center justify-center bg-black/50 backdrop-blur-sm group-hover:bg-black/30 transition-all duration-300">
                <div className="w-24 h-24 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 cursor-pointer">
                  <Play className="w-12 h-12 text-dark-green ml-2" />
                </div>
              </div>
            </div>
          </div>

          {/* Final CTA */}
          <div className="relative p-12 rounded-3xl bg-gradient-to-r from-white/90 to-light-green/20 dark:from-black/90 dark:to-dark-green/20 backdrop-blur-sm border-2 border-black/20 dark:border-white/20">
            <h3 className="text-3xl font-bold mb-4 text-black dark:text-white">
              From Blank Page to Published Masterpiece
            </h3>
            <p className="text-xl text-black/70 dark:text-white/70 mb-8">
              We have the tools you need.
            </p>

            <button className="group relative px-12 py-6 bg-gradient-to-r from-dark-green to-light-green text-white rounded-full font-bold text-2xl overflow-hidden transition-all duration-300 hover:scale-110 hover:shadow-2xl">
              <span className="relative z-10">
                Sign Up and Write Your First Chapter Today
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-light-green to-dark-green transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
            </button>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0.1; }
          50% { transform: translateY(-20px) translateX(10px); opacity: 0.3; }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(50px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scroll {
          0% { transform: translateY(0); }
          100% { transform: translateY(10px); }
        }

        .animate-scroll {
          animation: scroll 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default HomePage;
