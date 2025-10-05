/**
 * Enhanced API Types for NASA Knowledge Engine
 * Matching the backend response structure exactly
 */

export interface Publication {
  title: string;
  url: string;
  year?: string;
  authors?: string;
  subjects?: string[];
  stressors?: string[];
}

export interface Brief {
  consensus: string;
  contradiction: string;
  gap: string;
}

export interface EnhancedQueryResponse {
  brief: Brief;
  evidence: Publication[];
  highlighted_concepts: string[];
  follow_up_questions: string[];
  agent_logs?: string[];
}

export interface QueryRequest {
  question: string;
  persona: string;
  conversation_history?: Array<{
    question: string;
    answer: string;
  }>;
}

export interface StreamEvent {
  type: 'log' | 'thought' | 'tool' | 'result';
  content: string;
  timestamp: string;
}
