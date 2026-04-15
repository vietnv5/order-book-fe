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

export interface CustomerStatistics {
  customerId: string;
  totalOrders: number;
  unpaidOrders: number;
  totalAmount: number;
  totalDebt: number;
}
