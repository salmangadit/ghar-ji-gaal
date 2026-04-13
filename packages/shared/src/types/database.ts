// Generated types for Supabase schema — run `supabase gen types typescript` to regenerate

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      vocabulary_requests: {
        Row: {
          id: string;
          english: string;
          category: string | null;
          context: string | null;
          request_type: 'single-word' | 'short-phrase' | 'sentence';
          share_token: string;
          status: 'pending' | 'responses_in' | 'grouped' | 'verified' | 'rejected';
          verified_memoni: string | null;
          verified_audio_url: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['vocabulary_requests']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['vocabulary_requests']['Insert']>;
      };
      vocabulary_responses: {
        Row: {
          id: string;
          request_id: string;
          contributor_name: string | null;
          memoni_text: string | null;
          audio_url: string | null;
          ai_transcription: string | null;
          ai_transcription_lang: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['vocabulary_responses']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['vocabulary_responses']['Insert']>;
      };
      vocabulary_relations: {
        Row: {
          id: string;
          word_id: string;
          related_word_id: string;
          relation_type: 'same-topic' | 'antonym' | 'compound' | 'related';
        };
        Insert: Omit<Database['public']['Tables']['vocabulary_relations']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['vocabulary_relations']['Insert']>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

// Convenience row types
export type VocabularyRequest = Database['public']['Tables']['vocabulary_requests']['Row'];
export type VocabularyResponse = Database['public']['Tables']['vocabulary_responses']['Row'];
export type VocabularyRelation = Database['public']['Tables']['vocabulary_relations']['Row'];

export type RequestStatus = VocabularyRequest['status'];
export type RequestType = VocabularyRequest['request_type'];
export type RelationType = VocabularyRelation['relation_type'];

// Fuzzy-grouped response cluster (computed client-side, not stored)
export interface ResponseCluster {
  representative: string;       // the most common spelling in this cluster
  responses: VocabularyResponse[];
  size: number;
}
