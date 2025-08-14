-- Create Sample Data for BuildReady Platform
-- Run this after fixing the RLS policies to test the functionality

-- First, let's create some sample users (you'll need to replace these with actual auth.users IDs)
-- You can get these from your Supabase Auth > Users section

-- Sample homeowner user (replace with actual auth.users ID)
INSERT INTO public.users (id, email, user_role, full_name, first_name, last_name, phone_number, address, is_active, is_verified_email, user_agreed_to_terms)
VALUES (
    '00000000-0000-0000-0000-000000000001', -- Replace with actual auth.users ID
    'homeowner@example.com',
    'homeowner',
    'John Smith',
    'John',
    'Smith',
    '+1234567890',
    '123 Main St, Anytown, USA',
    true,
    true,
    true
) ON CONFLICT (id) DO NOTHING;

-- Sample contractor user (replace with actual auth.users ID)
INSERT INTO public.users (id, email, user_role, full_name, first_name, last_name, phone_number, address, is_active, is_verified_email, user_agreed_to_terms)
VALUES (
    '00000000-0000-0000-0000-000000000002', -- Replace with actual auth.users ID
    'contractor@example.com',
    'contractor',
    'Mike Johnson',
    'Mike',
    'Johnson',
    '+1234567891',
    '456 Oak Ave, Anytown, USA',
    true,
    true,
    true
) ON CONFLICT (id) DO NOTHING;

-- Sample projects
INSERT INTO public.projects (
    homeowner_id,
    title,
    description,
    budget,
    location,
    category,
    status,
    proposal_deadline,
    preferred_start_date,
    preferred_end_date,
    decision_date,
    permit_required,
    site_photos,
    project_files,
    is_closed
) VALUES 
(
    '00000000-0000-0000-0000-000000000001', -- Replace with actual homeowner ID
    'Kitchen Renovation',
    'Complete kitchen remodel including new cabinets, countertops, and appliances. Looking for a professional contractor with experience in modern kitchen design.',
    25000.00,
    '123 Main St, Anytown, USA',
    'kitchen',
    'open',
    '2025-02-15',
    '2025-03-01',
    '2025-04-30',
    '2025-02-20',
    true,
    ARRAY['https://example.com/kitchen1.jpg', 'https://example.com/kitchen2.jpg'],
    ARRAY['https://example.com/kitchen_plans.pdf'],
    false
),
(
    '00000000-0000-0000-0000-000000000001', -- Replace with actual homeowner ID
    'Bathroom Remodel',
    'Update master bathroom with new tile, fixtures, and lighting. Need someone who can work around our schedule.',
    15000.00,
    '123 Main St, Anytown, USA',
    'bathroom',
    'open',
    '2025-02-20',
    '2025-03-15',
    '2025-04-15',
    '2025-02-25',
    false,
    ARRAY['https://example.com/bathroom1.jpg'],
    ARRAY['https://example.com/bathroom_specs.pdf'],
    false
),
(
    '00000000-0000-0000-0000-000000000001', -- Replace with actual homeowner ID
    'Deck Construction',
    'Build a new 20x12 foot deck with composite materials. Need proper permits and inspections.',
    8000.00,
    '123 Main St, Anytown, USA',
    'deck',
    'open',
    '2025-02-10',
    '2025-03-01',
    '2025-03-31',
    '2025-02-15',
    true,
    ARRAY['https://example.com/backyard1.jpg'],
    ARRAY['https://example.com/deck_design.pdf'],
    false
);

-- Verify the data was created
SELECT 
    p.id,
    p.title,
    p.category,
    p.budget,
    p.status,
    u.full_name as homeowner_name
FROM public.projects p
JOIN public.users u ON p.homeowner_id = u.id
ORDER BY p.created_at DESC;

-- Test the RLS policies by checking if we can see the projects
-- This should show all open projects
SELECT COUNT(*) as total_open_projects FROM public.projects WHERE status = 'open';
