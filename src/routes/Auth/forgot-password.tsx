import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import { useState } from "react";
import { Link } from "react-router-dom";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const { forgotPassword } = useFirebaseAuth();

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setMessage("");

    if (!email) {
      setError("Please enter your email address.");
      setIsLoading(false);
      return;
    }

    await forgotPassword(email);

    // Here you would add your password reset logic, such as calling an API
    // For now, we'll simulate a delay
    setTimeout(() => {
      setIsLoading(false);
      setMessage(
        "If this email is registered, you will receive a password reset link."
      );
    }, 2000);
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen  pt-12">
      <div className="flex items-center text-center mb-8 -ml-6">
        <h1 className="text-4xl font-serif  ml-4">NovelSync</h1>
      </div>

      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg border ">
        <h2 className="text-3xl font-serif  mb-6">Forgot Password</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium ">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border  rounded-md shadow-sm focus:outline-none  focus: sm:text-sm"
            />
          </div>

          {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
          {message && (
            <div className="text-green-500 text-sm mt-2">{message}</div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full  text-white py-2 px-4 rounded-md shadow-sm  focus:outline-none focus:ring-2  focus:ring-offset-2 ${
              isLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isLoading ? "Sending..." : "Send Reset Link"}
          </button>

          <div className="text-center mt-4">
            <Link to="/sign-in" className=" hover:">
              Back to Sign In
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
