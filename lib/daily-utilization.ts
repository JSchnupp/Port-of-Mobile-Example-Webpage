import { supabase } from './supabase';
import { DailyUtilization } from '../types/database';

export async function getDailyUtilization(warehouseId?: string, startDate?: string, endDate?: string) {
  try {
    let query = supabase
      .from('daily_utilization')
      .select('*')
      .order('date', { ascending: true });

    if (warehouseId) {
      query = query.eq('warehouse_id', warehouseId);
    }

    if (startDate) {
      query = query.gte('date', startDate);
    }

    if (endDate) {
      query = query.lte('date', endDate);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching daily utilization:', error.message);
      return [];
    }

    if (!data) {
      console.error('No data returned from daily_utilization table');
      return [];
    }

    return data as DailyUtilization[];
  } catch (error) {
    console.error('Unexpected error in getDailyUtilization:', error);
    return [];
  }
}

export async function insertDailyUtilization(utilization: Omit<DailyUtilization, 'id' | 'created_at' | 'updated_at'>) {
  try {
    const { data, error } = await supabase
      .from('daily_utilization')
      .insert(utilization)
      .select()
      .single();

    if (error) {
      console.error('Error inserting daily utilization:', error.message);
      return null;
    }

    return data as DailyUtilization;
  } catch (error) {
    console.error('Unexpected error in insertDailyUtilization:', error);
    return null;
  }
} 