import  { useState,  } from "react";
import { Lightbulb, CheckSquare, HelpCircle } from "lucide-react";
import TabContent from "./TabContent";

const RightSidebar = () => {
  const [activeTab, setActiveTab] = useState<"hints" | "solutions" | "help">("hints");
  const [hints, setHints] = useState<string[]>([]);
  const [code, setCode] = useState<string>("");

  return (
    <div>
      {/* Right Sidebar with Tabs */}
      <div className="hidden lg:flex flex-col w-80 border-l border-gray-200 dark:border-gray-700 bg-surface-light dark:bg-surface-dark h-full">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-1 min-h-0 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-primary scrollbar-track-gray-200 dark:scrollbar-track-gray-700 dark:scrollbar-thumb-primary-light">
            <button
              onClick={() => setActiveTab("hints")}
              className={`flex-1 py-4 px-4 text-center font-medium transition-colors ${
                activeTab === "hints"
                  ? "border-b-2 border-primary text-primary dark:text-primary-light dark:border-primary-light"
                  : "text-text-secondary-light dark:text-text-secondary-dark hover:text-text-primary-light dark:hover:text-text-primary-dark hover:bg-surface-alt-light dark:hover:bg-surface-alt-dark"
              }`}
              aria-label="Hints tab"
            >
              <div className="flex items-center justify-center">
                <Lightbulb className="h-4 w-4 mr-2" />
                Hints
              </div>
            </button>
            <button
              onClick={() => setActiveTab("solutions")}
              className={`flex-1 py-4 px-4 text-center font-medium transition-colors ${
                activeTab === "solutions"
                  ? "border-b-2 border-primary text-primary dark:text-primary-light dark:border-primary-light"
                  : "text-text-secondary-light dark:text-text-secondary-dark hover:text-text-primary-light dark:hover:text-text-primary-dark hover:bg-surface-alt-light dark:hover:bg-surface-alt-dark"
              }`}
              aria-label="Solutions tab"
            >
              <div className="flex items-center justify-center">
                <CheckSquare className="h-4 w-4 mr-2" />
                Solutions
              </div>
            </button>
            <button
              onClick={() => setActiveTab("help")}
              className={`flex-1 py-4 px-4 text-center font-medium transition-colors ${
                activeTab === "help"
                  ? "border-b-2 border-primary text-primary dark:text-primary-light dark:border-primary-light"
                  : "text-text-secondary-light dark:text-text-secondary-dark hover:text-text-primary-light dark:hover:text-text-primary-dark hover:bg-surface-alt-light dark:hover:bg-surface-alt-dark"
              }`}
              aria-label="Help tab"
            >
              <div className="flex items-center justify-center">
                <HelpCircle className="h-4 w-4 mr-2" />
                Help
              </div>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <TabContent activeTab={activeTab} />
        </div>
      </div>
    </div>
  );
};

export default RightSidebar;
