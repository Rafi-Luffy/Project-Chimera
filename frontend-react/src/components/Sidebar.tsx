import { motion } from 'framer-motion';
import { Rocket, User, Dna, History, Sparkles } from 'lucide-react';
import '../styles/Sidebar.css';

interface SidebarProps {
  persona: string;
  onPersonaChange: (persona: string) => void;
  organism: string;
  onOrganismChange: (organism: string) => void;
  onExampleQuery: (query: string) => void;
  queryHistory: Array<{ query: string; timestamp: string }>;
  onHistoryClick: (query: string) => void;
}

const PERSONAS = [
  { value: 'Research Scientist', label: 'Research Scientist', icon: '🔬' },
  { value: 'Mission Architect', label: 'Mission Architect', icon: '🚀' },
  { value: 'Manager', label: 'Manager', icon: '📊' },
];

const ORGANISMS = [
  { value: 'All', label: 'All Organisms' },
  { value: 'Mice', label: 'Mice' },
  { value: 'Arabidopsis thaliana', label: 'Arabidopsis thaliana' },
  { value: 'Drosophila', label: 'Drosophila' },
  { value: 'Human Cells', label: 'Human Cells' },
];

const EXAMPLE_QUERIES = [
  "What is the consensus on microgravity's effect on rodent vision?",
  "How does space radiation impact plant growth mechanisms?",
  "What genes are involved in bone loss during spaceflight?",
  "Are there contradictions in studies about muscle atrophy in space?",
  "What knowledge gaps exist in our understanding of immune response to space travel?",
  "How does altered gravity affect cellular processes in Drosophila?",
];

const Sidebar: React.FC<SidebarProps> = ({
  persona,
  onPersonaChange,
  organism,
  onOrganismChange,
  onExampleQuery,
  queryHistory,
  onHistoryClick,
}) => {
  return (
    <motion.aside
      className="sidebar"
      initial={{ x: -280 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <Rocket size={28} strokeWidth={1.5} />
          <div>
            <h1>Project <span className="chimera">Chimera</span></h1>
            <p>Knowledge Engine</p>
          </div>
        </div>
      </div>

      <div className="sidebar-content">
        <div className="control-section">
          <div className="section-header">
            <User size={18} />
            <h3>Select Your Persona</h3>
          </div>
          <select
            value={persona}
            onChange={(e) => onPersonaChange(e.target.value)}
            className="control-select"
          >
            {PERSONAS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.icon} {p.label}
              </option>
            ))}
          </select>
          <p className="control-hint">Tailors the AI response style to your role</p>
        </div>

        <div className="control-section">
          <div className="section-header">
            <Dna size={18} />
            <h3>Filter by Organism</h3>
          </div>
          <select
            value={organism}
            onChange={(e) => onOrganismChange(e.target.value)}
            className="control-select"
          >
            {ORGANISMS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <p className="control-hint">Narrow your search scope</p>
        </div>

        <div className="control-section">
          <div className="section-header">
            <Sparkles size={18} />
            <h3>Example Queries</h3>
          </div>
          <div className="example-queries">
            {EXAMPLE_QUERIES.map((query, idx) => (
              <button
                key={idx}
                onClick={() => onExampleQuery(query)}
                className="example-query-btn"
              >
                {query}
              </button>
            ))}
          </div>
        </div>

        {queryHistory.length > 0 && (
          <div className="control-section">
            <div className="section-header">
              <History size={18} />
              <h3>Query History</h3>
            </div>
            <div className="query-history">
              {queryHistory.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => onHistoryClick(item.query)}
                  className="history-item"
                  title={item.query}
                >
                  <span className="history-query">{item.query}</span>
                  <span className="history-time">
                    {new Date(item.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.aside>
  );
};

export default Sidebar;
