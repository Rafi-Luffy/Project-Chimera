import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface QueryHistoryItem {
  id?: string;
  session_id: string;
  query: string;
  persona: string;
  timestamp: string;
  answer?: string;
}

const HISTORY_KEY = 'nasa_query_history';

export const queryHistoryService = {
  async saveQuery(item: QueryHistoryItem): Promise<void> {
    try {
      const history = this.getLocalHistory(item.session_id);
      history.unshift(item);
      const limitedHistory = history.slice(0, 20);
      localStorage.setItem(`${HISTORY_KEY}_${item.session_id}`, JSON.stringify(limitedHistory));
    } catch (error) {
      console.error('Failed to save query:', error);
    }
  },

  async getSessionHistory(sessionId: string): Promise<QueryHistoryItem[]> {
    return this.getLocalHistory(sessionId);
  },

  getLocalHistory(sessionId: string): QueryHistoryItem[] {
    try {
      const stored = localStorage.getItem(`${HISTORY_KEY}_${sessionId}`);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to fetch history:', error);
      return [];
    }
  }
};
