import { Link } from "react-router-dom";

interface ClubsProps {
  bookClubs: any[];
}

const Clubs = ({ bookClubs }: ClubsProps) => {
  return (
    <div className="w-full lg:w-1/4 p-4 overflow-y-auto bg-white dark:bg-black transition-colors duration-200">
      <h2 className="text-2xl font-serif font-bold mb-4 text-black dark:text-white">
        Book Clubs
      </h2>
      <ul>
        {bookClubs.map((club) => (
          <Link
            to={`/book-clubs/${club.id}`}
            key={club.id}
            className="block transition-colors duration-200 ease-in-out transform hover:scale-105"
          >
            <li
              key={club.id}
              className="mb-4 p-3 rounded-lg border border-black/20 dark:border-white/20 hover:bg-black/10 dark:hover:bg-white/10"
            >
              <div className="flex justify-between items-center">
                <span className="font-serif font-semibold text-black dark:text-white">
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
          className="w-full mt-4 text-center text-white py-2 px-4 rounded-full bg-dark-green dark:bg-light-green hover:bg-light-green dark:hover:bg-dark-green transition-colors duration-200 font-serif mx-auto focus:outline-none focus:ring-2 focus:ring-dark-green dark:focus:ring-light-green focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-black"
          style={{ maxWidth: "200px" }}
        >
          View All Clubs
        </Link>
      </div>
    </div>
  );
};

export default Clubs;
