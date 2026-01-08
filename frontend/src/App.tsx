// App.tsx
import { useState, useEffect } from "react";
import { Download, Settings, Menu } from "lucide-react";
// Import types for messages and conversations
import { Message, Conversation } from "./types";
// Utility functions for formatting dates and generating IDs
import { formatDate, generateUniqueId } from "./utils";
// Import child components
import MainPage from "./components/MainPage";
import ChatHistorySidebar from "./components/ChatHistorySidebar";
import RightSidebar from "./components/RightSidebar";
import LandingPage from "./components/LandingPage";
import { fetchProblem, fetchProblemSummary } from "./services/api";
import { v4 as uuidv4 } from "uuid";

function App() {
  const [showLanding, setShowLanding] = useState(true);
  // State for conversations and active conversation

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null);

  // State for chat messages and input
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  // State to toggle sidebar visibility
  const [showSidebar, setShowSidebar] = useState(true);

  // State for problem selection and related data
  const [problemSlug, setProblemSlug] = useState<string | null>(null);
  const [hints, setHints] = useState<string[]>([]);
  const [code, setCode] = useState<string>("");

  // Load saved conversations from localStorage on mount
  useEffect(() => {
    const storedConversations = localStorage.getItem("conversations");
    if (storedConversations) {
      const parsedConversations: Conversation[] =
        JSON.parse(storedConversations);
      setConversations(parsedConversations);
      if (parsedConversations.length > 0) {
        setActiveConversationId(parsedConversations[0].id);
        setMessages(parsedConversations[0].messages);
        setProblemSlug(parsedConversations[0].problemSlug || null);
      }
    }
  }, []);

  // Sync current messages and problemSlug back to the conversations array
  useEffect(() => {
    if (activeConversationId) {
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === activeConversationId
            ? {
              ...conv,
              messages,
              problemSlug,
              lastMessage: messages.length > 0 ? messages[messages.length - 1].content : conv.lastMessage,
              timestamp: messages.length > 0 ? messages[messages.length - 1].timestamp : conv.timestamp
            }
            : conv
        )
      );
    }
  }, [messages, problemSlug, activeConversationId]);

  // Save conversations to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("conversations", JSON.stringify(conversations));
  }, [conversations]);

  // Callback to create a new conversation
  const handleCreateConversation = (): Conversation => {
    const newConversation: Conversation = {
      id: generateUniqueId(),
      conversationId: uuidv4(),
      title: "New Conversation",
      messages: [],
      lastMessage: "",
      timestamp: "",
      problemSlug: null,
    };

    setConversations((prev) => [newConversation, ...prev]);
    setActiveConversationId(newConversation.id);
    setMessages([]);
    setProblemSlug(null);
    return newConversation;
  };

  // Export current conversation as a text file
  const handleExportChat = () => {
    if (!activeConversationId) return;
    const currentConversation = conversations.find(
      (c) => c.id === activeConversationId
    );
    if (!currentConversation) return;

    const chatContent = currentConversation.messages
      .map(
        (msg) =>
          `${msg.sender === "user" ? "You" : "AI"} (${formatDate(
            msg.timestamp
          )}): ${msg.content}`
      )
      .join("\n\n");

    const blob = new Blob([chatContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `chat-export-${formatDate(new Date().toISOString())}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Toggle the sidebar open/closed
  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  // Callback to select an existing conversation
  const handleSelectConversation = (conversationId: string) => {
    setActiveConversationId(conversationId);
    const conversation = conversations.find(
      (conv) => conv.id === conversationId
    );
    if (conversation) {
      setMessages(conversation.messages);
      setProblemSlug(conversation.problemSlug || null);   // Restore problemSlug when selecting conversation
    }
  };

  // Handle problem selection
  const handleProblemSelect = async (slug: string) => {
    let currentConvo = conversations.find((c) => c.id === activeConversationId);

    if (!currentConvo) {
      currentConvo = handleCreateConversation();
    }

    try {
      const problem = await fetchProblem(slug);
      const problemSummary = await fetchProblemSummary(slug);
      const problemDescription = problemSummary.description;

      const problemMessage: Message = {
        id: generateUniqueId(),
        content: `**Problem: ${problem.title}**\n\n${problemDescription}`,
        sender: "ai",
        timestamp: new Date().toISOString(),
        read: true,
      };

      setConversations((prev) => {
        return prev.map(conv => {
          if (conv.id === currentConvo!.id) {
            return {
              ...conv,
              title: problem.title,
              messages: [problemMessage],
              lastMessage: problemMessage.content,
              timestamp: new Date().toISOString(),
              problemSlug: slug,
            };
          }
          return conv;
        });
      });
      setMessages([problemMessage]);
      setProblemSlug(slug);
    } catch (error: any) {
      console.error("Error fetching problem:", error);
    }
  };

  const activeConversation = conversations.find(
    (c) => c.id === activeConversationId
  ); // Get active conversation object

  if (showLanding) {
    return <LandingPage onStart={() => setShowLanding(false)} />;
  }

  return (
    <div className="flex h-screen bg-background-light dark:bg-background-dark text-text-primary-light dark:text-text-primary-dark transition-colors duration-200 font-sans">
      {/* Sidebar: Displays list of conversations and a button to create new ones */}
      <ChatHistorySidebar
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={(id) => {
          handleSelectConversation(id);
          setShowLanding(false);
        }}
        onCreateConversation={() => {
          handleCreateConversation();
          setShowLanding(false);
        }}
      />
      {/* Overlay for mobile devices when sidebar is open */}
      {showSidebar && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-20"
          onClick={toggleSidebar}
          aria-hidden="true"
        ></div>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative">
        {/* Top Header */}
        <div className="h-16 bg-surface-light dark:bg-surface-dark border-b border-gray-200 dark:border-gray-700 px-4 flex items-center justify-between sticky top-0 z-10 shadow-card-light dark:shadow-card-dark">
          <div className="flex items-center">
            <button
              onClick={toggleSidebar}
              className="p-2 mr-2 rounded-full hover:bg-surface-alt-light dark:hover:bg-surface-alt-dark transition-colors"
              aria-label="Toggle sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h2 className="text-lg font-semibold truncate max-w-[200px] md:max-w-md">
              {activeConversationId
                ? conversations.find((c) => c.id === activeConversationId)
                  ?.title || "Chat"
                : "New Conversation"}
            </h2>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowLanding(true)}
              className="px-3 py-1.5 text-xs font-semibold bg-primary/10 text-primary hover:bg-primary/20 rounded-lg transition-colors border border-primary/20"
            >
              Home
            </button>
            <div className="flex space-x-1">
              <button
                onClick={handleExportChat}
                disabled={!activeConversationId}
                className={`p-2 rounded-full transition-colors ${activeConversationId
                  ? "hover:bg-surface-alt-light dark:hover:bg-surface-alt-dark text-text-secondary-light dark:text-text-secondary-dark"
                  : "text-text-muted-light dark:text-text-muted-dark cursor-not-allowed opacity-50"
                  }`}
                aria-label="Export chat"
                title="Export chat"
              >
                <Download className="h-5 w-5" />
              </button>
              <button
                className="p-2 rounded-full hover:bg-surface-alt-light dark:hover:bg-surface-alt-dark transition-colors"
                aria-label="Settings"
                title="Settings"
              >
                <Settings className="h-5 w-5 text-text-secondary-light dark:text-text-secondary-dark" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Main Chat Component */}
          <MainPage
            messages={messages}
            setMessages={setMessages}
            isTyping={isTyping}
            setIsTyping={setIsTyping}
            problemSlug={problemSlug}
            setProblemSlug={setProblemSlug}
            hints={hints}
            setHints={setHints}
            code={code}
            setCode={setCode}
            handleProblemSelect={async (slug) => {
              await handleProblemSelect(slug);
              setShowLanding(false);
            }}
            conversationId={activeConversation?.conversationId} // Pass conversationId prop here
          />

          {/* Right Sidebar Component*/}
          <RightSidebar code={code} setCode={setCode} />

        </div>
      </div>
    </div>
  );
}

export default App;
