# Contractor Proposal System

This document describes the comprehensive contractor proposal system implemented in the BuildReady platform.

## Overview

The contractor proposal system allows contractors to submit detailed, professional proposals for homeowner projects, including comprehensive financial breakdowns, timelines, penalties, and supporting documentation. Homeowners can then review and accept/reject these proposals.

## Features Implemented

### 1. Comprehensive Proposal Fields

#### Financial Details
- **Net Amount**: Base project cost before taxes
- **Tax Amount**: Applicable taxes
- **Total Amount**: Automatically calculated (Net + Tax)
- **Deposit Amount**: Required upfront payment
- **Deposit Due Date**: When deposit is due

#### Timeline Details
- **Proposed Start Date**: When work will begin
- **Proposed End Date**: When work will be completed
- **Estimated Days**: Automatically calculated from start/end dates

#### Penalties & Guarantees
- **Delay Penalty**: Daily penalty for project delays
- **Abandonment Penalty**: Penalty for project abandonment

#### Project Information
- **Detailed Description**: How the contractor will approach the project
- **Project Timeline**: Breakdown of project phases and milestones
- **Materials Included**: Whether materials are included in the price
- **Warranty Period**: Warranty coverage details
- **Additional Notes**: Any special considerations or clarifications

#### Supporting Documents
- **File Uploads**: Support for PDF, DOC, DOCX, JPG, PNG, DWG, SKP files
- **Multiple Files**: Contractors can upload multiple supporting documents

### 2. Database Schema Updates

New fields added to the `proposals` table:
```sql
-- Financial details
net_amount DECIMAL(10,2)
tax_amount DECIMAL(10,2)
total_amount DECIMAL(10,2)
deposit_amount DECIMAL(10,2)
deposit_due_date DATE

-- Timeline details
proposed_start_date DATE
proposed_end_date DATE
estimated_days INTEGER

-- Penalties
delay_penalty DECIMAL(10,2)
abandonment_penalty DECIMAL(10,2)

-- Additional information
uploaded_files TEXT[]
materials_included BOOLEAN DEFAULT false
warranty_period TEXT
additional_notes TEXT
feedback TEXT
```

### 3. User Workflows

#### Contractor Workflow
1. **Browse Projects**: View available projects on the contractor dashboard
2. **Submit Proposal**: Click "Submit Proposal" on any open project
3. **Fill Form**: Complete the comprehensive proposal form with all required details
4. **Upload Files**: Attach supporting documents, plans, or specifications
5. **Submit**: Submit the proposal for homeowner review
6. **Track Status**: Monitor proposal status (pending, accepted, rejected)

#### Homeowner Workflow
1. **Review Proposals**: View all proposals received for their projects
2. **Compare Details**: Review financial breakdowns, timelines, and contractor credentials
3. **Accept/Reject**: Accept or reject proposals with optional feedback
4. **Project Activation**: When a proposal is accepted, the project status changes to "active"

### 4. Technical Implementation

#### API Endpoints
- `POST /api/trpc/proposals.create` - Create new proposal
- `GET /api/trpc/proposals.getByProject` - Get proposals for a project
- `GET /api/trpc/proposals.getMy` - Get contractor's proposals
- `GET /api/trpc/proposals.getReceived` - Get homeowner's received proposals
- `PUT /api/trpc/proposals.updateStatus` - Update proposal status (accept/reject)
- `PUT /api/trpc/proposals.update` - Update proposal details
- `DELETE /api/trpc/proposals.delete` - Delete proposal

#### Auto-Calculations
- **Total Amount**: Automatically calculated from net amount + tax amount
- **Estimated Days**: Automatically calculated from proposed start/end dates
- **Real-time Updates**: Calculations update as users type

#### Validation
- Required fields validation
- Financial amount validation (positive numbers)
- Date validation (end date after start date)
- File type validation for uploads

### 5. User Interface

#### Proposal Submission Form
- **Organized Sections**: Financial, Timeline, Penalties, Details, Files
- **Responsive Design**: Works on desktop and mobile devices
- **Auto-calculation**: Real-time updates for totals and durations
- **File Management**: Drag-and-drop file uploads with preview

#### Proposal Review Dashboard
- **Comprehensive View**: All proposal details in organized cards
- **Financial Summary**: Visual breakdown of costs
- **Contractor Information**: Ratings, experience, location
- **Action Buttons**: Accept/Reject with immediate feedback
- **Search & Filter**: Find specific proposals quickly

### 6. Security & Access Control

#### Role-Based Access
- **Contractors**: Can only submit proposals for projects they haven't already bid on
- **Homeowners**: Can only view and manage proposals for their own projects
- **Validation**: Server-side validation prevents unauthorized access

#### Data Integrity
- **Unique Constraints**: One proposal per contractor per project
- **Status Validation**: Only pending proposals can be updated
- **Project Status**: Projects automatically update when proposals are accepted

### 7. File Management

#### Supported Formats
- **Documents**: PDF, DOC, DOCX
- **Images**: JPG, JPEG, PNG
- **Design Files**: DWG (AutoCAD), SKP (SketchUp)

#### Storage
- Currently stores file names as placeholders
- Future implementation will include actual file upload to cloud storage
- File validation and size limits

### 8. Future Enhancements

#### Planned Features
- **File Storage**: Integration with cloud storage (AWS S3, Supabase Storage)
- **Proposal Templates**: Pre-built templates for common project types
- **Bulk Actions**: Accept/reject multiple proposals at once
- **Notifications**: Email/SMS notifications for proposal updates
- **Contract Generation**: Automatic contract generation from accepted proposals
- **Payment Integration**: Deposit and milestone payment processing

#### Analytics
- **Proposal Metrics**: Success rates, average response times
- **Market Analysis**: Pricing trends by project type and location
- **Contractor Performance**: Track accepted vs. rejected proposals

## Usage Instructions

### For Contractors
1. Navigate to `/contractor/projects/view`
2. Browse available projects
3. Click "Submit Proposal" on desired project
4. Fill out all required fields
5. Upload supporting documents
6. Review and submit

### For Homeowners
1. Navigate to `/homeowner/proposals`
2. Review all received proposals
3. Use search and filters to find specific proposals
4. Click "Accept Proposal" or "Reject Proposal"
5. Provide optional feedback when rejecting

## Database Migration

To apply the new proposal fields, run the migration:
```bash
# Apply the migration
psql -d your_database -f migration-add-proposal-fields.sql
```

## Testing

The system includes comprehensive validation and error handling:
- Form validation for all required fields
- Database constraints for data integrity
- User role validation
- Project status validation
- Duplicate proposal prevention

## Support

For technical support or questions about the proposal system, refer to the main project documentation or contact the development team.
