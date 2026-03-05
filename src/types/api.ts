export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  statusCode: number;
  isOperational: boolean;
  details?: any;
}

export interface UploadResponse {
  success: boolean;
  filePath: string;
  publicUrl: string;
}

export interface ExtractResponse {
  success: boolean;
  extractedData: {
    patientName?: string;
    patientAge?: number;
    patientGender?: string;
    billDate?: string;
    hospitalName?: string;
    items: Array<{
      description: string;
      amount: number;
      category?: string;
    }>;
    totalAmount: number;
  };
  mappedFields: Record<string, number>;
}