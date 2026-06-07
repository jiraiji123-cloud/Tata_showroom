export interface TataCar {
  id: string;
  name: string;
  tagline: string;
  description: string;
  type: 'EV' | 'SUV' | 'Hatchback' | 'Sedan';
  startingPrice: number; // in INR e.g., 14.99 Lakhs represented as float or absolute number
  priceSuffix: string; // e.g., "Lakh onwards"
  badge?: string; // e.g., "Trending", "New Launch"
  rangeOrEngine: string; // e.g., "465 km" or "1.5L Turbo"
  power: string; // e.g., "143.1 bhp"
  acceleration?: string; // e.g., "8.9s (0-100 km/h)"
  seating: string; // e.g., "5 Seater"
  transmission: string; // e.g., "Automatic / Manual"
  images: {
    hero: string;
    interior: string;
    profile: string;
  };
  features: string[];
  isFeatured: boolean;
  displayActive: boolean;
}

export interface TestDriveBooking {
  id: string;
  carId: string;
  carName: string;
  customerName: string;
  email: string;
  phone: string;
  preferredDate: string;
  preferredTimeSlot: string; // e.g., "10:00 AM - 12:00 PM"
  locationBranch: string; // e.g., "Mumbai (Ghatkopar)", "Delhi (South Ext)", "Bangalore (Whitefield)", "Pune (Koregaon Park)"
  status: 'Pending' | 'Contacted' | 'Confirmed' | 'Completed' | 'Cancelled';
  createdAt: string;
  comments?: string;
}

export interface ShowroomSettings {
  id: string;
  announcementText: string;
  showAnnouncement: boolean;
  featuredCarId: string;
  enableInteractiveAiRecommender: boolean;
  requireAdminApproval: boolean;
}
