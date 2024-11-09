import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

interface BookDetailsProps {}

interface Book {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    description?: string;
    publishedDate?: string;
    publisher?: string;
    pageCount?: number;
    categories?: string[];
    averageRating?: number;
    ratingsCount?: number;
    imageLinks?: {
      thumbnail: string;
    };
  };
}

const BookDetails: React.FC<BookDetailsProps> = () => {
  const { id } = useParams<{ id: string }>();
  const [book, setBook] = useState<Book | null>(null);

  useEffect(() => {
    const fetchBookDetails = async () => {
      const apiKey = import.meta.env.VITE_BOOKS_API_KEY;
      const url = `https://www.googleapis.com/books/v1/volumes/${id}?key=${apiKey}`;

      try {
        const response = await axios.get(url);

        setBook(response.data);
      } catch (error) {
        console.error("Error fetching book details:", error);
      }
    };

    fetchBookDetails();
  }, [id]);

  const parseHtmlContent = (htmlContent: string) => {
    const elements: React.ReactNode[] = [];
    const tagRegex = /(<\/?[^>]+>)/g;
    const parts = htmlContent.split(tagRegex);

    parts.forEach((part, index) => {
      if (part.startsWith("<b>")) {
        elements.push(<b key={index}>{part.replace(/<\/?b>/g, "")}</b>);
      } else if (part.startsWith("</b>")) {
        // Skip closing tags since they are handled when opening tag is found
      } else if (part.startsWith("<i>")) {
        elements.push(<i key={index}>{part.replace(/<\/?i>/g, "")}</i>);
      } else if (part.startsWith("</i>")) {
        // Skip closing tags since they are handled when opening tag is found
      } else if (part === "<br>" || part === "<br/>") {
        elements.push(<br key={index} />);
      } else {
        elements.push(part);
      }
    });

    return elements;
  };

  if (!book) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-amber-50 p-4">
      <div className="w-full max-w-lg border border-amber-200 rounded-lg shadow-md bg-white p-4">
        <h1 className="text-2xl font-bold text-amber-700 mb-4">
          {book.volumeInfo.title}
        </h1>
        <div className="mb-4">
          <img
            src={book.volumeInfo.imageLinks?.thumbnail}
            alt={book.volumeInfo.title}
            className="rounded-lg shadow-md"
          />
        </div>
        <p className="text-lg text-amber-600 mb-2">
          {book.volumeInfo.authors?.join(", ")}
        </p>
        <p className="text-sm text-amber-500 mb-4">
          Published by {book.volumeInfo.publisher} on{" "}
          {book.volumeInfo.publishedDate}
        </p>
        <p className="text-sm text-amber-600 mb-4">
          {book.volumeInfo.categories?.join(", ")}
        </p>
        <div className="text-sm text-amber-500">
          {parseHtmlContent(
            book.volumeInfo.description || "No description available."
          )}
        </div>
        {book.volumeInfo.averageRating && (
          <div className="mb-4">
            <p className="text-sm text-amber-600">
              Average Rating: {book.volumeInfo.averageRating} / 5
            </p>
            <p className="text-sm text-amber-500">
              ({book.volumeInfo.ratingsCount} ratings)
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookDetails;
