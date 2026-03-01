import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle: React.FC = () => {
    const { isDarkMode, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="fixed top-4 right-4 z-50 p-2.5 rounded-xl
                       bg-white/80 dark:bg-gray-800/80 backdrop-blur-md
                       border border-gray-200 dark:border-gray-700
                       shadow-lg hover:shadow-xl
                       text-gray-700 dark:text-gray-200
                       hover:bg-gray-100 dark:hover:bg-gray-700
                       transition-all duration-300 active:scale-90"
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
            <div className="relative w-5 h-5">
                <Sun className={`w-5 h-5 absolute inset-0 transition-all duration-300 ${isDarkMode ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'}`} />
                <Moon className={`w-5 h-5 absolute inset-0 transition-all duration-300 ${isDarkMode ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'}`} />
            </div>
        </button>
    );
};

export default ThemeToggle;
