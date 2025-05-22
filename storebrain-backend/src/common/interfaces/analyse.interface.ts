import { AnalyseIcon } from 'src/analyse/analyse.service';

export interface AnalyseResult {
  monthly: AnalyseTableResult;
  quarterly: AnalyseTableResult;
}

export interface AnalyseTableResult {
  headerColumns: AnalyseHeaderColumn[];
  rows: AnalyseRow[];
  totalSalePrice: number;
  totalSale: number;
  totalMargin: number;
  totalRotationRate: number;
}

export interface AnalyseHeaderColumn {
  index: number;
  title: string;
  start: Date;
  end: Date;
  totalSale: number;
  totalSalePrice: number;
  totalMargin: number;
  totalRotationRate: number;
}

export interface AnalyseRow {
  label: string;
  dataColumns: AnalyseDataColumn[];
  totalSale: number;
  totalSalePrice: number;
  totalMargin: number;
  totalRotationRate: number;
  ranges: any[];
  details: ProductAnalyse[];
  salePriceMedian: number;
  subRows?: AnalyseRow[] | null;
  // cumulativePercentage: number;
  salePricePercentage: number;
  salePricePercentageN1: number;
  stock: number;
  stockPurchasePrice: number;
  //N1
  totalSaleN1: number;
  totalSalePriceN1: number;
  totalMarginN1: number;
  stockN1: number;
  stockPurchasePriceN1: number;
  //Difference
  differenceN1: number;
  differenceSalePriceN1: number;
  differenceSalePricePercentageN1: number;
  differenceMarginN1: number;
  differenceStockN1: number;
  differenceStockPurchasePriceN1: number;
}

export interface AnalyseDataColumn {
  index: number;
  salePrice: number;
  sale: number;
  margin: number;
  rotationRate: number;
}
export interface ProductAnalyse {
  department: string;
  group: string;
  family: string;
  familyKeyword: string[];
  stone: string | null;
  supplier: string;
  reference: string;
  image: string | null;
  size: number | null;
  periods: ProductPeriodAnalyse[];
  totalSalePrice: number;
  totalSale: number;
  sale: number;
  unitOrder: number;
  order: number;
  totalMargin: number;
  marginRate: number;
  totalStock: number;
  totalPaStock: number;
  publicSalePrice: number;
  ddv: number | null;
  rotationRate: number;
  coverageRate: number;
  icon: AnalyseIcon;
  saleDetails: SaleDetail[];
  isPareto: boolean;
  //N1
  totalSaleN1: number;
  totalStockN1: number;
  totalSalePriceN1: number;
  totalMarginN1: number;
  totalStockPurchasePriceN1: number;
}

export interface ProductPeriodAnalyse {
  index: number;
  totalSale: number;
  sale: number;
  unitOrder: number;
  salePrice: number;
  margin: number;
  stock: number;
  //N1
  salePriceN1: number;
}

export interface Range {
  index: number;
  minPrice: number;
  stock: number;
  stockPurchasePrice: number;
  totalSale: number;
  sale: number;
  unitOrder: number;
  salePrice: number;
  purchaseSalePrice: number;
  marginRate: number;
  products: RangeProduct[];
  isMedian: boolean;
  //N1
  totalSaleN1: number;
  saleN1: number;
  differenceN1: number;
  stockN1: number;
  stockPurchasePriceN1: number;
  differenceStockN1: number;
  differenceStockPurchasePriceN1: number;
}

export interface RangeProductInfo {
  index: number;
  sale: number;
  unitOrder: number;
  salePrice: number;
  purchaseSalePrice: number;
  margin: number;
  minPrice: number;
  saleN1: number;
  unitOrderN1: number;
}

