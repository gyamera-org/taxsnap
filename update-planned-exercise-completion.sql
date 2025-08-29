-- Function to mark a planned exercise as completed
CREATE OR REPLACE FUNCTION mark_planned_exercise_completed(
  plan_id_param UUID,
  exercise_name_param TEXT,
  exercise_date_param DATE
)
RETURNS BOOLEAN AS $$
DECLARE
  plan_data_current JSONB;
  updated_plan_data JSONB;
  day_index INTEGER := 0;
  exercise_index INTEGER := 0;
  days_array JSONB;
  current_day JSONB;
  exercises_array JSONB;
  current_exercise JSONB;
BEGIN
  -- Get current plan data
  SELECT plan_data INTO plan_data_current 
  FROM weekly_exercise_plans 
  WHERE id = plan_id_param AND user_id = auth.uid();
  
  IF plan_data_current IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Get the days array
  days_array := plan_data_current->'days';
  
  -- Find the day and exercise to mark as completed
  FOR day_index IN 0..(jsonb_array_length(days_array) - 1) LOOP
    current_day := days_array->day_index;
    
    -- Check if this is the correct date
    IF (current_day->>'date')::DATE = exercise_date_param THEN
      exercises_array := current_day->'exercises';
      
      -- Find the exercise by name
      FOR exercise_index IN 0..(jsonb_array_length(exercises_array) - 1) LOOP
        current_exercise := exercises_array->exercise_index;
        
        IF current_exercise->>'name' = exercise_name_param THEN
          -- Mark this exercise as completed
          exercises_array := jsonb_set(
            exercises_array,
            ARRAY[exercise_index::text, 'completed'],
            'true'::jsonb
          );
          
          -- Update the day with the modified exercises
          days_array := jsonb_set(
            days_array,
            ARRAY[day_index::text, 'exercises'],
            exercises_array
          );
          
          -- Update the plan data
          updated_plan_data := jsonb_set(
            plan_data_current,
            ARRAY['days'],
            days_array
          );
          
          -- Save back to database
          UPDATE weekly_exercise_plans 
          SET plan_data = updated_plan_data
          WHERE id = plan_id_param AND user_id = auth.uid();
          
          RETURN TRUE;
        END IF;
      END LOOP;
    END IF;
  END LOOP;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permission to authenticated users
GRANT EXECUTE ON FUNCTION mark_planned_exercise_completed TO authenticated;
