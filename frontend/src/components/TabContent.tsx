import React from "react";
import {
  Lightbulb,
  CheckSquare,
  HelpCircle,
  ExternalLink,
  ArrowRight,
} from "lucide-react";

interface TabContentProps {
  activeTab: "hints" | "solutions" | "help";
}

const TabContent: React.FC<TabContentProps> = ({ activeTab }) => {
  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert(`Copied to clipboard: ${text}`); // Basic feedback - can be improved
    }).catch(err => {
      console.error("Failed to copy text: ", err);
      alert("Failed to copy text to clipboard.");
    });
  };

  if (activeTab === "hints") {
    return (
      <div className="space-y-5">
        <h3 className="text-lg font-semibold flex items-center">
          <Lightbulb className="h-5 w-5 mr-2 text-accent" />
          DSA Guidance Prompts
        </h3>
        <div className="space-y-4">
          <div className="bg-accent/10 dark:bg-accent/5 p-4 rounded-xl border border-accent/20 dark:border-accent/10">
            <h4 className="font-medium text-accent-dark dark:text-accent-light mb-2">
              Try asking about:
            </h4>
            <ul className="text-sm text-text-primary-light dark:text-text-primary-dark space-y-3">
              <li
                className="cursor-pointer hover:text-primary dark:hover:text-primary-light transition-colors flex items-center"
                onClick={() => handleCopyToClipboard("How can I optimize the time complexity for this problem?")}
              >
                <ArrowRight className="h-3 w-3 mr-2 text-accent" />
                <span>"How can I optimize the time complexity for this problem?"</span>
              </li>
              <li
                className="cursor-pointer hover:text-primary dark:hover:text-primary-light transition-colors flex items-center"
                onClick={() => handleCopyToClipboard("What approach should I take for this graph traversal?")}
              >
                <ArrowRight className="h-3 w-3 mr-2 text-accent" />
                <span>"What approach should I take for this graph traversal?"</span>
              </li>
              <li
                className="cursor-pointer hover:text-primary dark:hover:text-primary-light transition-colors flex items-center"
                onClick={() => handleCopyToClipboard("Can you help me understand the trade-offs between recursion and iteration?")}
              >
                <ArrowRight className="h-3 w-3 mr-2 text-accent" />
                <span>"Can you help me understand the trade-offs between recursion and iteration?"</span>
              </li>
            </ul>
          </div>

          <div className="bg-primary/10 dark:bg-primary/5 p-4 rounded-xl border border-primary/20 dark:border-primary/10">
            <h4 className="font-medium text-primary-dark dark:text-primary-light mb-2">
              Current DSA topics:
            </h4>
            <ul className="text-sm text-text-primary-light dark:text-text-primary-dark space-y-3">
              <li
                className="cursor-pointer hover:text-primary dark:hover:text-primary-light transition-colors flex items-center"
                onClick={() => handleCopyToClipboard("Explain dynamic programming with an example")}
              >
                <ArrowRight className="h-3 w-3 mr-2 text-primary" />
                <span>"Explain dynamic programming with an example"</span>
              </li>
              <li
                className="cursor-pointer hover:text-primary dark:hover:text-primary-light transition-colors flex items-center"
                onClick={() => handleCopyToClipboard("How do I analyze the time and space complexity of an algorithm?")}
              >
                <ArrowRight className="h-3 w-3 mr-2 text-primary" />
                <span>"How do I analyze the time and space complexity of an algorithm?"</span>
              </li>
              <li
                className="cursor-pointer hover:text-primary dark:hover:text-primary-light transition-colors flex items-center"
                onClick={() => handleCopyToClipboard("What are common pitfalls when implementing tree traversals?")}
              >
                <ArrowRight className="h-3 w-3 mr-2 text-primary" />
                <span>"What are common pitfalls when implementing tree traversals?"</span>
              </li>
            </ul>
          </div>

          <div className="bg-secondary/10 dark:bg-secondary/5 p-4 rounded-xl border border-secondary/20 dark:border-secondary/10">
            <h4 className="font-medium text-secondary-dark dark:text-secondary-light mb-2">
              Deep Dive Prompts:
            </h4>
            <ul className="text-sm text-text-primary-light dark:text-text-primary-dark space-y-3">
              <li
                className="cursor-pointer hover:text-primary dark:hover:text-primary-light transition-colors flex items-center"
                onClick={() => handleCopyToClipboard("Compare iterative and recursive approaches for this problem")}
              >
                <ArrowRight className="h-3 w-3 mr-2 text-secondary" />
                <span>"Compare iterative and recursive approaches for this problem"</span>
              </li>
              <li
                className="cursor-pointer hover:text-primary dark:hover:text-primary-light transition-colors flex items-center"
                onClick={() => handleCopyToClipboard("Outline a step-by-step plan to debug this algorithm")}
              >
                <ArrowRight className="h-3 w-3 mr-2 text-secondary" />
                <span>"Outline a step-by-step plan to debug this algorithm"</span>
              </li>
              <li
                className="cursor-pointer hover:text-primary dark:hover:text-primary-light transition-colors flex items-center"
                onClick={() => handleCopyToClipboard("Discuss how to refine the solution to handle edge cases")}
              >
                <ArrowRight className="h-3 w-3 mr-2 text-secondary" />
                <span>"Discuss how to refine the solution to handle edge cases"</span>
              </li>
            </ul>
          </div>
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