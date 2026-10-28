import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('⚡ AUTOENGINE: Seeding enterprise automotive digital engineering database...');

  // 1. Roles
  const rolesData = [
    { name: 'ADMIN', description: 'Full access to projects, telemetry, database architecture, and team administration.' },
    { name: 'CUSTOMER', description: 'Customer platform account with 3D studio, digital twin, project showcase, and vehicle configurator access.' },
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
  const siddharthPasswordHash = await bcrypt.hash('12345678', 10);
  const passwordHash = siddharthPasswordHash;
  const customerPasswordHash = await bcrypt.hash('customer1234', 10);
  const usersData = [
    {
      email: 'siddharth@autoengine.io',
      passwordHash: siddharthPasswordHash,
      firstName: 'Siddharth',
      lastName: 'Admin',
      roleId: roles['ADMIN'],
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
    },
    {
      email: 'admin@autoengine.io',
      passwordHash: siddharthPasswordHash,
      firstName: 'Siddharth',
      lastName: 'Admin',
      roleId: roles['ADMIN'],
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
    },
    {
      email: 'customer@autoengine.io',
      passwordHash: customerPasswordHash,
      firstName: 'Alex',
      lastName: 'Morgan',
      roleId: roles['CUSTOMER'],
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&q=80',
    },
    {
      email: 'client@autoengine.io',
      passwordHash: customerPasswordHash,
      firstName: 'Marcus',
      lastName: 'Cole',
      roleId: roles['CUSTOMER'],
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
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
      update: { firstName: u.firstName, lastName: u.lastName, roleId: u.roleId, passwordHash: u.passwordHash },
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
    { code: 'ENGINE', name: 'Internal Combustion Engines & Turbos', icon: 'Flame', description: 'High-revving twin-turbo flat-six, biturbo V8, naturally aspirated V10, and V12 engines.' },
    { code: 'TRANSMISSION', name: 'Transmissions & Drivetrains', icon: 'Settings2', description: 'Dual-clutch PDK, AMG SPEEDSHIFT, M Steptronic, and 4x4 transfer cases.' },
    { code: 'EXHAUST', name: 'Exhaust Systems', icon: 'Wind', description: 'Titanium lightweight active valve sport exhaust systems and venturi quad tips.' },
    { code: 'BODY', name: 'Body Panels & Spoilers', icon: 'Layers', description: 'Aerodynamic carbon fiber body panels, hoods, doors, diffusers, and GT wings.' },
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
    { supplierCode: 'SUP-PIRELLI-09', name: 'Pirelli Motorsport & Performance', tierLevel: 'Tier 1', country: 'Italy', contactEmail: 'racing@pirelli.com', rating: 4.9 },
    { supplierCode: 'SUP-AKRAP-10', name: 'Akrapovič Titanium Engineering', tierLevel: 'Tier 1', country: 'Slovenia', contactEmail: 'exhaust@akrapovic.com', rating: 5.0 },
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

  // 7. Vehicle Models & Variants (All 9 Manufacturers + Apex Platform)
  const vehicleSeedData = [
    {
      modelCode: 'POR-911-TURBOS',
      name: '911 Turbo S',
      manufacturer: 'Porsche',
      category: 'Supercar',
      segment: 'Rear-Engine Sports Coupe',
      year: 2025,
      description: 'Iconic 3.7L twin-turbo flat-six delivering 640 hp with active aerodynamics, rear-axle steering, and launch control.',
      imagePath: '/models/porsche-911/preview.jpg',
      variantCode: 'POR-911-TS-2025',
      variantName: '911 Turbo S Coupe',
      drivetrain: 'AWD Twin-Turbo Flat-6',
      basePrice: 232000,
      specs: { rangeKm: 580, acceleration0100: 2.6, topSpeedKmh: 330, peakPowerKw: 478, batteryKwh: 0, curbWeightKg: 1640, dragCoefficient: 0.33 },
      threeD: { meshName: 'Porsche 911 Turbo S High-Precision Mesh', filePath: '/models/porsche-911/vehicle.glb', verticesCount: 142500 }
    },
    {
      modelCode: 'MB-AMG-GT63',
      name: 'AMG GT',
      manufacturer: 'Mercedes-Benz',
      category: 'Grand Tourer',
      segment: 'V8 Front-Mid Coupe',
      year: 2025,
      description: 'Handcrafted 4.0L V8 Biturbo with AMG Performance 4MATIC+ all-wheel drive and active roll stabilization.',
      imagePath: '/models/mercedes-amg/preview.jpg',
      variantCode: 'MB-GT63-2025',
      variantName: 'AMG GT 63 4MATIC+ Coupe',
      drivetrain: '4MATIC+ V8 Biturbo',
      basePrice: 178000,
      specs: { rangeKm: 520, acceleration0100: 3.1, topSpeedKmh: 315, peakPowerKw: 430, batteryKwh: 0, curbWeightKg: 1890, dragCoefficient: 0.31 },
      threeD: { meshName: 'Mercedes-AMG GT High-Precision Mesh', filePath: '/models/mercedes-amg/vehicle.glb', verticesCount: 138000 }
    },
    {
      modelCode: 'BMW-M4-COMP',
      name: 'M4 Competition',
      manufacturer: 'BMW',
      category: 'Performance Coupe',
      segment: 'Track-Focused Sports Coupe',
      year: 2025,
      description: 'Precision track weapon driven by a 3.0L BMW M TwinPower Turbo inline 6-cylinder with 503 hp and M xDrive.',
      imagePath: '/models/bmw-m4/preview.jpg',
      variantCode: 'BMW-M4C-2025',
      variantName: 'M4 Competition xDrive Coupe',
      drivetrain: 'M xDrive TwinPower I6',
      basePrice: 86000,
      specs: { rangeKm: 560, acceleration0100: 3.4, topSpeedKmh: 290, peakPowerKw: 375, batteryKwh: 0, curbWeightKg: 1780, dragCoefficient: 0.34 },
      threeD: { meshName: 'BMW M4 Competition High-Precision Mesh', filePath: '/models/bmw-m4/vehicle.glb', verticesCount: 129000 }
    },
    {
      modelCode: 'AUDI-R8-V10',
      name: 'R8 V10 Performance',
      manufacturer: 'Audi',
      category: 'Supercar',
      segment: 'Mid-Engine V10 Coupe',
      year: 2024,
      description: 'Naturally aspirated 5.2L V10 FSI engine with intoxicating 8,700 RPM redline and motorsport-derived Quattro all-wheel drive.',
      imagePath: '/models/audi-r8/preview.jpg',
      variantCode: 'AUDI-R8-PERF',
      variantName: 'R8 V10 Performance Quattro',
      drivetrain: 'Quattro Mid-Engine 5.2L V10',
      basePrice: 209000,
      specs: { rangeKm: 480, acceleration0100: 3.1, topSpeedKmh: 331, peakPowerKw: 449, batteryKwh: 0, curbWeightKg: 1595, dragCoefficient: 0.36 },
      threeD: { meshName: 'Audi R8 V10 Performance High-Precision Mesh', filePath: '/models/audi-r8/vehicle.glb', verticesCount: 135000 }
    },
    {
      modelCode: 'MAH-THAR-4X4',
      name: 'Thar 4x4',
      manufacturer: 'Mahindra',
      category: 'Off-Road SUV',
      segment: 'Adventure Body-on-Frame 4x4',
      year: 2025,
      description: 'Iconic authentic 4x4 off-roader with shift-on-the-fly transfer case, mechanical locking differential, and 650mm water wading capacity.',
      imagePath: '/models/mahindra-thar/preview.jpg',
      variantCode: 'MAH-THAR-EARTH',
      variantName: 'Thar Earth Edition 4x4 AT',
      drivetrain: 'Shift-on-the-fly 4x4 Turbo Diesel',
      basePrice: 24000,
      specs: { rangeKm: 750, acceleration0100: 10.2, topSpeedKmh: 155, peakPowerKw: 112, batteryKwh: 0, curbWeightKg: 1750, dragCoefficient: 0.44 },
      threeD: { meshName: 'Mahindra Thar 4x4 Rugged High-Precision Mesh', filePath: '/models/mahindra-thar/vehicle.glb', verticesCount: 118000 }
    },
    {
      modelCode: 'FORD-MUSTANG-GT',
      name: 'Mustang GT',
      manufacturer: 'Ford',
      category: 'Muscle Car',
      segment: 'American V8 Fastback',
      year: 2025,
      description: 'Raw American performance featuring the Gen-4 5.0L Coyote V8 with dual throttle bodies and active valve performance exhaust.',
      imagePath: '/images/home-hero-car.jpg',
      variantCode: 'FORD-MUST-GT25',
      variantName: 'Mustang GT Fastback V8 Premium',
      drivetrain: 'RWD Gen-4 5.0L Coyote V8',
      basePrice: 47000,
      specs: { rangeKm: 510, acceleration0100: 4.2, topSpeedKmh: 250, peakPowerKw: 362, batteryKwh: 0, curbWeightKg: 1740, dragCoefficient: 0.35 },
      threeD: { meshName: 'Ford Mustang GT Fastback High-Precision Mesh', filePath: '/models/ford-mustang/vehicle.glb', verticesCount: 132000 }
    },
    {
      modelCode: 'RING-KINGPIN-69',
      name: 'Ringbrothers KINGPIN',
      manufacturer: 'Ringbrothers',
      category: 'Restomod Muscle',
      segment: 'Widebody Supercharged Restomod',
      year: 1969,
      description: 'Hand-crafted 820 HP restomod based on a 1969 Mustang Mach 1. Supercharged 5.0L Coyote V8, Bowler 6-speed manual, Roadster Shop FAST TRACK Stage III chassis, and bespoke carbon fiber aero.',
      imagePath: '/images/mustang-kingpin.jpg',
      variantCode: 'RING-KINGPIN-V8SC',
      variantName: 'KingPin 820HP Supercharged Edition',
      drivetrain: 'RWD Whipple-Supercharged 5.0L Coyote V8 + Bowler 6-Speed Manual',
      basePrice: 850000,
      specs: { rangeKm: 460, acceleration0100: 3.2, topSpeedKmh: 335, peakPowerKw: 603, batteryKwh: 0, curbWeightKg: 1520, dragCoefficient: 0.34 },
      threeD: { meshName: 'Ringbrothers Kingpin 1969 Mustang Mesh', filePath: '/models/ford-mustang/vehicle.glb', verticesCount: 145000 }
    },

    {
      modelCode: 'RR-PHANTOM-EXT',
      name: 'Phantom',
      manufacturer: 'Rolls-Royce',
      category: 'Ultra-Luxury',
      segment: 'Flagship Extended Saloon',
      year: 2025,
      description: 'The pinnacle of bespoke automotive luxury with twin-turbocharged 6.75L V12, coach doors, and Magic Carpet Ride suspension.',
      imagePath: '/models/rolls-royce-phantom/preview.jpg',
      variantCode: 'RR-PHAN-SER2',
      variantName: 'Phantom Extended Series II',
      drivetrain: 'RWD Twin-Turbo 6.75L V12',
      basePrice: 540000,
      specs: { rangeKm: 620, acceleration0100: 5.1, topSpeedKmh: 250, peakPowerKw: 420, batteryKwh: 0, curbWeightKg: 2560, dragCoefficient: 0.38 },
      threeD: { meshName: 'Rolls-Royce Phantom Series II High-Precision Mesh', filePath: '/models/rolls-royce-phantom/vehicle.glb', verticesCount: 154000 }
    },
    {
      modelCode: 'FER-SF90-STRAD',
      name: 'SF90 Stradale',
      manufacturer: 'Ferrari',
      category: 'Hypercar',
      segment: 'PHEV Mid-Engine Hybrid',
      year: 2025,
      description: 'Pioneering PHEV architecture combining a 780 cv twin-turbo V8 with three electric motors generating 1,000 cv of ferocious acceleration.',
      imagePath: '/models/ferrari-sf90/preview.jpg',
      variantCode: 'FER-SF90-FIOR',
      variantName: 'SF90 Stradale Assetto Fiorano',
      drivetrain: 'e-4WD Hybrid Twin-Turbo V8',
      basePrice: 528000,
      specs: { rangeKm: 420, acceleration0100: 2.5, topSpeedKmh: 340, peakPowerKw: 735, batteryKwh: 7.9, curbWeightKg: 1570, dragCoefficient: 0.32 },
      threeD: { meshName: 'Ferrari SF90 Stradale High-Precision Mesh', filePath: '/models/ferrari-sf90/vehicle.glb', verticesCount: 162000 }
    },
    {
      modelCode: 'LAM-HURACAN-TEC',
      name: 'Huracán',
      manufacturer: 'Lamborghini',
      category: 'Supercar',
      segment: 'V10 Purist Sports Coupe',
      year: 2024,
      description: 'Naturally aspirated 5.2L V10 channeling 640 CV to the rear wheels with LDVI predictive logic and extreme downforce aerodynamic package.',
      imagePath: '/models/lamborghini-huracan/preview.jpg',
      variantCode: 'LAM-HUR-TEC24',
      variantName: 'Huracán Tecnica RWD',
      drivetrain: 'RWD LDVI 5.2L Naturally Aspirated V10',
      basePrice: 245000,
      specs: { rangeKm: 460, acceleration0100: 3.2, topSpeedKmh: 325, peakPowerKw: 470, batteryKwh: 0, curbWeightKg: 1379, dragCoefficient: 0.35 },
      threeD: { meshName: 'Lamborghini Huracán Tecnica High-Precision Mesh', filePath: '/models/lamborghini-huracan/vehicle.glb', verticesCount: 148000 }
    },
    {
      modelCode: 'AE-APEX-GT',
      name: 'AE-Apex Hyper-GT',
      manufacturer: 'AUTOENGINE',
      category: 'Hyper-GT',
      segment: 'Hyper-GT EV',
      year: 2026,
      description: 'Futuristic high-downforce aerodynamic grand tourer powered by next-generation silicon-carbide 800V inverters.',
      imagePath: '/models/porsche-911/preview.jpg',
      variantCode: 'APEX-PERF-AWD',
      variantName: 'Apex Performance Dual-Motor AWD',
      drivetrain: 'Dual-Motor AWD',
      basePrice: 165000,
      specs: { rangeKm: 520, acceleration0100: 3.2, topSpeedKmh: 320, peakPowerKw: 500, batteryKwh: 82.0, curbWeightKg: 1920, dragCoefficient: 0.208 },
      threeD: { meshName: 'Apex Hyper-GT Concept 3D Mesh', filePath: '/models/porsche-911/vehicle.glb', verticesCount: 130000 }
    },
    {
      modelCode: 'AE-TERRA-SUV',
      name: 'AE-Terra Electric SUV',
      manufacturer: 'AUTOENGINE',
      category: 'Electric SUV',
      segment: 'Luxury Adventure SUV',
      year: 2026,
      description: 'Luxury adventure sport utility vehicle featuring adaptive pneumatic suspension and active differential locks.',
      imagePath: '/models/mahindra-thar/preview.jpg',
      variantCode: 'TERRA-ADV-QUAD',
      variantName: 'Terra Adventure Quad-Motor',
      drivetrain: 'Quad-Motor AWD',
      basePrice: 125000,
      specs: { rangeKm: 580, acceleration0100: 3.8, topSpeedKmh: 240, peakPowerKw: 600, batteryKwh: 120.0, curbWeightKg: 2450, dragCoefficient: 0.29 },
      threeD: { meshName: 'Terra Electric SUV 3D Mesh', filePath: '/models/mahindra-thar/vehicle.glb', verticesCount: 120000 }
    },
    {
      modelCode: 'AE-PULSE-SEDAN',
      name: 'AE-Pulse Executive Sedan',
      manufacturer: 'AUTOENGINE',
      category: 'Performance Sedan',
      segment: 'Executive Luxury Sedan',
      year: 2026,
      description: 'Aerodynamic executive electric cruiser offering class-leading 640 km highway range and whisper-quiet cabin acoustics.',
      imagePath: '/models/mercedes-amg/preview.jpg',
      variantCode: 'PULSE-LONG-RWD',
      variantName: 'Pulse Long-Range Executive',
      drivetrain: 'Rear-Wheel Drive Ultra-Efficiency',
      basePrice: 92000,
      specs: { rangeKm: 640, acceleration0100: 4.1, topSpeedKmh: 260, peakPowerKw: 380, batteryKwh: 95.0, curbWeightKg: 2050, dragCoefficient: 0.21 },
      threeD: { meshName: 'Pulse Executive Sedan 3D Mesh', filePath: '/models/mercedes-amg/vehicle.glb', verticesCount: 125000 }
    }
  ];

  const seededVariants: Record<string, string> = {};

  for (const vData of vehicleSeedData) {
    const vModel = await prisma.vehicleModel.upsert({
      where: { modelCode: vData.modelCode },
      update: {
        name: vData.name,
        manufacturer: vData.manufacturer,
        category: vData.category,
        segment: vData.segment,
        year: vData.year,
        description: vData.description,
        imagePath: vData.imagePath,
      },
      create: {
        projectId: apexId,
        modelCode: vData.modelCode,
        name: vData.name,
        manufacturer: vData.manufacturer,
        category: vData.category,
        segment: vData.segment,
        year: vData.year,
        description: vData.description,
        imagePath: vData.imagePath,
      },
    });

    const vVariant = await prisma.vehicleVariant.upsert({
      where: { variantCode: vData.variantCode },
      update: {
        name: vData.variantName,
        drivetrain: vData.drivetrain,
        basePrice: vData.basePrice,
      },
      create: {
        modelId: vModel.id,
        variantCode: vData.variantCode,
        name: vData.variantName,
        drivetrain: vData.drivetrain,
        basePrice: vData.basePrice,
        status: 'ACTIVE',
      },
    });
    seededVariants[vData.modelCode] = vVariant.id;

    await prisma.vehicleSpecification.upsert({
      where: { variantId: vVariant.id },
      update: vData.specs,
      create: {
        variantId: vVariant.id,
        ...vData.specs,
      },
    });

    const existing3D = await prisma.threeDModel.findFirst({
      where: { variantId: vVariant.id },
    });
    if (!existing3D) {
      await prisma.threeDModel.create({
        data: {
          variantId: vVariant.id,
          meshName: vData.threeD.meshName,
          filePath: vData.threeD.filePath,
          fileFormat: 'GLTF/Procedural',
          verticesCount: vData.threeD.verticesCount,
          lodLevels: 3,
          renderProperties: JSON.stringify({ pbr: true, shadows: true, explodedSupported: true }),
        },
      });
    }
  }

  // Also support Apex Cyber Track Edition
  const apexTrackVariant = await prisma.vehicleVariant.upsert({
    where: { variantCode: 'APEX-TRACK-TRI' },
    update: {},
    create: {
      modelId: (await prisma.vehicleModel.findUnique({ where: { modelCode: 'AE-APEX-GT' } }))!.id,
      variantCode: 'APEX-TRACK-TRI',
      name: 'Apex Cyber Track Edition Tri-Motor',
      drivetrain: 'Tri-Motor Performance AWD',
      basePrice: 215000,
      status: 'ACTIVE',
    },
  });
  seededVariants['APEX-TRACK-TRI'] = apexTrackVariant.id;

  await prisma.vehicleSpecification.upsert({
    where: { variantId: apexTrackVariant.id },
    update: {},
    create: {
      variantId: apexTrackVariant.id,
      rangeKm: 610,
      acceleration0100: 2.1,
      topSpeedKmh: 350,
      peakPowerKw: 750,
      batteryKwh: 105.0,
      curbWeightKg: 2010,
      dragCoefficient: 0.198,
    },
  });

  const apexPerfVariant = { id: seededVariants['AE-APEX-GT'] };
  console.log('✓ All 9 Automotive Models + Variants & Specs seeded successfully');

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
    // ==========================================
    // 3D MODIFICATION COMPONENTS (WHEELS, TYRES, SPOILERS, BRAKES, ENGINES, INTERIORS)
    // ==========================================
    // Wheels
    {
      partNumber: 'CMP-WHL-FORGED-5SPK',
      categoryId: categories['WHEELS'],
      name: 'Forged 5-Spoke Lightweight Wheels',
      description: 'Ultra-rigid lightweight monoblock forged alloy with concave split 5-spoke design for optimal brake cooling.',
      manufacturer: 'Bosch Mobility Solutions',
      weightKg: 34.0,
      costUsd: 3200.0,
      status: 'APPROVED',
      meshType: 'wheels',
      supplierCode: 'SUP-BOSCH-01',
      specs: [
        { specKey: 'Construction', specValue: 'Forged 6061-T6 Aluminum', unit: '' },
        { specKey: 'Fitment', specValue: 'Front 20" / Rear 21"', unit: '' },
      ],
    },
    {
      partNumber: 'CMP-WHL-CENTERLOCK',
      categoryId: categories['WHEELS'],
      name: 'Centerlock Monoblock GT Wheels',
      description: 'Motorsport-derived single-nut central locking mechanism forged for extreme lateral track acceleration.',
      manufacturer: 'Brembo Racing & Performance',
      weightKg: 31.0,
      costUsd: 5800.0,
      status: 'APPROVED',
      meshType: 'wheels',
      supplierCode: 'SUP-BREMBO-02',
      specs: [
        { specKey: 'Locking System', specValue: 'Central Locking Nut', unit: '' },
        { specKey: 'Weight Savings', specValue: '4.2 kg per corner', unit: '' },
      ],
    },
    {
      partNumber: 'CMP-WHL-COMP-MULTI',
      categoryId: categories['WHEELS'],
      name: 'Multi-Spoke Competition Alloy Wheels',
      description: 'Fine-mesh geometric spoke architecture distributing brake heat and aerodynamic turbulence evenly.',
      manufacturer: 'Bosch Mobility Solutions',
      weightKg: 36.0,
      costUsd: 2800.0,
      status: 'APPROVED',
      meshType: 'wheels',
      supplierCode: 'SUP-BOSCH-01',
      specs: [{ specKey: 'Design', specValue: '15-Spoke Radial Symmetry', unit: '' }],
    },
    {
      partNumber: 'CMP-WHL-CARBON-AERO',
      categoryId: categories['WHEELS'],
      name: 'Carbon Aero Disc Wheels',
      description: 'Turbine-profile carbon fiber discs reducing rotational aerodynamic drag by up to 14% at 200 km/h.',
      manufacturer: 'Bosch Mobility Solutions',
      weightKg: 29.0,
      costUsd: 6400.0,
      status: 'APPROVED',
      meshType: 'wheels',
      supplierCode: 'SUP-BOSCH-01',
      specs: [{ specKey: 'Aerodynamic Drag Reduction', specValue: '14%', unit: '' }],
    },
    {
      partNumber: 'CMP-WHL-BEADLOCK-17',
      categoryId: categories['WHEELS'],
      name: '17" Rugged Beadlock Off-Road Wheels',
      description: 'True mechanical beadlock ring clamping tyre bead securely for rock crawling at single-digit tyre pressures.',
      manufacturer: 'Magna Steyr Vehicle Powertrains',
      weightKg: 46.0,
      costUsd: 2200.0,
      status: 'APPROVED',
      meshType: 'wheels',
      supplierCode: 'SUP-MAGNA-07',
      specs: [{ specKey: 'Beadlock Clamp', specValue: 'Dual Grade-8 Hardware', unit: '' }],
    },
    // Tyres
    {
      partNumber: 'CMP-TYR-CUP2R',
      categoryId: categories['TYRES'],
      name: 'Michelin Pilot Sport Cup 2 R Semi-Slick',
      description: 'Nürburgring record-setting ultra-high traction compound offering maximum dry pavement cornering grip.',
      manufacturer: 'Michelin EV Motorsport',
      weightKg: 40.0,
      costUsd: 2400.0,
      status: 'APPROVED',
      meshType: 'wheels',
      supplierCode: 'SUP-MICH-04',
      specs: [{ specKey: 'Treadwear', specValue: '140 (Track Semi-Slick)', unit: '' }],
    },
    {
      partNumber: 'CMP-TYR-PZERO-CORSA',
      categoryId: categories['TYRES'],
      name: 'Pirelli P-Zero Corsa Motorsport',
      description: 'Custom tread compound formulated in Formula 1 telemetry for razor-sharp steering turn-in response.',
      manufacturer: 'Pirelli Motorsport & Performance',
      weightKg: 41.0,
      costUsd: 2100.0,
      status: 'APPROVED',
      meshType: 'wheels',
      supplierCode: 'SUP-PIRELLI-09',
      specs: [{ specKey: 'Speed Index', specValue: '(Y) > 300 km/h', unit: '' }],
    },
    {
      partNumber: 'CMP-TYR-WRANGLER',
      categoryId: categories['TYRES'],
      name: 'Goodyear Wrangler Duratrac All-Terrain Tyres',
      description: 'Aggressive self-cleaning shoulder tread blocks designed for deep mud, loose sand, and sharp rock trails.',
      manufacturer: 'Michelin EV Motorsport',
      weightKg: 52.0,
      costUsd: 1400.0,
      status: 'APPROVED',
      meshType: 'wheels',
      supplierCode: 'SUP-MICH-04',
      specs: [{ specKey: 'Terrain Rating', specValue: 'Mud & Snow (M+S) Rated', unit: '' }],
    },
    // Spoilers & Aero
    {
      partNumber: 'CMP-SPOILER-GT3',
      categoryId: categories['AERO'],
      name: 'GT3 Swan-Neck Carbon Aerodynamic Wing',
      description: 'Top-hung swan-neck pylons keeping underside airflow clean to generate up to 380 kg of clean downforce.',
      manufacturer: 'Bosch Mobility Solutions',
      weightKg: 12.0,
      costUsd: 5400.0,
      status: 'APPROVED',
      meshType: 'body_panels',
      supplierCode: 'SUP-BOSCH-01',
      specs: [{ specKey: 'Downforce', specValue: '380 kg @ 200 km/h', unit: '' }, { specKey: 'Angle of Attack', specValue: 'Adjustable 4-Stage', unit: '' }],
    },
    {
      partNumber: 'CMP-SPOILER-DUCKTAIL',
      categoryId: categories['AERO'],
      name: 'Heritage Carbon Ducktail Spoiler',
      description: 'Classic flared aerodynamic upsweep integrated seamlessly with rear body decklid for reduced high-speed lift.',
      manufacturer: 'Bosch Mobility Solutions',
      weightKg: 6.5,
      costUsd: 2200.0,
      status: 'APPROVED',
      meshType: 'body_panels',
      supplierCode: 'SUP-BOSCH-01',
      specs: [{ specKey: 'Lift Reduction', specValue: '42 kg @ 180 km/h', unit: '' }],
    },
    {
      partNumber: 'CMP-SPOILER-LIP',
      categoryId: categories['AERO'],
      name: 'Low-Drag OEM Carbon Lip Spoiler',
      description: 'Minimalist low-profile rear lip spoiler maintaining ultra-slippery drag coefficient while stabilizing airflow.',
      manufacturer: 'Bosch Mobility Solutions',
      weightKg: 3.2,
      costUsd: 1200.0,
      status: 'APPROVED',
      meshType: 'body_panels',
      supplierCode: 'SUP-BOSCH-01',
      specs: [{ specKey: 'Drag Impact', specValue: '+0.002 Cd', unit: '' }],
    },
    // Brakes & Calipers
    {
      partNumber: 'CMP-BRK-CC-YELLOW',
      categoryId: categories['BRAKES'],
      name: 'Porsche PCCB Carbon-Ceramic Matrix (Speed Yellow)',
      description: 'Cross-drilled carbon-ceramic brake discs with massive 10-piston front calipers in signature Porsche Speed Yellow.',
      manufacturer: 'Brembo Racing & Performance',
      weightKg: 30.0,
      costUsd: 9800.0,
      status: 'APPROVED',
      meshType: 'brakes',
      supplierCode: 'SUP-BREMBO-02',
      specs: [{ specKey: 'Front Disc Diameter', specValue: '420', unit: 'mm' }, { specKey: 'Color', specValue: 'Speed Yellow', unit: '' }],
    },
    {
      partNumber: 'CMP-BRK-SLOTTED-RED',
      categoryId: categories['BRAKES'],
      name: 'High-Friction Slotted Steel Brakes (Racing Red)',
      description: 'Curved slotted iron rotors with high thermal capacity and aggressive track bite paired with 6-piston Red calipers.',
      manufacturer: 'Brembo Racing & Performance',
      weightKg: 42.0,
      costUsd: 4600.0,
      status: 'APPROVED',
      meshType: 'brakes',
      supplierCode: 'SUP-BREMBO-02',
      specs: [{ specKey: 'Rotor Type', specValue: 'Directional Slotted Cast Iron', unit: '' }],
    },
    {
      partNumber: 'CMP-BRK-STEALTH-BLK',
      categoryId: categories['BRAKES'],
      name: 'Heavy-Duty Ventilated Brakes (Stealth Black)',
      description: 'Anodized stealth black monobloc calipers with dust-sealed pistons engineered for endurance and low brake dust.',
      manufacturer: 'Brembo Racing & Performance',
      weightKg: 38.0,
      costUsd: 3900.0,
      status: 'APPROVED',
      meshType: 'brakes',
      supplierCode: 'SUP-BREMBO-02',
      specs: [{ specKey: 'Finish', specValue: 'Cerakote Stealth Black', unit: '' }],
    },
    // Engines & Powertrains
    {
      partNumber: 'CMP-ENG-PORSCHE-F6',
      categoryId: categories['ENGINE'],
      name: '3.7L Twin-Turbo Flat-Six Boxer Engine',
      description: 'All-aluminum twin-turbocharged boxer 6-cylinder with variable turbine geometry (VTG) generating 640 hp and 800 Nm.',
      manufacturer: 'Magna Steyr Vehicle Powertrains',
      weightKg: 215.0,
      costUsd: 38000.0,
      status: 'APPROVED',
      meshType: 'engine',
      supplierCode: 'SUP-MAGNA-07',
      specs: [{ specKey: 'Power', specValue: '640 hp / 478 kW', unit: '' }, { specKey: 'Torque', specValue: '800 Nm', unit: '' }, { specKey: 'Max RPM', specValue: '7,200', unit: 'RPM' }],
    },
    {
      partNumber: 'CMP-ENG-AMG-V8',
      categoryId: categories['ENGINE'],
      name: 'Handcrafted AMG 4.0L V8 Biturbo Engine',
      description: 'One Man, One Engine built V8 with "hot inside V" turbocharger packaging providing instantaneous boost response.',
      manufacturer: 'Magna Steyr Vehicle Powertrains',
      weightKg: 209.0,
      costUsd: 32000.0,
      status: 'APPROVED',
      meshType: 'engine',
      supplierCode: 'SUP-MAGNA-07',
      specs: [{ specKey: 'Power', specValue: '577 hp / 430 kW', unit: '' }, { specKey: 'Torque', specValue: '800 Nm', unit: '' }],
    },
    {
      partNumber: 'CMP-ENG-BMW-S58',
      categoryId: categories['ENGINE'],
      name: '3.0L BMW M TwinPower Turbo Inline-6 (S58)',
      description: 'Forged crankshaft and 3D-printed cylinder head core delivering high-revving track durability and 503 hp.',
      manufacturer: 'Magna Steyr Vehicle Powertrains',
      weightKg: 198.0,
      costUsd: 22000.0,
      status: 'APPROVED',
      meshType: 'engine',
      supplierCode: 'SUP-MAGNA-07',
      specs: [{ specKey: 'Power', specValue: '503 hp / 375 kW', unit: '' }, { specKey: 'Max RPM', specValue: '7,200', unit: 'RPM' }],
    },
    {
      partNumber: 'CMP-ENG-AUDI-V10',
      categoryId: categories['ENGINE'],
      name: '5.2L Naturally Aspirated V10 FSI Engine',
      description: 'Pure acoustic perfection: Dry-sump lubricated 40-valve V10 reaching an exhilarating 8,700 RPM redline.',
      manufacturer: 'Magna Steyr Vehicle Powertrains',
      weightKg: 258.0,
      costUsd: 35000.0,
      status: 'APPROVED',
      meshType: 'engine',
      supplierCode: 'SUP-MAGNA-07',
      specs: [{ specKey: 'Power', specValue: '602 hp / 449 kW', unit: '' }, { specKey: 'Redline', specValue: '8,700', unit: 'RPM' }],
    },
    {
      partNumber: 'CMP-ENG-FORD-V8',
      categoryId: categories['ENGINE'],
      name: 'Gen-4 5.0L Coyote V8 Engine',
      description: 'High-flowing dual 80mm throttle bodies with forged steel connecting rods producing 486 hp of American muscle.',
      manufacturer: 'Magna Steyr Vehicle Powertrains',
      weightKg: 202.0,
      costUsd: 14500.0,
      status: 'APPROVED',
      meshType: 'engine',
      supplierCode: 'SUP-MAGNA-07',
      specs: [{ specKey: 'Power', specValue: '486 hp / 362 kW', unit: '' }, { specKey: 'Displacement', specValue: '5,038 cc', unit: '' }],
    },
    {
      partNumber: 'CMP-ENG-RR-V12',
      categoryId: categories['ENGINE'],
      name: '6.75L Twin-Turbo V12 Engine',
      description: 'Whisper-quiet ultra-refined 12-cylinder powerhouse providing effortless waftability with 900 Nm from 1,700 RPM.',
      manufacturer: 'Magna Steyr Vehicle Powertrains',
      weightKg: 310.0,
      costUsd: 48000.0,
      status: 'APPROVED',
      meshType: 'engine',
      supplierCode: 'SUP-MAGNA-07',
      specs: [{ specKey: 'Power', specValue: '563 hp / 420 kW', unit: '' }, { specKey: 'Torque', specValue: '900 Nm @ 1,700 RPM', unit: '' }],
    },
    {
      partNumber: 'CMP-ENG-FER-SF90',
      categoryId: categories['ENGINE'],
      name: 'Ferrari 4.0L V8 Twin-Turbo + Tri-Motor PHEV',
      description: 'V8 turbo producing 780 cv harmonized with three electric motors (RAC-e) producing total 1,000 cv hybrid thrust.',
      manufacturer: 'Magna Steyr Vehicle Powertrains',
      weightKg: 285.0,
      costUsd: 65000.0,
      status: 'APPROVED',
      meshType: 'engine',
      supplierCode: 'SUP-MAGNA-07',
      specs: [{ specKey: 'Total Combined Power', specValue: '1,000 cv / 735 kW', unit: '' }, { specKey: 'Electric Range', specValue: '25 km', unit: '' }],
    },
    {
      partNumber: 'CMP-ENG-LAM-V10',
      categoryId: categories['ENGINE'],
      name: '5.2L Naturally Aspirated V10 LDVI',
      description: 'Titanium intake valves and tuned exhaust tract creating an iconic Lamborghini soundtrack with 640 CV output.',
      manufacturer: 'Magna Steyr Vehicle Powertrains',
      weightKg: 250.0,
      costUsd: 39000.0,
      status: 'APPROVED',
      meshType: 'engine',
      supplierCode: 'SUP-MAGNA-07',
      specs: [{ specKey: 'Power', specValue: '640 CV / 470 kW', unit: '' }, { specKey: 'Max RPM', specValue: '8,500', unit: 'RPM' }],
    },
    {
      partNumber: 'CMP-ENG-THAR-D22',
      categoryId: categories['ENGINE'],
      name: 'mHawk 2.2L All-Terrain Turbo Diesel',
      description: 'Cast-iron cylinder block with variable geometry turbocharger engineered for high-altitude expedition torque.',
      manufacturer: 'Magna Steyr Vehicle Powertrains',
      weightKg: 195.0,
      costUsd: 7800.0,
      status: 'APPROVED',
      meshType: 'engine',
      supplierCode: 'SUP-MAGNA-07',
      specs: [{ specKey: 'Power', specValue: '150 hp / 112 kW', unit: '' }, { specKey: 'Torque', specValue: '320 Nm @ 1,600 RPM', unit: '' }],
    },
    // Interiors
    {
      partNumber: 'CMP-INT-OBSIDIAN-NAPPA',
      categoryId: categories['INTERIOR'],
      name: 'Obsidian Nappa Leather Interior with Cyan Stitching',
      description: 'Full-grain semi-aniline Nappa leather upholstery featuring contrast Quantum Cyan diamond quilting.',
      manufacturer: 'Recaro Automotive Engineering',
      weightKg: 32.0,
      costUsd: 5200.0,
      status: 'APPROVED',
      meshType: 'interior',
      supplierCode: 'SUP-RECARO-06',
      specs: [{ specKey: 'Leather Grade', specValue: 'Full Grain Semi-Aniline', unit: '' }],
    },
    {
      partNumber: 'CMP-INT-TRACK-ALCANTARA',
      categoryId: categories['INTERIOR'],
      name: 'Full Race Alcantara Interior with Matte Carbon Trim',
      description: 'Lightweight race-spec grip material covering steering wheel, bucket bolsters, and dashboard to eliminate sun glare.',
      manufacturer: 'Recaro Automotive Engineering',
      weightKg: 24.0,
      costUsd: 4800.0,
      status: 'APPROVED',
      meshType: 'interior',
      supplierCode: 'SUP-RECARO-06',
      specs: [{ specKey: 'Weight Savings', specValue: '8.0 kg vs Leather', unit: '' }],
    },
    {
      partNumber: 'CMP-INT-COGNAC-LEATHER',
      categoryId: categories['INTERIOR'],
      name: 'Hand-Stitched Cognac Tan Luxury Leather',
      description: 'Traditional European bespoke artisan leather treated with natural vegetable tannins and bookmatched open-pore wood.',
      manufacturer: 'Recaro Automotive Engineering',
      weightKg: 36.0,
      costUsd: 6800.0,
      status: 'APPROVED',
      meshType: 'interior',
      supplierCode: 'SUP-RECARO-06',
      specs: [{ specKey: 'Tannin Method', specValue: 'Natural Vegetable Dyed', unit: '' }],
    },
    // Exhausts
    {
      partNumber: 'CMP-EXH-AKRAP-TITAN',
      categoryId: categories['EXHAUST'],
      name: 'Akrapovič Ultralight Titanium Valved Performance Exhaust',
      description: 'Hydroformed aerospace-grade titanium pipes with active sound valves and carbon fiber coated exhaust tips.',
      manufacturer: 'Akrapovič Titanium Engineering',
      weightKg: 14.5,
      costUsd: 7900.0,
      status: 'APPROVED',
      meshType: 'exhaust',
      supplierCode: 'SUP-AKRAP-10',
      specs: [{ specKey: 'Weight Reduction', specValue: '18.5 kg vs Stainless', unit: '' }, { specKey: 'Acoustic Sound Profile', specValue: 'Valved Dual-Mode', unit: '' }],
    },
    {
      partNumber: 'CMP-EXH-QUAD-BLACK',
      categoryId: categories['EXHAUST'],
      name: 'Black Chrome Quad-Exit Venturi Sport Exhaust',
      description: 'Staggered dual oval quad outlets with high-flow resonators providing deep resonant exhaust tone.',
      manufacturer: 'Akrapovič Titanium Engineering',
      weightKg: 22.0,
      costUsd: 3400.0,
      status: 'APPROVED',
      meshType: 'exhaust',
      supplierCode: 'SUP-AKRAP-10',
      specs: [{ specKey: 'Finish', specValue: 'PVD Black Chrome', unit: '' }],
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

    // Attach to All Seeded Vehicle Variants
    for (const vId of Object.values(seededVariants)) {
      await prisma.variantComponent.upsert({
        where: { variantId_componentId: { variantId: vId, componentId: comp.id } },
        update: {},
        create: {
          variantId: vId,
          componentId: comp.id,
          isStandard: true,
          isOptional: false,
        },
      });
    }
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

  // 11. Restomod Vehicle Seeding (Ringbrothers KINGPIN - 1969 Mustang Restomod)
  await prisma.restomodVehicle.upsert({
    where: { buildName: 'Ringbrothers KINGPIN' },
    update: {
      imagePath: '/images/mustang-kingpin.jpg',
      horsepower: 820,
      torqueNm: 915,
      estimatedValueUsd: 850000.0,
    },
    create: {
      buildName: 'Ringbrothers KINGPIN',
      codename: 'RB-1969-KINGPIN',
      donorMake: 'Ford',
      donorModel: 'Mustang Mach 1 Fastback',
      donorYear: 1969,
      builder: 'Ringbrothers',
      leadBuilders: 'Jim Ring & Mike Ring',
      buildHours: 5500,
      unveiledAt: 'SEMA Show, Las Vegas',
      engine: 'Wegner Motorsports 5.0L Coyote 32V V8',
      supercharger: 'Whipple 2.9L Twin-Screw Supercharger',
      horsepower: 820,
      torqueNm: 915,
      transmission: 'Bowler Carbon Edition 6-Speed Manual',
      chassis: 'Roadster Shop FAST TRACK Stage III Custom Unibody Conversion',
      suspension: 'Roadster Shop Independent Front & Rear Suspension (IRS)',
      dampers: 'Fox Racing RS SV Single-Adjustable Aluminum Coil-Overs',
      brakesFront: 'Brembo 6-Piston Monobloc Calipers with 15.0" Carbon-Ceramic Rotors',
      brakesRear: 'Brembo 4-Piston Monobloc Calipers with 14.0" Carbon-Ceramic Rotors',
      caliperColor: 'Quantum Cyan / Brembo Blue',
      wheelsFront: 'HRE Vintage Series 517 Forged 3-Piece 19x10"',
      wheelsRear: 'HRE Vintage Series 517 Forged 3-Piece 20x13"',
      tiresFront: 'Michelin Pilot Sport 4 S 295/35R19',
      tiresRear: 'Michelin Pilot Sport 4 S 345/30R20',
      exhaust: 'Custom Ringbrothers Mandrel-Bent Headers + Flowmaster Super 44 Dual Stainless Exhaust',
      bodyWideningFrontIn: 2.0,
      bodyWideningRearIn: 3.5,
      wheelbaseStretchIn: 1.5,
      carbonFiberParts: 'Carbon fiber shaker hood scoop, front splitter, radiator surround, rocker panels, rear diffuser, and decklid spoiler',
      paintName: 'Bootleg Black',
      paintCode: 'BASF Glasurit GM 8555',
      curbWeightKg: 1520.0,
      acceleration0100: 3.2,
      topSpeedKmh: 335,
      estimatedValueUsd: 850000.0,
      imagePath: '/images/mustang-kingpin.jpg',
    },
  });
  console.log('✓ Restomod Vehicle (Ringbrothers KINGPIN 1969 Mustang) recorded');

  console.log('✨ AUTOENGINE Database Seeding Completed Successfully! All relational tables populated.');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
