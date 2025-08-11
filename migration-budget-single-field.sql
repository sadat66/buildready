-- Migration to change budget_min and budget_max to single budget field

-- First, add the new budget column
ALTER TABLE projects ADD COLUMN budget DECIMAL(10,2);

-- Update existing data: use budget_min as the budget value (or average if you prefer)
UPDATE projects SET budget = budget_min WHERE budget_min IS NOT NULL;

-- Drop the old columns
ALTER TABLE projects DROP COLUMN budget_min;
ALTER TABLE projects DROP COLUMN budget_max;

-- Add NOT NULL constraint if needed
ALTER TABLE projects ALTER COLUMN budget SET NOT NULL;

-- Add check constraint to ensure budget is positive
ALTER TABLE projects ADD CONSTRAINT check_budget_positive CHECK (budget > 0);