-- Ghar ji Ghaal — Initial Schema
-- Run this in the Supabase SQL editor to set up the Collector app backend.

-- ── vocabulary_requests ──────────────────────────────────────────────────────
-- Words/phrases sent out for crowdsourcing
CREATE TABLE IF NOT EXISTS vocabulary_requests (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  english            text NOT NULL,
  category           text,
  context            text,
  request_type       text NOT NULL DEFAULT 'single-word'
                       CHECK (request_type IN ('single-word', 'short-phrase', 'sentence')),
  share_token        text UNIQUE NOT NULL,
  status             text NOT NULL DEFAULT 'pending'
                       CHECK (status IN ('pending', 'responses_in', 'grouped', 'verified', 'rejected')),
  verified_memoni    text,
  verified_audio_url text,
  created_at         timestamptz DEFAULT now()
);

-- ── vocabulary_responses ─────────────────────────────────────────────────────
-- Contributions from community members (anonymous)
CREATE TABLE IF NOT EXISTS vocabulary_responses (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id            uuid REFERENCES vocabulary_requests ON DELETE CASCADE,
  contributor_name      text,
  memoni_text           text,
  audio_url             text,
  ai_transcription      text,
  ai_transcription_lang text,
  created_at            timestamptz DEFAULT now()
);

-- ── vocabulary_relations ─────────────────────────────────────────────────────
-- Vocabulary knowledge graph: relationships between words
CREATE TABLE IF NOT EXISTS vocabulary_relations (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  word_id         uuid REFERENCES vocabulary_requests ON DELETE CASCADE,
  related_word_id uuid REFERENCES vocabulary_requests ON DELETE CASCADE,
  relation_type   text NOT NULL DEFAULT 'related'
                    CHECK (relation_type IN ('same-topic', 'antonym', 'compound', 'related'))
);

-- ── RLS policies ─────────────────────────────────────────────────────────────
-- vocabulary_requests: public read, authenticated insert/update
ALTER TABLE vocabulary_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read requests"
  ON vocabulary_requests FOR SELECT USING (true);

CREATE POLICY "Authenticated can insert requests"
  ON vocabulary_requests FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated can update requests"
  ON vocabulary_requests FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- vocabulary_responses: public insert (anonymous contributors), authenticated full access
ALTER TABLE vocabulary_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit responses"
  ON vocabulary_responses FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated can read responses"
  ON vocabulary_responses FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated can update responses"
  ON vocabulary_responses FOR UPDATE TO authenticated USING (true);

-- vocabulary_relations: public read, authenticated write
ALTER TABLE vocabulary_relations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read relations"
  ON vocabulary_relations FOR SELECT USING (true);

CREATE POLICY "Authenticated can manage relations"
  ON vocabulary_relations FOR ALL TO authenticated USING (true);

-- ── Storage bucket setup (run separately in Supabase Storage UI) ──────────────
-- Create a bucket named "response-audio" with public access.
-- Policy: allow anyone to upload (INSERT), authenticated to read all.
