import { useState } from "react";
import { AITextGenerator } from "./AITextGenerator";
import { Loader } from "lucide-react";

const BookRecommendation = () => {
  const [books, setBooks] = useState(Array(3).fill(""));
  const [vibe, setVibe] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleBookChange = (index: number, value: string) => {
    const newBooks = [...books];
    newBooks[index] = value;
    setBooks(newBooks);
  };

  const handleSubmit = async () => {
    setLoading(true);
    const aiTextGen = new AITextGenerator(0);
    const recommendations = await aiTextGen.generateRecommendation(books, vibe);
    setBooks(Array(3).fill(""));
    setVibe("");
    setRecommendations(recommendations);
    setSubmitted(true);
    setLoading(false);
  };

  return (
    <div className=" p-4 max-w-lg mx-auto space-y-4 rounded-lg shadow-lg border  overflow-hidden">
      <h2 className="text-xl font-serif  text-center">
        Get Book Recommendations
      </h2>

      <div className="space-y-2">
        <p className="text-sm text-gray-700 text-center">
          Enter the names of 3 books you like:
        </p>
        {books.map((book, index) => (
          <input
            key={index}
            type="text"
            value={book}
            onChange={(e) => handleBookChange(index, e.target.value)}
            placeholder={`Book ${index + 1}`}
            className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 "
          />
        ))}
      </div>

      <div className="space-y-2">
        <p className="text-sm text-gray-700 text-center">
          What's the vibe you're looking for?
        </p>
        <input
          type="text"
          value={vibe}
          onChange={(e) => setVibe(e.target.value)}
          placeholder="e.g., adventurous, romantic, thrilling"
          className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 "
        />
      </div>

      {/* Show submit button only when all books are filled and vibe is provided */}
      {books.every((book) => book) && vibe && (
        <button
          onClick={handleSubmit}
          className="w-full  text-white py-2 rounded-md font-medium text-sm  transition-colors duration-200"
        >
          Submit
        </button>
      )}

      {loading && (
        <span className="flex items-center justify-center">
          <Loader className="animate-spin mr-2" size={18} />
        </span>
      )}
      {submitted && (
        <div className="mt-4 space-y-2">
          <h3 className="text-lg font-serif  text-center">Recommended Books</h3>
          <ul className="list-disc pl-5 space-y-1 text-sm text-gray-800">
            {recommendations.map((recommendation, index) => (
              <li key={index}>{recommendation}</li>
            ))}
          </ul>
          <button
            className="w-full  text-white py-2 rounded-md font-medium text-sm  transition-colors duration-200"
            onClick={() => {
              setSubmitted(false);
              setRecommendations([]);
            }}
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );
};

export default BookRecommendation;
