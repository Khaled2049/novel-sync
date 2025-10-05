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
    <div className="p-4 max-w-lg mx-auto space-y-4 rounded-lg shadow-lg border border-black/20 dark:border-white/20 overflow-hidden bg-neutral-50 dark:bg-black transition-colors duration-200">
      <h2 className="text-xl font-serif text-black dark:text-white text-center">
        Get Book Recommendations
      </h2>

      <div className="space-y-2">
        <p className="text-sm text-black/70 dark:text-white/70 text-center">
          Enter the names of 3 books you like:
        </p>
        {books.map((book, index) => (
          <input
            key={index}
            type="text"
            value={book}
            onChange={(e) => handleBookChange(index, e.target.value)}
            placeholder={`Book ${index + 1}`}
            className="w-full px-3 py-2 text-sm border border-black/20 dark:border-white/20 rounded-md focus:outline-none focus:ring-2 focus:ring-dark-green dark:focus:ring-light-green bg-neutral-50 dark:bg-black text-black dark:text-white"
          />
        ))}
      </div>

      <div className="space-y-2">
        <p className="text-sm text-black/70 dark:text-white/70 text-center">
          What's the vibe you're looking for?
        </p>
        <input
          type="text"
          value={vibe}
          onChange={(e) => setVibe(e.target.value)}
          placeholder="e.g., adventurous, romantic, thrilling"
          className="w-full px-3 py-2 text-sm border border-black/20 dark:border-white/20 rounded-md focus:outline-none focus:ring-2 focus:ring-dark-green dark:focus:ring-light-green bg-neutral-50 dark:bg-black text-black dark:text-white"
        />
      </div>

      {/* Show submit button only when all books are filled and vibe is provided */}
      {books.every((book) => book) && vibe && (
        <button
          onClick={handleSubmit}
          className="w-full bg-dark-green dark:bg-light-green text-white py-2 rounded-md font-medium text-sm hover:bg-light-green dark:hover:bg-dark-green transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-dark-green dark:focus:ring-light-green focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-black"
        >
          Submit
        </button>
      )}

      {loading && (
        <span className="flex items-center justify-center text-dark-green dark:text-light-green">
          <Loader className="animate-spin mr-2" size={18} />
        </span>
      )}
      {submitted && (
        <div className="mt-4 space-y-2">
          <h3 className="text-lg font-serif text-black dark:text-white text-center">
            Recommended Books
          </h3>
          <ul className="list-disc pl-5 space-y-1 text-sm text-black/80 dark:text-white/80">
            {recommendations.map((recommendation, index) => (
              <li key={index}>{recommendation}</li>
            ))}
          </ul>
          <button
            className="w-full bg-black/10 dark:bg-neutral-50/10 text-black dark:text-white py-2 rounded-md font-medium text-sm hover:bg-black/20 dark:hover:bg-neutral-50/20 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-dark-green dark:focus:ring-light-green focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-black"
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
