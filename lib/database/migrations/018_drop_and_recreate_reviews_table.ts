import { Migration } from '../migrations'

export const migration_018_drop_and_recreate_reviews_table: Migration = {
  id: '018_drop_and_recreate_reviews_table',
  version: 18,
  name: 'Drop existing reviews table and recreate with new schema from image',
  checksum: 'd4e5f6g7h8i9', // Hash for reviews table recreation
  up: async (db) => {
    // First drop the existing reviews table
    await db.execute(`
      DROP TABLE IF EXISTS public.reviews CASCADE;
    `)

    // Create new reviews table with all fields from the schema
    await db.execute(`
      CREATE TABLE public.reviews (
        -- Base schema fields
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        
        -- Core review fields
        author UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
        file JSONB DEFAULT '[]' NOT NULL,
        flagged TEXT CHECK (flagged IN ('yes', 'no')) NOT NULL,
        is_verified TEXT CHECK (is_verified IN ('yes', 'no')) NOT NULL,
        project UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
        rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
        recipient UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
        recommend_score INTEGER CHECK (recommend_score >= 0 AND recommend_score <= 10) NOT NULL,
        text TEXT NOT NULL
      );
    `)

    // Create indexes for performance
    await db.execute(`
      CREATE INDEX idx_reviews_author ON public.reviews(author);
      CREATE INDEX idx_reviews_recipient ON public.reviews(recipient);
      CREATE INDEX idx_reviews_project ON public.reviews(project);
      CREATE INDEX idx_reviews_rating ON public.reviews(rating);
      CREATE INDEX idx_reviews_flagged ON public.reviews(flagged);
      CREATE INDEX idx_reviews_is_verified ON public.reviews(is_verified);
      CREATE INDEX idx_reviews_recommend_score ON public.reviews(recommend_score);
    `)

    // Add comments for all columns (exact text from image)
    await db.execute(`
      COMMENT ON COLUMN public.reviews.author IS 'The user who wrote and submitted the review';
      COMMENT ON COLUMN public.reviews.file IS 'Optional supporting files or images uploaded with the review';
      COMMENT ON COLUMN public.reviews.flagged IS 'Indicates whether the review has been flagged for moderation';
      COMMENT ON COLUMN public.reviews.is_verified IS 'Indicates whether the platform has verified the author as part of the reviewed project';
      COMMENT ON COLUMN public.reviews.project IS 'The related project associated with this review';
      COMMENT ON COLUMN public.reviews.rating IS 'The numeric rating score (typically 1–5 stars)';
      COMMENT ON COLUMN public.reviews.recipient IS 'The user who received the review (e.g., contractor or homeowner)';
      COMMENT ON COLUMN public.reviews.recommend_score IS 'A Net Promoter Score-style metric (e.g., 0–10 likelihood of recommending)';
      COMMENT ON COLUMN public.reviews.text IS 'The written feedback included in the review';
    `)

    // Add table comment
    await db.execute(`
      COMMENT ON TABLE public.reviews IS 'Reviews exchanged between homeowners and contractors for completed projects with ratings, recommendations, and verification status';
    `)
  },
  down: async (db) => {
    // This is a destructive migration - we can't easily rollback
    // The down migration would need to recreate the old table structure
    console.log('⚠️  Rollback not supported for this migration - it would require recreating the old reviews table structure');
  }
}
