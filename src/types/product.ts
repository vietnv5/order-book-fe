export interface Product {
  uuid: string;
  name: string;
  unit?: string;
  sellPrice?: number;
  imageUrl?: string;
  category?: string;
  description?: string;
  active: boolean;
  createdAt: string;
  updatedAt?: string;
  deleted?: boolean;
}
