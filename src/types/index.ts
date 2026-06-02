export type UserRole = 'Owner' | 'Admin' | 'Member';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  createdAt: Date;
}

export interface Gym {
  id: string;
  ownerId: string;
  name: string;
  address: string;
  phone?: string;
  email?: string;
  openingTime: string;
  closingTime: string;
  isActive: boolean;
}

export interface Member {
  id: string;
  userId: string;
  gymId: string;
  displayId: string;
  name: string;
  email: string;
  phone?: string;
  joinDate: Date;
  subscriptionStatus?: 'active' | 'expired' | 'pending';
}

export interface Package {
  id: string;
  gymId: string;
  name: string;
  durationDays: number;
  price: number;
  features: string[];
  color: string;
}
