import { useState } from 'react';
import './App.css';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        <h1 className="text-4xl font-bold tracking-tight">
          AI Chat Assistant
        </h1>
        <p className="text-xl text-muted-foreground">
          Google Gemini Powered Chat Interface
        </p>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Configure your Gemini API key to start chatting
          </p>
          <button
            onClick={() => setCount((count) => count + 1)}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Click count: {count}
          </button>
        </div>
        <div className="text-xs text-muted-foreground">
          Built with React + TypeScript + Vite + Tailwind CSS
        </div>
      </div>
    </div>
  );
}

export default App;
