// CodeEditor.tsx
import Editor from "@monaco-editor/react";

interface CodeEditorProps {
    code: string;
    onChange: (value: string | undefined) => void;
    language?: string;
}

const CodeEditor = ({ code, onChange, language = "python" }: CodeEditorProps) => {
    return (
        <div className="h-full w-full rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-xl bg-surface-light dark:bg-surface-dark">
            <div className="h-10 bg-gray-100 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800 flex items-center px-4 justify-between">
                <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/20" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/20" />
                    <div className="w-3 h-3 rounded-full bg-green-500/20" />
                    <span className="ml-2 text-xs font-mono text-text-muted-light dark:text-text-muted-dark uppercase tracking-wider font-bold">
                        {language} editor
                    </span>
                </div>
            </div>
            <Editor
                height="calc(100% - 40px)"
                defaultLanguage={language}
                theme="vs-dark"
                value={code}
                onChange={onChange}
                options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                    lineNumbers: "on",
                    roundedSelection: true,
                    scrollBeyondLastLine: false,
                    readOnly: false,
                    automaticLayout: true,
                    padding: { top: 16, bottom: 16 },
                }}
            />
        </div>
    );
};

export default CodeEditor;
