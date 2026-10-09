export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type Row = Record<string, unknown>;
type Table<T extends Row = Row> = {
  Row: T;
  Insert: Partial<T>;
  Update: Partial<T>;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      profiles: Table;
      locations: Table;
      categories: Table;
      subcategories: Table;
      vehicle_brands: Table;
      vehicle_types: Table;
      vehicles: Table;
      vehicle_variants: Table;
      photos: Table;
      listings: Table;
      favorites: Table;
      conversations: Table;
      messages: Table;
      notifications: Table;
      reviews: Table;
      review_photos: Table;
      reports: Table;
      user_reports: Table;
      user_blocks: Table;
      user_follows: Table;
      listing_likes: Table;
      search_logs: Table;
      admin_logs: Table;
      transactions: Table;
      listing_credit_packages: Table;
      listing_credit_purchases: Table;
      listing_credit_usages: Table;
      listing_credit_transactions: Table;
      listing_daily_views: Table;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
