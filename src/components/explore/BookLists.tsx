import { useState } from "react";
import {
  Search,
  Grid,
  List,
  Plus,
  X,
  Edit2,
  Trash2,
  ChevronUp,
  ChevronDown,
} from "lucide-react";

type Book = {
  id: string;
  title: string;
  author: string;
  coverUrl?: string;
  publishedDate?: string;
  genre?: string;
};

type BookList = {
  id: string;
  title: string;
  books: Book[];
};

// Mock Books
const mockBooks: Book[] = [
  {
    id: "a1",
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    publishedDate: "1925",
    genre: "Fiction",
  },
  {
    id: "a2",
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    publishedDate: "1960",
    genre: "Fiction",
  },
  {
    id: "b1",
    title: "The Midnight Library",
    author: "Matt Haig",
    publishedDate: "2020",
    genre: "Fiction",
  },
  {
    id: "b2",
    title: "Klara and the Sun",
    author: "Kazuo Ishiguro",
    publishedDate: "2021",
    genre: "Science Fiction",
  },
  {
    id: "c1",
    title: "1984",
    author: "George Orwell",
    publishedDate: "1949",
    genre: "Dystopian",
  },
  {
    id: "c2",
    title: "Pride and Prejudice",
    author: "Jane Austen",
    publishedDate: "1813",
    genre: "Romance",
  },
];

