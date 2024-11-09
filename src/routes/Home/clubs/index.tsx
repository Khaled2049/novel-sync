import { Link } from "react-router-dom";

interface ClubsProps {
  bookClubs: any[];
}

const Clubs = ({ bookClubs }: ClubsProps) => {
  return (
    <div className="w-full lg:w-1/4 bg-amber-50 p-4 overflow-y-auto">
      <h2 className="text-2xl font-serif font-bold mb-4 text-amber-900">
        Book Clubs
      </h2>
      <ul>
        {bookClubs.map((club) => (
          <Link
            to={`/book-clubs/${club.id}`}
            key={club.id}
            className="block transition duration-300 ease-in-out transform hover:scale-105"
          >
            <li
              key={club.id}
              className="mb-4 p-3 bg-white rounded-lg border border-amber-200"
            >
              <div className="flex justify-between items-center">
                <span className="font-serif font-semibold text-amber-900">
                  {club.name}
                </span>
              </div>
            </li>
          </Link>
        ))}
      </ul>
      <div className="flex justify-center items-center">
        <Link
          to="/book-clubs"
          className="w-full mt-4 text-center bg-amber-700 text-white py-2 px-4 rounded-full hover:bg-amber-800 transition duration-300 font-serif mx-auto"
          style={{ maxWidth: "200px" }} // Optional: Set a max width if you want a specific size
        >
          View All Clubs
        </Link>
      </div>
    </div>
  );
};

export default Clubs;
