# Proposal Schema Update Summary

## Overview
The proposal schema has been completely updated to match the comprehensive fields shown in the image. This update includes both the database schema and TypeScript types to ensure consistency across the application.

## What Was Updated

### 1. Base Schema (`lib/database/schemas/base.ts`)
- Added new enums: `rejectionReason`, `visibilitySettings`
- Updated `proposalStatus` to include: `draft`, `submitted`, `viewed`, `accepted`, `rejected`, `withdrawn`, `expired`
- Added new validation patterns: `yesNo`, `htmlContent`, `amount`, `date`
- Added new type exports for the new enums

### 2. Proposal Schema (`lib/database/schemas/proposals.ts`)
- **Completely rewritten** to match the image schema
- Added all fields from the image:
  - Core fields: `title`, `description_of_work`
  - Financial: `subtotal_amount`, `tax_included`, `total_amount`, `deposit_amount`, `deposit_due_on`
  - Timeline: `proposed_start_date`, `proposed_end_date`, `expiry_date`
  - Status: `status`, `is_selected`, `is_deleted`
  - Dates: `submitted_date`, `accepted_date`, `rejected_date`, `withdrawn_date`, `viewed_date`, `last_updated`
  - Rejection: `rejected_by`, `rejection_reason`, `rejection_reason_notes`
  - Content: `clause_preview_html`, `attached_files`, `notes`
  - Relationships: `agreement`, `proposals` (child proposals)
  - Users: `created_by`, `last_modified_by`
  - Visibility: `visibility_settings`

### 3. Database Migration (`database/migrations/015_comprehensive_proposal_schema.sql`)
- **New migration file** to update the database table structure
- Adds all new columns to match the comprehensive schema
- Updates status enum constraints
- Migrates existing data to populate new required fields
- Creates indexes for new fields
- Maintains backward compatibility during migration

### 4. TypeScript Migration (`lib/database/migrations/015_add_comprehensive_proposal_schema.ts`)
- **New TypeScript migration file** for consistency with the migration system
- Serves as documentation and placeholder for the schema update

### 5. Types (`types/database/proposals.ts`)
- **Completely updated** to match the new comprehensive schema
- All interfaces now reflect the exact structure from the image
- Maintains type safety across the application

### 6. API Router (`server/api/routers/proposals.ts`)
- **Completely rewritten** to use the new comprehensive schema
- Updated all endpoints to work with new field names and structure
- Added new endpoints: `updateStatus`, `markAsViewed`
- Improved permission handling for different user roles
- Better error handling and validation

## Key Changes from Old Schema

### Old Fields (Removed)
- `bidAmount` → `subtotal_amount` + `total_amount`
- `description` → `description_of_work`
- `timeline` → `proposed_start_date` + `proposed_end_date`
- `status: 'pending'` → `status: 'draft'` (default)

### New Fields (Added)
- `title` - Display name for the proposal
- `homeowner_id` - Direct reference to homeowner
- `tax_included` - Whether taxes are included in subtotal
- `deposit_amount` + `deposit_due_on` - Deposit requirements
- `expiry_date` - When proposal expires
- `is_selected` - Marks proposal as awarded
- `is_deleted` - Soft delete flag
- `clause_preview_html` - HTML content for contract clauses
- `attached_files` - Array of file references
- `notes` - Internal notes
- `rejection_reason` + `rejection_reason_notes` - Detailed rejection info
- `visibility_settings` - Controls proposal visibility
- `agreement` - Reference to created agreement
- `proposals` - Child trade-specific proposals
- `created_by` + `last_modified_by` - User tracking
- Various timestamp fields for workflow tracking

## Migration Strategy

1. **Backward Compatible**: Existing data is migrated to populate new required fields
2. **Soft Migration**: Old columns are removed after data migration
3. **Index Creation**: Performance indexes are created for new fields
4. **RLS Policies**: Existing Row Level Security policies are maintained

## Status Values

The new status workflow is:
- `draft` → `submitted` → `viewed` → `accepted`/`rejected`
- `withdrawn` can be set from any status by contractor
- `expired` is automatically set when proposal reaches expiry date
- `rejected` can only be set by homeowner

## Next Steps

1. **Run Migration**: Execute the SQL migration on your database
2. **Update Frontend**: Update any frontend components to use new field names
3. **Test API**: Verify all API endpoints work with new schema
4. **Update Queries**: Review and update any direct database queries

## Benefits

- **Comprehensive Coverage**: All fields from the image are now included
- **Better Workflow**: More granular status tracking and user actions
- **Improved UX**: Better tracking of proposal lifecycle
- **Type Safety**: Full TypeScript support for all new fields
- **Performance**: Optimized indexes for new fields
- **Scalability**: Better structure for future enhancements
