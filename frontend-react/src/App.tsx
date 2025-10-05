import { useState, useRef, useEffect } from 'react';
import './App.css';
import { CategoryDashboard } from './components/CategoryDashboard';
import { ChatBot } from './components/ChatBot';
import { Login } from './components/Login';

// Backend API URL
const API_URL = 'http://localhost:8000';

// NASA Data Sources
const DATA_SOURCES = [
  {
    icon: '🌌',
    title: 'NASA Open Science Data Repository',
    description: 'Access to decades of space biology research data',
    url: 'https://osdr.nasa.gov/'
  },
  {
    icon: '📚',
    title: 'NASA Space Life Sciences Library',
    description: 'Comprehensive collection of life sciences publications',
    url: 'https://lsda.jsc.nasa.gov/'
  },
  {
    icon: '📋',
    title: 'NASA Task Book',
    description: 'Current and archived space biology research projects',
    url: 'https://taskbook.nasaprs.com/'
  }
];

// Example Queries
const EXAMPLE_QUERIES = [
  "What are the conflicting findings regarding plant photosynthesis in space?",
  "Summarize the consensus on how microgravity affects the cardiovascular system in mice, and identify any knowledge gaps.",
  "Show the relationship between space radiation and cellular oxidative stress."
];

// Types for backend response
interface Evidence {
  title: string;
  year: string;
  url: string;
  journal?: string;
}

interface Brief {
  consensus: string;
  contradictions: string;
  knowledge_gaps: string;
  confidence: string;
}

