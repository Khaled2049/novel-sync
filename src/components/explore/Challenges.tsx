// Define a type for a Challenge
type Challenge = {
  id: string;
  title: string;
  description: string;
};

// Mock Data for Challenges
const mockChallenges: Challenge[] = [
  {
    id: "1",
    title: "500-Word Story Challenge",
    description:
      "Write a complete story in 500 words or less. Challenge your brevity and creativity!",
  },
  {
    id: "2",
    title: "Create a Fantasy Character",
    description:
      "Develop a character with a rich background in a fantasy setting. Give them a unique trait!",
  },
  {
    id: "3",
    title: "Plot Twist Challenge",
    description:
      "Write a story where the ending completely surprises the reader. No one should see it coming!",
  },
  // Add more challenges as needed
];

const Challenges: React.FC = () => {
  // Function to handle challenge click (for now, just showing an alert)
  const handleChallengeClick = (challenge: Challenge) => {
    alert(`Starting the "${challenge.title}" challenge!`);
  };

  return (
    <div className="challenges-container p-6 max-w-screen-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Writing Challenges</h2>

      <ul className="space-y-4">
        {mockChallenges.map((challenge) => (
          <li
            key={challenge.id}
            className="p-4 border-l-4 border-green-600 bg-white rounded-md shadow-sm cursor-pointer"
            onClick={() => handleChallengeClick(challenge)}
          >
            <h3 className="text-lg font-semibold text-green-600">
              {challenge.title}
            </h3>
            <p className="text-gray-700 mt-2">{challenge.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Challenges;
