-- ====================================================================
-- AUTOENGINE — RELATIONAL DATABASE TABLE SPECIFICATION (BCSE307L COMPLIANT)
-- ENTITY: Ringbrothers "KINGPIN" (1969 Ford Mustang Mach 1 Restomod)
-- ====================================================================

-- --------------------------------------------------------------------
-- 1. STANDALONE PRODUCTION TABLE (PostgreSQL / Enterprise SQL)
-- --------------------------------------------------------------------
DROP TABLE IF EXISTS "RestomodVehicle" CASCADE;

CREATE TABLE "RestomodVehicle" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    build_name VARCHAR(120) NOT NULL UNIQUE,
    codename VARCHAR(50) NOT NULL UNIQUE,
    donor_make VARCHAR(60) NOT NULL DEFAULT 'Ford',
    donor_model VARCHAR(80) NOT NULL DEFAULT 'Mustang Mach 1',
    donor_year INTEGER NOT NULL CHECK (donor_year BETWEEN 1964 AND 2030),
    builder VARCHAR(100) NOT NULL DEFAULT 'Ringbrothers',
    lead_builders VARCHAR(150) NOT NULL DEFAULT 'Jim Ring & Mike Ring',
    build_hours INTEGER NOT NULL CHECK (build_hours > 0),
    unveiled_at VARCHAR(100) NOT NULL DEFAULT 'SEMA Show, Las Vegas',
    
    -- Powertrain Specifications
    engine_name VARCHAR(150) NOT NULL,
    engine_displacement_cc INTEGER NOT NULL CHECK (engine_displacement_cc > 0),
    supercharger VARCHAR(150) NOT NULL,
    horsepower INTEGER NOT NULL CHECK (horsepower > 0),
    torque_nm INTEGER NOT NULL CHECK (torque_nm > 0),
    transmission VARCHAR(120) NOT NULL,
    drivetrain VARCHAR(50) NOT NULL DEFAULT 'RWD',
    exhaust_system VARCHAR(200) NOT NULL,
    
    -- Chassis & Suspension
    chassis_platform VARCHAR(150) NOT NULL,
    suspension_front VARCHAR(150) NOT NULL,
    suspension_rear VARCHAR(150) NOT NULL,
    dampers VARCHAR(150) NOT NULL,
    roll_cage VARCHAR(150) NOT NULL,
    
    -- Braking & Wheels
    brakes_front VARCHAR(150) NOT NULL,
    brakes_rear VARCHAR(150) NOT NULL,
    caliper_color VARCHAR(60) NOT NULL DEFAULT 'Quantum Cyan',
    wheels_front VARCHAR(120) NOT NULL,
    wheels_rear VARCHAR(120) NOT NULL,
    tires_front VARCHAR(100) NOT NULL,
    tires_rear VARCHAR(100) NOT NULL,
    
    -- Body Dimensions & Materials
    body_widening_front_in NUMERIC(4, 2) NOT NULL DEFAULT 2.00,
    body_widening_rear_in NUMERIC(4, 2) NOT NULL DEFAULT 3.50,
    wheelbase_stretch_in NUMERIC(4, 2) NOT NULL DEFAULT 1.50,
    carbon_fiber_components TEXT NOT NULL,
    paint_name VARCHAR(100) NOT NULL DEFAULT 'Bootleg Black',
    paint_code VARCHAR(100) NOT NULL DEFAULT 'BASF Glasurit GM 8555',
    interior_trim VARCHAR(200) NOT NULL,
    
    -- Performance Metrics
    curb_weight_kg NUMERIC(6, 2) NOT NULL CHECK (curb_weight_kg > 500),
    acceleration_0_100_kmh NUMERIC(4, 2) NOT NULL CHECK (acceleration_0_100_kmh > 0),
    top_speed_kmh INTEGER NOT NULL CHECK (top_speed_kmh > 100),
    estimated_valuation_usd NUMERIC(12, 2) NOT NULL CHECK (estimated_valuation_usd > 0),
    image_path VARCHAR(255),
    
    -- Audit Timestamps
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Performance B-Tree Indexes
CREATE INDEX idx_restomod_build_name ON "RestomodVehicle"(build_name);
CREATE INDEX idx_restomod_donor_year ON "RestomodVehicle"(donor_year);
CREATE INDEX idx_restomod_builder ON "RestomodVehicle"(builder);
CREATE INDEX idx_restomod_hp ON "RestomodVehicle"(horsepower);


