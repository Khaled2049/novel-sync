import React, { useState } from "react";

// Define types for Category and Book
type Book = {
  id: string;
  title: string;
  author: string;
};

type Category = {
  id: string;
  name: string;
  books: Book[];
};

// Mock Data for Categories and Books
const mockCategories: Category[] = [
  {
    id: "1",
    name: "Fantasy",
    books: [
      { id: "a1", title: "The Hobbit", author: "J.R.R. Tolkien" },
      {
        id: "a2",
        title: "Harry Potter and the Sorcerer's Stone",
        author: "J.K. Rowling",
      },
    ],
  },
  {
    id: "2",
    name: "Science Fiction",
    books: [
      { id: "b1", title: "Dune", author: "Frank Herbert" },
      { id: "b2", title: "Ender's Game", author: "Orson Scott Card" },
    ],
  },
  // Add more categories as needed
];

const Categories: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );

  // Function to handle category selection
  const handleCategoryClick = (category: Category) => {
    setSelectedCategory(category);
  };

  // Function to render book details
  const handleBookClick = (book: Book) => {
    alert(`You clicked on "${book.title}" by ${book.author}`);
  };

  return (
    <div className="categories-container p-6 max-w-screen-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Book Categories</h2>

      <div className="flex">
        {/* Category List */}
        <div className="w-1/3 pr-4">
          <h3 className="text-lg font-semibold mb-2">Categories</h3>
          <ul>
            {mockCategories.map((category) => (
              <li
                key={category.id}
                className="mb-2 cursor-pointer text-blue-600 hover:text-blue-800"
                onClick={() => handleCategoryClick(category)}
              >
                {category.name}
              </li>
            ))}
          </ul>
        </div>

        {/* Book List for Selected Category */}
        <div className="w-2/3">
          {selectedCategory ? (
            <>
              <h3 className="text-lg font-semibold mb-2">
                {selectedCategory.name} Books
              </h3>
              <ul>
                {selectedCategory.books.map((book) => (
                  <li
                    key={book.id}
                    className="mb-2 cursor-pointer text-gray-700 hover:text-gray-900"
                    onClick={() => handleBookClick(book)}
                  >
                    {book.title} by {book.author}
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="text-gray-600">Select a category to view books.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Categories;
