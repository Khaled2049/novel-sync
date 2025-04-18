import React, { useState } from "react";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { FaGoogle } from "react-icons/fa";

const Signup: React.FC = () => {
  const [formData, setFormData] = useState({
    userName: "",
    email: "",
    password: "",
  });

  const {
    handleAnonymousSignUp,
    handleEmailSignUp,
    handleGoogleSignUp,
    error,
  } = useFirebaseAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleEmailSignUp(
      formData.email,
      formData.password,
      formData.userName
    );
    if (!error) {
      navigate("/");
    }
  };

  const googleSignUp = async () => {
    try {
      await handleGoogleSignUp();
      if (!error) {
        navigate("/");
      }
    } catch (err) {
      console.log("err", err);
    }
  };

  const anonymousSignUp = async () => {
    try {
      await handleAnonymousSignUp();
      if (!error) {
        navigate("/");
      }
    } catch (err) {
      console.log("err", err);
    }
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-amber-50 pt-12">
      <div className="flex items-center text-center mb-8 -ml-6">
        <h1 className="text-4xl font-serif text-amber-900 ml-4">NovelSync</h1>
      </div>

      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg border border-amber-200">
        <h2 className="text-3xl font-serif text-amber-900 mb-6">Sign Up</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="userName"
              className="block text-sm font-medium text-amber-800"
            >
              Username
            </label>
            <input
              maxLength={20}
              type="text"
              id="userName"
              name="userName"
              value={formData.userName}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-amber-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
            />
          </div>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-amber-800"
            >
              Email
            </label>
            <input
              maxLength={50}
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-amber-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-amber-800"
            >
              Password
            </label>
            <input
              maxLength={20}
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-amber-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-amber-600 text-white py-2 px-4 rounded-md shadow-sm hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
          >
            Sign Up
          </button>
        </form>

        {/* Simple separator without external dependency */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-gray-500">Or</span>
          </div>
        </div>

        {/* Google Sign Up Button */}
        <button
          onClick={googleSignUp}
          className="w-full flex items-center justify-center gap-2 bg-white text-gray-700 py-2 px-4 rounded-md shadow-sm border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 mb-4"
        >
          <FaGoogle size={20} />
          <span>Continue with Google</span>
        </button>

        {/* Anonymous Sign Up Button */}
        <button
          onClick={anonymousSignUp}
          className="w-full bg-amber-900 text-white py-2 px-4 rounded-md shadow-sm hover:bg-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
        >
          Continue Anonymously
        </button>
        <div className="text-center mt-4">
          <Link to="/sign-in" className="text-amber-600 hover:text-amber-800">
            Already have an account? Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
