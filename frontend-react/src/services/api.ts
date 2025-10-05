/**
 * NASA Knowledge Engine API Client
 * Low-latency communication with FastAPI backend
 */

import axios, { type AxiosInstance } from 'axios';
import type { QueryRequest, AgentResponse, KnowledgeGraph } from '../types/agents';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

interface StatsResponse {
  publications: number;
  genes_proteins: number;
  subjects: number;
  stressors: number;
}

class APIClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: BACKEND_URL,
      timeout: 60000, // 60 seconds for complex queries
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Check backend health
   */
  async checkHealth(): Promise<boolean> {
    try {
      const response = await this.client.get('/health');
      return response.status === 200;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }

  /**
   * Get system statistics
   */
  async getStats(): Promise<StatsResponse> {
    try {
      const response = await this.client.get('/stats');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      throw error;
    }
  }

  /**
   * Query the agent system
   */
  async query(request: QueryRequest): Promise<AgentResponse> {
    try {
      const response = await this.client.post('/query', request);
      return response.data;
    } catch (error) {
      console.error('Query failed:', error);
      throw error;
    }
  }

  /**
   * Stream query responses for low latency (if backend supports SSE)
   */
  async streamQuery(
    request: QueryRequest,
    onChunk: (chunk: string) => void,
    onComplete: (response: AgentResponse) => void,
    onError: (error: Error) => void
  ): Promise<void> {
    try {
      // For now, use regular query. Later can implement EventSource for SSE
      const response = await this.query(request);
      
      // Simulate streaming by chunking the response
      const words = response.answer.split(' ');
      let accumulated = '';
      
      for (const word of words) {
        accumulated += word + ' ';
        onChunk(accumulated.trim());
        await new Promise(resolve => setTimeout(resolve, 20)); // 20ms delay for smooth streaming
      }
      
      onComplete(response);
    } catch (error) {
      onError(error as Error);
    }
  }

  /**
   * Get knowledge graph visualization data
   */
  async getVisualization(query: string): Promise<KnowledgeGraph> {
    try {
      const response = await this.client.post('/visualize', { query });
      return response.data;
    } catch (error) {
      console.error('Visualization failed:', error);
      throw error;
    }
  }
}

export const apiClient = new APIClient();
export default apiClient;
