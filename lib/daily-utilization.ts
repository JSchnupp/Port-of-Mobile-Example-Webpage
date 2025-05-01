import { supabase } from './supabase';
import { DailyUtilization } from '../types/database';

export async function getDailyUtilization(warehouseId?: string, startDate?: string, endDate?: string) {
  try {
    const { data, error } = await supabase
      .from('daily_utilization')
      .select('date, utilization_percent')
      .gte('date', new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .order('date', { ascending: true });

    console.log('Raw Supabase response:', { data, error });

    if (error) {
      console.error('Supabase query error:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      throw new Error(`Failed to fetch daily utilization: ${error.message}`);
    }

    if (!data || data.length === 0) {
      console.warn('No utilization data found for the specified date range');
      return [];
    }

    return data as DailyUtilization[];
  } catch (error) {
    console.error('Unexpected error in getDailyUtilization:', error);
    throw new Error('Failed to fetch daily utilization data');
  }
}

export async function insertDailyUtilization(utilization: Omit<DailyUtilization, 'id' | 'created_at' | 'updated_at'>) {
  try {
    const { data, error } = await supabase
      .from('daily_utilization')
      .insert(utilization)
      .select()
      .single();

    console.log('Raw Supabase insert response:', { data, error });

    if (error) {
      console.error('Supabase insert error:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      throw new Error(`Failed to insert daily utilization: ${error.message}`);
    }

    if (!data) {
      throw new Error('No data returned after insertion');
    }

    return data as DailyUtilization;
  } catch (error) {
    console.error('Unexpected error in insertDailyUtilization:', error);
    throw new Error('Failed to insert daily utilization data');
  }
} 