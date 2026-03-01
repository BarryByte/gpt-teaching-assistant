import { useState } from "react";
import { Lightbulb, Code as CodeIcon, HelpCircle, Trash2 } from "lucide-react";
import TabContent from "./TabContent";
import CodeEditor from "./CodeEditor";
import { cn } from "../utils"; // Assuming cn is in utils or defined here

interface RightSidebarProps {
  code: string;
  setCode: React.Dispatch<React.SetStateAction<string>>;
  onSendMessage: (content: string) => Promise<void>;
}

const RightSidebar = ({ code, setCode, onSendMessage }: RightSidebarProps) => {
  const [activeTab, setActiveTab] = useState<"hints" | "editor" | "help">("editor");

  return (
    <div className="hidden lg:flex flex-col w-full border-l border-gray-200 dark:border-gray-800 bg-surface-light dark:bg-surface-dark h-full shadow-2xl z-10">
      {/* Tabs Header */}
      <div className="flex border-b border-gray-200 dark:border-gray-800">
        <TabButton
          active={activeTab === "hints"}
          onClick={() => setActiveTab("hints")}
          icon={<Lightbulb className="w-4 h-4" />}
          label="Hints"
        />
        <TabButton
          active={activeTab === "editor"}
          onClick={() => setActiveTab("editor")}
          icon={<CodeIcon className="w-4 h-4" />}
          label="Editor"
        />
        <TabButton
          active={activeTab === "help"}
          onClick={() => setActiveTab("help")}
          icon={<HelpCircle className="w-4 h-4" />}
          label="Help"
        />
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === "editor" ? (
          <div className="h-full p-4 flex flex-col">
            <div className="flex justify-between items-center mb-2 px-2">
              <span className="text-xs font-semibold text-text-muted-light dark:text-text-muted-dark uppercase tracking-wider">Python Editor</span>
              <button
                onClick={() => setCode("")}
                className="flex items-center space-x-1 text-xs text-text-muted-light dark:text-text-muted-dark hover:text-red-500 dark:hover:text-red-400 transition-colors"
                title="Clear Editor"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            </div>
            <div className="flex-1 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm relative">
              <CodeEditor
                code={code}
                onChange={(val) => setCode(val || "")}
                language="python"
              />
            </div>
          </div>
        ) : (
          <div className="h-full overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-800">
            <TabContent activeTab={activeTab === "hints" ? "hints" : "help"} onSendMessage={onSendMessage} />
          </div>
        )}
      </div>
    </div>
  );
};

const TabButton = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) => (
  <button
    onClick={onClick}
    className={cn(
      "flex-1 flex items-center justify-center space-x-2 py-4 px-2 border-b-2 transition-all duration-200 font-semibold text-xs tracking-wider uppercase",
      active
        ? "border-primary text-primary bg-primary/5"
        : "border-transparent text-text-muted-light dark:text-text-muted-dark hover:text-text-primary-light dark:hover:text-text-primary-dark hover:bg-gray-50 dark:hover:bg-gray-800/50"
    )}
  >
    {icon}
    <span>{label}</span>
  </button>
);

export default RightSidebar;
