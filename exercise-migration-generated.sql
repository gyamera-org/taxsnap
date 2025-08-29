-- Auto-generated exercise migration script
-- Run this in Supabase SQL Editor after creating the community exercise database

INSERT INTO exercise_database (
  name,
  category,
  muscle_groups,
  equipment,
  difficulty,
  instructions,
  calories_per_minute,
  source,
  verified
) VALUES
  ('Running', 'cardio', '{cardiovascular}', 'bodyweight', 'beginner', 'Outdoor or treadmill running', 12, 'data_migration', true),
  ('Walking', 'cardio', '{cardiovascular}', 'bodyweight', 'beginner', 'Casual or brisk walking', 4, 'data_migration', true),
  ('Jogging', 'cardio', '{cardiovascular}', 'bodyweight', 'beginner', 'Light jogging or slow running', 7, 'data_migration', true),
  ('Cycling', 'cardio', '{cardiovascular}', 'bodyweight', 'beginner', 'Road cycling or stationary bike', 8, 'data_migration', true),
  ('Swimming', 'cardio', '{cardiovascular}', 'bodyweight', 'beginner', 'Pool or open water swimming', 10, 'data_migration', true),
  ('Rowing', 'cardio', '{back,cardiovascular}', 'bodyweight', 'beginner', 'Rowing machine or boat rowing', 7, 'data_migration', true),
  ('Elliptical', 'cardio', '{cardiovascular}', 'cardio_machine', 'beginner', 'Elliptical machine workout', 7, 'data_migration', true),
  ('Treadmill', 'cardio', '{cardiovascular}', 'cardio_machine', 'beginner', 'Treadmill walking or running', 7, 'data_migration', true),
  ('Stair Climber', 'cardio', '{cardiovascular}', 'bodyweight', 'beginner', 'Stair climbing machine', 7, 'data_migration', true),
  ('Weight Lifting', 'strength', '{full_body}', 'bodyweight', 'beginner', 'Free weights or machines', 4.5, 'data_migration', true),
  ('Gym Workout', 'strength', '{full_body}', 'bodyweight', 'beginner', 'General gym session', 4.5, 'data_migration', true),
  ('Calisthenics', 'strength', '{full_body}', 'bodyweight', 'beginner', 'Bodyweight exercises', 4.5, 'data_migration', true),
  ('Bodyweight Training', 'strength', '{full_body}', 'bodyweight', 'beginner', 'Push-ups, pull-ups, squats', 4.5, 'data_migration', true),
  ('CrossFit', 'strength', '{full_body}', 'bodyweight', 'beginner', 'High-intensity functional training', 4.5, 'data_migration', true),
  ('Powerlifting', 'strength', '{full_body}', 'bodyweight', 'beginner', 'Squat, bench press, deadlift', 4.5, 'data_migration', true),
  ('Yoga', 'flexibility', '{flexibility}', 'bodyweight', 'beginner', 'Yoga poses and stretches', 2.5, 'data_migration', true),
  ('Pilates', 'flexibility', '{flexibility}', 'bodyweight', 'beginner', 'Core-focused exercises', 2.5, 'data_migration', true),
  ('Stretching', 'flexibility', '{flexibility}', 'bodyweight', 'beginner', 'Static or dynamic stretching', 2.5, 'data_migration', true),
  ('Meditation', 'other', '{full_body}', 'bodyweight', 'beginner', 'Mindfulness and meditation', 5, 'data_migration', true),
  ('Basketball', 'sports', '{full_body}', 'bodyweight', 'beginner', 'Basketball game or practice', 8, 'data_migration', true),
  ('Football', 'sports', '{full_body}', 'bodyweight', 'beginner', 'American football', 8, 'data_migration', true),
  ('Tennis', 'sports', '{full_body}', 'bodyweight', 'beginner', 'Tennis match or practice', 8, 'data_migration', true),
  ('Soccer', 'sports', '{full_body}', 'bodyweight', 'beginner', 'Soccer/football game', 8, 'data_migration', true),
  ('Volleyball', 'sports', '{full_body}', 'bodyweight', 'beginner', 'Volleyball game or practice', 8, 'data_migration', true),
  ('Badminton', 'sports', '{full_body}', 'bodyweight', 'beginner', 'Badminton match or practice', 8, 'data_migration', true),
  ('Boxing', 'other', '{full_body}', 'bodyweight', 'beginner', 'Boxing training or sparring', 5, 'data_migration', true),
  ('Martial Arts', 'other', '{full_body}', 'bodyweight', 'beginner', 'Karate, Taekwondo, Jiu-Jitsu', 5, 'data_migration', true),
  ('Kickboxing', 'other', '{full_body}', 'bodyweight', 'beginner', 'Kickboxing training', 5, 'data_migration', true),
  ('Dancing', 'other', '{full_body}', 'bodyweight', 'beginner', 'Social or solo dancing', 5, 'data_migration', true),
  ('Zumba', 'other', '{full_body}', 'bodyweight', 'beginner', 'Zumba fitness class', 5, 'data_migration', true),
  ('Aerobics', 'other', '{full_body}', 'bodyweight', 'beginner', 'Aerobics class or routine', 5, 'data_migration', true),
  ('Hiking', 'other', '{full_body}', 'bodyweight', 'beginner', 'Trail hiking or nature walks', 5, 'data_migration', true),
  ('Rock Climbing', 'other', '{full_body}', 'bodyweight', 'beginner', 'Indoor or outdoor climbing', 5, 'data_migration', true),
  ('Kayaking', 'other', '{full_body}', 'bodyweight', 'beginner', 'Kayaking or canoeing', 5, 'data_migration', true),
  ('Surfing', 'other', '{full_body}', 'bodyweight', 'beginner', 'Ocean or lake surfing', 5, 'data_migration', true),
  ('Skiing', 'other', '{full_body}', 'bodyweight', 'beginner', 'Downhill or cross-country skiing', 5, 'data_migration', true),
  ('Snowboarding', 'other', '{full_body}', 'bodyweight', 'beginner', 'Snowboarding on slopes', 5, 'data_migration', true)
;

-- Update statistics
SELECT 'Exercise migration completed!' as message,
       COUNT(*) as total_exercises,
       COUNT(CASE WHEN category = 'cardio' THEN 1 END) as cardio_exercises,
       COUNT(CASE WHEN category = 'strength' THEN 1 END) as strength_exercises,
       COUNT(CASE WHEN category = 'flexibility' THEN 1 END) as flexibility_exercises,
       COUNT(CASE WHEN category = 'sports' THEN 1 END) as sports_exercises
FROM exercise_database
WHERE source = 'data_migration';