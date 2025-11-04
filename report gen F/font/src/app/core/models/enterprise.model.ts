export interface Enterprise {
  id?: number;
  enterpriseName: string;
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  manager?: UserInfoDTO;
  usersInEnterprise?: UserInfoDTO[];
  usersCount?: number;
  creation_Date?: string;
  updatedAt_Date?: string;
}

export interface UserInfoDTO {
  id?: number;
  first_Name: string;
  last_Name: string;
  email: string;
  birthdate?: string;
  enabled?: boolean;
  accountLocked?: boolean;
  pos_Code?: string;
  userType?: UserType;
  role?: Role;
  created_Date?: string;
  updated_Date?: string;
}

export interface User {
  id?: number;
  first_Name: string;
  last_Name: string;
  email: string;
  birthdate?: string;
  enabled: boolean;
  accountLocked: boolean;
  pos_Code?: string;
  userType?: UserType;
  pin?: string;
  role?: Role;
  enterprise?: Enterprise;
  pos?: POS;
  created_Date?: string;
  updated_Date?: string;
}

export interface Role {
  id?: number;
  name: string;
  actions?: RoleAction[];
  users?: User[];
  created_Date?: string;
  updated_Date?: string;
}

export interface RoleAction {
  id?: number;
  actionKey: string;
  description?: string;
  endpointPattern?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface POS {
  id?: number;
  posName: string;
  codeOfPOS: string;
  headOfPOS?: User;
  sector?: Sector;
  users?: User[];
  creation_Date?: string;
  updatedAt_Date?: string;
}

export interface Sector {
  id?: number;
  sectorName: string;
  headOfSector?: User;
  zone?: Zone;
  posInSector?: POS[];
  creation_Date?: string;
  updatedAt_Date?: string;
}

export interface Zone {
  id?: number;
  zoneName: string;
  headOfZone?: User;
  region?: Region;
  sectors?: Sector[];
  creationDate?: string;
  updatedAt_Date?: string;
}

export interface Region {
  id?: number;
  regionName: string;
  headOfRegion?: User;
  zones?: Zone[];
  creation_Date?: string;
  updatedAt_Date?: string;
}

export enum UserType {
  INTERNAL = 'INTERNAL',
  POS = 'POS',
  USER_ADMIN = 'USER_ADMIN'
}

export interface CreateEnterpriseRequest {
  enterpriseName: string;
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  managerId?: number;
}

export interface UpdateEnterpriseRequest {
  enterpriseName?: string;
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  managerId?: number;
}

export interface AssignUserToEnterpriseRequest {
  enterpriseId: number;
  userId: number;
}
