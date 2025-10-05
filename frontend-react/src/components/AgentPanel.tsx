import { motion } from 'framer-motion';
import { Database, Network, BarChart3, MessageSquare, Workflow } from 'lucide-react';
import type { Agent } from '../types/agents';
import '../styles/AgentPanel.css';

const AGENT_CONFIGS = {
  librarian: {
    icon: Database,
    name: 'The Librarian',
    description: 'Data ingestion and extraction specialist',
    color: '#0B3D91',
  },
  cartographer: {
    icon: Network,
    name: 'The Cartographer',
    description: 'Knowledge graph architect',
    color: '#1E5288',
  },
  analyst: {
    icon: BarChart3,
    name: 'The Analyst',
    description: 'Pattern recognition and insight generation',
    color: '#66FCF1',
  },
  communicator: {
    icon: MessageSquare,
    name: 'The Communicator',
    description: 'Natural language synthesis',
    color: '#FC3D21',
  },
  orchestrator: {
    icon: Workflow,
    name: 'The Orchestrator',
    description: 'Multi-agent coordination system',
    color: '#45A29E',
  },
};

interface AgentPanelProps {
  agents: Agent[];
}

const AgentCard: React.FC<{ agent: Agent }> = ({ agent }) => {
  const config = AGENT_CONFIGS[agent.id];
  const Icon = config.icon;

  const getStatusColor = () => {
    switch (agent.status) {
      case 'working':
        return config.color;
      case 'completed':
        return '#4CAF50';
      case 'error':
        return '#F44336';
      default:
        return 'rgba(255, 255, 255, 0.1)';
    }
  };

  return (
    <motion.div
      className={`agent-card ${agent.status}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{ borderColor: getStatusColor() }}
    >
      <div className="agent-header">
        <div className="agent-icon" style={{ backgroundColor: `${config.color}22` }}>
          <Icon size={24} strokeWidth={1.5} style={{ color: config.color }} />
        </div>
        <div className="agent-info">
          <h3>{config.name}</h3>
          <p>{config.description}</p>
        </div>
      </div>

      <div className="agent-status">
        <div className={`status-badge ${agent.status}`}>
          <span className="status-dot"></span>
          <span className="status-text">{agent.status.toUpperCase()}</span>
        </div>
      </div>

      {agent.status === 'working' && agent.currentTask && (
        <motion.div
          className="agent-task"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <div className="task-label">Current Task</div>
          <div className="task-content">{agent.currentTask}</div>
          <div className="progress-bar">
            <motion.div
              className="progress-fill"
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 2, ease: 'linear', repeat: Infinity }}
              style={{ backgroundColor: config.color }}
            />
          </div>
        </motion.div>
      )}

      {agent.output && (
        <motion.div
          className="agent-output"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
        >
          <div className="output-label">Output</div>
          <div className="output-content">{agent.output}</div>
        </motion.div>
      )}
    </motion.div>
  );
};

const AgentPanel: React.FC<AgentPanelProps> = ({ agents }) => {
  return (
    <div className="agent-panel">
      <div className="panel-header">
        <Workflow size={24} strokeWidth={1.5} />
        <div>
          <h2>Digital Research Team</h2>
          <p>5-Agent Collaborative System</p>
        </div>
      </div>
      <div className="agent-grid">
        {agents.map((agent) => (
          <AgentCard key={agent.id} agent={agent} />
        ))}
      </div>
    </div>
  );
};

export default AgentPanel;
