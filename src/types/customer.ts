export interface Customer {
  uuid: string;
  name: string;
  sdt?: string;
  address?: string;
  description?: string;
  active: boolean;
  createdAt: string;
  updatedAt?: string;
  deleted?: boolean;
}
