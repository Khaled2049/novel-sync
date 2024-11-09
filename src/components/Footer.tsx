import { FaEnvelope } from "react-icons/fa";

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white py-6 ">
      <div className="max-w-4xl mx-auto px-4 flex flex-col items-center">
        <div className="flex space-x-6 mb-4">
          <a href="khaledhossain.not@gmail.com">
            <FaEnvelope className="text-2xl hover:text-green-400 transition-colors duration-300" />
          </a>
          {/* <a
            href="https://github.com/Khaled2049"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaGithub className="text-2xl hover:text-gray-400 transition-colors duration-300" />
          </a> */}
        </div>
        <p className="text-center text-sm">
          {new Date().getFullYear()} Khaled Hossain
        </p>
      </div>
    </footer>
  );
};

export default Footer;
