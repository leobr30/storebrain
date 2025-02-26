export interface Product {
  id: number;
  image: string | null;
  department: string;
  group: string;
  family: string;
  stone: string | null;
  familyKeyword: string[];
  weight: null | number;
}

export interface ProductInformation {
  date: Date;
  dateIn: Date | null;
  dateOut: Date | null;
  store: string;
  supplier: string;
  type: string;
  reference: string;
  size: number | null;
  stock: number;
  stockPurchasePrice: number;
  purchase: number;
  purchasePrice: number;
  sale: number;
  salePrice: number;
  price: number;
  purchaseSalePrice: number;
  publicSalePrice: number;
  unitOrder: number;
  order: number;
  publicSalePriceDate: Date | null;
  isEnabled: boolean;
  productPrice: number;
  discountRate: number;
  unit: string;
  productPurchasePrice: number;
  coefficient: number;
  productPublicSalePrice: number;
  productMarginRate: number;
}

export interface InventoryProduct {
  family: string;
  id: number;
  supplier: string;
  reference: string;
  size: number | null;
  stock: number;
}

export type Revenue = {  
  revenue: number;
}

export type RevenueDetail = {
  onerpId: number;
  fullName: string;
  zone: string;
  revenue: number;
  revenueOr: number;
  revenueMode: number;
  revenueService: number;
  revenueFourniture: number;
}

