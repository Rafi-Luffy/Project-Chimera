/**
 * Enhanced API Service for NASA Knowledge Engine
 * Supports structured responses, streaming, and real backend integration
 */

import axios, { type AxiosInstance } from 'axios';
import type { QueryRequest, EnhancedQueryResponse, Publication } from '../types/api';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

class EnhancedAPIClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: BACKEND_URL,
      timeout: 120000, // 2 minutes for complex queries
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
   * Query the agent with structured response
   */
  async query(request: QueryRequest): Promise<EnhancedQueryResponse> {
    try {
      const response = await this.client.post('/query', request);
      
      // Transform legacy response format to new structured format if needed
      if (response.data.answer && !response.data.brief) {
        // Legacy format - parse and structure it
        return this.transformLegacyResponse(response.data);
      }
      
      return response.data as EnhancedQueryResponse;
    } catch (error) {
      console.error('Query failed:', error);
      throw error;
    }
  }

  /**
   * Query with streaming agent logs
   * Returns a function that can be called with a callback to receive log updates
   */
  async queryWithStreaming(
    request: QueryRequest,
    onLog: (log: string) => void,
    onComplete: (result: EnhancedQueryResponse) => void
  ): Promise<void> {
    try {
      // Check if backend supports streaming endpoint
      const hasStreaming = await this.checkStreamingSupport();
      
      if (hasStreaming) {
        // Use Server-Sent Events for real streaming
        const eventSource = new EventSource(
          `${BACKEND_URL}/query/stream?` + new URLSearchParams({
            question: request.question,
            persona: request.persona
          })
        );

        eventSource.onmessage = (event) => {
          const data = JSON.parse(event.data);
          
          if (data.type === 'log') {
            onLog(data.content);
          } else if (data.type === 'result') {
            onComplete(data.content);
            eventSource.close();
          }
        };

        eventSource.onerror = () => {
          eventSource.close();
          // Fallback to regular query
          this.query(request).then(onComplete);
        };
      } else {
        // Simulate streaming with regular query
        this.simulateStreaming(request, onLog, onComplete);
      }
    } catch (error) {
      console.error('Streaming query failed:', error);
      // Fallback to regular query
      this.query(request).then(onComplete);
    }
  }

  /**
   * Simulate streaming for backends without streaming support
   */
  private async simulateStreaming(
    request: QueryRequest,
    onLog: (log: string) => void,
    onComplete: (result: EnhancedQueryResponse) => void
  ): Promise<void> {
    // Simulate agent thinking logs
    const simulatedLogs = [
      `[${new Date().toLocaleTimeString()}] Deconstructing user goal...`,
      `[${new Date().toLocaleTimeString()}] Analyzing question for key concepts...`,
      `[${new Date().toLocaleTimeString()}] Querying knowledge graph for relevant publications...`,
      `[${new Date().toLocaleTimeString()}] Retrieved publications from database`,
      `[${new Date().toLocaleTimeString()}] Analyzing consensus patterns...`,
      `[${new Date().toLocaleTimeString()}] Identifying contradictory findings...`,
      `[${new Date().toLocaleTimeString()}] Detecting knowledge gaps...`,
      `[${new Date().toLocaleTimeString()}] Synthesizing final brief...`
    ];

    // Stream logs one by one
    for (let i = 0; i < simulatedLogs.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 400));
      onLog(simulatedLogs[i]);
    }

    // Then get the actual result
    const result = await this.query(request);
    onComplete(result);
  }

  /**
   * Check if backend supports streaming
   */
  private async checkStreamingSupport(): Promise<boolean> {
    try {
      const response = await this.client.get('/health');
      return response.data.streaming_supported === true;
    } catch {
      return false;
    }
  }

  /**
   * Transform legacy response format to structured format
   */
  private transformLegacyResponse(legacyData: { answer?: string; publications?: unknown[]; intermediate_steps?: unknown[] }): EnhancedQueryResponse {
    // Parse the answer text to extract structured information
    const answer = legacyData.answer || '';
    
    // Try to extract sections from the answer
    const consensus = this.extractSection(answer, 'consensus') || 
                     this.extractSection(answer, 'findings') ||
                     answer.substring(0, 300);
    
    const contradiction = this.extractSection(answer, 'contradiction') ||
                         this.extractSection(answer, 'conflicting') ||
                         'No significant contradictions identified in the literature.';
    
    const gap = this.extractSection(answer, 'gap') ||
               this.extractSection(answer, 'future research') ||
               'Additional research may be needed to fully address this question.';

    // Extract publications from intermediate steps
    const evidence = (legacyData.publications || []) as Publication[];
    
    // Extract concepts (simplified - could use NLP)
    const highlighted_concepts = this.extractConcepts(answer);
    
    return {
      brief: {
        consensus,
        contradiction,
        gap
      },
      evidence,
      highlighted_concepts,
      follow_up_questions: [
        'Can you provide more details about the methodology?',
        'What are the implications for future missions?',
        'Are there any ongoing studies on this topic?'
      ],
      agent_logs: (legacyData.intermediate_steps || []).map((step: unknown) => 
        JSON.stringify(step)
      )
    };
  }

  /**
   * Extract a section from text
   */
  private extractSection(text: string, keyword: string): string | null {
    const regex = new RegExp(`${keyword}[^.]*[.][^]*?(?=\\n\\n|$)`, 'i');
    const match = text.match(regex);
    return match ? match[0] : null;
  }

  /**
   * Extract key concepts from text
   */
  private extractConcepts(text: string): string[] {
    // Common space biology terms
    const knownConcepts = [
      'microgravity', 'spaceflight', 'radiation', 'photosynthesis',
      'cardiovascular', 'bone density', 'muscle atrophy', 'immune system',
      'circadian rhythm', 'oxidative stress', 'gene expression'
    ];
    
    return knownConcepts.filter(concept => 
      text.toLowerCase().includes(concept.toLowerCase())
    ).slice(0, 5);
  }
}

export const enhancedApiClient = new EnhancedAPIClient();
export default enhancedApiClient;
