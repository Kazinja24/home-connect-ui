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
  available: boolean;
  landlordId: string;
}

export interface ViewingRequest {
  id: string;
  propertyId: string;
  tenantId: string;
  date: string;
  timeWindow: "morning" | "afternoon" | "evening";
  status: "pending" | "approved" | "rejected";
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
  houseRules: string[];
  specialConditions: string;
  acknowledged: boolean;
}

export type RequestStatus = "pending" | "approved" | "rejected";
