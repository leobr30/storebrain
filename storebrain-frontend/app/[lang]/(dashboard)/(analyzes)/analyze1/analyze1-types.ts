export interface GroupingResult {
  //Shared
  index: number;
  label: string;
  subGroupings?: GroupingResult[];
  ranges: GroupingRange[];
  isInPareto: boolean;
  //N
  totalSales: number;
  totalSalesRevenue: number;
  totalSalesRevenuePercentage: number;
  totalSalesMargin: number;
  stock: number;
  stockPurchasePrice: number;
  //N1
  totalSalesN1: number;
  totalSalesRevenueN1: number;
  totalSalesRevenuePercentageN1: number;
  totalSalesMarginN1: number;
  stockN1: number;
  stockPurchasePriceN1: number;
  //Difference
  totalSalesDifferenceN1: number;
  totalSalesRevenueDifferenceN1: number;
  totalSalesRevenuePercentageDifferenceN1: number;
  totalSalesMarginDifferenceN1: number;
  stockDifferenceN1: number;
  stockPurchasePriceDifferenceN1: number;
  products: GroupingProduct[];
}

export interface GroupingRange {
  //Shared
  minPrice: number;
  products: GroupingProduct[];
  isMedian: boolean;
  //N
  totalSales: number;
  stock: number;
  stockPurchasePrice: number;
  totalSalesRevenue: number;
  //N1
  totalSalesN1: number;
  stockN1: number;
  stockPurchasePriceN1: number;
  totalSalesRevenueN1: number;
  //Difference
  totalSalesDifferenceN1: number;
  stockDifferenceN1: number;
  stockPurchasePriceDifferenceN1: number;
  totalSalesRevenueDifferenceN1: number;
}

export interface GroupingProduct {
  supplier: string;
  reference: string;
  image: string | null;
  totalSales: number;
  totalSalesRevenue: number;
  totalSalesRevenueN1: number;
  totalSalesDifferenceN1: number;
  totalSalesDifferenceRevenueN1: number;
  sales: number;
  salesDifferenceN1: number;
  unitOrders: number;
  unitOrdersDifferenceN1: number;
  totalSalesMargin: number;
  totalSalesMarginN1: number;
  totalSalesMarginRate: number;
  totalSalesMarginRateDifferenceN1: number;
  isInPareto: boolean;
  stock: number;
  stockInfo?: string | null;
  stockDifferenceN1: number;
  stockPurchasePrice: number;
  stockPurchasePriceDifferenceN1: number;
  orders: number;
  publicSalePrice: number;
  bestSalesPrice?: number | null;
}