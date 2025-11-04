export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

// Spring Data Page structure
export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number; // page number (0-indexed)
  first: boolean;
  last: boolean;
  numberOfElements: number; // elements in current page
  empty: boolean;
  sort?: {
    sorted: boolean;
    unsorted: boolean;
    empty: boolean;
  };
}

// Alias for backward compatibility
export type PaginatedResponse<T> = Page<T>;