-- --------------------------------------------------------------------
-- 2. 3NF NORMALIZED RELATIONAL DECOMPOSITION (ACADEMIC ARCHITECTURE)
-- Decomposed to eliminate update, insertion, and deletion anomalies.
-- --------------------------------------------------------------------

-- Entity 1: Donor Vehicle Specification
CREATE TABLE "DonorVehicle" (
    donor_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    make VARCHAR(60) NOT NULL,
    model VARCHAR(80) NOT NULL,
    model_year INTEGER NOT NULL CHECK (model_year BETWEEN 1900 AND 2030),
    original_body_style VARCHAR(80) NOT NULL,
    factory_chassis_code VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Entity 2: Powertrain Specification
CREATE TABLE "PowertrainSpecification" (
    powertrain_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    engine_name VARCHAR(150) NOT NULL,
    displacement_cc INTEGER NOT NULL,
    supercharger VARCHAR(150),
    horsepower INTEGER NOT NULL,
    torque_nm INTEGER NOT NULL,
    transmission VARCHAR(120) NOT NULL,
    exhaust_system VARCHAR(200) NOT NULL
);

-- Entity 3: Chassis & Suspension Architecture
CREATE TABLE "ChassisSuspension" (
    chassis_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chassis_platform VARCHAR(150) NOT NULL,
    front_suspension VARCHAR(150) NOT NULL,
    rear_suspension VARCHAR(150) NOT NULL,
    damper_spec VARCHAR(150) NOT NULL,
    roll_cage_spec VARCHAR(150) NOT NULL
);

-- Entity 4: Wheel & Braking Package
CREATE TABLE "WheelBrakePackage" (
    package_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    front_wheel VARCHAR(120) NOT NULL,
    rear_wheel VARCHAR(120) NOT NULL,
    front_tire VARCHAR(100) NOT NULL,
    rear_tire VARCHAR(100) NOT NULL,
    front_caliper_pistons INTEGER NOT NULL DEFAULT 6,
    rear_caliper_pistons INTEGER NOT NULL DEFAULT 4,
    caliper_finish_color VARCHAR(60) NOT NULL DEFAULT 'Quantum Cyan',
    brake_system_brand VARCHAR(100) NOT NULL DEFAULT 'Brembo'
);

-- Entity 5: Body & Aerodynamic Modifications
CREATE TABLE "BodyAeroModification" (
    modification_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    widening_front_in NUMERIC(4, 2) NOT NULL,
    widening_rear_in NUMERIC(4, 2) NOT NULL,
    wheelbase_stretch_in NUMERIC(4, 2) NOT NULL,
    carbon_fiber_parts TEXT NOT NULL,
    paint_name VARCHAR(100) NOT NULL,
    paint_code VARCHAR(100) NOT NULL
);

-- Entity 6: Core Restomod Build (3NF Master Relation)
CREATE TABLE "RestomodBuild" (
    build_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    build_name VARCHAR(120) NOT NULL UNIQUE,
    codename VARCHAR(50) NOT NULL UNIQUE,
    builder VARCHAR(100) NOT NULL,
    lead_fabricators VARCHAR(150) NOT NULL,
    build_hours INTEGER NOT NULL,
    unveiled_at VARCHAR(100) NOT NULL,
    valuation_usd NUMERIC(12, 2) NOT NULL,
    curb_weight_kg NUMERIC(6, 2) NOT NULL,
    accel_0_100_s NUMERIC(4, 2) NOT NULL,
    top_speed_kmh INTEGER NOT NULL,
    image_url VARCHAR(255),
    
    -- Foreign Keys enforcing Referential Integrity (3NF)
    donor_id UUID NOT NULL REFERENCES "DonorVehicle"(donor_id) ON DELETE RESTRICT,
    powertrain_id UUID NOT NULL REFERENCES "PowertrainSpecification"(powertrain_id) ON DELETE RESTRICT,
    chassis_id UUID NOT NULL REFERENCES "ChassisSuspension"(chassis_id) ON DELETE RESTRICT,
    package_id UUID NOT NULL REFERENCES "WheelBrakePackage"(package_id) ON DELETE RESTRICT,
    modification_id UUID NOT NULL REFERENCES "BodyAeroModification"(modification_id) ON DELETE RESTRICT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


-- --------------------------------------------------------------------
-- 3. SQL VIEW: KingpinFullSpecificationView
-- --------------------------------------------------------------------
CREATE OR REPLACE VIEW "KingpinFullSpecificationView" AS
SELECT 
    b.build_name,
    b.codename,
    b.builder,
    b.build_hours,
    d.make AS donor_make,
    d.model AS donor_model,
    d.model_year AS donor_year,
    p.engine_name,
    p.supercharger,
    p.horsepower,
    p.torque_nm,
    p.transmission,
    c.chassis_platform,
    c.damper_spec,
    w.brake_system_brand,
    w.caliper_finish_color,
    w.front_wheel,
    w.rear_wheel,
    m.widening_rear_in,
    m.paint_name,
    b.curb_weight_kg,
    b.valuation_usd
FROM "RestomodBuild" b
JOIN "DonorVehicle" d ON b.donor_id = d.donor_id
JOIN "PowertrainSpecification" p ON b.powertrain_id = p.powertrain_id
JOIN "ChassisSuspension" c ON b.chassis_id = c.chassis_id
JOIN "WheelBrakePackage" w ON b.package_id = w.package_id
JOIN "BodyAeroModification" m ON b.modification_id = m.modification_id;


-- --------------------------------------------------------------------
-- 4. DATA SEEDING (DML): Ringbrothers KINGPIN Real Specifications
-- --------------------------------------------------------------------
INSERT INTO "RestomodVehicle" (
    id,
    build_name,
    codename,
    donor_make,
    donor_model,
    donor_year,
    builder,
    lead_builders,
    build_hours,
    unveiled_at,
    engine_name,
    engine_displacement_cc,
    supercharger,
    horsepower,
    torque_nm,
    transmission,
    drivetrain,
    exhaust_system,
    chassis_platform,
    suspension_front,
    suspension_rear,
    dampers,
    roll_cage,
    brakes_front,
    brakes_rear,
    caliper_color,
    wheels_front,
    wheels_rear,
    tires_front,
    tires_rear,
    body_widening_front_in,
    body_widening_rear_in,
    wheelbase_stretch_in,
    carbon_fiber_components,
    paint_name,
    paint_code,
    interior_trim,
    curb_weight_kg,
    acceleration_0_100_kmh,
    top_speed_kmh,
    estimated_valuation_usd,
    image_path
) VALUES (
    'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d',
    'Ringbrothers KINGPIN',
    'RB-1969-KINGPIN',
    'Ford',
    'Mustang Mach 1 Fastback',
    1969,
    'Ringbrothers',
    'Jim Ring & Mike Ring',
    5500,
    'SEMA Show, Las Vegas',
    'Wegner Motorsports 5.0L Coyote 32V V8',
    5038,
    'Whipple 2.9L Twin-Screw Supercharger',
    820,
    915,
    'Bowler Carbon Edition 6-Speed Manual',
    'RWD',
    'Custom Ringbrothers Mandrel-Bent Headers + Flowmaster Super 44 Stainless Dual Exhaust',
    'Roadster Shop FAST TRACK Stage III Custom Unibody Conversion',
    'Roadster Shop Independent Front Suspension with C6 Corvette Spindles',
    'Roadster Shop Independent Rear Suspension (IRS)',
    'Fox Racing RS SV Single-Adjustable Aluminum Coil-Overs',
    'Integrated Hand-Crafted 1.75-inch DOM Chromoly Roll Cage',
    'Brembo 6-Piston Monobloc Calipers with 15.0-inch Carbon-Ceramic Drilled Rotors',
    'Brembo 4-Piston Monobloc Calipers with 14.0-inch Carbon-Ceramic Drilled Rotors',
    'Quantum Cyan / Brembo Blue',
    'HRE Vintage Series 517 Forged 3-Piece 19x10 inch',
    'HRE Vintage Series 517 Forged 3-Piece 20x13 inch',
    'Michelin Pilot Sport 4 S 295/35R19',
    'Michelin Pilot Sport 4 S 345/30R20',
    2.00,
    3.50,
    1.50,
    'Carbon fiber shaker hood scoop, aerodynamic front splitter, radiator surround, rocker panels, rear diffuser, and decklid spoiler',
    'Bootleg Black',
    'BASF Glasurit GM 8555',
    'Hand-stitched Obsidian Nappa Leather with Alcantara inserts, contrast cyan stitching, Dakota Digital gauges, and Vintage Air Gen-IV climate control',
    1520.00,
    3.20,
    335,
    850000.00,
    '/images/mustang-kingpin.jpg'
);
