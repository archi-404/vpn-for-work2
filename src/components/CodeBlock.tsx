import { useState } from 'react';

interface CodeBlockProps {
  code: string;
  language?: string;
}

export default function CodeBlock({ code, language = 'bash' }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const highlightLine = (line: string): JSX.Element => {
    // Comments
    if (line.trim().startsWith('#')) {
      return <span className="text-gray-500">{line}</span>;
    }
    
    // Key-value pairs (YAML)
    if (language === 'yaml' || language === 'ini') {
      if (line.includes(':')) {
        const [key, ...rest] = line.split(':');
        return (
          <span>
            <span className="text-cyan-300">{key}:</span>
            <span className="text-green-300">{rest.join(':')}</span>
          </span>
        );
      }
      if (line.trim().startsWith('-')) {
        return <span className="text-yellow-300">{line}</span>;
      }
    }

    // Bash commands
    if (language === 'bash') {
      if (line.trim().startsWith('sudo')) {
        return <span className="text-red-300">{line}</span>;
      }
      if (line.includes('=') && !line.startsWith(' ')) {
        const [key, ...rest] = line.split('=');
        return (
          <span>
            <span className="text-purple-300">{key}</span>
            <span className="text-gray-400">=</span>
            <span className="text-green-300">{rest.join('=')}</span>
          </span>
        );
      }
    }

    return <span className="text-gray-200">{line}</span>;
  };

  return (
    <div className="code-block">
      <div className="flex items-center justify-between px-4 py-2 bg-[#161b22] border-b border-[#21262d] rounded-t-lg">
        <span className="text-xs text-gray-500 uppercase tracking-wider">{language}</span>
        <button
          onClick={handleCopy}
          className="copy-btn"
        >
          {copied ? '✓ Скопировано' : '📋 Копировать'}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-sm leading-relaxed">
        <code>
          {code.split('\n').map((line, i) => (
            <div key={i} className="flex">
              <span className="text-gray-600 select-none w-8 text-right mr-4 shrink-0 text-xs leading-relaxed">
                {i + 1}
              </span>
              <span>{highlightLine(line)}</span>
            </div>
          ))}
        </code>
      </pre>
    </div>
  );
}
