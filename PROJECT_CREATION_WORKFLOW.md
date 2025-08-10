# Homeowner Project Creation Workflow

This document describes the implementation of the comprehensive project creation workflow for homeowners in the BuildReady platform.

## Overview

The project creation workflow allows homeowners to post detailed construction projects with all necessary information to attract quality contractors and enable proposals without traditional site visits.

## Features Implemented

### 1. User Role Validation
- Only users with `homeowner` role can access the project creation form
- Role-based navigation and UI elements

### 2. Comprehensive Project Form

The form includes all required fields as specified:

#### Basic Information
- **Title** (required): Project title
- **Description** (required): Detailed work description
- **Trade Category** (required): Dropdown with predefined categories
- **Location** (required): Google Maps input (currently text input, can be enhanced)

#### Budget
- **Budget Range** (required): Minimum and maximum budget amounts
- Validation ensures max > min

#### Timeline
- **Proposal Deadline** (required): When contractors must submit proposals
- **Decision Date** (required): When homeowner will make decision
- **Preferred Start Date** (required): When work should begin
- **Preferred End Date** (required): When work should be completed

#### Additional Options
- **Permit Toggle** (optional): Whether permits are required
- **Site Photos** (required): Upload multiple photos with recommendations
- **Project Files** (optional): Upload plans, specifications, etc.

### 3. Database Schema Updates

New fields added to the `projects` table:
```sql
proposal_deadline DATE NOT NULL
preferred_start_date DATE NOT NULL
preferred_end_date DATE NOT NULL
decision_date DATE NOT NULL
permit_required BOOLEAN DEFAULT false
site_photos TEXT[] -- Array of photo URLs
project_files TEXT[] -- Array of file URLs
is_closed BOOLEAN DEFAULT false
```

### 4. Privacy Features
- Location masking: Only city is shown to contractors for privacy
- Full address stored but not displayed in project listings

### 5. Form Validation
- All required fields validated
- Budget range validation
- Date validation
- File upload validation (at least one site photo required)

### 6. User Experience
- Clean, modern UI with step-by-step sections
- File upload with progress indicators
- Helpful tooltips and recommendations
- Responsive design for mobile and desktop

## File Structure

```
src/
├── app/(dashboard)/dashboard/projects/
│   ├── page.tsx                 # Projects listing (role-based)
│   └── create/
│       └── page.tsx             # Project creation form
├── types/
│   └── database.ts              # Updated Project interface
└── ...

supabase-schema.sql              # Updated database schema
migration-add-project-fields.sql # Migration for existing databases
```

## Usage Instructions

### For New Installations
1. Run the updated `supabase-schema.sql` to create tables with all fields

### For Existing Installations
1. Run `migration-add-project-fields.sql` to add new fields to existing projects table
2. Restart your application

### Creating a Project
1. Sign in as a homeowner
2. Navigate to Dashboard > Projects
3. Click "Post a Project"
4. Fill out all required fields:
   - Basic project information
   - Budget range
   - Timeline dates
   - Upload site photos (required)
   - Optionally upload project files
   - Set permit requirements
5. Submit the form

### Viewing Projects
- **Homeowners**: See only their own projects
- **Contractors**: See all open projects available for bidding
- Projects display key information: budget, location (city only), category, deadlines

## Technical Implementation

### Form Handling
- React state management for form data
- File handling for uploads (currently stores filenames, can be enhanced with actual file storage)
- Comprehensive validation before submission

### Database Integration
- Supabase client for database operations
- Row Level Security (RLS) policies ensure data privacy
- Proper error handling and user feedback

### Security Features
- Role-based access control
- Input validation and sanitization
- Privacy protection for homeowner addresses

## Future Enhancements

1. **File Storage**: Integrate with Supabase Storage for actual file uploads
2. **Google Maps Integration**: Replace text input with interactive map
3. **Image Preview**: Show thumbnails of uploaded photos
4. **Draft Saving**: Allow saving projects as drafts
5. **Project Templates**: Pre-filled forms for common project types
6. **Bulk Upload**: Support for multiple file uploads with drag-and-drop
7. **Project Duplication**: Copy existing projects as templates

## Testing

To test the workflow:
1. Create a homeowner account
2. Navigate to the projects section
3. Create a new project with all required information
4. Verify the project appears in the listing
5. Test with a contractor account to see the project in available projects

## Support

For issues or questions about the project creation workflow, refer to the main README.md or check the application logs for detailed error messages.