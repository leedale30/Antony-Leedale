
import React from 'react';

export const MarkdownRenderer: React.FC<{ content: string; className?: string }> = ({ content, className = '' }) => {
    const renderMarkdown = (text: string) => {
        if (!text) return { __html: '' };

        // 1. Escape HTML (basic) to prevent injection
        let html = text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");

        // 2. Code Blocks (```code```)
        html = html.replace(/```([\s\S]*?)```/g, '<pre class="bg-black/50 p-4 rounded-lg my-4 overflow-x-auto font-mono text-sm text-green-400 border border-white/10">$1</pre>');

        // 3. Inline Code (`code`)
        html = html.replace(/`([^`]+)`/g, '<code class="bg-white/10 px-1.5 py-0.5 rounded font-mono text-sm text-pink-300">$1</code>');

        // 4. Headers (#, ##, ###)
        html = html.replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold text-white mt-4 mb-2">$1</h3>');
        html = html.replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold text-white mt-6 mb-3 border-b border-white/10 pb-2">$1</h2>');
        html = html.replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold text-white mt-8 mb-4">$1</h1>');

        // 5. Bold (**text**)
        html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-white">$1</strong>');

        // 6. Italic (*text*)
        html = html.replace(/\*(.*?)\*/g, '<em class="italic text-gray-300">$1</em>');

        // 7. Lists (Unordered)
        // Replacing "- item" or "* item" with a styled div since we can't easily nest ul/li with regex
        html = html.replace(/^\s*[-*]\s+(.*$)/gim, '<div class="flex items-start mb-1 ml-4"><span class="mr-2 text-gem-blue">•</span><span>$1</span></div>');

        // 8. Lists (Ordered)
        // Replacing "1. item" with a styled div
        html = html.replace(/^\s*(\d+)\.\s+(.*$)/gim, '<div class="flex items-start mb-1 ml-4"><span class="mr-2 font-bold text-gray-400">$1.</span><span>$2</span></div>');

        // 9. Blockquotes (> text)
        html = html.replace(/^>\s+(.*$)/gim, '<blockquote class="border-l-4 border-gem-blue pl-4 italic text-gray-400 my-4">$1</blockquote>');

        // 10. Horizontal Rule (---)
        html = html.replace(/^\s*---\s*$/gim, '<hr class="border-white/10 my-6" />');

        // 11. Tables (Basic piping support for simple tables)
        // This assumes a simple Markdown table structure. Complex tables might need a real parser.
        // We'll skip complex table parsing to avoid breaking layout and stick to text formatting.

        // 12. Line breaks
        // Double newline = block spacing
        html = html.replace(/\n\n/g, '<div class="h-4"></div>');
        // Single newline = br, but ignore newlines that are inside tags we just created to prevent extra spacing
        // A simple strategy is to convert remaining \n to <br/>
        html = html.replace(/\n/g, '<br/>');

        // Cleanup: Remove <br/> immediately following block elements headers/divs to prevent huge gaps
        html = html.replace(/(<\/h[1-3]>|<\/div>|<\/pre>|<\/blockquote>)\s*<br\/>/g, '$1');

        return { __html: html };
    };

    return (
        <div 
            className={`prose prose-invert max-w-none text-gray-300 leading-relaxed ${className}`}
            dangerouslySetInnerHTML={renderMarkdown(content)}
        />
    );
};
