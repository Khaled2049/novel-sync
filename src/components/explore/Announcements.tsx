const Announcements: React.FC = () => {
  return (
    <div className="announcements-container p-6 max-w-screen-md mx-auto bg-gray-100 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Announcements</h2>
      <div className="announcement-item p-4 border-l-4 border-blue-600 bg-white rounded-md shadow-sm">
        <h3 className="text-lg font-semibold text-blue-600">
          Khaled's Release Party
        </h3>
        <p className="text-gray-700 mt-2">
          Join us in celebrating the release of NovelSync! Stay tuned for more
          details about the event.
        </p>
      </div>
    </div>
  );
};

export default Announcements;
