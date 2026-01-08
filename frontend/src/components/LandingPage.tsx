import { motion } from "framer-motion";
import { MessageSquare, Code, Cpu, Zap, ArrowRight, Github } from "lucide-react";

interface LandingPageProps {
    onStart: () => void;
}

const LandingPage = ({ onStart }: LandingPageProps) => {
    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark overflow-hidden selection:bg-primary/30">
            {/* Background Blobs */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
            </div>

            <nav className="relative z-10 container mx-auto px-6 py-8 flex justify-between items-center">
                <div className="flex items-center space-x-2">
                    <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                        <Cpu className="text-white w-6 h-6" />
                    </div>
                    <span className="text-2xl font-bold tracking-tight">TeachAI</span>
                </div>
                <div className="hidden md:flex items-center space-x-8 text-sm font-medium">
                    <a href="#" className="text-text-secondary-light dark:text-text-secondary-dark hover:text-primary transition-colors">Features</a>
                    <a href="#" className="text-text-secondary-light dark:text-text-secondary-dark hover:text-primary transition-colors">How it works</a>
                    <a href="https://github.com" className="flex items-center space-x-2 text-text-secondary-light dark:text-text-secondary-dark hover:text-primary transition-colors">
                        <Github className="w-5 h-5" />
                        <span>GitHub</span>
                    </a>
                    <button
                        onClick={onStart}
                        className="px-6 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-full font-semibold transition-all shadow-lg shadow-primary/20 active:scale-95"
                    >
                        Launch Assistant
                    </button>
                </div>
            </nav>

            <main className="relative z-10 container mx-auto px-6 pt-20 pb-32">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/10 mb-8">
                            <Zap className="w-4 h-4 text-primary" />
                            <span className="text-sm font-semibold text-primary">Now supporting Codeforces & HackerRank</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1]">
                            Master <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">DSA</span> with your personal AI Tutor
                        </h1>
                        <p className="text-xl text-text-secondary-light dark:text-text-secondary-dark mb-12 max-w-2xl mx-auto leading-relaxed">
                            Don't just get the solution. Understand the intuition. TeachAI guides you step-by-step through tough coding problems, helping you build real problem-solving skills.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
                            <button
                                onClick={onStart}
                                className="group w-full sm:w-auto px-8 py-4 bg-primary hover:bg-primary-dark text-white rounded-2xl font-bold text-lg transition-all shadow-xl shadow-primary/25 flex items-center justify-center space-x-3 active:scale-95"
                            >
                                <span>Start Learning</span>
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                            <button className="w-full sm:w-auto px-8 py-4 bg-surface-alt-light dark:bg-surface-alt-dark hover:bg-gray-200 dark:hover:bg-gray-700 rounded-2xl font-bold text-lg transition-all active:scale-95">
                                Watch Demo
                            </button>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="mt-24 relative"
                    >
                        <div className="absolute inset-0 bg-gradient-to-t from-background-light dark:from-background-dark via-transparent to-transparent z-10" />
                        <div className="rounded-3xl border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden bg-surface-light dark:bg-surface-dark/50 backdrop-blur-xl">
                            <div className="h-12 border-b border-gray-200 dark:border-gray-800 flex items-center px-6 space-x-2">
                                <div className="w-3 h-3 rounded-full bg-red-500/20" />
                                <div className="w-3 h-3 rounded-full bg-yellow-500/20" />
                                <div className="w-3 h-3 rounded-full bg-green-500/20" />
                            </div>
                            <div className="p-8 aspect-video flex items-center justify-center text-text-muted-light dark:text-text-muted-dark italic">
                                {/* Placeholder for the actual app preview */}
                                <div className="flex flex-col items-center space-y-4">
                                    <MessageSquare className="w-16 h-16 opacity-20" />
                                    <p>App Preview Interace</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto">
                    <FeatureCard
                        icon={<Code className="w-6 h-6" />}
                        title="Multi-Platform support"
                        description="Paste links from LeetCode, Codeforces, or HackerRank. We've got you covered."
                    />
                    <FeatureCard
                        icon={<MessageSquare className="w-6 h-6" />}
                        title="Socratic Method"
                        description="Our AI doesn't just give answers. It asks the right questions to lead you there."
                    />
                    <FeatureCard
                        icon={<Cpu className="w-6 h-6" />}
                        title="Intelligent Hints"
                        description="Get hints tailored to your current progress, from basic intuition to specific implementation."
                    />
                </div>
            </main>

            <footer className="relative z-10 border-t border-gray-200 dark:border-gray-800 py-12">
                <div className="container mx-auto px-6 text-center text-text-muted-light dark:text-text-muted-dark text-sm">
                    <p>© 2026 TeachAI Assistant. Built for developers by developers.</p>
                </div>
            </footer>
        </div>
    );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
    <div className="p-8 rounded-3xl bg-surface-light dark:bg-surface-dark border border-gray-100 dark:border-gray-800 shadow-card-light dark:shadow-card-dark hover:translate-y-[-5px] transition-all duration-300">
        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6">
            {icon}
        </div>
        <h3 className="text-xl font-bold mb-3">{title}</h3>
        <p className="text-text-secondary-light dark:text-text-secondary-dark leading-relaxed">
            {description}
        </p>
    </div>
);

export default LandingPage;
