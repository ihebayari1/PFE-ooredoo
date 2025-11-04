export interface RegisterRequest {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  pinHash: string;
  userType: UserType;
}

export enum UserType {
  INTERNAL = 'INTERNAL',
  POS = 'POS',
  USER_ADMIN = 'USER_ADMIN'
} 