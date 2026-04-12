export interface Shipper {
  uuid: string;
  name: string;
  phone?: string;
  active: boolean;
  createdAt: string;
  updatedAt?: string;
  deleted?: boolean;
}
