export interface PinVerificationResponse {
  valid: boolean;
  message: string;
  enterpriseTheme?: EnterpriseThemeData;
}

export interface EnterpriseThemeData {
  enterpriseId: number;
  enterpriseName: string;
  primaryColor: string;
  secondaryColor: string;
  logoUrl: string;
}
