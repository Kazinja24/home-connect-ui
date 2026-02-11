export type UserRole = "tenant" | "landlord" | "admin";

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
}

export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  bedrooms: number;
  propertyType: string;
  amenities: string[];
  houseRules: string[];
  images: string[];
  status: string; // "available" | "occupied" | "maintenance" etc.
  owner: string; // user ID of landlord
  created_at: string;
}

export interface ViewingRequest {
  id: string;
  propertyId: string;
  tenantId: string;
  date: string;
  timeWindow: "morning" | "afternoon" | "evening";
  status: "pending" | "approved" | "rejected";
  created_at: string;
}

export interface Application {
  id: string;
  propertyId: string;
  tenantId: string;
  employmentStatus: string;
  lengthOfStay: string;
  occupants: number;
  status: "pending" | "approved" | "rejected";
}

export interface LeaseAgreement {
  id: string;
  propertyId: string;
  tenantId: string;
  landlordId: string;
  status: string; // "draft" | "active" | "signed" | "terminated"
  houseRules: string[];
  specialConditions: string;
  signed_at: string | null;
  terminated_at: string | null;
  created_at: string;
}

export interface Payment {
  id: string;
  propertyId: string;
  tenantId: string;
  amount: number;
  status: "pending" | "completed" | "failed";
  reference: string;
  created_at: string;
}

export type RequestStatus = "pending" | "approved" | "rejected";
