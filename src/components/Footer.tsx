import { Link } from "react-router-dom";

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white py-6 ">
      <div className="max-w-4xl mx-auto px-4 flex flex-col items-center">
        <div className="flex space-x-6 mb-4">
          <p className="text-sm">
            By your continued use of this site, you accept such use. See our{" "}
            <Link
              to="/privacy-policy"
              className="text-blue-600 hover:underline"
            >
              Privacy Policy
            </Link>{" "}
            and{" "}
            <Link to="/terms-of-use" className="text-blue-600 hover:underline">
              Terms of Use
            </Link>
            .
          </p>
        </div>
        <p className="text-center text-sm">
          {new Date().getFullYear()} Khaled Hossain
        </p>
      </div>
    </footer>
  );
};

export default Footer;
