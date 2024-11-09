import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import AOS from "aos";
import "aos/dist/aos.css";
import { useEffect } from "react";
import {
  Book,
  BookOpen,
  Feather,
  Globe,
  MessageCircle,
  Users,
} from "lucide-react";
import { profiles } from "../profiles";
import { Link } from "react-router-dom";

const HomePage = () => {
  useEffect(() => {
    AOS.init({ duration: 1000 });
  }, []);

  const novels = [
    {
      title: "The Lost Kingdom",
      author: "John Doe",
      description: "An epic fantasy adventure.",
      cover: "https://via.placeholder.com/150", // Placeholder image
    },
    {
      title: "Echoes of the Past",
      author: "Jane Smith",
      description: "A gripping historical novel.",
      cover: "https://via.placeholder.com/150", // Placeholder image
    },
    {
      title: "Future Visions",
      author: "Alice Johnson",
      description: "A journey into the unknown.",
      cover: "https://via.placeholder.com/150", // Placeholder image
    },
  ];

  const features = [
    {
      title: "Draft Mode and Feedback",
      description:
        "Save your progress and continue whenever you're ready. Get valuable feedback from a community of fellow writers and readers.",
    },
    {
      title: "AI Partners",
      description:
        "Collaborate with AI partners to brainstorm and develop your ideas. Let AI assist you in writing your novel with creative suggestions.",
    },
    {
      title: "Global Audience",
      description: "Share your novel with readers around the world.",
    },

    {
      title: "Author Updates",
      description:
        "Follow your favorite authors and get the latest updates on their works and thoughts.",
    },
    {
      title: "Book Clubs",
      description:
        "Join book clubs and engage in meaningful discussions with fellow readers.",
    },
    {
      title: "Spoiler-Free Reviews",
      description:
        "Read and write reviews without the fear of spoilers, so you can enjoy the story to the fullest.",
    },
  ];

  return (
    <div className="bg-amber-50 text-amber-900">
      <header className="bg-gradient-to-r from-amber-700 to-amber-900 text-amber-50 py-16 h-[70vh] flex items-center">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-serif font-bold mb-4 drop-shadow-lg">
            Welcome to NovelSync
          </h1>
          <p className="text-xl md:text-2xl mb-8 font-light">
            Your gateway to amazing stories and novels.
          </p>
          <Link
            to="/stories"
            className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-6 rounded-full transition duration-300 ease-in-out transform hover:scale-105 shadow-lg"
          >
            Explore NovelSync
          </Link>
        </div>
      </header>

      <section className="py-16 bg-amber-100" data-aos="fade-up">
        <div className="container mx-auto px-4">
          {/* Featured Novels Section */}
          <div className="mb-16">
            <h2 className="text-3xl font-serif font-bold mb-8 text-center">
              Featured Stories
            </h2>
            <div className="max-w-xl mx-auto border border-amber-400">
              <Carousel
                showArrows={true}
                autoPlay={true}
                infiniteLoop={true}
                showThumbs={false}
                showStatus={false}
                interval={5000}
                className="bg-amber-50 p-8 rounded-lg"
              >
                {novels.map((novel, index) => (
                  <div key={index} className="p-6 rounded-lg text-center">
                    <img
                      src={novel.cover}
                      alt={`${novel.title} cover`}
                      className="w-full h-auto mb-4 rounded-lg"
                    />
                    <h3 className="text-2xl font-serif font-bold mb-2">
                      {novel.title}
                    </h3>
                    <p className="text-amber-700 mb-4 italic">
                      by {novel.author}
                    </p>
                    <p className="text-amber-900">{novel.description}</p>
                  </div>
                ))}
              </Carousel>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-amber-50" data-aos="fade-up">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-serif font-bold mb-12 text-center">
            Our Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-lg shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
              >
                <div className="text-amber-600 mb-4">
                  {index === 0 && <Book size={48} />}
                  {index === 1 && <Feather size={48} />}
                  {index === 2 && <Users size={48} />}
                  {index === 3 && <Globe size={48} />}
                  {index === 4 && <MessageCircle size={48} />}
                  {index === 5 && <BookOpen size={48} />}
                </div>
                <h3 className="text-2xl font-serif font-bold mb-4">
                  {feature.title}
                </h3>
                <p className="text-amber-800">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Meet Our AI Partners Section */}
      <section className="py-16 bg-amber-100" data-aos="fade-up">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-serif font-bold mb-8 text-center">
            Meet Our AI Partners
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {profiles.map((profile) => (
              <div
                key={profile.id}
                className="bg-white p-6 rounded-lg text-center"
              >
                <img
                  src={profile.img}
                  alt={profile.name}
                  className="w-24 h-24 mx-auto rounded-full mb-4"
                />
                <h3 className="text-xl font-bold mb-2">{profile.name}</h3>
                <p className="text-gray-700">{profile.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-amber-50" data-aos="fade-up">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-serif font-bold mb-8 text-center">
            What Our Authors Say
          </h2>
          <div className="max-w-xl mx-auto bg-white p-8 rounded-lg">
            <p className="text-xl italic mb-4">
              "I really enjoy this platform! I was able to write my first novel
              and share it with my friends and family. I absolutely love using
              this app."
            </p>
            <p className="text-right font-bold">- Ali</p>
          </div>
        </div>
      </section>
      <div className="text-center">
        <p className="text-sm md:text-base text-red-900 bg-red">
          This is a beta version, so there might be bugs and errors. But don't
          worry, Khaled is working hard! If you see any errors or need some
          features, hit him up or create an issue on GitHub.
        </p>
      </div>
    </div>
  );
};

export default HomePage;
