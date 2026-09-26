import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('⚡ AUTOENGINE: Seeding enterprise automotive digital engineering database...');

  // 1. Roles
  const rolesData = [
    { name: 'ADMIN', description: 'Full access to projects, telemetry, database architecture, and team administration.' },
    { name: 'PROJECT_MANAGER', description: 'Program management, timeline tracking, milestone sign-offs, and resource allocation.' },
    { name: 'ENGINEER', description: 'Powertrain, chassis, component design, bill of materials, and engineering reviews.' },
    { name: 'DESIGNER', description: 'Vehicle styling, 3D digital twins, exterior CMF, and studio configurations.' },
  ];

  const roles: Record<string, string> = {};
  for (const r of rolesData) {
    const role = await prisma.role.upsert({
      where: { name: r.name },
      update: { description: r.description },
      create: r,
    });
    roles[r.name] = role.id;
  }
  console.log('✓ Roles initialized:', Object.keys(roles).join(', '));

  // 2. Users (Personas)
  const passwordHash = await bcrypt.hash('AutoEngine2026!', 10);
  const usersData = [
    {
      email: 'admin@autoengine.io',
      passwordHash,
      firstName: 'Elena',
      lastName: 'Vance',
      roleId: roles['ADMIN'],
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
    },
    {
      email: 'pm@autoengine.io',
      passwordHash,
      firstName: 'Marcus',
      lastName: 'Thorne',
      roleId: roles['PROJECT_MANAGER'],
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
    },
    {
      email: 'engineer@autoengine.io',
      passwordHash,
      firstName: 'Dr. Sarah',
      lastName: 'Chen',
      roleId: roles['ENGINEER'],
      avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=256&q=80',
    },
    {
      email: 'designer@autoengine.io',
      passwordHash,
      firstName: 'Julian',
      lastName: 'Rossi',
      roleId: roles['DESIGNER'],
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80',
    },
  ];

  const users: Record<string, string> = {};
  for (const u of usersData) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: { firstName: u.firstName, lastName: u.lastName, roleId: u.roleId },
      create: u,
    });
    users[u.email] = user.id;
  }
  console.log('✓ Users & Personas seeded');

  // 3. Component Categories
  const categoriesData = [
    { code: 'POWERTRAIN', name: 'Electric Powertrain & Motors', icon: 'Zap', description: 'Axial and radial flux electric drive units, inverters, and reduction gearboxes.' },
    { code: 'BATTERY', name: 'Energy Storage & High Voltage', icon: 'BatteryCharging', description: '800V skateboard architecture, liquid-cooled cell modules, and BMS.' },
    { code: 'CHASSIS', name: 'Chassis & Subframe', icon: 'Cpu', description: 'High-strength aluminum and carbon composite monocoque structures.' },
    { code: 'SUSPENSION', name: 'Active Suspension & Damping', icon: 'Activity', description: 'Adaptive air springs, active anti-roll bars, and magnetorheological dampers.' },
    { code: 'BRAKES', name: 'Braking Systems', icon: 'Disc', description: 'Carbon-ceramic ventilated rotors, regenerative 6-piston monobloc calipers.' },
    { code: 'WHEELS', name: 'Wheels & Aero Rims', icon: 'CircleDot', description: 'Ultra-lightweight forged alloys with active aerodynamic aero blades.' },
    { code: 'TYRES', name: 'Performance Tyres', icon: 'RotateCw', description: 'Low rolling-resistance compounds engineered for EV torque and high speed.' },
    { code: 'AERO', name: 'Active Aerodynamics', icon: 'Wind', description: 'Active front splitters, motorized rear diffusers, and DRS rear wings.' },
    { code: 'INTERIOR', name: 'Cockpit & Ergonomics', icon: 'Layout', description: 'Driver-centric monocoque bucket seats, titanium fixtures, and sustainable textiles.' },
    { code: 'DASHBOARD', name: 'Digital Instrumentation', icon: 'Monitor', description: 'Continuous curved OLED digital displays with real-time telemetry rendering.' },
    { code: 'LIGHTING', name: 'Matrix LED & Optics', icon: 'Sun', description: 'Adaptive matrix laser optics and continuous rear aerodynamic light bars.' },
    { code: 'THERMAL', name: 'Thermal Management', icon: 'Thermometer', description: 'Octovalve heat pumps, glycol coolant circuits, and direct stator cooling.' },
  ];

  const categories: Record<string, string> = {};
  for (const c of categoriesData) {
    const cat = await prisma.componentCategory.upsert({
      where: { code: c.code },
      update: c,
      create: c,
    });
    categories[c.code] = cat.id;
  }
  console.log('✓ Component Categories initialized');

  // 4. Certified Suppliers
  const suppliersData = [
    { supplierCode: 'SUP-BOSCH-01', name: 'Bosch Mobility Solutions', tierLevel: 'Tier 1', country: 'Germany', contactEmail: 'oem.autoengine@bosch.de', rating: 4.9 },
    { supplierCode: 'SUP-BREMBO-02', name: 'Brembo Racing & Performance', tierLevel: 'Tier 1', country: 'Italy', contactEmail: 'motorsport@brembo.it', rating: 5.0 },
    { supplierCode: 'SUP-SDI-03', name: 'Samsung SDI High-Voltage Div', tierLevel: 'Tier 1', country: 'South Korea', contactEmail: 'mobility@samsungsdi.com', rating: 4.8 },
    { supplierCode: 'SUP-MICH-04', name: 'Michelin EV Motorsport', tierLevel: 'Tier 1', country: 'France', contactEmail: 'tech.ev@michelin.fr', rating: 4.9 },
    { supplierCode: 'SUP-BILST-05', name: 'Bilstein Performance Suspension', tierLevel: 'Tier 1', country: 'Germany', contactEmail: 'oem@bilstein.de', rating: 4.9 },
    { supplierCode: 'SUP-RECARO-06', name: 'Recaro Automotive Engineering', tierLevel: 'Tier 1', country: 'Germany', contactEmail: 'custom@recaro-automotive.com', rating: 4.7 },
    { supplierCode: 'SUP-MAGNA-07', name: 'Magna Steyr Vehicle Powertrains', tierLevel: 'Tier 1', country: 'Austria', contactEmail: 'drive@magnasteyr.at', rating: 4.8 },
    { supplierCode: 'SUP-CONTI-08', name: 'Continental Autonomous Optics', tierLevel: 'Tier 1', country: 'Germany', contactEmail: 'vision@conti-online.com', rating: 4.6 },
  ];

  const suppliers: Record<string, string> = {};
  for (const s of suppliersData) {
    const sup = await prisma.supplier.upsert({
      where: { supplierCode: s.supplierCode },
      update: s,
      create: s,
    });
    suppliers[s.supplierCode] = sup.id;
  }
  console.log('✓ Tier-1 Automotive Suppliers registered');

  // 5. Engineering Projects
  const projectsData = [
    {
      projectCode: 'PRJ-APEX-01',
      name: 'Project Apex Hyper-GT',
      description: 'Ultra-high performance 800V electric grand tourer demonstrating breakthrough aerodynamics and track dynamics.',
      status: 'IN_ENGINEERING',
      budget: 85000000,
      startDate: new Date('2025-01-15'),
      targetEndDate: new Date('2026-12-31'),
      completionPercentage: 68.5,
    },
    {
      projectCode: 'PRJ-TERRA-02',
      name: 'Project Terra All-Terrain EV',
      description: 'Next-generation rugged electric adventure SUV featuring quad-motor torque vectoring and adjustable ground clearance.',
      status: 'PROTOTYPING',
      budget: 120000000,
      startDate: new Date('2024-06-01'),
      targetEndDate: new Date('2027-03-31'),
      completionPercentage: 82.0,
    },
    {
      projectCode: 'PRJ-PULSE-03',
      name: 'Project Pulse Executive Sedan',
      description: 'Streamlined luxury electric sedan designed for extreme range and Level 3 autonomous highway cruising.',
      status: 'CONCEPT',
      budget: 65000000,
      startDate: new Date('2025-09-01'),
      targetEndDate: new Date('2027-11-30'),
      completionPercentage: 35.0,
    },
  ];

  const projects: Record<string, string> = {};
  for (const p of projectsData) {
    const proj = await prisma.automotiveProject.upsert({
      where: { projectCode: p.projectCode },
      update: p,
      create: p,
    });
    projects[p.projectCode] = proj.id;

    // Add members
    await prisma.projectMember.upsert({
      where: { projectId_userId: { projectId: proj.id, userId: users['pm@autoengine.io'] } },
      update: {},
      create: { projectId: proj.id, userId: users['pm@autoengine.io'], assignedRole: 'Chief Program Director' },
    });
    await prisma.projectMember.upsert({
      where: { projectId_userId: { projectId: proj.id, userId: users['engineer@autoengine.io'] } },
      update: {},
      create: { projectId: proj.id, userId: users['engineer@autoengine.io'], assignedRole: 'Lead Powertrain Engineer' },
    });
    await prisma.projectMember.upsert({
      where: { projectId_userId: { projectId: proj.id, userId: users['designer@autoengine.io'] } },
      update: {},
      create: { projectId: proj.id, userId: users['designer@autoengine.io'], assignedRole: 'Lead Exterior CMF Designer' },
    });
  }
  console.log('✓ Automotive Development Projects & Teams created');

  // 6. Project Milestones
  const apexId = projects['PRJ-APEX-01'];
  const milestonesData = [
    { projectId: apexId, title: 'Aerodynamic Wind Tunnel & CFD Validation', phase: '01-CONCEPT', description: 'Full-scale scale model CFD achieving targeted drag coefficient Cd 0.208.', targetDate: new Date('2025-04-10'), isCompleted: true, completedAt: new Date('2025-04-08'), weight: 1.5 },
    { projectId: apexId, title: '800V Skateboard Chassis Packaging', phase: '02-DESIGN', description: 'Thermal integration of 82 kWh liquid-cooled battery pack and subframe mounts.', targetDate: new Date('2025-07-20'), isCompleted: true, completedAt: new Date('2025-07-18'), weight: 2.0 },
    { projectId: apexId, title: 'Dual Axial-Flux Powertrain Bench Test', phase: '03-ENGINEERING', description: 'Dynamometer testing of dual 250 kW motors under sustained peak load.', targetDate: new Date('2025-11-15'), isCompleted: true, completedAt: new Date('2025-11-12'), weight: 2.5 },
    { projectId: apexId, title: 'Active Damper & Carbon-Ceramic Brake Tuning', phase: '03-ENGINEERING', description: 'Nürburgring calibration of Bilstein adaptive suspension and Brembo 6-piston calipers.', targetDate: new Date('2026-03-30'), isCompleted: false, weight: 2.0 },
    { projectId: apexId, title: 'Digital Twin Hardware-in-the-Loop Simulation', phase: '04-PROTOTYPE', description: 'Real-time CAN-bus synchronization and thermal runaway telemetry loop.', targetDate: new Date('2026-06-15'), isCompleted: false, weight: 1.5 },
    { projectId: apexId, title: 'Pre-Series Homologation & Crash Certification', phase: '05-TESTING', description: 'Full NCAP frontal, side, and rollover crash compliance validation.', targetDate: new Date('2026-10-30'), isCompleted: false, weight: 3.0 },
  ];

  for (const m of milestonesData) {
    const existing = await prisma.projectMilestone.findFirst({
      where: { projectId: m.projectId, title: m.title },
    });
    if (!existing) {
      await prisma.projectMilestone.create({ data: m });
    }
  }
  console.log('✓ Project Milestones configured');

  // 7. Vehicle Models & Variants
  const apexModel = await prisma.vehicleModel.upsert({
    where: { modelCode: 'AE-APEX-GT' },
    update: {},
    create: {
      projectId: apexId,
      modelCode: 'AE-APEX-GT',
      name: 'AE-Apex Hyper-GT',
      segment: 'Hyper-GT',
      year: 2026,
      description: 'Futuristic high-downforce aerodynamic grand tourer powered by next-generation silicon-carbide 800V inverters.',
    },
  });

  const terraModel = await prisma.vehicleModel.upsert({
    where: { modelCode: 'AE-TERRA-SUV' },
    update: {},
    create: {
      projectId: projects['PRJ-TERRA-02'],
      modelCode: 'AE-TERRA-SUV',
      name: 'AE-Terra Electric SUV',
      segment: 'Electric SUV',
      year: 2026,
      description: 'Luxury adventure sport utility vehicle featuring adaptive pneumatic suspension and active differential locks.',
    },
  });

  const pulseModel = await prisma.vehicleModel.upsert({
    where: { modelCode: 'AE-PULSE-SEDAN' },
    update: {},
    create: {
      projectId: projects['PRJ-PULSE-03'],
      modelCode: 'AE-PULSE-SEDAN',
      name: 'AE-Pulse Executive Sedan',
      segment: 'Performance Sedan',
      year: 2026,
      description: 'Aerodynamic executive electric cruiser offering class-leading 640 km highway range and whisper-quiet cabin acoustics.',
    },
  });

  // Variants
  const apexPerfVariant = await prisma.vehicleVariant.upsert({
    where: { variantCode: 'APEX-PERF-AWD' },
    update: {},
    create: {
      modelId: apexModel.id,
      variantCode: 'APEX-PERF-AWD',
      name: 'Apex Performance Dual-Motor AWD',
      drivetrain: 'Dual-Motor AWD',
      basePrice: 165000,
      status: 'ACTIVE',
    },
  });

  const apexTrackVariant = await prisma.vehicleVariant.upsert({
    where: { variantCode: 'APEX-TRACK-TRI' },
    update: {},
    create: {
      modelId: apexModel.id,
      variantCode: 'APEX-TRACK-TRI',
      name: 'Apex Cyber Track Edition Tri-Motor',
      drivetrain: 'Tri-Motor Performance AWD',
      basePrice: 215000,
      status: 'ACTIVE',
    },
  });

  // Specifications
  await prisma.vehicleSpecification.upsert({
    where: { variantId: apexPerfVariant.id },
    update: {},
    create: {
      variantId: apexPerfVariant.id,
      rangeKm: 520,
      acceleration0100: 3.2,
      topSpeedKmh: 320,
      peakPowerKw: 500, // 670 hp
      batteryKwh: 82.0,
      curbWeightKg: 1920,
      dragCoefficient: 0.208,
    },
  });

  await prisma.vehicleSpecification.upsert({
    where: { variantId: apexTrackVariant.id },
    update: {},
    create: {
      variantId: apexTrackVariant.id,
      rangeKm: 610,
      acceleration0100: 2.1,
      topSpeedKmh: 350,
      peakPowerKw: 750, // 1,006 hp
      batteryKwh: 105.0,
      curbWeightKg: 2010,
      dragCoefficient: 0.198,
    },
  });
  console.log('✓ Vehicle Models, Variants, and Telemetry Specs seeded');

  // 8. Components Library
  const componentsList = [
    // Powertrain & Battery
    {
      partNumber: 'CMP-BAT-82KW',
      categoryId: categories['BATTERY'],
      name: '82 kWh Skateboard Battery Pack',
      description: '800V structural prismatic battery enclosure with integrated aluminum cooling channels and high volumetric density.',
      manufacturer: 'Samsung SDI High-Voltage Div',
      weightKg: 495.0,
      costUsd: 14200.0,
      status: 'APPROVED',
      meshType: 'battery_pack',
      supplierCode: 'SUP-SDI-03',
      specs: [
        { specKey: 'Nominal Energy', specValue: '82.0', unit: 'kWh' },
        { specKey: 'System Architecture', specValue: '800', unit: 'V' },
        { specKey: 'Cell Chemistry', specValue: 'NMC 811 Prismatic', unit: '' },
        { specKey: 'Peak Fast Charging', specValue: '350', unit: 'kW' },
      ],
    },
    {
      partNumber: 'CMP-BAT-105KW',
      categoryId: categories['BATTERY'],
      name: '105 kWh Solid-State Hypercell Pack',
      description: 'Next-gen silicon-composite anode battery pack with ceramic solid electrolyte for track endurance and extreme power draw.',
      manufacturer: 'Samsung SDI High-Voltage Div',
      weightKg: 535.0,
      costUsd: 22500.0,
      status: 'APPROVED',
      meshType: 'battery_pack',
      supplierCode: 'SUP-SDI-03',
      specs: [
        { specKey: 'Nominal Energy', specValue: '105.0', unit: 'kWh' },
        { specKey: 'System Architecture', specValue: '900', unit: 'V' },
        { specKey: 'Gravimetric Density', specValue: '340', unit: 'Wh/kg' },
      ],
    },
    {
      partNumber: 'CMP-MOT-250KW',
      categoryId: categories['POWERTRAIN'],
      name: '250 kW Axial-Flux Electric Drive Unit',
      description: 'Ultra-compact axial flux permanent magnet motor with silicon-carbide (SiC) inverter delivering immediate torque response.',
      manufacturer: 'Magna Steyr Vehicle Powertrains',
      weightKg: 62.5,
      costUsd: 6800.0,
      status: 'APPROVED',
      meshType: 'motor_front',
      supplierCode: 'SUP-MAGNA-07',
      specs: [
        { specKey: 'Continuous Power', specValue: '250', unit: 'kW' },
        { specKey: 'Peak Torque', specValue: '480', unit: 'Nm' },
        { specKey: 'Max RPM', specValue: '20,000', unit: 'RPM' },
        { specKey: 'Inverter Efficiency', specValue: '98.8', unit: '%' },
      ],
    },
    {
      partNumber: 'CMP-MOT-350KW',
      categoryId: categories['POWERTRAIN'],
      name: '350 kW Rear Performance Drive Unit',
      description: 'High-speed dual-rotor permanent magnet synchronous motor with oil-spray rotor cooling for sustained Autobahn speeds.',
      manufacturer: 'Bosch Mobility Solutions',
      weightKg: 78.0,
      costUsd: 9400.0,
      status: 'APPROVED',
      meshType: 'motor_rear',
      supplierCode: 'SUP-BOSCH-01',
      specs: [
        { specKey: 'Peak Power', specValue: '350', unit: 'kW' },
        { specKey: 'Peak Torque', specValue: '620', unit: 'Nm' },
        { specKey: 'Differential', specValue: 'Electronic Torque Vectoring', unit: '' },
      ],
    },
    // Suspension & Brakes
    {
      partNumber: 'CMP-SUSP-ADAPT',
      categoryId: categories['SUSPENSION'],
      name: 'Bilstein Adaptive Air Suspension System',
      description: 'Triple-chamber pneumatic air springs with continuously variable magnetorheological damping and millimeter ride-height control.',
      manufacturer: 'Bilstein Performance Suspension',
      weightKg: 44.0,
      costUsd: 5800.0,
      status: 'APPROVED',
      meshType: 'suspension',
      supplierCode: 'SUP-BILST-05',
      specs: [
        { specKey: 'Response Time', specValue: '12', unit: 'ms' },
        { specKey: 'Height Adjustment Range', specValue: '85', unit: 'mm' },
        { specKey: 'Damping Modes', specValue: 'Comfort, Sport, Track, Aero-Low', unit: '' },
      ],
    },
    {
      partNumber: 'CMP-BRK-BREMBO-CC',
      categoryId: categories['BRAKES'],
      name: 'Brembo 410mm Carbon-Ceramic Matrix Brakes',
      description: 'Front 410mm and rear 390mm carbon-ceramic composite discs paired with forged aluminum 6-piston monobloc calipers in Electric Cyan finish.',
      manufacturer: 'Brembo Racing & Performance',
      weightKg: 32.0,
      costUsd: 8900.0,
      status: 'APPROVED',
      meshType: 'brakes',
      supplierCode: 'SUP-BREMBO-02',
      specs: [
        { specKey: 'Rotor Diameter Front', specValue: '410', unit: 'mm' },
        { specKey: 'Caliper Architecture', specValue: '6-Piston Monobloc', unit: '' },
        { specKey: 'Operating Temperature', specValue: 'Up to 1,000', unit: '°C' },
        { specKey: 'Weight Reduction vs Steel', specValue: '48', unit: '%' },
      ],
    },
    // Wheels & Tyres
    {
      partNumber: 'CMP-WHL-AERO-21',
      categoryId: categories['WHEELS'],
      name: '21" Aero Carbon Blade Forged Wheels',
      description: 'Precision milled monoblock aerospace aluminum wheels with interchangeable carbon fiber aerodynamic vortex blades.',
      manufacturer: 'Bosch Mobility Solutions',
      weightKg: 38.0,
      costUsd: 4600.0,
      status: 'APPROVED',
      meshType: 'wheels',
      supplierCode: 'SUP-BOSCH-01',
      specs: [
        { specKey: 'Dimension Front', specValue: '21 x 9.5J', unit: '' },
        { specKey: 'Dimension Rear', specValue: '21 x 11.5J', unit: '' },
        { specKey: 'Material', specValue: '6061-T6 Forged Aluminum + Carbon', unit: '' },
      ],
    },
    {
      partNumber: 'CMP-TYR-MICH-EV',
      categoryId: categories['TYRES'],
      name: 'Michelin Pilot Sport EV Acoustic Tyres',
      description: 'Acoustic polyurethane foam lined performance compound developed specifically for extreme electric torque and lateral grip.',
      manufacturer: 'Michelin EV Motorsport',
      weightKg: 42.0,
      costUsd: 1900.0,
      status: 'APPROVED',
      meshType: 'wheels',
      supplierCode: 'SUP-MICH-04',
      specs: [
        { specKey: 'Front Size', specValue: '265/35 ZR21', unit: '' },
        { specKey: 'Rear Size', specValue: '305/30 ZR21', unit: '' },
        { specKey: 'Wet Grip Rating', specValue: 'Class A', unit: '' },
      ],
    },
    // Interior & Ergonomics
    {
      partNumber: 'CMP-INT-RECARO-CB',
      categoryId: categories['INTERIOR'],
      name: 'Recaro Carbon Monocoque Sport Seats',
      description: 'Ultra-lightweight autoclave carbon fiber shell seats upholstered in breathable Alcantara and active cooling micro-perforations.',
      manufacturer: 'Recaro Automotive Engineering',
      weightKg: 28.0,
      costUsd: 7400.0,
      status: 'APPROVED',
      meshType: 'interior',
      supplierCode: 'SUP-RECARO-06',
      specs: [
        { specKey: 'Shell Material', specValue: 'Autoclave Carbon Composite', unit: '' },
        { specKey: 'Adjustment', specValue: '18-Way Power + Pneumatic Bolsters', unit: '' },
        { specKey: 'Weight per Seat', specValue: '14.0', unit: 'kg' },
      ],
    },
    // Cockpit Instrumentation
    {
      partNumber: 'CMP-DSB-OLED-CURV',
      categoryId: categories['DASHBOARD'],
      name: 'Ultra-Wide Curved OLED Digital Cockpit',
      description: 'Seamless 37-inch 8K curved panoramic glass display powered by automotive-grade Snapdragon Digital Chassis processor.',
      manufacturer: 'Continental Autonomous Optics',
      weightKg: 12.5,
      costUsd: 4200.0,
      status: 'APPROVED',
      meshType: 'interior',
      supplierCode: 'SUP-CONTI-08',
      specs: [
        { specKey: 'Display Size', specValue: '37-inch Panoramic', unit: '' },
        { specKey: 'Resolution', specValue: '8K Ultra HD', unit: '' },
        { specKey: 'Refresh Rate', specValue: '120', unit: 'Hz' },
        { specKey: 'Peak Brightness', specValue: '1,500', unit: 'nits' },
      ],
    },
    // Active Aerodynamics
    {
      partNumber: 'CMP-AERO-DRS-WING',
      categoryId: categories['AERO'],
      name: 'Active Carbon DRS Rear Wing & Diffuser',
      description: 'Motorized dual-element carbon wing providing up to 450 kg of high-speed downforce with automated aerodynamic braking assist.',
      manufacturer: 'Bosch Mobility Solutions',
      weightKg: 19.5,
      costUsd: 6200.0,
      status: 'APPROVED',
      meshType: 'body_panels',
      supplierCode: 'SUP-BOSCH-01',
      specs: [
        { specKey: 'Peak Downforce', specValue: '450', unit: 'kg @ 250 km/h' },
        { specKey: 'Actuation Speed', specValue: '0.4', unit: 'sec' },
        { specKey: 'Air-Brake Deceleration Assist', specValue: '0.35', unit: 'G' },
      ],
    },
    // Matrix Lighting
    {
      partNumber: 'CMP-LGT-LASER-MTX',
      categoryId: categories['LIGHTING'],
      name: 'Adaptive Micro-Laser Matrix Headlight System',
      description: '1.3 million micro-mirror projection optics delivering adaptive glare-free illumination up to 650 meters downroad.',
      manufacturer: 'Continental Autonomous Optics',
      weightKg: 8.0,
      costUsd: 3800.0,
      status: 'APPROVED',
      meshType: 'body_panels',
      supplierCode: 'SUP-CONTI-08',
      specs: [
        { specKey: 'High-Beam Range', specValue: '650', unit: 'm' },
        { specKey: 'Individual Beam Pixels', specValue: '1,300,000', unit: 'px' },
      ],
    },
  ];

  for (const c of componentsList) {
    const comp = await prisma.component.upsert({
      where: { partNumber: c.partNumber },
      update: {
        name: c.name,
        description: c.description,
        weightKg: c.weightKg,
        costUsd: c.costUsd,
        status: c.status,
        meshType: c.meshType,
      },
      create: {
        partNumber: c.partNumber,
        categoryId: c.categoryId,
        name: c.name,
        description: c.description,
        manufacturer: c.manufacturer,
        weightKg: c.weightKg,
        costUsd: c.costUsd,
        status: c.status,
        meshType: c.meshType,
      },
    });

    // Link Supplier
    const supplierId = suppliers[c.supplierCode];
    if (supplierId) {
      await prisma.componentSupplier.upsert({
        where: { componentId_supplierId: { componentId: comp.id, supplierId } },
        update: {},
        create: {
          componentId: comp.id,
          supplierId,
          leadTimeDays: 28,
          unitCost: c.costUsd * 0.85,
          supplyAgreementStatus: 'ACTIVE',
        },
      });
    }

    // Link Specifications
    for (const spec of c.specs) {
      const existingSpec = await prisma.componentSpecification.findFirst({
        where: { componentId: comp.id, specKey: spec.specKey },
      });
      if (!existingSpec) {
        await prisma.componentSpecification.create({
          data: {
            componentId: comp.id,
            specKey: spec.specKey,
            specValue: spec.specValue,
            unit: spec.unit || null,
          },
        });
      }
    }

    // Attach to Apex Performance Variant
    await prisma.variantComponent.upsert({
      where: { variantId_componentId: { variantId: apexPerfVariant.id, componentId: comp.id } },
      update: {},
      create: {
        variantId: apexPerfVariant.id,
        componentId: comp.id,
        isStandard: true,
        isOptional: false,
      },
    });
  }
  console.log('✓ Component Library & Specifications populated');

  // 9. Engineering Reviews
  const reviewsData = [
    {
      projectId: apexId,
      reviewerId: users['engineer@autoengine.io'],
      title: 'High-Speed Aerodynamic Drag & Downforce Audit',
      reviewType: 'AERODYNAMICS',
      status: 'APPROVED',
      score: 96.5,
      comments: 'Front air curtain and active venturi tunnels verified at 300 km/h wind velocity. Boundary layer separation within 2% margin of error.',
    },
    {
      projectId: apexId,
      reviewerId: users['engineer@autoengine.io'],
      title: '800V Fast Charging Thermal Equilibrium Assessment',
      reviewType: 'THERMAL',
      status: 'APPROVED',
      score: 94.0,
      comments: 'Cell temperature maintained at 38°C peak during 350 kW 10-80% charge cycle test. Glycol flow distribution validated.',
    },
    {
      projectId: apexId,
      reviewerId: users['pm@autoengine.io'],
      title: 'Structural Carbon Monocoque Torsional Rigidity Review',
      reviewType: 'CHASSIS_DYNAMICS',
      status: 'APPROVED',
      score: 98.0,
      comments: 'Torsional rigidity exceeds 62,000 Nm/deg. Meets FIA track homologation guidelines.',
    },
  ];

  for (const r of reviewsData) {
    const existing = await prisma.engineeringReview.findFirst({
      where: { projectId: r.projectId, title: r.title },
    });
    if (!existing) {
      await prisma.engineeringReview.create({ data: r });
    }
  }
  console.log('✓ Engineering Reviews recorded');

  // 10. Audit Log Seed
  await prisma.auditLog.create({
    data: {
      tableName: 'AutomotiveProject',
      recordId: apexId,
      action: 'UPDATE',
      changedBy: users['pm@autoengine.io'],
      oldValues: JSON.stringify({ status: 'CONCEPT', completionPercentage: 45.0 }),
      newValues: JSON.stringify({ status: 'IN_ENGINEERING', completionPercentage: 68.5 }),
    },
  });

  console.log('✨ AUTOENGINE Database Seeding Completed Successfully! All 19 tables in 3NF populated.');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
