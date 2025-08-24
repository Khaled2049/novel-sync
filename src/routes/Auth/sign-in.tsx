import React, { useState } from "react";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

const Signin: React.FC = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signin } = useFirebaseAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const res = await signin(formData.email, formData.password);
    if (res.status === 200) {
      navigate("/");
    } else {
      setFormData({ email: "", password: "" });
      setIsLoading(false);
      setError("Invalid username or password");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen dark:bg-black text-black dark:text-white transition-colors duration-300">
      <div className="flex items-center text-center mb-8 -ml-6">
        <h1 className="text-4xl font-serif text-dark-green dark:text-light-green ml-4 transition-colors duration-300">
          NovelSync
        </h1>
      </div>

      {/* Sign In Form Container */}
      <div className="w-full max-w-md p-8  dark:bg-black rounded-lg shadow-lg border border-black dark:border-white transition-colors duration-300">
        <h2 className="text-3xl font-serif text-black dark:text-white mb-6 transition-colors duration-300">
          Sign In
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-black dark:text-white/70 transition-colors duration-300"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-black/20 dark:border-white/20 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-dark-green dark:focus:ring-light-green focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-black transition-colors duration-300 sm:text-sm"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-black dark:text-white/70 transition-colors duration-300"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-black/20 dark:border-white/20 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-dark-green dark:focus:ring-light-green focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-black transition-colors duration-300 sm:text-sm"
            />
          </div>
          {/* forgot password */}
          <div className="text-left">
            <Link
              to="/forgot-password"
              className="text-dark-green dark:text-light-green hover:text-light-green dark:hover:text-dark-green transition-colors duration-200"
            >
              Forgot password?
            </Link>
          </div>

          {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full bg-dark-green dark:bg-light-green text-white py-2 px-4 rounded-md shadow-sm hover:bg-light-green dark:hover:bg-dark-green focus:outline-none focus:ring-2 focus:ring-dark-green dark:focus:ring-light-green focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-black transition-all duration-300 ${
              isLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isLoading ? "Signing In..." : "Sign In"}
          </button>
          {/* <div className="text-center mt-4">
            <Link to="/sign-up" className="text-dark-green dark:text-light-green hover:text-light-green dark:hover:text-dark-green transition-colors duration-200">
              Create an account
            </Link>
          </div> */}
        </form>
      </div>
    </div>
  );
};

export default Signin;
