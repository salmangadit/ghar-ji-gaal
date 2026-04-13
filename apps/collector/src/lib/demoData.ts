export interface DemoRequest {
  id: string;
  share_token: string;
  english: string;
  context: string | null;
  category: string | null;
  request_type: 'single-word' | 'short-phrase' | 'sentence-context';
}

export const DEMO_REQUESTS: Record<string, DemoRequest> = {
  'demo-water': {
    id: 'demo-water',
    share_token: 'demo-water',
    english: 'water',
    context: 'The everyday word for drinking water',
    category: 'food & home',
    request_type: 'single-word',
  },
  'demo-hello': {
    id: 'demo-hello',
    share_token: 'demo-hello',
    english: 'Hello / greeting',
    context: 'What you say when you greet someone',
    category: 'greetings',
    request_type: 'short-phrase',
  },
  'demo-mother': {
    id: 'demo-mother',
    share_token: 'demo-mother',
    english: 'mother',
    context: 'What a child calls their mum',
    category: 'family',
    request_type: 'single-word',
  },
  'demo-red': {
    id: 'demo-red',
    share_token: 'demo-red',
    english: 'red',
    context: 'The colour red',
    category: 'colours',
    request_type: 'single-word',
  },
  'demo-eat': {
    id: 'demo-eat',
    share_token: 'demo-eat',
    english: "Let's eat",
    context: 'What you call out when food is ready and it\'s time to come to the table',
    category: 'food & home',
    request_type: 'short-phrase',
  },
};

export interface DemoResponse {
  id: string;
  request_id: string;
  english: string;
  contributor_name: string | null;
  memoni_text: string | null;
  has_audio: boolean;
  created_at: string;
}

const STORAGE_KEY = 'gjg_demo_responses';

export function getDemoResponses(): DemoResponse[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
  } catch {
    return [];
  }
}

export function saveDemoResponse(r: Omit<DemoResponse, 'id' | 'created_at'>) {
  const all = getDemoResponses();
  all.push({ ...r, id: Math.random().toString(36).slice(2), created_at: new Date().toISOString() });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}
