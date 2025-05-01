import { supabase } from './supabase';
import { DailyUtilization, WarehouseStatus } from '../types/database';
import { calculateUtilizationStats, calculateIndoorUtilization, calculateOutdoorUtilization } from './warehouse-calculations';

export async function getDailyUtilization(warehouseId?: string, startDate?: string, endDate?: string) {
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
    console.error('Error fetching daily utilization:', error);
    return [];
  }

  return data;
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

export async function updateDailyUtilization(used: number, total: number) {
  const today = new Date().toISOString().split('T')[0];
  const utilization = total > 0 ? Math.round((used / total) * 100) : 0;

  console.log('Updating daily utilization:', {
    date: today,
    used,
    total,
    calculatedUtilization: utilization
  });

  const { data, error } = await supabase
    .from('daily_utilization')
    .upsert({
      date: today,
      utilized_space: Math.round(used), // Ensure we're using whole numbers
      total_space: total,
      utilization_percent: utilization
    }, { onConflict: 'date' })
    .select('*');

  if (error) {
    console.error("❌ Supabase update failed:", error);
    return null;
  }
  
  console.log("✅ Updated utilization row:", data);
  return data;
}

// Helper function to calculate and update utilization from button status
export async function updateUtilizationFromStatus(buttonStatus: Record<string, WarehouseStatus>) {
  const stats = calculateUtilizationStats(buttonStatus);
  console.log('Calculated stats for update:', stats);
  return updateDailyUtilization(stats.utilizedSpace, stats.totalSpace);
}

// Function to update utilization for all warehouses
export async function updateAllWarehousesUtilization(
  buttonStatus: Record<string, WarehouseStatus>,
  warehouses: Array<{ id: string; type: 'indoor' | 'outdoor' }>
) {
  const stats = calculateUtilizationStats(buttonStatus);
  console.log('Calculated stats for all warehouses:', stats);
  
  try {
    const result = await updateDailyUtilization(stats.utilizedSpace, stats.totalSpace);
    return {
      success: true,
      result
    };
  } catch (error) {
    console.error("Failed to update utilization:", error);
    return {
      success: false,
      error
    };
  }
} 