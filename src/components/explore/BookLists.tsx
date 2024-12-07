// Define types for Book and BookList
type Book = {
  id: string;
  title: string;
  author: string;
};

type BookList = {
  id: string;
  title: string;
  books: Book[];
};

// Mock Data for Book Lists
const mockBookLists: BookList[] = [
  {
    id: "1",
    title: "Popular Books",
    books: [
      { id: "a1", title: "The Great Gatsby", author: "F. Scott Fitzgerald" },
      { id: "a2", title: "To Kill a Mockingbird", author: "Harper Lee" },
    ],
  },
  {
    id: "2",
    title: "New Arrivals",
    books: [
      { id: "b1", title: "The Midnight Library", author: "Matt Haig" },
      { id: "b2", title: "Klara and the Sun", author: "Kazuo Ishiguro" },
    ],
  },
  {
    id: "3",
    title: "Top Rated",
    books: [
      { id: "c1", title: "1984", author: "George Orwell" },
      { id: "c2", title: "Pride and Prejudice", author: "Jane Austen" },
    ],
  },
  // Add more book lists as needed
];

const BookLists: React.FC = () => {
  // Function to handle book click (for now, just showing an alert)
  const handleBookClick = (book: Book) => {
    alert(`You clicked on "${book.title}" by ${book.author}`);
  };

  return (
    <div className="book-lists-container p-6 max-w-screen-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Book Lists</h2>

      {/* Iterate through each Book List */}
      {mockBookLists.map((bookList) => (
        <div key={bookList.id} className="mb-8">
          <h3 className="text-xl font-semibold mb-2">{bookList.title}</h3>
          <ul className="space-y-2">
            {bookList.books.map((book) => (
              <li
                key={book.id}
                className="cursor-pointer text-blue-600 hover:text-blue-800"
                onClick={() => handleBookClick(book)}
              >
                {book.title} by {book.author}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default BookLists;
