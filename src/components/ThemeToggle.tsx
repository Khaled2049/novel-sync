interface ThemeToggleProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({
  isDarkMode,
  toggleTheme,
}) => {
  return (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded-md ${
        isDarkMode ? " text-yellow-300" : " text-gray-800"
      }`}
    >
      {isDarkMode ? "🌙" : "☀️"}
    </button>
  );
};

export default ThemeToggle;
