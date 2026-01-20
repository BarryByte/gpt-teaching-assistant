import { useState, useEffect } from "react";
import { Download, Settings, Menu, PanelLeft, LogOut } from "lucide-react";
import { Message, Conversation, fetchProblem, fetchProblemSummary, ChatRequest } from "../services/api";
import { formatDate, generateUniqueId } from "../utils";
import MainPage from "./MainPage";
import ChatHistorySidebar from "./ChatHistorySidebar";
import RightSidebar from "./RightSidebar";
import { v4 as uuidv4 } from "uuid";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function ChatLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // State for conversations and active conversation
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

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

    // State for resizable right sidebar
    const DEFAULT_RIGHT_SIDEBAR_WIDTH = 400;
    const MIN_RIGHT_SIDEBAR_WIDTH = 100;
    const [rightSidebarWidth, setRightSidebarWidth] = useState(DEFAULT_RIGHT_SIDEBAR_WIDTH);
    const [isRightSidebarCollapsed, setIsRightSidebarCollapsed] = useState(false);
    const [isResizing, setIsResizing] = useState(false);

    // Theme state
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const savedTheme = localStorage.getItem("theme");
        return savedTheme ? savedTheme === "dark" : true;
    });
    const [showSettings, setShowSettings] = useState(false);

    // Load saved conversations from backend on mount
    useEffect(() => {
        if (!user) return;

        const loadConversations = async () => {
            try {
                // Dynamic import to avoid circular dep if needed, or just standard import
                const { fetchUserConversations } = await import("../services/api");
                const data = await fetchUserConversations();

                // Map backend data to frontend Conversation type
                const mapped: Conversation[] = data.map((d: any) => ({
                    id: d.conversation_id, // Use backend ID as local ID for simplicity
                    conversationId: d.conversation_id,
                    title: d.title || "Chat Session", // You might want to format this based on slug
                    messages: [], // We don't have messages yet
                    lastMessage: d.last_message,
                    timestamp: d.timestamp,
                    problemSlug: d.problem_slug
                }));

                setConversations(mapped);

                // If we have conversations but no active one, potentially select first? 
                // Or just leave it blank.
            } catch (error) {
                console.error("Failed to load conversations:", error);
            }
        };

        loadConversations();
    }, [user?.username]);

    // Sync current messages and problemSlug back to the conversations array
    useEffect(() => {
        if (activeConversationId) {
            setConversations((prev) =>
                prev.map((conv) =>
                    conv.id === activeConversationId
                        ? {
                            ...conv,
                            messages, // We are updating the local state with currently loaded messages
                            problemSlug,
                            lastMessage: messages.length > 0 ? messages[messages.length - 1].content : conv.lastMessage,
                            timestamp: messages.length > 0 ? messages[messages.length - 1].timestamp : conv.timestamp
                        }
                        : conv
                )
            );
        }
    }, [messages, problemSlug, activeConversationId]);

    // Save conversations to localStorage - REMOVED or kept as backup?
    // User said "previous conversations get deleted". If we rely on backend, we don't strictly need localStorage sync 
    // EXCEPT maybe for unsaved drafts or offline? For now, let's DISABLE localStorage write to avoid conflicts
    // unless we want to use it for faster initial load.
    // useEffect(() => {
    //     if (user?.username) {
    //         localStorage.setItem(`conversations_${user.username}`, JSON.stringify(conversations));
    //     }
    // }, [conversations, user?.username]);

    // Apply theme class to HTML element
    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
        localStorage.setItem("theme", isDarkMode ? "dark" : "light");
    }, [isDarkMode]);

    // Handle sidebar resize with mouse events
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isResizing) return;
            const newWidth = window.innerWidth - e.clientX;
            if (newWidth < MIN_RIGHT_SIDEBAR_WIDTH) {
                setIsRightSidebarCollapsed(true);
                setIsResizing(false);
            } else {
                setRightSidebarWidth(Math.min(newWidth, window.innerWidth * 0.6));
            }
        };

        const handleMouseUp = () => {
            setIsResizing(false);
        };

        if (isResizing) {
            document.addEventListener("mousemove", handleMouseMove);
            document.addEventListener("mouseup", handleMouseUp);
            document.body.style.cursor = "col-resize";
            document.body.style.userSelect = "none";
        }

        return () => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
            document.body.style.cursor = "";
            document.body.style.userSelect = "";
        };
    }, [isResizing]);


    // Callback to create a new conversation
    const handleCreateConversation = (): Conversation => {
        const newUuid = uuidv4();
        const newConversation: Conversation = {
            id: newUuid, // Use UUID for both
            conversationId: newUuid,
            title: "New Conversation",
            messages: [],
            lastMessage: "",
            timestamp: new Date().toISOString(),
            problemSlug: null,
        };

        setConversations((prev) => [newConversation, ...prev]);
        setActiveConversationId(newConversation.id);
        setMessages([]);
        setProblemSlug(null);
        setInputMessage("");
        return newConversation;
    };

    const handleDeleteConversation = async (conversationId: string) => {
        const conversation = conversations.find(c => c.id === conversationId);
        if (!conversation) return;

        // Optimistic UI update
        const newConversations = conversations.filter(c => c.id !== conversationId);
        setConversations(newConversations);

        if (activeConversationId === conversationId) {
            // If we strictly want to clear, we can. Or pick the first one.
            if (newConversations.length > 0) {
                // If we switch, we should probably trigger a select? 
                // For now just clearing state is safer to avoid auto-fetch loops
                setActiveConversationId(null);
                setMessages([]);
                setProblemSlug(null);
            } else {
                setActiveConversationId(null);
                setMessages([]);
                setProblemSlug(null);
            }
        }

        try {
            await import("../services/api").then(mod => mod.deleteConversation(conversation.conversationId));
        } catch (error) {
            console.error("Failed to delete conversation:", error);
            // Revert if needed, but for now we trust it works or user refreshes.
        }
    }

    const handleRenameConversation = async (conversationId: string, newTitle: string) => {
        // Optimistic Update
        setConversations(prev => prev.map(c =>
            c.id === conversationId ? { ...c, title: newTitle } : c
        ));

        const conversation = conversations.find(c => c.id === conversationId);
        if (conversation) {
            try {
                await import("../services/api").then(mod => mod.renameConversation(conversation.conversationId, newTitle));
            } catch (error) {
                console.error("Failed to rename", error);
                // Could revert here
            }
        }
    }

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

    const toggleSidebar = () => {
        setShowSidebar(!showSidebar);
    };

    const handleSelectConversation = async (conversationId: string) => {
        setActiveConversationId(conversationId);
        const conversation = conversations.find(
            (conv) => conv.id === conversationId
        );
        if (conversation) {
            setMessages(conversation.messages); // Set initial (likely empty if fresh load)
            setProblemSlug(conversation.problemSlug || null);

            // Fetch full history from backend
            try {
                const { fetchChatHistory } = await import("../services/api");
                const historyItems = await fetchChatHistory(conversation.conversationId);

                // Convert ChatHistoryItem to Message
                const messagesFromBackend: Message[] = [];
                historyItems.forEach((item, idx) => {
                    // User message
                    messagesFromBackend.push({
                        id: `hist-${conversationId}-${idx}-u`,
                        content: item.question,
                        sender: 'user',
                        timestamp: new Date().toISOString(), // Mock timestamp if not in history item
                        read: true
                    });
                    // AI response
                    if (item.response) {
                        messagesFromBackend.push({
                            id: `hist-${conversationId}-${idx}-a`,
                            content: item.response,
                            sender: 'ai',
                            timestamp: new Date().toISOString(),
                            read: true
                        });
                    }
                });

                setMessages(messagesFromBackend);

                // Update local conversation object with fetched messages so we don't re-fetch needlessly?
                // Or just keep it ephemeral in 'messages' state. 
                // Given we sync back in useEffect, this will update 'conversations' state too.

            } catch (e) {
                console.error("Failed to fetch history", e);
            }
        }
    };

    const handleProblemSelect = async (slug: string) => {
        let currentConvo = conversations.find((c) => c.id === activeConversationId);

        if (!currentConvo) {
            currentConvo = handleCreateConversation();
        }

        // Fix: Ensure we are using the freshly created conversation ID if it was just created
        // handleCreateConversation updates state but `conversations` here is closure stale?
        // Actually handleCreateConversation returns the object.
        // We will force setting state below with functional update which is safer.
        const targetConvoId = currentConvo.id;

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
                    if (conv.id === targetConvoId) {
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

            // If we are looking at this conversation, update messages view
            if (activeConversationId === targetConvoId || !activeConversationId) {
                setMessages([problemMessage]);
                setProblemSlug(slug);
                if (!activeConversationId) setActiveConversationId(targetConvoId);
            }

        } catch (error: any) {
            console.error("Error fetching problem:", error);
        }
    };

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

        const newUserMessage: Message = {
            id: generateUniqueId(),
            content: content,
            sender: "user",
            timestamp: new Date().toISOString(),
            read: true,
        };

        setMessages((prev) => [...prev, newUserMessage]);
        setInputMessage("");
        setIsTyping(true);

        try {
            const chatRequest: ChatRequest = {
                question: content,
                problem_slug: problemSlug,
                conversation_id: conversationUUID,
            };

            // Prepare placeholder for AI response
            const aiResponseId = generateUniqueId();
            const initialAiResponse: Message = {
                id: aiResponseId,
                content: "", // Start empty
                sender: "ai",
                timestamp: new Date().toISOString(),
                read: false,
            };
            setMessages((prev) => [...prev, initialAiResponse]);

            let fullContent = "";

            // Dynamic import to avoid circular dependency issues if any, or just valid ES module usage
            const { streamChatWithAI } = await import("../services/api");

            await streamChatWithAI(
                chatRequest,
                (chunk) => {
                    fullContent += chunk;
                    setMessages((prev) =>
                        prev.map(msg =>
                            msg.id === aiResponseId
                                ? { ...msg, content: fullContent }
                                : msg
                        )
                    );
                },
                (error) => {
                    console.error("Stream error:", error);
                    // Could append error message to content
                }
            );

            // Post-processing for hints/code (same as before but on the full content)
            if (fullContent.includes("Code Example")) {
                const codeStart = fullContent.indexOf("```python");
                if (codeStart !== -1) {
                    const codeEnd = fullContent.indexOf("```", codeStart + 3);
                    if (codeEnd !== -1) {
                        setCode(fullContent.substring(codeStart + 9, codeEnd));
                    }
                }
            } else if (fullContent.toLowerCase().includes("hint")) {
                // Determine if it is a new hint or we should just add it. 
                // A bit naive, but sticking to existing logic.
                setHints((prevHints) => {
                    // Avoid duplicates if re-rendering
                    if (!prevHints.includes(fullContent)) {
                        return [...prevHints, fullContent];
                    }
                    return prevHints;
                });
            }

        } catch (error: any) {
            console.error("Failed to send message:", error);
            setInputMessage(content); // Restore input? 
            // Better UX might be to allow retry.
            alert("Failed to send message.");
        } finally {
            setIsTyping(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="h-screen flex flex-col bg-background-light dark:bg-background-dark text-text-primary-light dark:text-text-primary-dark transition-colors duration-200 font-sans overflow-hidden">
            {/* Top Header */}
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
                    <span className="text-sm font-medium mr-2 hidden md:block">
                        Hi, {user?.username}
                    </span>
                    <div className="h-4 w-[1px] bg-gray-200 dark:bg-gray-800 mx-1"></div>
                    <button
                        onClick={handleExportChat}
                        disabled={!activeConversationId}
                        className="p-2.5 rounded-xl hover:bg-surface-alt-light dark:hover:bg-surface-alt-dark text-text-secondary-light dark:text-text-secondary-dark hover:text-primary transition-all disabled:opacity-30"
                        title="Export chat"
                    >
                        <Download className="h-5 w-5" />
                    </button>

                    <div className="relative">
                        <button
                            onClick={() => setShowSettings(!showSettings)}
                            className="p-2.5 rounded-xl hover:bg-surface-alt-light dark:hover:bg-surface-alt-dark text-text-secondary-light dark:text-text-secondary-dark hover:text-primary transition-all"
                            title="Settings"
                        >
                            <Settings className="h-5 w-5" />
                        </button>
                        {showSettings && (
                            <div className="absolute right-0 top-full mt-2 w-64 bg-surface-light dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl p-4 z-50">
                                <h3 className="text-sm font-bold text-text-primary-light dark:text-text-primary-dark mb-4">Settings</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-text-secondary-light dark:text-text-secondary-dark">Dark Mode</span>
                                        <button
                                            onClick={() => setIsDarkMode(!isDarkMode)}
                                            className={`relative w-12 h-6 rounded-full transition-colors ${isDarkMode ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'}`}
                                        >
                                            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${isDarkMode ? 'translate-x-6' : 'translate-x-0'}`} />
                                        </button>
                                    </div>
                                    <hr className="border-gray-200 dark:border-gray-700" />
                                    <button
                                        onClick={handleLogout}
                                        className="w-full text-left text-sm text-red-500 hover:text-red-600 flex items-center"
                                    >
                                        <LogOut className="w-4 h-4 mr-2" /> Sign Out
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <div className="flex-1 overflow-hidden flex flex-row">
                <div
                    className={`
            shrink-0 transition-all duration-300 ease-in-out overflow-hidden border-r border-gray-200 dark:border-gray-800
            ${showSidebar ? "w-[300px] translate-x-0 opacity-100" : "w-0 -translate-x-full opacity-0"}
          `}
                >
                    <div className="w-[300px] h-full">
                        <ChatHistorySidebar
                            conversations={conversations}
                            activeConversationId={activeConversationId}
                            onSelectConversation={(id) => {
                                handleSelectConversation(id);
                            }}
                            onCreateConversation={() => {
                                handleCreateConversation();
                            }}
                            onDeleteConversation={handleDeleteConversation}
                            onRenameConversation={handleRenameConversation}
                        />
                    </div>
                </div>

                <div className="flex-1 min-w-0 h-full flex flex-row relative">
                    <div className="flex-1 min-w-0 h-full overflow-hidden">
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
                            }}
                            onSendMessage={handleSendMessage}
                        />
                    </div>

                    {!isRightSidebarCollapsed && (
                        <div
                            className="w-1.5 bg-gray-200 dark:bg-gray-800 hover:bg-primary cursor-col-resize flex-shrink-0 transition-colors z-20 group flex items-center justify-center"
                            onMouseDown={(e) => {
                                e.preventDefault();
                                setIsResizing(true);
                            }}
                        >
                            <div className="w-0.5 h-12 bg-gray-400 dark:bg-gray-600 rounded-full group-hover:bg-primary group-hover:h-20 transition-all" />
                        </div>
                    )}

                    {isRightSidebarCollapsed ? (
                        <div className="w-12 h-full bg-surface-light dark:bg-surface-dark border-l border-gray-200 dark:border-gray-800 flex flex-col items-center py-4 flex-shrink-0">
                            <button
                                onClick={() => {
                                    setIsRightSidebarCollapsed(false);
                                    setRightSidebarWidth(DEFAULT_RIGHT_SIDEBAR_WIDTH);
                                }}
                                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-text-muted-light dark:text-text-muted-dark hover:text-primary transition-all"
                                title="Expand Sidebar"
                            >
                                <PanelLeft className="w-5 h-5" />
                            </button>
                        </div>
                    ) : (
                        <div
                            className="h-full flex-shrink-0 overflow-hidden"
                            style={{ width: rightSidebarWidth }}
                        >
                            <RightSidebar code={code} setCode={setCode} onSendMessage={handleSendMessage} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ChatLayout;