const BookLists = () => {
  const [bookLists, setBookLists] = useState<BookList[]>([
    { id: "1", title: "My Reading List", books: [...mockBooks] },
  ]);
  const [selectedListId, setSelectedListId] = useState<string>("1");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"title" | "author" | "date">("title");
  const [filterGenre, setFilterGenre] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isCreatingList, setIsCreatingList] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [editingListId, setEditingListId] = useState<string | null>(null);
  const [editingListName, setEditingListName] = useState("");

  const selectedList = bookLists.find((list) => list.id === selectedListId);

  // Get unique genres
  const genres = [
    "all",
    ...new Set(mockBooks.flatMap((book) => book.genre || [])),
  ];

  // Filter and sort books
  const getFilteredAndSortedBooks = () => {
    if (!selectedList) return [];

    let filtered = selectedList.books.filter((book) => {
      const matchesSearch =
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesGenre = filterGenre === "all" || book.genre === filterGenre;
      return matchesSearch && matchesGenre;
    });

    filtered.sort((a, b) => {
      if (sortBy === "title") return a.title.localeCompare(b.title);
      if (sortBy === "author") return a.author.localeCompare(b.author);
      if (sortBy === "date")
        return (a.publishedDate || "").localeCompare(b.publishedDate || "");
      return 0;
    });

    return filtered;
  };

  // Create new list
  const handleCreateList = () => {
    if (newListName.trim()) {
      const newList: BookList = {
        id: Date.now().toString(),
        title: newListName,
        books: [],
      };
      setBookLists([...bookLists, newList]);
      setSelectedListId(newList.id);
      setNewListName("");
      setIsCreatingList(false);
    }
  };

  // Delete list
  const handleDeleteList = (listId: string) => {
    if (bookLists.length === 1) {
      alert("Cannot delete the last list");
      return;
    }
    if (confirm("Are you sure you want to delete this list?")) {
      const newLists = bookLists.filter((list) => list.id !== listId);
      setBookLists(newLists);
      if (selectedListId === listId) {
        setSelectedListId(newLists[0].id);
      }
    }
  };

  // Rename list
  const handleRenameList = (listId: string) => {
    if (editingListName.trim()) {
      setBookLists(
        bookLists.map((list) =>
          list.id === listId ? { ...list, title: editingListName } : list
        )
      );
      setEditingListId(null);
      setEditingListName("");
    }
  };

  // Remove book from list
  const handleRemoveBook = (bookId: string) => {
    if (confirm("Remove this book from the list?")) {
      setBookLists(
        bookLists.map((list) =>
          list.id === selectedListId
            ? {
                ...list,
                books: list.books.filter((book) => book.id !== bookId),
              }
            : list
        )
      );
    }
  };

  // Move book between lists
  const handleMoveBook = (bookId: string, targetListId: string) => {
    const book = selectedList?.books.find((b) => b.id === bookId);
    if (!book) return;

    setBookLists(
      bookLists.map((list) => {
        if (list.id === selectedListId) {
          return { ...list, books: list.books.filter((b) => b.id !== bookId) };
        }
        if (list.id === targetListId) {
          return { ...list, books: [...list.books, book] };
        }
        return list;
      })
    );
  };

  // Move book up/down in list
  const handleMoveBookPosition = (bookId: string, direction: "up" | "down") => {
    if (!selectedList) return;
    const currentIndex = selectedList.books.findIndex((b) => b.id === bookId);
    if (currentIndex === -1) return;
    if (direction === "up" && currentIndex === 0) return;
    if (direction === "down" && currentIndex === selectedList.books.length - 1)
      return;

    const newBooks = [...selectedList.books];
    const targetIndex =
      direction === "up" ? currentIndex - 1 : currentIndex + 1;
    [newBooks[currentIndex], newBooks[targetIndex]] = [
      newBooks[targetIndex],
      newBooks[currentIndex],
    ];

    setBookLists(
      bookLists.map((list) =>
        list.id === selectedListId ? { ...list, books: newBooks } : list
      )
    );
  };

  const filteredBooks = getFilteredAndSortedBooks();

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Book Lists</h1>

      <div className="flex gap-6">
        {/* Sidebar - Lists */}
        <div className="w-64 flex-shrink-0">
          <div className="mb-4">
            <button
              onClick={() => setIsCreatingList(true)}
              className="w-full flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              <Plus size={18} /> New List
            </button>
          </div>

          {isCreatingList && (
            <div className="mb-4 p-3 border rounded">
              <input
                type="text"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                placeholder="List name"
                className="w-full px-2 py-1 border rounded mb-2"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={handleCreateList}
                  className="px-3 py-1 bg-green-500 text-white rounded text-sm"
                >
                  Create
                </button>
                <button
                  onClick={() => {
                    setIsCreatingList(false);
                    setNewListName("");
                  }}
                  className="px-3 py-1 bg-gray-300 rounded text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {bookLists.map((list) => (
              <div
                key={list.id}
                className={`p-3 rounded cursor-pointer border ${
                  selectedListId === list.id
                    ? "bg-blue-100 border-blue-500"
                    : "hover:bg-gray-100"
                }`}
              >
                {editingListId === list.id ? (
                  <div>
                    <input
                      type="text"
                      value={editingListName}
                      onChange={(e) => setEditingListName(e.target.value)}
                      className="w-full px-2 py-1 border rounded mb-2"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleRenameList(list.id)}
                        className="px-2 py-1 bg-green-500 text-white rounded text-xs"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setEditingListId(null);
                          setEditingListName("");
                        }}
                        className="px-2 py-1 bg-gray-300 rounded text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div
                      onClick={() => setSelectedListId(list.id)}
                      className="flex justify-between items-start"
                    >
                      <div>
                        <div className="font-medium">{list.title}</div>
                        <div className="text-sm text-gray-500">
                          {list.books.length} books
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingListId(list.id);
                            setEditingListName(list.title);
                          }}
                          className="p-1 hover:bg-gray-200 rounded"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteList(list.id);
                          }}
                          className="p-1 hover:bg-red-100 rounded"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Controls */}
          <div className="mb-6 space-y-4">
            {/* Search */}
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search
                  className="absolute left-3 top-2.5 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search books by title or author..."
                  className="w-full pl-10 pr-4 py-2 border rounded"
                />
              </div>
            </div>

            {/* Filters and View Toggle */}
            <div className="flex gap-4 items-center">
              <div className="flex gap-2 items-center">
                <label className="text-sm font-medium">Sort by:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-1 border rounded"
                >
                  <option value="title">Title</option>
                  <option value="author">Author</option>
                  <option value="date">Date</option>
                </select>
              </div>

              <div className="flex gap-2 items-center">
                <label className="text-sm font-medium">Genre:</label>
                <select
                  value={filterGenre}
                  onChange={(e) => setFilterGenre(e.target.value)}
                  className="px-3 py-1 border rounded"
                >
                  {genres.map((genre) => (
                    <option key={genre} value={genre}>
                      {genre === "all" ? "All Genres" : genre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="ml-auto flex gap-2">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded ${
                    viewMode === "grid"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200"
                  }`}
                >
                  <Grid size={20} />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded ${
                    viewMode === "list"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200"
                  }`}
                >
                  <List size={20} />
                </button>
              </div>
            </div>
          </div>

          {/* Books Display */}
          {filteredBooks.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No books found. Try adjusting your search or filters.
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-3 gap-4">
              {filteredBooks.map((book) => (
                <div
                  key={book.id}
                  className="border rounded p-4 hover:shadow-lg transition-shadow"
                >
                  <div className="aspect-[2/3] bg-gray-200 mb-3 flex items-center justify-center text-gray-400">
                    Cover
                  </div>
                  <h3 className="font-semibold text-sm mb-1 line-clamp-2">
                    {book.title}
                  </h3>
                  <p className="text-xs text-gray-600 mb-2">{book.author}</p>
                  <p className="text-xs text-gray-500 mb-3">
                    {book.publishedDate} • {book.genre}
                  </p>

                  <div className="flex gap-2">
                    <select
                      onChange={(e) => handleMoveBook(book.id, e.target.value)}
                      className="text-xs px-2 py-1 border rounded flex-1"
                      defaultValue=""
                    >
                      <option value="" disabled>
                        Move to...
                      </option>
                      {bookLists
                        .filter((list) => list.id !== selectedListId)
                        .map((list) => (
                          <option key={list.id} value={list.id}>
                            {list.title}
                          </option>
                        ))}
                    </select>
                    <button
                      onClick={() => handleRemoveBook(book.id)}
                      className="p-1 text-red-500 hover:bg-red-50 rounded"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredBooks.map((book, index) => (
                <div
                  key={book.id}
                  className="border rounded p-4 hover:bg-gray-50 flex items-center gap-4"
                >
                  <div className="w-12 h-16 bg-gray-200 flex-shrink-0 flex items-center justify-center text-xs text-gray-400">
                    Cover
                  </div>

                  <div className="flex-1">
                    <h3 className="font-semibold">{book.title}</h3>
                    <p className="text-sm text-gray-600">{book.author}</p>
                    <p className="text-xs text-gray-500">
                      {book.publishedDate} • {book.genre}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => handleMoveBookPosition(book.id, "up")}
                        disabled={index === 0}
                        className="p-1 hover:bg-gray-200 rounded disabled:opacity-30"
                      >
                        <ChevronUp size={16} />
                      </button>
                      <button
                        onClick={() => handleMoveBookPosition(book.id, "down")}
                        disabled={index === filteredBooks.length - 1}
                        className="p-1 hover:bg-gray-200 rounded disabled:opacity-30"
                      >
                        <ChevronDown size={16} />
                      </button>
                    </div>

                    <select
                      onChange={(e) => handleMoveBook(book.id, e.target.value)}
                      className="text-sm px-3 py-1 border rounded"
                      defaultValue=""
                    >
                      <option value="" disabled>
                        Move to...
                      </option>
                      {bookLists
                        .filter((list) => list.id !== selectedListId)
                        .map((list) => (
                          <option key={list.id} value={list.id}>
                            {list.title}
                          </option>
                        ))}
                    </select>

                    <button
                      onClick={() => handleRemoveBook(book.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookLists;
