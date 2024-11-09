import React, { useState, useCallback } from "react";
import axios from "axios";
import { debounce } from "lodash";

const apiKey = import.meta.env.VITE_BOOKS_API_KEY;

interface Book {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    description?: string;
    imageLinks?: {
      thumbnail: string;
    };
  };
}

interface BookSearchProps {
  onBookSelect: (book: Book) => void;
}

const BookSearch: React.FC<BookSearchProps> = ({ onBookSelect }) => {
  const [query, setQuery] = useState("");
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  const searchBooks = async (searchQuery: string) => {
    try {
      const response = await axios.get(
        `https://www.googleapis.com/books/v1/volumes?q=${searchQuery}&key=${apiKey}&maxResults=3`
      );
      setBooks(response.data.items || []);
    } catch (error) {
      console.error("Error fetching books:", error);
    }
  };

  const debouncedSearch = useCallback(
    debounce((searchQuery: string) => {
      if (searchQuery) {
        searchBooks(searchQuery);
      } else {
        setBooks([]);
      }
    }, 300),
    []
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    debouncedSearch(newQuery);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (query) {
      searchBooks(query);
    }
  };

  const handleBookClick = (book: Book) => {
    setSelectedBook(book);
    onBookSelect(book);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            placeholder="Search for books..."
            className="w-full px-4 py-2 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors"
          />
          {/* <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Search
          </button> */}
        </div>
      </form>

      {selectedBook ? (
        <div className="p-4 border border-gray-200 rounded">
          <h3 className="font-bold">{selectedBook.volumeInfo.title}</h3>
          <p className="text-sm text-gray-600">
            {selectedBook.volumeInfo.authors?.join(", ") || "Unknown Author"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {books.map((book) => (
            <div
              key={book.id}
              className="flex items-center gap-4 p-4 border border-gray-200 rounded cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => handleBookClick(book)}
            >
              {book.volumeInfo.imageLinks?.thumbnail && (
                <img
                  src={book.volumeInfo.imageLinks.thumbnail}
                  alt={`${book.volumeInfo.title} cover`}
                  className="w-16 h-24 object-cover"
                />
              )}
              <div>
                <h3 className="font-bold">{book.volumeInfo.title}</h3>
                <p className="text-sm text-gray-600">
                  {book.volumeInfo.authors?.join(", ") || "Unknown Author"}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BookSearch;
