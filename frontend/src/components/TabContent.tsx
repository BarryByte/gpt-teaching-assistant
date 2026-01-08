import React from "react";
import {
  Lightbulb,
  CheckSquare,
  HelpCircle,
  ExternalLink,
  ArrowRight,
  Zap,
} from "lucide-react";

interface TabContentProps {
  activeTab: "hints" | "solutions" | "help";
  onSendMessage: (content: string) => Promise<void>;
}

const TabContent: React.FC<TabContentProps> = ({ activeTab, onSendMessage }) => {
  const handleHintClick = (text: string) => {
    onSendMessage(text);
  };

  if (activeTab === "hints") {
    return (
      <div className="space-y-6 p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black flex items-center text-text-primary-light dark:text-text-primary-dark tracking-tight">
            <Lightbulb className="h-5 w-5 mr-3 text-primary" />
            Adaptive Hints
          </h3>
          <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-primary text-background-dark uppercase tracking-widest">Beta</span>
        </div>

        <div className="space-y-5">
          <div className="bg-surface-alt-light dark:bg-surface-alt-dark/40 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-2 opacity-5">
              <Zap className="w-12 h-12 text-primary rotate-12" />
            </div>
            <h4 className="font-bold text-[10px] text-primary uppercase tracking-[0.2em] mb-4 flex items-center">
              <span className="w-2 h-0.5 bg-primary mr-2"></span>
              Strategic Questions
            </h4>
            <ul className="space-y-2.5 relative z-10">
              {[
                "Verify the time complexity of my current approach",
                "What edge cases should I handle first?",
                "Is there a more space-efficient way to solve this?",
                "Explain the core intuition behind the optimal solution."
              ].map((hint, idx) => (
                <li
                  key={idx}
                  className="group cursor-pointer bg-white dark:bg-background-dark/60 hover:bg-primary text-text-primary-light dark:text-text-primary-dark hover:text-background-dark border border-gray-100 dark:border-gray-800 hover:border-primary p-3.5 rounded-xl transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-primary/20 flex items-center justify-between"
                  onClick={() => handleHintClick(hint)}
                >
                  <span className="text-xs font-bold leading-relaxed">{hint}</span>
                  <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0 group-hover:block hidden md:block" />
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-surface-alt-light dark:bg-surface-alt-dark/40 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm relative overflow-hidden">
            <h4 className="font-bold text-[10px] text-primary uppercase tracking-[0.2em] mb-4 flex items-center">
              <span className="w-2 h-0.5 bg-primary mr-2"></span>
              Concept Deep Dives
            </h4>
            <ul className="space-y-2.5">
              {[
                "Visualize a real-world analogy for this problem",
                "Break down the recursion tree for this scenario",
                "Compare DFS vs BFS for this specific constraint"
              ].map((hint, idx) => (
                <li
                  key={idx}
                  className="group cursor-pointer bg-white dark:bg-background-dark/60 hover:bg-primary text-text-primary-light dark:text-text-primary-dark hover:text-background-dark border border-gray-100 dark:border-gray-800 hover:border-primary p-3.5 rounded-xl transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-primary/20 flex items-center justify-between"
                  onClick={() => handleHintClick(hint)}
                >
                  <span className="text-xs font-bold leading-relaxed">{hint}</span>
                  <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0 group-hover:block hidden md:block" />
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="p-4 bg-primary/10 border border-primary/20 rounded-2xl">
          <p className="text-[10px] text-primary/80 font-bold leading-relaxed italic">
            Tip: Clicking a card will automatically send the query to BrainBox. These hints focus on guiding your thought process.
          </p>
        </div>
      </div>
    );
  }

  if (activeTab === "solutions") {
    return (
      <div className="h-full overflow-y-auto p-4">
        <div className="space-y-5">
          <h3 className="text-lg font-semibold flex items-center">
            <CheckSquare className="h-5 w-5 mr-2 text-secondary" />
            Guided Problem-Solving Strategies
          </h3>
          <div className="space-y-4">
            <div className="bg-surface-light dark:bg-surface-dark p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-card-light dark:shadow-card-dark">
              <h4 className="font-medium mb-3">Common DSA Queries</h4>
              <div className="space-y-3">
                <div className="p-3 bg-surface-alt-light dark:bg-surface-alt-dark rounded-lg">
                  <h5 className="text-sm font-semibold mb-1">
                    How do I evaluate algorithm complexity?
                  </h5>
                  <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                    Consider both time and space complexity, and examine
                    worst-case, average-case, and best-case scenarios to
                    understand performance.
                  </p>
                </div>

                <div className="p-3 bg-surface-alt-light dark:bg-surface-alt-dark rounded-lg">
                  <h5 className="text-sm font-semibold mb-1">
                    What strategies help in debugging my code?
                  </h5>
                  <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                    Break down the problem, test individual components, and use
                    debugging tools or print statements to trace the logic.
                  </p>
                </div>

                <div className="p-3 bg-surface-alt-light dark:bg-surface-alt-dark rounded-lg">
                  <h5 className="text-sm font-semibold mb-1">
                    How do I choose the right data structure?
                  </h5>
                  <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                    Analyze your problem requirements and consider the
                    performance trade-offs of various data structures for
                    optimal efficiency.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-secondary/10 dark:bg-secondary/5 p-4 rounded-xl border border-secondary/20 dark:border-secondary/10">
              <h4 className="font-medium text-secondary-dark dark:text-secondary-light mb-3">
                Quick Actions
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <button className="p-3 bg-white dark:bg-surface-dark rounded-lg border border-gray-200 dark:border-gray-700 text-sm hover:bg-surface-alt-light dark:hover:bg-surface-alt-dark transition-colors shadow-xs">
                  Submit new DSA query
                </button>
                <button className="p-3 bg-white dark:bg-surface-dark rounded-lg border border-gray-200 dark:border-gray-700 text-sm hover:bg-surface-alt-light dark:hover:bg-surface-alt-dark transition-colors shadow-xs">
                  View query history
                </button>
                <button className="p-3 bg-white dark:bg-surface-dark rounded-lg border border-gray-200 dark:border-gray-700 text-sm hover:bg-surface-alt-light dark:hover:bg-surface-alt-dark transition-colors shadow-xs">
                  Clear current discussion
                </button>
                <button className="p-3 bg-white dark:bg-surface-dark rounded-lg border border-gray-200 dark:border-gray-700 text-sm hover:bg-surface-alt-light dark:hover:bg-surface-alt-dark transition-colors shadow-xs">
                  Update preferences
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <h3 className="text-lg font-semibold flex items-center">
        <HelpCircle className="h-5 w-5 mr-2 text-primary" />
        DSA Help & Support
      </h3>

      <div className="space-y-4">
        <div className="bg-surface-light dark:bg-surface-dark p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-card-light dark:shadow-card-dark">
          <h4 className="font-medium mb-4">Frequently Asked Questions</h4>
          <div className="space-y-3">
            <details className="group">
              <summary className="flex justify-between items-center font-medium cursor-pointer list-none p-3 rounded-lg bg-surface-alt-light dark:bg-surface-alt-dark">
                <span>How does the DSA assistant work?</span>
                <span className="transition group-open:rotate-180">
                  <svg
                    fill="none"
                    height="24"
                    shapeRendering="geometricPrecision"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    viewBox="0 0 24 24"
                    width="24"
                  >
                    <path d="M6 9l6 6 6-6"></path>
                  </svg>
                </span>
              </summary>
              <p className="text-text-secondary-light dark:text-text-secondary-dark mt-3 mb-4 px-3 text-sm">
                Our AI teaching assistant leverages advanced natural language
                processing to help you tackle DSA challenges by offering hints,
                probing questions, and insights—without revealing the full
                solution.
              </p>
            </details>

            <details className="group">
              <summary className="flex justify-between items-center font-medium cursor-pointer list-none p-3 rounded-lg bg-surface-alt-light dark:bg-surface-alt-dark">
                <span>Are my DSA queries and data secure?</span>
                <span className="transition group-open:rotate-180">
                  <svg
                    fill="none"
                    height="24"
                    shapeRendering="geometricPrecision"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    viewBox="0 0 24 24"
                    width="24"
                  >
                    <path d="M6 9l6 6 6-6"></path>
                  </svg>
                </span>
              </summary>
              <p className="text-text-secondary-light dark:text-text-secondary-dark mt-3 mb-4 px-3 text-sm">
                Yes, your queries are stored locally and remain private. You
                have full control over your data, including options to export or
                delete your conversation history.
              </p>
            </details>

            <details className="group">
              <summary className="flex justify-between items-center font-medium cursor-pointer list-none p-3 rounded-lg bg-surface-alt-light dark:bg-surface-alt-dark">
                <span>Do I need an internet connection for the assistant?</span>
                <span className="transition group-open:rotate-180">
                  <svg
                    fill="none"
                    height="24"
                    shapeRendering="geometricPrecision"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    viewBox="0 0 24 24"
                    width="24"
                  >
                    <path d="M6 9l6 6 6-6"></path>
                  </svg>
                </span>
              </summary>
              <p className="text-text-secondary-light dark:text-text-secondary-dark mt-3 mb-4 px-3 text-sm">
                An active internet connection is required for the assistant to
                process your queries and provide real-time DSA guidance.
              </p>
            </details>
          </div>
        </div>

        <div className="bg-primary/10 dark:bg-primary/5 p-4 rounded-xl border border-primary/20 dark:border-primary/10">
          <h4 className="font-medium text-primary-dark dark:text-primary-light mb-3">
            Usage Guidelines
          </h4>
          <ul className="text-sm text-text-primary-light dark:text-text-primary-dark space-y-2 list-disc pl-5">
            <li>
              Be specific in your DSA queries to receive targeted guidance
            </li>
            <li>
              Use markdown formatting for clearer code snippets and explanations
            </li>
            <li>Attach problem links or code snippets when relevant</li>
            <li>Start a new query for unrelated topics</li>
            <li>Review your query history for previous insights</li>
          </ul>
        </div>

        <div className="bg-accent/10 dark:bg-accent/5 p-4 rounded-xl border border-accent/20 dark:border-accent/10">
          <h4 className="font-medium text-accent-dark dark:text-accent-light mb-3">
            Contact DSA Support
          </h4>
          <p className="text-sm text-text-primary-light dark:text-text-primary-dark mb-4">
            Need additional assistance with your DSA challenges? Our support
            team is here to help.
          </p>
          <button className="w-full p-3 bg-accent hover:bg-accent-light active:bg-accent-dark text-white rounded-lg transition-colors text-sm font-medium flex items-center justify-center">
            <ExternalLink className="h-4 w-4 mr-2" />
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
};

export default TabContent;