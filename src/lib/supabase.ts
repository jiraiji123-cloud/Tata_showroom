import { createClient } from '@supabase/supabase-js';
import { TestDriveBooking, ShowroomSettings, TataCar } from '../types';

// Retrieve credentials safely from Meta environment
const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || '';

// True if real credentials are fully provided
export const isSupabaseConfigured = 
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'YOUR_SUPABASE_URL' && 
  supabaseAnonKey !== 'YOUR_SUPABASE_KEY';

// Initialize the real Client (lazy initial fallback if not configured to avoid startup crash)
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Standard local fallback storage keys
const BOOKINGS_KEY = 'tata_showroom_bookings';
const SETTINGS_KEY = 'tata_showroom_settings';
const CUSTOM_CARS_KEY = 'tata_showroom_custom_cars';

// Seed initial default showroom settings
const DEFAULT_SETTINGS: ShowroomSettings = {
  id: "tata-showroom-config",
  announcementText: "⭐ Experience the Future of Mobility: TATA CURVV.ev in showrooms near you. Book a Test Drive today!",
  showAnnouncement: true,
  featuredCarId: "tata-curvv-ev",
  enableInteractiveAiRecommender: true,
  requireAdminApproval: false
};

// --- BOOKINGS DB LOGIC ---

export async function fetchBookings(): Promise<TestDriveBooking[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      console.log("[Supabase] Querying active bookings table...");
      const { data, error } = await supabase
        .from('test_drives')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) {
        // Map database naming style back to TypeScript schema
        return data.map((item: any) => ({
          id: item.id,
          carId: item.car_id,
          carName: item.car_name,
          customerName: item.customer_name,
          email: item.email,
          phone: item.phone,
          preferredDate: item.preferred_date,
          preferredTimeSlot: item.preferred_timeslot,
          locationBranch: item.location_branch,
          status: item.status,
          createdAt: item.created_at,
          comments: item.comments
        }));
      }
    } catch (e) {
      console.warn("[Supabase] Failed to fetch active bookings. Accessing local persistence fallback.", e);
    }
  }

  // Local mirror fallback
  const cached = localStorage.getItem(BOOKINGS_KEY);
  return cached ? JSON.parse(cached) : [];
}

export async function submitBooking(booking: TestDriveBooking): Promise<{ success: boolean; id: string }> {
  // Always mirror in localStorage
  const cached = localStorage.getItem(BOOKINGS_KEY);
  const current: TestDriveBooking[] = cached ? JSON.parse(cached) : [];
  current.unshift(booking);
  localStorage.setItem(BOOKINGS_KEY, JSON.stringify(current));

  if (isSupabaseConfigured && supabase) {
    try {
      console.log("[Supabase] Executing insert for booking record:", booking.id);
      const { error } = await supabase
        .from('test_drives')
        .insert([{
          id: booking.id,
          car_id: booking.carId,
          car_name: booking.carName,
          customer_name: booking.customerName,
          email: booking.email,
          phone: booking.phone,
          preferred_date: booking.preferredDate,
          preferred_timeslot: booking.preferredTimeSlot,
          location_branch: booking.locationBranch,
          status: booking.status,
          created_at: booking.createdAt,
          comments: booking.comments || ''
        }]);

      if (error) throw error;
      return { success: true, id: booking.id };
    } catch (e) {
      console.error("[Supabase] Remote insert failed. Cached locally.", e);
      return { success: false, id: booking.id };
    }
  }

  return { success: true, id: booking.id };
}

export async function updateBookingStatus(id: string, newStatus: TestDriveBooking['status']): Promise<boolean> {
  // Sync locally
  const cached = localStorage.getItem(BOOKINGS_KEY);
  if (cached) {
    const list: TestDriveBooking[] = JSON.parse(cached);
    const updated = list.map(item => item.id === id ? { ...item, status: newStatus } : item);
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(updated));
  }

  if (isSupabaseConfigured && supabase) {
    try {
      console.log("[Supabase] Updating state for:", id, "to", newStatus);
      const { error } = await supabase
        .from('test_drives')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (e) {
      console.error("[Supabase] Failed to update state remotely in table.", e);
    }
  }
  return true;
}

export async function deleteBookingRecord(id: string): Promise<boolean> {
  const cached = localStorage.getItem(BOOKINGS_KEY);
  if (cached) {
    const list: TestDriveBooking[] = JSON.parse(cached);
    const updated = list.filter(item => item.id !== id);
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(updated));
  }

  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase
        .from('test_drives')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (e) {
      console.error("[Supabase] Failed to purge remote record.", e);
    }
  }
  return true;
}

// --- SHOWROOM SETTINGS DB LOGIC ---

export async function fetchShowroomSettings(): Promise<ShowroomSettings> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('showroom_settings')
        .select('*')
        .eq('id', 'tata-showroom-config')
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 is no-row error
      if (data) {
        return {
          id: data.id,
          announcementText: data.announcement_text,
          showAnnouncement: data.show_announcement,
          featuredCarId: data.featured_car_id,
          enableInteractiveAiRecommender: data.enable_ai_recommender,
          requireAdminApproval: data.require_admin_approval
        };
      }
    } catch (e) {
      console.warn("[Supabase] Error reading settings table. Using cache mirror.", e);
    }
  }

  const cached = localStorage.getItem(SETTINGS_KEY);
  if (cached) {
    return JSON.parse(cached);
  } else {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(DEFAULT_SETTINGS));
    return DEFAULT_SETTINGS;
  }
}

export async function saveShowroomSettings(settings: ShowroomSettings): Promise<boolean> {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));

  if (isSupabaseConfigured && supabase) {
    try {
      const dbPayload = {
        id: 'tata-showroom-config',
        announcement_text: settings.announcementText,
        show_announcement: settings.showAnnouncement,
        featured_car_id: settings.featuredCarId,
        enable_ai_recommender: settings.enableInteractiveAiRecommender,
        require_admin_approval: settings.requireAdminApproval
      };

      const { error } = await supabase
        .from('showroom_settings')
        .upsert(dbPayload, { onConflict: 'id' });

      if (error) throw error;
      return true;
    } catch (e) {
      console.error("[Supabase] Failed to write settings remotely:", e);
    }
  }
  return true;
}

// --- CARS CUSTOM CONFIGURATION TABLE LOGIC ---

export function fetchCustomCarsList(): TataCar[] | null {
  const cached = localStorage.getItem(CUSTOM_CARS_KEY);
  return cached ? JSON.parse(cached) : null;
}

export function saveCustomCarsList(cars: TataCar[]): void {
  localStorage.setItem(CUSTOM_CARS_KEY, JSON.stringify(cars));
}
