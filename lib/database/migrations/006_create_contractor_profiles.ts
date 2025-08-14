/**
 * Migration: 006_create_contractor_profiles
 * Version: 6
 * Description: Create contractor_profiles table with all fields from ContractorProfile schema image
 * Applied: 2024-12-19
 */

import { Migration, DatabaseClient } from '../migrations'

export const migration_006_create_contractor_profiles: Migration = {
  id: '006_create_contractor_profiles',
  version: 6,
  name: 'Create contractor_profiles table with all fields from ContractorProfile schema image',
  up: async (db: DatabaseClient) => {
    // Create contractor_profiles table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS public.contractor_profiles (
          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          bio TEXT,
          business_name TEXT NOT NULL,
          contractor_contacts TEXT[] DEFAULT '{}',
          gst_hst_number TEXT,
          insurance_builders_risk DECIMAL(12,2),
          insurance_expiry DATE,
          insurance_general_liability DECIMAL(12,2),
          insurance_upload TEXT,
          is_insurance_verified BOOLEAN DEFAULT false,
          legal_entity_type TEXT CHECK (legal_entity_type IN ('Corporation', 'Partnership', 'Sole Proprietorship', 'LLC')),
          licenses TEXT[] DEFAULT '{}',
          logo TEXT,
          phone_number TEXT,
          portfolio TEXT[] DEFAULT '{}',
          service_location TEXT,
          trade_category TEXT[] DEFAULT '{}',
          user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
          wcb_number TEXT,
          work_guarantee INTEGER,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `)

    // Create indexes for better performance
    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_contractor_profiles_user_id ON public.contractor_profiles(user_id);
    `)
    
    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_contractor_profiles_business_name ON public.contractor_profiles(business_name);
    `)
    
    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_contractor_profiles_insurance_verified ON public.contractor_profiles(is_insurance_verified);
    `)
    
    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_contractor_profiles_trade_category ON public.contractor_profiles USING GIN(trade_category);
    `)

    // Add comments to document the fields
    await db.execute(`
      COMMENT ON TABLE public.contractor_profiles IS 'Main business profile for contractors with company information, compliance data, and service areas';
    `)
    
    await db.execute(`
      COMMENT ON COLUMN public.contractor_profiles.bio IS 'Short biography or description of contractor''s experience';
    `)
    
    await db.execute(`
      COMMENT ON COLUMN public.contractor_profiles.business_name IS 'Legal or trade business name of the contractor';
    `)
    
    await db.execute(`
      COMMENT ON COLUMN public.contractor_profiles.contractor_contacts IS 'List of linked internal contacts for the contractor';
    `)
    
    await db.execute(`
      COMMENT ON COLUMN public.contractor_profiles.gst_hst_number IS 'CRA ID used for compliance verification';
    `)
    
    await db.execute(`
      COMMENT ON COLUMN public.contractor_profiles.insurance_builders_risk IS 'Monetary amount of the builder''s risk insurance';
    `)
    
    await db.execute(`
      COMMENT ON COLUMN public.contractor_profiles.insurance_expiry IS 'Expiry date of the insurance';
    `)
    
    await db.execute(`
      COMMENT ON COLUMN public.contractor_profiles.insurance_general_liability IS 'Monetary amount of the general liability insurance';
    `)
    
    await db.execute(`
      COMMENT ON COLUMN public.contractor_profiles.insurance_upload IS 'File representing proof of insurance';
    `)
    
    await db.execute(`
      COMMENT ON COLUMN public.contractor_profiles.is_insurance_verified IS 'Indicates whether the insurance status has been verified';
    `)
    
    await db.execute(`
      COMMENT ON COLUMN public.contractor_profiles.legal_entity_type IS 'Corporate structure (Corporation, Partnership, Sole Proprietorship, LLC)';
    `)
    
    await db.execute(`
      COMMENT ON COLUMN public.contractor_profiles.licenses IS 'List of uploaded license files';
    `)
    
    await db.execute(`
      COMMENT ON COLUMN public.contractor_profiles.logo IS 'Company''s logo file';
    `)
    
    await db.execute(`
      COMMENT ON COLUMN public.contractor_profiles.phone_number IS 'Primary business phone number';
    `)
    
    await db.execute(`
      COMMENT ON COLUMN public.contractor_profiles.portfolio IS 'List of past project images or documents';
    `)
    
    await db.execute(`
      COMMENT ON COLUMN public.contractor_profiles.service_location IS 'Central service location';
    `)
    
    await db.execute(`
      COMMENT ON COLUMN public.contractor_profiles.trade_category IS 'List specifying primary and secondary trades';
    `)
    
    await db.execute(`
      COMMENT ON COLUMN public.contractor_profiles.user_id IS 'Linked user account';
    `)
    
    await db.execute(`
      COMMENT ON COLUMN public.contractor_profiles.wcb_number IS 'Workers'' Compensation Board number';
    `)
    
    await db.execute(`
      COMMENT ON COLUMN public.contractor_profiles.work_guarantee IS 'Work and materials guarantee in months';
    `)
  },
  down: async (db: DatabaseClient) => {
    // Drop the table (this will also drop all indexes and comments)
    await db.execute(`
      DROP TABLE IF EXISTS public.contractor_profiles CASCADE;
    `)
  }
}
