export type ScanStatus = 'safe' | 'caution' | 'avoid' | 'pending';

export interface ScanResult {
  id: string;
  user_id: string;
  name: string;
  image_url?: string;
  status: ScanStatus;
  summary: string;
  ingredients?: string[];
  analysis?: ScanAnalysis;
  // Nutrition info
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  // Progress for pending scans
  progress?: number;
  is_favorite: boolean;
  scanned_at: string;
  created_at: string;
  updated_at: string;
}

export interface ScanAnalysis {
  glycemic_index?: 'low' | 'medium' | 'high';
  sugar_content?: 'low' | 'moderate' | 'high';
  inflammatory_score?: number; // 1-10
  hormone_impact?: 'positive' | 'neutral' | 'negative';
  fiber_content?: 'low' | 'moderate' | 'high';
  protein_quality?: 'low' | 'moderate' | 'high';
  healthy_fats?: boolean;
  processed_level?: 'minimally' | 'moderately' | 'highly';
  recommendations?: string[];
  warnings?: string[];
}

export interface CreateScanInput {
  name: string;
  image_url?: string;
  status: ScanStatus;
  summary: string;
  ingredients?: string[];
  analysis?: ScanAnalysis;
}

export interface UpdateScanInput {
  name?: string;
  is_favorite?: boolean;
}
