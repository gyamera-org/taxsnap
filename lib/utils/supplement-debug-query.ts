/**
 * Direct database queries for debugging supplement issues
 */

import { supabase } from '@/lib/supabase/client';
import { getTodayDateString } from './date-helpers';

/**
 * Debug function to directly query supplement logs from the database
 */
export async function debugSupplementLogs(date?: string) {
  const targetDate = date || getTodayDateString();

  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      return;
    }


    // Get all supplement logs for the user
    const { data: allLogs, error: allLogsError } = await supabase
      .from('supplement_logs')
      .select('*')
      .eq('user_id', user.user.id)
      .order('date', { ascending: false })
      .limit(10);

    if (allLogsError) {
      console.error('[DEBUG] Error fetching all logs:', allLogsError);
      return;
    }


    // Get logs for the specific date
    const { data: dateLogs, error: dateLogsError } = await supabase
      .from('supplement_logs')
      .select('*')
      .eq('user_id', user.user.id)
      .eq('date', targetDate);

    if (dateLogsError) {
      console.error('[DEBUG] Error fetching date logs:', dateLogsError);
      return;
    }


    // Get user's supplements
    const { data: supplements, error: supplementsError } = await supabase
      .from('user_supplements')
      .select('*')
      .eq('user_id', user.user.id)
      .eq('is_active', true);

    if (supplementsError) {
      console.error('[DEBUG] Error fetching supplements:', supplementsError);
      return;
    }


    return {
      allLogs,
      dateLogs,
      supplements,
      targetDate,
      userId: user.user.id,
    };
  } catch (error) {
    console.error('[DEBUG] Error in debugSupplementLogs:', error);
  }
}

/**
 * Clear a specific supplement log entry
 */
export async function clearSupplementLog(supplementName: string, date?: string) {
  const targetDate = date || getTodayDateString();

  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      return;
    }


    const { data, error } = await supabase
      .from('supplement_logs')
      .delete()
      .eq('user_id', user.user.id)
      .eq('supplement_name', supplementName)
      .eq('date', targetDate);

    if (error) {
      console.error('[DEBUG] Error clearing supplement log:', error);
      return;
    }

    return data;
  } catch (error) {
    console.error('[DEBUG] Error in clearSupplementLog:', error);
  }
}
