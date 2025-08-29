-- Enable real-time for meal_entries table
ALTER PUBLICATION supabase_realtime ADD TABLE meal_entries;

-- Verify the table is added to real-time
SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';
