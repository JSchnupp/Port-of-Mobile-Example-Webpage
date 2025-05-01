-- Add section_type column to warehouse_sections table
ALTER TABLE warehouse_sections
ADD COLUMN section_type TEXT NOT NULL DEFAULT 'indoor' CHECK (section_type IN ('indoor', 'outdoor'));

-- Create function to update section_type when warehouse_sections are inserted or updated
CREATE OR REPLACE FUNCTION update_section_type()
RETURNS TRIGGER AS $$
BEGIN
  -- Get the warehouse type from the parent warehouse
  NEW.section_type := (
    SELECT type 
    FROM warehouses 
    WHERE id = NEW.warehouse_id
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update section_type
CREATE TRIGGER update_section_type_trigger
  BEFORE INSERT OR UPDATE ON warehouse_sections
  FOR EACH ROW
  EXECUTE FUNCTION update_section_type();

-- Update existing records
UPDATE warehouse_sections ws
SET section_type = w.type
FROM warehouses w
WHERE ws.warehouse_id = w.id;

-- Add index for better query performance
CREATE INDEX idx_warehouse_sections_type ON warehouse_sections(section_type); 