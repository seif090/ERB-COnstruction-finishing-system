export interface Document {
  id: string;
  name: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  category: DocumentCategory;
  relatedType?: string;
  relatedId?: string;
  description?: string;
  uploadedBy: string;
  createdAt: string;
  updatedAt: string;
}

export type DocumentCategory = 'contract' | 'invoice' | 'blueprint' | 'report' | 'certificate' | 'license' | 'other';

export interface CreateDocumentRequest {
  name: string;
  file: File;
  category: DocumentCategory;
  relatedType?: string;
  relatedId?: string;
  description?: string;
}

export interface DocumentQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: DocumentCategory;
  relatedType?: string;
  relatedId?: string;
}

export interface PaginatedDocuments {
  data: Document[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}