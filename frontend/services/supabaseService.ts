import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

const supabaseUrl = Constants.expoConfig?.extra?.EXPO_PUBLIC_SUBABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_ANON_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface LocationData {
  id: string;
  latitude: number;
  longitude: number;
  address?: string;
  googlemapsurl?: string;
  updated_at: string;
}

export class SupabaseService {
  static async getSwamijiLocation(): Promise<LocationData | null> {
    try {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .eq('id', 'swamiji_location')
        .single();

      if (error) {
        console.error('Error fetching Swamiji location:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getSwamijiLocation:', error);
      return null;
    }
  }

  static async updateSwamijiLocation(latitude: number, longitude: number, address?: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('locations')
        .upsert({
          id: 'swamiji_location',
          latitude,
          longitude,
          address,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error updating Swamiji location:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in updateSwamijiLocation:', error);
      return false;
    }
  }
}