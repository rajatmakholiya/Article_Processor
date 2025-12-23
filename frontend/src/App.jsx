import React, { useEffect, useState } from 'react';
import { getArticles } from './api';
import ReactMarkdown from 'react-markdown';
import { BookOpen, CheckCircle, Clock, Loader2, RefreshCw } from 'lucide-react';

function App() {
  const [articles, setArticles] = useState([]);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const data = await getArticles();
      setArticles(data);
      if (data.length > 0 && !selectedArticle) setSelectedArticle(data[0]);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col h-screen">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm z-10">
        <div className="flex items-center gap-2">
          <BookOpen className="text-blue-600" />
          <h1 className="text-xl font-bold text-gray-800">Article Upgrade</h1>
        </div>
        <button onClick={fetchData} className="p-2 hover:bg-gray-100 rounded-full" title="Refresh">
          <RefreshCw size={20} className="text-gray-500" />
        </button>
      </header>

      <main className="flex flex-1 overflow-hidden">
        <div className="w-1/3 border-r border-gray-200 bg-white overflow-y-auto">
          {loading ? (
            <div className="flex justify-center p-10"><Loader2 className="animate-spin text-blue-500" /></div>
          ) : (
            articles.map((article) => (
              <div
                key={article.id}
                onClick={() => setSelectedArticle(article)}
                className={`p-5 border-b cursor-pointer transition-colors hover:bg-gray-50 ${
                  selectedArticle?.id === article.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : 'border-l-4 border-l-transparent'
                }`}
              >
                <h3 className="font-semibold text-gray-800 mb-2 truncate">{article.title}</h3>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">{new Date(article.created_at).toLocaleDateString()}</span>
                  <StatusBadge status={article.status} />
                </div>
              </div>
            ))
          )}
        </div>

        <div className="flex-1 bg-gray-50 overflow-y-auto p-8">
          {selectedArticle ? (
            <div className="max-w-6xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">{selectedArticle.title}</h2>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 border-b pb-2">
                    Original Content
                  </h3>
                  <div className="prose prose-sm text-gray-600 whitespace-pre-wrap max-w-none">
                    {selectedArticle.original_content}
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-lg border border-blue-100 ring-1 ring-blue-50">
                  <h3 className="text-sm font-bold text-blue-500 uppercase tracking-wider mb-4 border-b pb-2 flex items-center gap-2">
                    <img src="/vite.svg" className="w-4 h-4" alt="AI" /> AI Enhanced Version
                  </h3>
                  
                  {selectedArticle.status === 'completed' ? (
                    <div className="prose prose-blue max-w-none">
                      <ReactMarkdown>{selectedArticle.updated_content}</ReactMarkdown>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                      <Loader2 className="w-10 h-10 animate-spin mb-4 text-blue-200" />
                      <p>AI is processing this article...</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">Select an article to view details</div>
          )}
        </div>
      </main>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    pending: "bg-yellow-100 text-yellow-800",
    processing: "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
  };
  
  const icons = {
    pending: <Clock size={12} className="mr-1" />,
    processing: <Loader2 size={12} className="mr-1 animate-spin" />,
    completed: <CheckCircle size={12} className="mr-1" />,
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${styles[status]}`}>
      {icons[status]} {status}
    </span>
  );
}

export default App;