function App() {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authToken, setAuthToken] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [showLogin, setShowLogin] = useState(true);
  
  const [query, setQuery] = useState('');
  const [persona, setPersona] = useState('Research Scientist');
  const [queryHistory, setQueryHistory] = useState<string[]>([]);
  const [agentLog, setAgentLog] = useState<string[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  
  // Response data
  const [brief, setBrief] = useState<Brief | null>(null);
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [followUpQuestions, setFollowUpQuestions] = useState<string[]>([]);
  
  // Category view state
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categoryPublications, setCategoryPublications] = useState<any[]>([]);
  const [loadingCategory, setLoadingCategory] = useState(false);
  
  // Dynamic publication count and timestamp
  const [publicationCount, setPublicationCount] = useState(607); // Default value
  const [lastUpdated, setLastUpdated] = useState(new Date().toLocaleString());
  
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Check for existing auth token on mount
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const email = localStorage.getItem('user_email');
    if (token && email) {
      setAuthToken(token);
      setUserEmail(email);
      setIsAuthenticated(true);
      setShowLogin(false);
    }
  }, []);
  
  // Fetch publication statistics on mount
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`${API_URL}/stats`);
        if (response.ok) {
          const data = await response.json();
          if (data.publications) {
            setPublicationCount(data.publications);
          }
          setLastUpdated(new Date().toLocaleString());
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      }
    };
    
    fetchStats();
    // Refresh stats every 5 minutes
    const interval = setInterval(fetchStats, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);
  
  // Handle login success
  const handleLoginSuccess = (token: string, email: string) => {
    if (token && email) {
      setAuthToken(token);
      setUserEmail(email);
      setIsAuthenticated(true);
    }
    setShowLogin(false);
  };
  
  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_email');
    setAuthToken('');
    setUserEmail('');
    setIsAuthenticated(false);
    setShowLogin(true);
  };
  
  // Show login screen if needed
  if (showLogin) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }
  
  // Handle query submission
  const handleSubmit = async () => {
    if (!query.trim()) return;
    
    // Add to history
    setQueryHistory(prev => [query, ...prev]);
    
    // Reset state
    setIsStreaming(true);
    setAgentLog([]);
    setBrief(null);
    setEvidence([]);
    
    // Scroll to top
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
    
    // Connect to backend with Server-Sent Events
    try {
      const eventSource = new EventSource(
        `${API_URL}/query/stream?question=${encodeURIComponent(query)}&persona=${encodeURIComponent(persona)}`
      );
      
      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log('Received SSE data:', data); // DEBUG
        
        if (data.type === 'log') {
          // Stream agent activity log
          setAgentLog(prev => [...prev, data.message]);
        } else if (data.type === 'result') {
          // Final results received
          console.log('Setting result data:', data); // DEBUG
          setBrief(data.brief);
          setEvidence(data.evidence);
          setFollowUpQuestions(data.follow_up_questions || []);
          setIsStreaming(false);
        } else if (data.type === 'error') {
          console.error('Backend error:', data.message);
          setAgentLog(prev => [...prev, `[ERROR] ${data.message}`]);
          setIsStreaming(false);
        } else if (data.type === 'done') {
          eventSource.close();
        }
      };
      
      eventSource.onerror = (error) => {
        console.error('EventSource error:', error);
        setAgentLog(prev => [...prev, '[ERROR] Connection to backend lost. Using fallback mode.']);
        setIsStreaming(false);
        eventSource.close();
        
        // Fallback to non-streaming API
        fallbackQuery();
      };
      
    } catch (error) {
      console.error('Error connecting to backend:', error);
      fallbackQuery();
    }
  };
  
  // Fallback to regular HTTP request if streaming fails
  const fallbackQuery = async () => {
    try {
      const response = await fetch(`${API_URL}/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: query, persona }),
      });
      const data = await response.json();
      if (data.success) {
        setBrief(data.brief);
        setEvidence(data.evidence);
        setFollowUpQuestions(data.follow_up_questions || []);
      } else {
        setAgentLog(prev => [...prev, '[ERROR] No results returned.']);
      }
      setIsStreaming(false);
    } catch {
      setAgentLog(prev => [...prev, '[ERROR] Fallback query failed.']);
      setIsStreaming(false);
    }
  };

  // Export brief as Markdown
  const handleExport = () => {
    if (!brief) return;
    let markdown = `# Research Brief: ${query}\n\n`;
    markdown += `## Summary\n`;
    markdown += `**Query:** ${query}\n`;
    markdown += `**Confidence:** ${brief.confidence}\n\n`;
    markdown += `## Consensus\n`;
    markdown += `${brief.consensus.replace(/<[^>]*>/g, '')}\n\n`;
    markdown += `## Contradictions\n`;
    markdown += `${brief.contradictions.replace(/<[^>]*>/g, '')}\n\n`;
    markdown += `## Knowledge Gap\n`;
    markdown += `${brief.knowledge_gaps.replace(/<[^>]*>/g, '')}\n\n`;
    markdown += `## Supporting Evidence\n`;
    markdown += evidence.map(e => `- [${e.title}](${e.url}) (${e.year})`).join('\n') + '\n\n';
    if (followUpQuestions.length > 0) {
      markdown += `## Follow-Up Questions\n`;
      markdown += followUpQuestions.map(q => `- ${q}`).join('\n') + '\n';
    }
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${query.replace(/\s+/g, '_')}-brief.md`;
    a.click();
  };

  // Helper: handle Enter key for query input
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  // Helper: click example query
  const handleExampleClick = (exampleQuery: string) => {
    setQuery(exampleQuery);
    setBrief(null);
    setEvidence([]);
    setAgentLog([]);
    setFollowUpQuestions([]);
  };

  // Helper: click query history
  const handleHistoryClick = (historyQuery: string) => {
    setQuery(historyQuery);
    setBrief(null);
    setEvidence([]);
    setAgentLog([]);
    setFollowUpQuestions([]);
    setSelectedCategory(null);
  };

  // Handler: category click
  const handleCategoryClick = async (categoryName: string) => {
    setSelectedCategory(categoryName);
    setLoadingCategory(true);
    try {
      const response = await fetch(`${API_URL}/api/categories/${encodeURIComponent(categoryName)}/publications`);
      const data = await response.json();
      setCategoryPublications(data.publications || []);
    } catch (error) {
      console.error('Error fetching category publications:', error);
      setCategoryPublications([]);
    } finally {
      setLoadingCategory(false);
    }
  };

  // Handler: back to categories
  const handleBackToCategories = () => {
    setSelectedCategory(null);
    setCategoryPublications([]);
  };

  // Helper: highlight concepts in output
  const renderWithHighlights = (text: string) => {
    // This is a placeholder for concept highlighting logic
    // For now, just return as HTML
    return { __html: text };
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1>Project <span className="accent">Chimera</span></h1>
        </div>
        
        {/* User Info - show auth status */}
        {isAuthenticated && userEmail && (
          <div className="sidebar-section user-info">
            <div className="user-email">👤 {userEmail}</div>
            <button className="logout-button" onClick={handleLogout}>
              Logout
            </button>
          </div>
        )}
        
        {!isAuthenticated && (
          <div className="sidebar-section user-info">
            <button className="login-prompt" onClick={() => setShowLogin(true)}>
              🔐 Login to save preferences
            </button>
          </div>
        )}
        
        {/* NASA Data Sources */}
        <div className="sidebar-section">
          <div className="sidebar-section-title">NASA Data Sources</div>
          <div className="data-sources">
            {DATA_SOURCES.map((source, idx) => (
              <a
                key={idx}
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="data-source-card"
              >
                <div className="data-source-card-header">
                  <span className="data-source-icon">{source.icon}</span>
                  <span className="data-source-title">{source.title}</span>
                </div>
                <div className="data-source-desc">{source.description}</div>
              </a>
            ))}
          </div>
        </div>
        
        {/* Persona Selector */}
        <div className="sidebar-section">
          <div className="sidebar-section-title">Select Your Persona</div>
          <select
            className="persona-select"
            value={persona}
            onChange={(e) => setPersona(e.target.value)}
          >
            <option value="Research Scientist">Research Scientist</option>
            <option value="Mission Architect">Mission Architect</option>
            <option value="Manager">Manager</option>
          </select>
        </div>
        
        {/* Example Queries */}
        <div className="sidebar-section">
          <div className="sidebar-section-title">Example Queries</div>
          <div className="example-queries">
            {EXAMPLE_QUERIES.map((exampleQuery, idx) => (
              <button
                key={idx}
                className="example-query-item"
                onClick={() => handleExampleClick(exampleQuery)}
              >
                {exampleQuery}
              </button>
            ))}
          </div>
        </div>
        
        {/* Query History */}
        <div className="sidebar-section">
          <div className="sidebar-section-title">Query History</div>
          <div className="query-history">
            {queryHistory.length === 0 ? (
              <div className="query-history-empty">No queries yet</div>
            ) : (
              queryHistory.map((historyQuery, idx) => (
                <button
                  key={idx}
                  className="query-history-item"
                  onClick={() => handleHistoryClick(historyQuery)}
                  title={historyQuery}
                >
                  {historyQuery}
                </button>
              ))
            )}
          </div>
        </div>
      </aside>
      
      {/* Main Content */}
      <main className="main-content" ref={contentRef}>
        {/* Header with Search Bar - Centered Hero Section */}
        <header className="main-header centered-hero">
          <h1 className="main-title">NASA Space Biology Knowledge Engine</h1>
          <p className="main-subtitle">Your agentic AI partner for synthesizing decades of research.</p>
          
          {/* Command Bar - Centered with max-width */}
          <div className="command-bar-section">
            <div className="command-bar">
              <input
                type="text"
                className="command-input"
                placeholder="Ask a complex question about space biology research..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <button className="command-send-btn" onClick={handleSubmit}>
                <span>Send</span>
                <span>→</span>
              </button>
            </div>
          </div>
        </header>
        
        {/* Three-State Interface */}
        
        {/* STATE 1: Welcome Screen (Default) - Shows Categories */}
        {!isStreaming && !brief && !selectedCategory && (
          <>
            {/* OR Separator */}
            <div className="section-separator">
              <div className="separator-line"></div>
              <div className="separator-text">OR</div>
              <div className="separator-line"></div>
            </div>
            
            {/* Research Domains Section with new title */}
            <div className="research-domains-section">
              <h2 className="research-domains-title">Explore {publicationCount} space biology publications across multiple domains</h2>
              {/* Category Dashboard - Now appears by default */}
              <CategoryDashboard 
                onCategoryClick={handleCategoryClick}
                searchQuery={query}
              />
            </div>
          </>
        )}

        {/* STATE 1B: Category Publications View */}
        {!isStreaming && !brief && selectedCategory && (
          <div className="category-publications-screen">
            <div className="category-header">
              <button className="back-button" onClick={handleBackToCategories}>
                ← Back to Categories
              </button>
              <h2 className="category-title">{selectedCategory}</h2>
              <p className="category-subtitle">
                {categoryPublications.length} publications sorted by date
              </p>
            </div>

            {loadingCategory ? (
              <div className="loading-publications">
                <div className="loading-spinner">⚙️</div>
                <p>Loading publications...</p>
              </div>
            ) : (
              <div className="publications-timeline">
                {categoryPublications.map((pub, index) => (
                  <div key={index} className="publication-card">
                    <div className="publication-date">{pub.year || 'N/A'}</div>
                    <div className="publication-content">
                      <h3 className="publication-title">{pub.title}</h3>
                      <a
                        href={pub.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="publication-link"
                      >
                        View Publication →
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ChatBot for category view */}
            <ChatBot
              context={{
                brief: {
                  consensus: `Exploring ${selectedCategory} research`,
                  contradictions: '',
                  knowledge_gaps: '',
                  confidence: 'High'
                },
                evidence: categoryPublications.map(pub => ({
                  title: pub.title,
                  year: pub.year || 'N/A',
                  url: pub.url
                }))
              }}
              initialMessage={`How can I help you with ${selectedCategory} research?`}
            />
          </div>
        )}

        {/* STATE 2: Processing Screen (During Query) */}
        {isStreaming && (
          <div className="processing-screen">
            <div className="processing-header">
              <span className="processing-icon">⚙️</span>
              <h2>Processing Your Query...</h2>
            </div>
            <div className="agent-activity-log">
              {agentLog.map((line, index) => (
                <div key={index} className="log-line">
                  <span className="log-timestamp">{new Date().toLocaleTimeString()}</span>
                  <span className="log-content">{line}</span>
                </div>
              ))}
              {isStreaming && <div className="log-cursor">█</div>}
            </div>
          </div>
        )}

        {/* STATE 3: Insight & Exploration Screen (Final View) */}
        {!isStreaming && brief && (
          <div className="insight-screen">
            {/* Two-Column Layout */}
            <div className="insight-layout">
              
              {/* Left Column: Synthesized Action Brief */}
              <div className="brief-column">
                <h2 className="column-title">Synthesized Action Brief</h2>
                
                {/* Consensus Card */}
                <div className="brief-card consensus-card">
                  <div className="card-header">
                    <span className="card-icon">✅</span>
                    <h3>Consensus</h3>
                    <span className="confidence-badge">{brief.confidence} Confidence</span>
                  </div>
                  <div 
                    className="card-content"
                    dangerouslySetInnerHTML={renderWithHighlights(brief.consensus)}
                  />
                </div>

                {/* Contradiction Alert Card */}
                <div className="brief-card contradiction-card">
                  <div className="card-header">
                    <span className="card-icon">⚠️</span>
                    <h3>Contradiction Alert</h3>
                  </div>
                  <div 
                    className="card-content"
                    dangerouslySetInnerHTML={renderWithHighlights(brief.contradictions)}
                  />
                </div>

                {/* Knowledge Gap Card */}
                <div className="brief-card knowledge-gap-card">
                  <div className="card-header">
                    <span className="card-icon">🔍</span>
                    <h3>Knowledge Gap</h3>
                  </div>
                  <div 
                    className="card-content"
                    dangerouslySetInnerHTML={renderWithHighlights(brief.knowledge_gaps)}
                  />
                </div>
              </div>

              {/* Right Column: Supporting Evidence */}
              <div className="evidence-column">
                <h2 className="column-title">Supporting Evidence</h2>
                <div className="evidence-list">
                  {evidence.map((pub, index) => (
                    <a
                      key={index}
                      href={pub.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="evidence-card"
                    >
                      <div className="evidence-number">{index + 1}</div>
                      <div className="evidence-details">
                        <h4 className="evidence-title">{pub.title}</h4>
                        <div className="evidence-meta">
                          <span className="evidence-year">{pub.year}</span>
                          {pub.journal && (
                            <>
                              <span className="evidence-separator">•</span>
                              <span className="evidence-journal">{pub.journal}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <span className="evidence-arrow">→</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Post-Analysis Toolbar */}
            <div className="post-analysis-toolbar">
              <button className="toolbar-button export-button" onClick={handleExport}>
                Export Brief as Markdown
              </button>
            </div>

            {/* Follow-up Questions */}
            {followUpQuestions.length > 0 && (
              <div className="follow-up-section">
                <h3 className="follow-up-title">Explore Further</h3>
                <div className="follow-up-questions">
                  {followUpQuestions.map((question, index) => (
                    <button
                      key={index}
                      className="follow-up-button"
                      onClick={() => {
                        setQuery(question);
                        handleSubmit();
                      }}
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* ChatBot - Appears when results are shown */}
        {!isStreaming && brief && (
          <ChatBot 
            context={{
              brief: brief,
              evidence: evidence
            }}
            searchQuery={query}
          />
        )}
      </main>
    </div>
  );
}

export default App;
