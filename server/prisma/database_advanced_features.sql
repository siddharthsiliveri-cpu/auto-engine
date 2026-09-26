-- ====================================================================
-- AUTOENGINE DATABASE SYSTEMS SPECIFICATION (BCSE307L COMPLIANT)
-- Advanced Relational Database Constructs: View, Stored Procedure, Triggers, Indexes
-- ====================================================================

-- 1. DATABASE VIEW: VehicleComponentView
-- Unifies Vehicle Models, Variants, Components, Categories, and Certified Tier-1 Suppliers
CREATE OR REPLACE VIEW "VehicleComponentView" AS
SELECT 
    vm.id AS model_id,
    vm.model_code,
    vm.name AS model_name,
    vm.segment,
    vv.id AS variant_id,
    vv.variant_code,
    vv.name AS variant_name,
    vv.drivetrain,
    vv.base_price,
    c.id AS component_id,
    c.part_number,
    c.name AS component_name,
    c.manufacturer,
    c.weight_kg,
    c.cost_usd,
    c.status AS component_status,
    c.mesh_type,
    cc.id AS category_id,
    cc.code AS category_code,
    cc.name AS category_name,
    s.id AS supplier_id,
    s.supplier_code,
    s.name AS supplier_name,
    s.tier_level,
    s.country AS supplier_country
FROM "VehicleModel" vm
JOIN "VehicleVariant" vv ON vm.id = vv.model_id
JOIN "VariantComponent" vc ON vv.id = vc.variant_id
JOIN "Component" c ON vc.component_id = c.id
JOIN "ComponentCategory" cc ON c.category_id = cc.id
LEFT JOIN "ComponentSupplier" cs ON c.id = cs.component_id
LEFT JOIN "Supplier" s ON cs.supplier_id = s.id;


-- 2. STORED PROCEDURE / FUNCTION: calculate_project_completion
-- Calculates weighted milestone progress for a project and updates AutomotiveProject.completion_percentage
CREATE OR REPLACE FUNCTION calculate_project_completion(p_project_id TEXT)
RETURNS FLOAT AS $$
DECLARE
    v_total_weight FLOAT := 0;
    v_completed_weight FLOAT := 0;
    v_completion_pct FLOAT := 0;
BEGIN
    SELECT 
        COALESCE(SUM(weight), 0),
        COALESCE(SUM(CASE WHEN is_completed = true THEN weight ELSE 0 END), 0)
    INTO v_total_weight, v_completed_weight
    FROM "ProjectMilestone"
    WHERE project_id = p_project_id;

    IF v_total_weight > 0 THEN
        v_completion_pct := ROUND(((v_completed_weight / v_total_weight) * 100)::numeric, 1);
    ELSE
        v_completion_pct := 0;
    END IF;

    UPDATE "AutomotiveProject"
    SET completion_percentage = v_completion_pct,
        updated_at = NOW()
    WHERE id = p_project_id;

    RETURN v_completion_pct;
END;
$$ LANGUAGE plpgsql;


-- 3. TRIGGER 1: trigger_update_project_timestamp
-- Automatically updates updated_at whenever an AutomotiveProject record is modified
CREATE OR REPLACE FUNCTION trigger_update_project_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_project_timestamp ON "AutomotiveProject";
CREATE TRIGGER update_project_timestamp
BEFORE UPDATE ON "AutomotiveProject"
FOR EACH ROW
EXECUTE FUNCTION trigger_update_project_timestamp();


-- 4. TRIGGER 2: trigger_audit_milestone_update
-- Automatically records an audit log entry in AuditLog whenever a milestone is completed or modified
CREATE OR REPLACE FUNCTION trigger_audit_milestone_update()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.is_completed IS DISTINCT FROM NEW.is_completed THEN
        INSERT INTO "AuditLog" (id, table_name, record_id, action, old_values, new_values, created_at)
        VALUES (
            gen_random_uuid()::text,
            'ProjectMilestone',
            NEW.id,
            'UPDATE',
            json_build_object('is_completed', OLD.is_completed, 'title', OLD.title)::text,
            json_build_object('is_completed', NEW.is_completed, 'completed_at', NEW.completed_at)::text,
            NOW()
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS audit_milestone_update ON "ProjectMilestone";
CREATE TRIGGER audit_milestone_update
AFTER UPDATE ON "ProjectMilestone"
FOR EACH ROW
EXECUTE FUNCTION trigger_audit_milestone_update();


-- 5. PERFORMANCE B-TREE INDEXES
CREATE INDEX IF NOT EXISTS idx_component_part_number ON "Component" (part_number);
CREATE INDEX IF NOT EXISTS idx_component_status ON "Component" (status);
CREATE INDEX IF NOT EXISTS idx_variant_component_comp ON "VariantComponent" (component_id);
CREATE INDEX IF NOT EXISTS idx_variant_component_var ON "VariantComponent" (variant_id);
CREATE INDEX IF NOT EXISTS idx_milestone_project ON "ProjectMilestone" (project_id);
CREATE INDEX IF NOT EXISTS idx_review_project ON "EngineeringReview" (project_id);
CREATE INDEX IF NOT EXISTS idx_config_variant ON "VehicleConfiguration" (variant_id);
CREATE INDEX IF NOT EXISTS idx_config_user ON "VehicleConfiguration" (user_id);
