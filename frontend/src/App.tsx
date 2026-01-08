// App.tsx
import { useState, useEffect } from "react";
import { Download, Settings, Menu } from "lucide-react";
import { Panel, Group } from "react-resizable-panels";
// Import types for messages and conversations
import { Message, Conversation } from "./types";
// Utility functions for formatting dates and generating IDs
import { formatDate, generateUniqueId, getOrCreateUserId } from "./utils";
// Import child components
import MainPage from "./components/MainPage";
import ChatHistorySidebar from "./components/ChatHistorySidebar";
import RightSidebar from "./components/RightSidebar";
import LandingPage from "./components/LandingPage";
import ResizeHandle from "./components/ResizeHandle";
import { fetchProblem, fetchProblemSummary, chatWithAI, ChatRequest } from "./services/api";
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
  const [inputMessage, setInputMessage] = useState("");

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
    setInputMessage("");
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

  // Centralized Send Message Logic
  const handleSendMessage = async (content: string) => {
    if (isTyping || !content.trim()) return;

    if (!problemSlug) {
      alert("Please select a problem first.");
      return;
    }

    const currentConvo = conversations.find(c => c.id === activeConversationId);
    if (!activeConversationId || !currentConvo) {
      console.error("Missing conversationId.");
      alert("Error: No active conversation session.");
      return;
    }
    const conversationUUID = currentConvo.conversationId;

    const currentUser = getOrCreateUserId();
    const newUserMessage: Message = {
      id: generateUniqueId(),
      content: content,
      sender: "user",
      timestamp: new Date().toISOString(),
      read: true,
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setInputMessage(""); // Clear the input field
    setIsTyping(true);

    try {
      const chatRequest: ChatRequest = {
        question: content,
        problem_slug: problemSlug,
        user_id: currentUser,
        conversation_id: conversationUUID,
      };
      const response = await chatWithAI(chatRequest);

      const aiResponse: Message = {
        id: generateUniqueId(),
        content: response.response,
        sender: "ai",
        timestamp: new Date().toISOString(),
        read: false,
      };

      setMessages((prev) => [...prev, aiResponse]);

      // If response contains a code example, extract it
      if (response.response.includes("Code Example")) {
        const codeStart = response.response.indexOf("```python");
        if (codeStart !== -1) {
          const codeEnd = response.response.indexOf("```", codeStart + 3);
          if (codeEnd !== -1) {
            setCode(response.response.substring(codeStart + 9, codeEnd));
          }
        }
      } else if (response.response.toLowerCase().includes("hint")) {
        // If response includes a hint, add it to the hints list
        setHints((prevHints) => [...prevHints, response.response]);
      }
    } catch (error: any) {
      console.error("Failed to send message:", error);
      // Restore the message in case of failure
      setInputMessage(content);
      if (error.message && error.message.includes("429")) {
        alert("Rate Limit Reached: You are sending messages too fast. Please wait a moment before trying again.");
      } else {
        alert("Failed to send message. Please check your connection and try again.");
      }
    } finally {
      setIsTyping(false);
    }
  };

  if (showLanding) {
    return <LandingPage onStart={() => setShowLanding(false)} />;
  }

  return (
    <div className="h-screen flex flex-col bg-background-light dark:bg-background-dark text-text-primary-light dark:text-text-primary-dark transition-colors duration-200 font-sans overflow-hidden">
      {/* Top Header - Now global for consistency */}
      <header className="h-16 bg-surface-light dark:bg-surface-dark border-b border-gray-200 dark:border-gray-800 px-6 flex items-center justify-between z-20 shadow-sm shrink-0">
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-xl hover:bg-surface-alt-light dark:hover:bg-surface-alt-dark transition-all text-text-secondary-light dark:text-text-secondary-dark hover:text-primary"
            aria-label="Toggle sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div>
            <h2 className="text-lg font-bold tracking-tight text-text-primary-light dark:text-text-primary-dark truncate max-w-[200px] md:max-w-md">
              {activeConversationId
                ? conversations.find((c) => c.id === activeConversationId)
                  ?.title || "Chat Session"
                : "New learning session"}
            </h2>
            <div className="flex items-center text-[10px] uppercase font-bold tracking-widest text-primary/70">
              <span className="w-1.5 h-1.5 rounded-full bg-primary mr-1.5 animate-pulse"></span>
              Gemini 2.0 Flash
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowLanding(true)}
            className="px-4 py-2 text-xs font-bold bg-surface-alt-light dark:bg-surface-alt-dark text-text-secondary-light dark:text-text-secondary-dark hover:text-primary rounded-xl transition-all border border-gray-200 dark:border-gray-700"
          >
            Home
          </button>
          <div className="h-4 w-[1px] bg-gray-200 dark:bg-gray-800 mx-1"></div>
          <button
            onClick={handleExportChat}
            disabled={!activeConversationId}
            className="p-2.5 rounded-xl hover:bg-surface-alt-light dark:hover:bg-surface-alt-dark text-text-secondary-light dark:text-text-secondary-dark hover:text-primary transition-all disabled:opacity-30"
            title="Export chat"
          >
            <Download className="h-5 w-5" />
          </button>
          <button
            className="p-2.5 rounded-xl hover:bg-surface-alt-light dark:hover:bg-surface-alt-dark text-text-secondary-light dark:text-text-secondary-dark hover:text-primary transition-all"
            title="Settings"
          >
            <Settings className="h-5 w-5" />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-hidden">
        <Group orientation="horizontal">
          {/* Sidebar Panel */}
          {showSidebar && (
            <Panel defaultSize={20} minSize={15} maxSize={30} collapsible={true}>
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
            </Panel>
          )}

          {showSidebar && <ResizeHandle />}

          {/* Main Chat Panel */}
          <Panel minSize={30}>
            <MainPage
              messages={messages}
              setMessages={setMessages}
              isTyping={isTyping}
              setIsTyping={setIsTyping}
              inputMessage={inputMessage}
              setInputMessage={setInputMessage}
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
              onSendMessage={handleSendMessage}
            />
          </Panel>

          <ResizeHandle />

          {/* Right Sidebar Panel */}
          <Panel defaultSize={30} minSize={20} collapsible={true}>
            <RightSidebar code={code} setCode={setCode} onSendMessage={handleSendMessage} />
          </Panel>
        </Group>
      </div>
    </div>
  );
}

export default App;
