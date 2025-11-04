import { UserInfoDTO } from './enterprise.model';

export interface Flash {
  id?: number;
  title: string;
  isActive?: boolean;
  createdBy?: UserInfoDTO;
  files?: FlashFile[];
  filesCount?: number;
  creation_Date?: string;
  updatedAt_Date?: string;
}

export interface FlashFile {
  id?: number;
  originalFileName: string;
  storedFileName?: string;
  fileType: string;
  fileSize?: number;
  filePath?: string;
  fileCategory?: FileCategory;
  downloadUrl?: string;
}

export enum FileCategory {
  PDF = 'PDF',
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO'
}

export interface FlashRequest {
  title: string;
  isActive?: boolean;
}

export interface FlashResponse {
  id: number;
  title: string;
  isActive: boolean;
  createdBy: UserInfoDTO | null;
  files: FlashFile[];
  filesCount: number;
  creation_Date: string;
  updatedAt_Date: string;
}

export interface FlashFileResponse {
  id: number;
  originalFileName: string;
  storedFileName: string;
  fileType: string;
  fileSize: number;
  filePath: string;
  fileCategory: FileCategory;
  downloadUrl: string;
}
