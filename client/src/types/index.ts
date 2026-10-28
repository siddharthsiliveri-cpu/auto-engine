export interface Role {
  id: string;
  name: 'ADMIN' | 'PROJECT_MANAGER' | 'ENGINEER' | 'DESIGNER' | 'CUSTOMER';
  description: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'PROJECT_MANAGER' | 'ENGINEER' | 'DESIGNER' | 'CUSTOMER';
  avatarUrl?: string;
}

export interface VehicleSpecification {
  id: string;
  variantId: string;
  rangeKm: number;
  acceleration0100: number;
  topSpeedKmh: number;
  peakPowerKw: number;
  batteryKwh: number;
  curbWeightKg: number;
  dragCoefficient: number;
}

export interface Supplier {
  id: string;
  supplierCode: string;
  name: string;
  tierLevel: string;
  country: string;
  contactEmail: string;
  rating: number;
}

export interface ComponentCategory {
  id: string;
  code: string;
  name: string;
  icon: string;
  description: string;
  _count?: { components: number };
}

export interface ComponentSpecification {
  id: string;
  specKey: string;
  specValue: string;
  unit?: string;
}

export interface Component {
  id: string;
  categoryId: string;
  partNumber: string;
  name: string;
  description: string;
  manufacturer: string;
  material?: string;
  dimensions?: string;
  weightKg: number;
  costUsd: number;
  status: 'APPROVED' | 'IN_REVIEW' | 'PROTOTYPE' | 'DEPRECATED';
  meshType: string;
  category?: ComponentCategory;
  suppliers?: Array<{ supplier: Supplier; leadTimeDays: number; unitCost: number }>;
  specifications?: ComponentSpecification[];
}

export interface VehicleVariant {
  id: string;
  modelId: string;
  variantCode: string;
  name: string;
  drivetrain: string;
  basePrice: number;
  status: string;
  model?: VehicleModel;
  specifications?: VehicleSpecification;
  components?: Array<{ component: Component; isStandard: boolean; isOptional: boolean }>;
}

export interface VehicleModel {
  id: string;
  projectId: string;
  modelCode: string;
  name: string;
  manufacturer?: string;
  category?: string;
  imagePath?: string;
  segment: string;
  year: number;
  description: string;
  variants?: VehicleVariant[];
  project?: AutomotiveProject;
}

export interface ProjectMilestone {
  id: string;
  projectId: string;
  title: string;
  description: string;
  phase: string;
  targetDate: string;
  isCompleted: boolean;
  completedAt?: string;
  weight: number;
}

export interface EngineeringReview {
  id: string;
  projectId: string;
  reviewerId: string;
  title: string;
  reviewType: string;
  status: 'PENDING' | 'APPROVED' | 'REVISION_REQUIRED';
  score?: number;
  comments: string;
  reviewDate: string;
  reviewer?: { firstName: string; lastName: string; email: string };
  project?: AutomotiveProject;
}

export interface AutomotiveProject {
  id: string;
  projectCode: string;
  name: string;
  description: string;
  status: 'CONCEPT' | 'IN_ENGINEERING' | 'PROTOTYPING' | 'TESTING' | 'APPROVED';
  budget: number;
  startDate: string;
  targetEndDate: string;
  completionPercentage: number;
  vehicleModels?: VehicleModel[];
  projectMembers?: Array<{ user: User; assignedRole: string }>;
  milestones?: ProjectMilestone[];
  reviews?: EngineeringReview[];
}

export interface VehicleConfiguration {
  id: string;
  variantId: string;
  userId: string;
  configCode: string;
  name: string;
  totalPrice: number;
  totalWeight: number;
  calculatedRange: number;
  status: string;
  createdAt: string;
  variant?: VehicleVariant;
  user?: User;
  components?: Array<{ component: Component; colorOverride?: string }>;
}