export interface RangeProduct {
  department: string;
  group: string;
  supplier: string;
  reference: string;
  image: string | null;
  size: number | null;
  totalSalePrice: number;
  totalSale: number;
  totalSaleDifferenceN1: number;
  sale: number;
  saleDifferenceN1: number;
  unitOrder: number;
  order: number;
  totalMargin: number;
  marginRate: number;
  totalStock: number;
  stockDifferenceN1: number;
  stockPurchasePrice: number;
  stockPurchasePriceDifferenceN1: number;
  publicSalePrice: number;
  ddv: number | null;
  rotationRate: number;
  coverageRate: number;
  icon: AnalyseIcon;
  hasStockInOtherRange: boolean;
  isPareto: boolean;
}
export interface SaleDetail {
  price: number;
  totalSale: number;
  totalSaleN1: number;
  sale: number;
  saleN1: number;
  unitOrder: number;
  unitOrderN1: number;
  salePrice: number;
  salePriceN1: number;
  purchaseSalePrice: number;
  purchaseSalePriceN1: number;
}

export interface Grouping {
  department: string | null;
  group: string | null;
  family: string | null;
  familyKeyword?: string | string[];
  stone: string | null;
  withStone: boolean | null;
  label: string | null;
  other: boolean;
  default: boolean;
  subGroupings?: Grouping[];
}

//New Interface
export interface ProductData {
  //Shared
  department: string;
  group: string;
  family: string;
  familyKeyword: string[];
  stone: string | null;
  supplier: string;
  reference: string;
  image: string | null;
  publicSalePrice: number;
  orders: number;
  icon: AnalyseIcon;
  details: ProductDetailData[];
  salesDetails: ProductDataSales[];
  isEnabled: boolean;
  weight: null | number;
  productPrice: number;
  discountRate: number;
  unit: string;
  purchasePrice: number;
  coefficient: number;
  productPublicSalePrice: number;
  productMarginRate: number;
  //N
  totalSales: number;
  sales: number;
  unitOrders: number;
  totalSalesRevenue: number;
  totalSalesMargin: number;
  marginRate: number;
  stock: number;
  stockPurchasePrice: number;
  //N1
  totalSalesN1: number;
  totalSalesRevenueN1: number;
  totalSalesMarginN1: number;
  stockN1: number;
  stockPurchasePriceN1: number;
}

export interface ProductDataSales {
  salesPrice: number;
  totalSales: number;
  totalSalesRevenue: number;
  sales: number;
  totalSalesN1: number;
  totalSalesRevenueN1: number;
  salesN1: number;
  unitOrders: number;
  unitOrdersN1: number;
  totalSalesMargin: number;
  totalSalesMarginN1: number;
  // totalSalesDifferenceN1: number;
  // salesDifferenceN1: number;
}

export interface ProductDetailData {
  store: string;
  size: number | null;
  //N
  totalSales: number;
  totalSalesRevenue: number;
  totalSalesMargin: number;
  sales: number;
  marginRate: number;
  stock: number;
  stockPurchasePrice: number;
  //N1
  totalSalesN1: number;
  totalSalesRevenueN1: number;
  totalSalesMarginN1: number;
  stockN1: number;
  stockPurchasePriceN1: number;
  //Shared
  lastLifespan: number | null;
  icon: AnalyseIcon;
  publicSalePrice: number;
}

export interface ProductGrouping {
  name: string;
  totalSales: number;
}

export interface GroupingResult {
  //Shared
  label: string;
  subGroupings?: GroupingResult[];
  ranges: GroupingRange[];
  isInPareto: boolean;
  products: GroupingProduct[];
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
  totalSalesRevenueN1: number;
  stockN1: number;
  stockPurchasePriceN1: number;
  //Difference
  totalSalesDifferenceN1: number;
  totalSalesRevenueDifferenceN1: number;
  stockDifferenceN1: number;
  stockPurchasePriceDifferenceN1: number;
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
  bestSalesPrice: number | null;
  weight: number | null;
  productPrice: number;
  discountRate: number;
  unit: string;
  purchasePrice: number;
  coefficient: number;
  productPublicSalePrice: number;
  productMarginRate: number;
  details: ProductDetailData[];
}
