/**
 * NASA Space Biology Knowledge Engine - Agent System Types
 * 5-Agent Architecture: Librarian, Cartographer, Analyst, Communicator, Orchestrator
 */

export type AgentType = 'librarian' | 'cartographer' | 'analyst' | 'communicator' | 'orchestrator';

export type AgentStatus = 'idle' | 'working' | 'completed' | 'error';

export interface Agent {
  id: AgentType;
  name: string;
  description: string;
  icon?: string;
  color: string;
  status: AgentStatus;
  progress?: number;
  currentTask?: string;
  output?: string;
}

export interface AgentActivity {
  agentId: AgentType;
  timestamp: string;
  action: string;
  details?: string;
}

export interface KnowledgeGraphNode {
  id: string;
  name: string;
  type: 'gene' | 'subject' | 'stressor' | 'publication';
  value?: number;
  color?: string;
}

export interface KnowledgeGraphLink {
  source: string;
  target: string;
  value?: number;
}

export interface KnowledgeGraph {
  nodes: KnowledgeGraphNode[];
  links: KnowledgeGraphLink[];
}

export interface QueryRequest {
  query: string;
  persona?: string;
  conversationHistory?: Message[];
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface AgentResponse {
  answer: string;
  confidence?: string;
  citations?: string[];
  entities?: {
    genes?: string[];
    subjects?: string[];
    stressors?: string[];
  };
  graph?: KnowledgeGraph;
  agentActivities?: AgentActivity[];
}

export interface NASAResource {
  name: string;
  url: string;
  description: string;
  icon: string;
}

export interface Publication {
  title: string;
  link: string;
  genes?: string[];
  subjects?: string[];
  stressors?: string[];
}
