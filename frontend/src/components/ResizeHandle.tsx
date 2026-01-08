import { Separator } from "react-resizable-panels";

export default function ResizeHandle({ className = "", id }: { className?: string, id?: string }) {
    return (
        <Separator
            className={`relative flex items-center justify-center w-[2px] h-full group transition-all hover:bg-primary/40 bg-gray-200/50 dark:bg-gray-800/10 cursor-col-resize z-50 ${className}`}
            id={id}
        >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[3px] h-12 bg-gray-300 dark:bg-gray-700/50 rounded-full group-hover:bg-primary group-hover:h-20 transition-all duration-300 shadow-sm group-hover:shadow-[0_0_15px_rgba(245,158,11,0.5)]" />
        </Separator>
    );
}
