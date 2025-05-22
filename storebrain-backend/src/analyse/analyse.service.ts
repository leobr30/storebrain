import { Injectable, Logger } from '@nestjs/common';
import { Subject } from 'rxjs';
import {
  Product,
  ProductInformation,
} from 'src/common/interfaces/onerp.interface';
import { OnerpService } from 'src/onerp/onerp.service';
import {
  AnalyseDataColumn,
  AnalyseHeaderColumn,
  AnalyseRow,
  AnalyseTableResult,
  Grouping,
  GroupingProduct,
  GroupingRange,
  GroupingResult,
  ProductAnalyse,
  ProductData,
  ProductDataSales,
  ProductDetailData,
  ProductPeriodAnalyse,
  Range,
  RangeProductInfo,
  SaleDetail,
} from 'src/common/interfaces/analyse.interface';
import {
  add,
  addYears,
  differenceInDays,
  endOfDay,
  endOfMonth,
  format,
  startOfDay,
} from 'date-fns';
import { groupings } from './analyze-grouping';
import * as csv from 'fast-csv';
import { Analyze1Dto } from './dto/analyze1.dto';
import { AnalyseGateway } from './analyse.gateway';

enum Type {
  Quarterly,
  Monthly,
  Yearly,
}

export enum AnalyseIcon {
  Order,
  Maintain,
  Check,
  Remove,
  Other,
}

@Injectable()
export class AnalyseService {
  private readonly logger = new Logger(AnalyseService.name);
  private progressSubject = new Subject<{ current: number; total: number }>();

  gammes = [
    {
      rayon: 'OR',
      gammes: [
        {
          index: 1,
          minPrice: 100,
          minStock: 0,
          order: 60,
          maintain: 90,
          minSale: 5,
        },
        {
          index: 2,
          minPrice: 300,
          minStock: 0,
          order: 90,
          maintain: 120,
          minSale: 5,
        },
        {
          index: 3,
          minPrice: 500,
          minStock: 0,
          order: 120,
          maintain: 150,
          minSale: 3,
        },
        {
          index: 4,
          minPrice: 750,
          minStock: 0,
          order: 150,
          maintain: 180,
          minSale: 3,
        },
        {
          index: 5,
          minPrice: 999,
          minStock: 0,
          order: 90,
          maintain: 120,
          minSale: 3,
        },
        {
          index: 6,
          minPrice: 1250,
          minStock: 0,
          order: 120,
          maintain: 150,
          minSale: 3,
        },
        {
          index: 7,
          minPrice: 1500,
          minStock: 0,
          order: 180,
          maintain: 210,
          minSale: 2,
        },
        {
          index: 8,
          minPrice: 1800,
          minStock: 0,
          order: 210,
          maintain: 270,
          minSale: 1,
        },
        {
          index: 9,
          minPrice: 2000,
          minStock: 0,
          order: 270,
          maintain: 360,
          minSale: 1,
        },
        {
          index: 10,
          minPrice: 2500,
          minStock: 0,
          order: 0,
          maintain: 0,
          minSale: 0,
        },
        {
          index: 11,
          minPrice: 3000,
          minStock: 0,
          order: 0,
          maintain: 0,
          minSale: 0,
        },
        {
          index: 12,
          minPrice: 4000,
          minStock: 0,
          order: 0,
          maintain: 0,
          minSale: 0,
        },
        {
          index: 13,
          minPrice: 5000,
          minStock: 0,
          order: 0,
          maintain: 0,
          minSale: 0,
        },
        {
          index: 14,
          minPrice: 999999,
          minStock: 0,
          order: 0,
          maintain: 0,
          minSale: 0,
        },
      ].sort((a, b) => b.minPrice - a.minPrice),
    },
  ];

  constructor(
    private oneRPService: OnerpService,
    private analyseGateway: AnalyseGateway,
  ) {}

  async getAnalyze1(dto: Analyze1Dto) {
    this.logger.log(
      `Start Analyze1 from:${dto.startDate.toLocaleDateString()} to:${dto.endDate.toLocaleDateString()}, with: departmens:${dto.departments.toString()}, storeIds:${dto.storeIds.toString()}, supplierIds:${dto.supplierIds.toString()}`,
    );
    const productsData: ProductData[] = [];
    this.logger.debug(`Load products`);
    const products = await this.oneRPService.getProducts({ rayon: dto.departments });
    this.logger.debug(`${products.length} products founds....`);
    
    let processedProducts = 0;
    await Promise.all(
      products.map(async (product) => {
        const details = await this.oneRPService.getProductDetails(
          product.id,
          dto.storeIds,
          dto.supplierIds,
        );
        productsData.push(
          ...this.loadProductData(
            details,
            product,
            startOfDay(dto.startDate),
            endOfDay(dto.endDate),
          ),
        );
        processedProducts++;
        this.analyseGateway.emitProgress({ current: processedProducts, total: products.length });
      }),
    );
    const result = this.loadProductGroupings(productsData, groupings);
    this.logger.log(`End Analyze1`);
    return result;
  }


  loadProductGroupings(products: ProductData[], groupings: Grouping[]) {
    const wihExport = true;
    const productExport: any[] = [];
    let remainingProducts: ProductData[] = products;
    const groupingResults: GroupingResult[] = [];
    let totalSalesRevenue = 0;
    let totalSalesRevenueN1 = 0;
    groupings.map((grouping) => {
      const filterProductsResult = filterProducts(remainingProducts, grouping);
      remainingProducts = filterProductsResult.badProduct;
      const groupingResult = this.loadProductGrouping(
        filterProductsResult.okProduct,
        grouping,
      );
      totalSalesRevenue += groupingResult.totalSalesRevenue;
      totalSalesRevenueN1 += groupingResult.totalSalesRevenueN1;
      if (grouping.subGroupings) {
        const subGroupingResults: GroupingResult[] = [];
        let remainingSubGroupingProducts = filterProductsResult.okProduct;
        grouping.subGroupings.map((subGrouping) => {
          const subGroupingProducts = filterProducts(
            remainingSubGroupingProducts,
            subGrouping,
          );
          remainingSubGroupingProducts = subGroupingProducts.badProduct;
          const subGroupingResult = this.loadProductGrouping(
            subGroupingProducts.okProduct,
            subGrouping,
            true,
          );
          subGroupingResults.push(subGroupingResult);
        });
        if(remainingSubGroupingProducts.length > 0){
        const defaultSubGroupingResult = this.loadProductGrouping(
          remainingSubGroupingProducts,
          {
            department: grouping.department,
            group: grouping.group,
            label: 'Autres',
            family: null,
            stone: null,
            withStone: null,
            other: false,
            default: false,
          },
          );
          subGroupingResults.push(defaultSubGroupingResult);
        }        
        let sumTotalSalesRevenue = 0;
        subGroupingResults
          .sort((a, b) => b.totalSalesRevenue - a.totalSalesRevenue)
          .map((grouping) => {
            grouping.totalSalesRevenuePercentage =
              (grouping.totalSalesRevenue * 100) /
              groupingResult.totalSalesRevenue;
            grouping.totalSalesRevenuePercentageN1 =
              (grouping.totalSalesRevenueN1 * 100) /
              groupingResult.totalSalesRevenueN1;
            grouping.totalSalesRevenuePercentageDifferenceN1 =
              grouping.totalSalesRevenuePercentage -
              grouping.totalSalesRevenuePercentageN1;
            const sumRate =
              (sumTotalSalesRevenue * 100) / groupingResult.totalSalesRevenue;
            if (sumRate < 80) {
              grouping.isInPareto = true;
            }
            sumTotalSalesRevenue += grouping.totalSalesRevenue;
            return grouping;
          });
        groupingResult.subGroupings = subGroupingResults;
      } else {
        if (wihExport) {
          productExport.push(
            ...groupingResult.products.map((product) => ({
              ...product,
              grouping: groupingResult.label,
            })),
          );
        }
      }
      groupingResults.push(groupingResult);
    });
    //Default security
    this.logger.debug(`Autres ,products:${remainingProducts.length} `);

    //Pareto
    let sumTotalSalesRevenue = 0;
    groupingResults
      .sort((a, b) => b.totalSalesRevenue - a.totalSalesRevenue)
      .map((grouping) => {
        this.logger.debug(
          `${grouping.label} Revenue ${grouping.totalSalesRevenue} / ${totalSalesRevenue}`,
        );
        grouping.totalSalesRevenuePercentage =
          (grouping.totalSalesRevenue * 100) / totalSalesRevenue;
        grouping.totalSalesRevenuePercentageN1 =
          (grouping.totalSalesRevenueN1 * 100) / totalSalesRevenueN1;
        grouping.totalSalesRevenuePercentageDifferenceN1 =
          grouping.totalSalesRevenuePercentage -
          grouping.totalSalesRevenuePercentageN1;
        const sumRate = (sumTotalSalesRevenue * 100) / totalSalesRevenue;
        if (sumRate < 80) {
          grouping.isInPareto = true;
        }
        sumTotalSalesRevenue += grouping.totalSalesRevenue;
        return grouping;
      });
    csv
      .writeToPath('upload/tmp/out.csv', productExport, {
        headers: true,
        delimiter: ';',
      })
      .on('end', () => this.logger.debug('Debug csv saved'));
    return groupingResults;
  }

  loadProductGrouping(
    products: ProductData[],
    grouping: Grouping,
    subGrouping?: boolean,
  ): GroupingResult {
    //Shared
    const groupingSalesPrice: number[] = [];
    const groupingProducts: GroupingProduct[] = [];
    const label = `${!subGrouping ? grouping.department : ''}${!subGrouping && grouping.group ? '-' + grouping.group : ''}${grouping.family ? grouping.family : ''}${grouping.stone ? '-' + grouping.stone : ''}${grouping.label ? '-' + grouping.label : ''}${ grouping.familyKeyword && !Array.isArray(grouping.familyKeyword) ? '-' + grouping.familyKeyword : ''}`;
    //N
    let totalSales = 0;
    let totalSalesRevenue = 0;
    let totalSalesMargin = 0;
    let stock = 0;
    let stockPurchasePrice = 0;
    //N1
    let totalSalesN1 = 0;
    let totalSalesRevenueN1 = 0;
    let totalSalesMarginN1 = 0;
    let stockN1 = 0;
    let stockPurchasePriceN1 = 0;
    //Ranges
    const ranges: GroupingRange[] = this.gammes[0].gammes
      .sort((a, b) => a.minPrice - b.minPrice)
      .map((range) => ({
        minPrice: range.minPrice,
        totalSales: 0,
        stock: 0,
        stockPurchasePrice: 0,
        totalSalesN1: 0,
        stockN1: 0,
        stockPurchasePriceN1: 0,
        totalSalesDifferenceN1: 0,
        stockDifferenceN1: 0,
        stockPurchasePriceDifferenceN1: 0,
        isMedian: false,
        totalSalesRevenue: 0,
        totalSalesRevenueN1: 0,
        totalSalesRevenueDifferenceN1: 0,
        products: [],
      }));
    products.map((product) => {
      //N
      totalSales += product.totalSales;
      totalSalesRevenue += product.totalSalesRevenue;
      totalSalesMargin += product.totalSalesMargin;
      stock += product.stock;
      stockPurchasePrice += product.stockPurchasePrice;
      //N1
      totalSalesN1 += product.totalSalesN1;
      totalSalesRevenueN1 += product.totalSalesRevenueN1;
      totalSalesMarginN1 += product.totalSalesMarginN1;
      stockN1 += product.stockN1;
      stockPurchasePriceN1 += product.stockPurchasePriceN1;
      //Ranges
      const stockRange = ranges.find(
        (w) => product.publicSalePrice < w.minPrice,
      );
      //Find best sales price
      const maxTotalSalesPrice = product.salesDetails.length
        ? product.salesDetails.reduce((prev, current) =>
          prev.totalSales + prev.totalSalesN1 >
            current.totalSales + current.totalSalesN1 ||
            (prev.totalSales + prev.totalSalesN1 ===
              current.totalSales + current.totalSalesN1 &&
              prev.salesPrice > current.salesPrice)
            ? prev
            : current,
        ).salesPrice
        : 0;
      product.salesDetails.map((salesDetail) => {
        //Median Calculation
        for (let i = 1; i <= salesDetail.totalSales; i++) {
          groupingSalesPrice.push(salesDetail.salesPrice);
        }
        const range = ranges.find((w) => salesDetail.salesPrice < w.minPrice);
        if (range) {
          range.totalSales += salesDetail.totalSales;
          range.totalSalesN1 += salesDetail.totalSalesN1;
          range.totalSalesDifferenceN1 +=
            salesDetail.totalSales - salesDetail.totalSalesN1;
          range.totalSalesRevenue += salesDetail.totalSalesRevenue;
          range.totalSalesRevenueN1 += salesDetail.totalSalesRevenueN1;
          range.totalSalesRevenueDifferenceN1 +=
            salesDetail.totalSalesRevenue - salesDetail.totalSalesRevenueN1;
          const productRange = range.products.find(
            (x) =>
              x.supplier === product.supplier &&
              x.reference === product.reference,
          );
          if (productRange) {
            productRange.totalSales += salesDetail.totalSales;
            productRange.totalSalesDifferenceN1 +=
              salesDetail.totalSales - salesDetail.totalSalesN1;
            productRange.sales += salesDetail.sales;
            productRange.salesDifferenceN1 +=
              salesDetail.sales - salesDetail.salesN1;
            productRange.totalSalesRevenue += salesDetail.totalSalesRevenue;
            productRange.totalSalesRevenueN1 += salesDetail.totalSalesRevenueN1;
            productRange.totalSalesDifferenceRevenueN1 +=
              salesDetail.totalSalesRevenue - salesDetail.totalSalesRevenueN1;
            productRange.unitOrders += salesDetail.unitOrders;
            productRange.unitOrdersDifferenceN1 +=
              salesDetail.unitOrders - salesDetail.unitOrdersN1;
            productRange.totalSalesMargin += salesDetail.totalSalesMargin;
            productRange.totalSalesMarginN1 += salesDetail.totalSalesMarginN1;
          } else {
            range.products.push({
              supplier: product.supplier,
              reference: product.reference,
              image: product.image,
              totalSales: salesDetail.totalSales,
              totalSalesRevenue: salesDetail.totalSalesRevenue,
              totalSalesDifferenceN1:
                salesDetail.totalSales - salesDetail.totalSalesN1,
              totalSalesRevenueN1: salesDetail.totalSalesRevenueN1,
              totalSalesDifferenceRevenueN1:
                salesDetail.totalSalesRevenue - salesDetail.totalSalesRevenueN1,
              sales: salesDetail.sales,
              salesDifferenceN1: salesDetail.sales - salesDetail.salesN1,
              unitOrders: salesDetail.unitOrders,
              unitOrdersDifferenceN1:
                salesDetail.unitOrders - salesDetail.unitOrdersN1,
              totalSalesMargin: salesDetail.totalSalesMargin,
              totalSalesMarginN1: salesDetail.totalSalesMarginN1,
              totalSalesMarginRate: 0,
              totalSalesMarginRateDifferenceN1: 0,
              isInPareto: false,
              stock: 0,
              stockInfo:
                stock > 0 && stockRange?.minPrice !== range.minPrice
                  ? `${product.stock}x${product.publicSalePrice}€`
                  : null,
              stockDifferenceN1: 0,
              stockPurchasePrice: 0,
              stockPurchasePriceDifferenceN1: 0,
              orders: product.orders,
              publicSalePrice: product.publicSalePrice,
              bestSalesPrice:
                maxTotalSalesPrice !== 0 ? maxTotalSalesPrice : null,
              weight: product.weight,
              productPrice: product.productPrice,
              discountRate: product.discountRate,
              unit: product.unit,
              purchasePrice: product.purchasePrice,
              coefficient: product.coefficient,
              productPublicSalePrice: product.productPublicSalePrice,
              productMarginRate: product.marginRate,
              details: product.details,
            });
          }
        }
      });
      //Ranges Stock
      if (stockRange && (product.stock > 0 || product.stockN1 > 0)) {
        stockRange.stock += product.stock;
        stockRange.stockPurchasePrice += product.stockPurchasePrice;
        stockRange.stockN1 += product.stockN1;
        stockRange.stockPurchasePriceN1 += product.stockPurchasePriceN1;
        stockRange.stockDifferenceN1 += product.stock - product.stockN1;
        stockRange.stockPurchasePriceDifferenceN1 +=
          product.stockPurchasePrice - product.stockPurchasePriceN1;

        const productStockRange = stockRange.products.find(
          (w) =>
            w.supplier === product.supplier &&
            w.reference === product.reference,
        );
        if (productStockRange) {
          productStockRange.stock += product.stock;
          productStockRange.stockDifferenceN1 +=
            product.stock - product.stockN1;
          productStockRange.stockPurchasePrice += product.stockPurchasePrice;
          productStockRange.stockPurchasePriceDifferenceN1 +=
            product.stockPurchasePrice - product.stockPurchasePriceN1;
        } else {
          stockRange.products.push({
            supplier: product.supplier,
            reference: product.reference,
            image: product.image,
            totalSales: 0,
            totalSalesDifferenceN1: 0,
            totalSalesRevenue: 0,
            totalSalesDifferenceRevenueN1: 0,
            sales: 0,
            salesDifferenceN1: 0,
            unitOrders: 0,
            unitOrdersDifferenceN1: 0,
            totalSalesMargin: 0,
            totalSalesMarginN1: 0,
            totalSalesMarginRate: 0,
            totalSalesMarginRateDifferenceN1: 0,
            totalSalesRevenueN1: 0,
            isInPareto: false,
            stock: product.stock,
            stockDifferenceN1: product.stock - product.stockN1,
            stockPurchasePrice: product.stockPurchasePrice,
            stockPurchasePriceDifferenceN1:
              product.stockPurchasePrice - product.stockPurchasePriceN1,
            orders: product.orders,
            publicSalePrice: product.publicSalePrice,
            bestSalesPrice:
              maxTotalSalesPrice !== 0 ? maxTotalSalesPrice : null,
            weight: product.weight,
            productPrice: product.productPrice,
            discountRate: product.discountRate,
            unit: product.unit,
            purchasePrice: product.purchasePrice,
            coefficient: product.coefficient,
            productPublicSalePrice: product.productPublicSalePrice,
            productMarginRate: product.marginRate,
            details: product.details,
          });
        }
      }
      //Products
      const totalSalesMarginRate =
        (product.totalSalesMargin / product.totalSalesRevenue) * 100;
      const totalSalesMarginRateN1 =
        (product.totalSalesMarginN1 / product.totalSalesRevenueN1) * 100;
      groupingProducts.push({
        supplier: product.supplier,
        reference: product.reference,
        image: product.image,
        totalSales: product.totalSales,
        totalSalesDifferenceN1: product.totalSales - product.totalSalesN1,
        totalSalesRevenue: product.totalSalesRevenue,
        totalSalesRevenueN1: product.totalSalesRevenueN1,
        totalSalesDifferenceRevenueN1:
          product.totalSalesRevenue - product.totalSalesRevenueN1,
        sales: product.sales,
        salesDifferenceN1: product.sales - product.totalSalesN1,
        unitOrders: product.unitOrders,
        unitOrdersDifferenceN1: product.unitOrders,
        totalSalesMargin: product.totalSalesMargin,
        totalSalesMarginN1: product.totalSalesMarginN1,
        totalSalesMarginRate: totalSalesMarginRate,
        totalSalesMarginRateDifferenceN1:
          totalSalesMarginRate - totalSalesMarginRateN1,
        stock: product.stock,
        stockDifferenceN1: product.stock - product.stockN1,
        stockPurchasePrice: product.stockPurchasePrice,
        stockPurchasePriceDifferenceN1:
          product.stockPurchasePrice - product.stockPurchasePriceN1,
        orders: product.orders,
        isInPareto: false,
        publicSalePrice: product.publicSalePrice,
        bestSalesPrice: maxTotalSalesPrice !== 0 ? maxTotalSalesPrice : null,
        weight: product.weight,
        productPrice: product.productPrice,
        discountRate: product.discountRate,
        unit: product.unit,
        purchasePrice: product.purchasePrice,
        coefficient: product.coefficient,
        productPublicSalePrice: product.productPublicSalePrice,
        productMarginRate: product.marginRate,
        details: product.details,
      });
    });
    const medianPrice = this.median(groupingSalesPrice);
    const rangeMedianPriceIndex = ranges.findIndex(
      (w) => medianPrice < w.minPrice,
    );
    //Ranges Product
    ranges.map((range, index) => {
      let sumTotalSalesRevenue = 0;
      range.isMedian = rangeMedianPriceIndex === index;
      range.products
        .sort((a, b) => b.totalSalesRevenue - a.totalSalesRevenue)
        .map((rangeProduct) => {
          //Margin Rate
          const totalSalesMarginN1 =
            (rangeProduct.totalSalesMarginN1 /
              rangeProduct.totalSalesRevenueN1) *
            100;
          rangeProduct.totalSalesMarginRate =
            (rangeProduct.totalSalesMargin / rangeProduct.totalSalesRevenue) *
            100;
          rangeProduct.totalSalesMarginRateDifferenceN1 =
            rangeProduct.totalSalesMarginRate - totalSalesMarginN1;
          //Pareto
          const sumRate =
            (sumTotalSalesRevenue * 100) / range.totalSalesRevenue;
          if (sumRate < 80) {
            rangeProduct.isInPareto = true;
          }
          sumTotalSalesRevenue += rangeProduct.totalSalesRevenue;
        });
      return range;
    });
    //Temps debug
    // if (grouping.family === 'Pendentif Initiale' && subGrouping) {
    //   products.map((product) =>
    //     product.details
    //       .filter((w) => w.stockN1 > 0)
    //       .map((detail) =>
    //         this.logger.debug(
    //           `${product.supplier} ${product.reference}, size:${detail.size}, store:${detail.store}, stock:${detail.stockN1}`,
    //         ),
    //       ),
    //   );
    // }
    //products
    let sumTotalSalesRevenueProducts = 0;
    groupingProducts
      .sort((a, b) => b.totalSalesRevenue - a.totalSalesRevenue)
      .map((product) => {
        const sumRate =
          (sumTotalSalesRevenueProducts * 100) / totalSalesRevenue;
        if (sumRate < 80) {
          product.isInPareto = true;
        }
        sumTotalSalesRevenueProducts += product.totalSalesRevenue;
        return product;
      });
    return {
      //Shared
      label,
      ranges,
      isInPareto: false,
      products: groupingProducts,
      //N
      totalSales,
      totalSalesRevenue,
      totalSalesRevenuePercentage: 0,
      totalSalesMargin,
      stock,
      stockPurchasePrice,
      //N1
      totalSalesN1,
      totalSalesRevenueN1,
      totalSalesRevenuePercentageN1: 0,
      totalSalesMarginN1,
      stockN1,
      stockPurchasePriceN1,
      //Difference
      totalSalesDifferenceN1: totalSales - totalSalesN1,
      totalSalesRevenueDifferenceN1: totalSalesRevenue - totalSalesRevenueN1,
      totalSalesRevenuePercentageDifferenceN1: 0,
      totalSalesMarginDifferenceN1: totalSalesMargin - totalSalesMarginN1,
      stockDifferenceN1: stock - stockN1,
      stockPurchasePriceDifferenceN1: stockPurchasePrice - stockPurchasePriceN1,
    };
  }

  

  
 
  loadTableRow = (
    label: string,
    details: ProductAnalyse[],
    groupingDataColumns: AnalyseDataColumn[],
    headerColumns: AnalyseHeaderColumn[],
    groupingSalesPrice: number[],
    groupingRanges: Range[],
    groupingProducts: ProductAnalyse[],
  ) => {
    let currentGroupingSale = 0;
    let currentGroupingSalePrice = 0;
    let currentGroupingMargin = 0;
    let currentGroupingStock = 0;
    let currentGroupingStockPurchasePrice = 0;
    //N1
    let currentGroupingSaleN1 = 0;
    let currentGroupingSalePriceN1 = 0;
    let currentGroupingMarginN1 = 0;
    let currentGroupingStockN1 = 0;
    let currentGroupingStockPurchasePriceN1 = 0;
    const currentGroupingDataColumns = headerColumns.map((column) => ({
      index: column.index,
      salePrice: 0,
      sale: 0,
      margin: 0,
      rotationRate: 0,
    }));
    const currentGroupingRanges: Range[] = this.gammes[0].gammes.map(
      (range) => ({
        index: range.index,
        minPrice: range.minPrice,
        stock: 0,
        stockPurchasePrice: 0,
        totalSale: 0,
        sale: 0,
        unitOrder: 0,
        salePrice: 0,
        purchaseSalePrice: 0,
        marginRate: 0,
        products: [],
        isMedian: false,
        //N1
        totalSaleN1: 0,
        saleN1: 0,
        stockN1: 0,
        stockPurchasePriceN1: 0,
        differenceN1: 0,
        differenceStockN1: 0,
        differenceStockPurchasePriceN1: 0,
      }),
    );
    const currentSalesPrice: number[] = [];
    details.map((detail) => {
      const groupingRangeProductInfos: RangeProductInfo[] = [];
      const currentRangeProductInfos: RangeProductInfo[] = [];
      detail.periods.map((period) => {
        //TODO HANDLE N
        if (groupingDataColumns[period.index]) {
          groupingDataColumns[period.index].sale += period.sale;
          groupingDataColumns[period.index].salePrice += period.salePrice;
          groupingDataColumns[period.index].margin += period.margin;
        }
        if (currentGroupingDataColumns[period.index]) {
          currentGroupingDataColumns[period.index].sale += period.sale;
          currentGroupingDataColumns[period.index].salePrice +=
            period.salePrice;
          currentGroupingDataColumns[period.index].margin += period.margin;
        }
      });
      //Ranges SALES
      detail.saleDetails.map((saleDetail) => {
        for (let i = 0; i < saleDetail.sale; i++) {
          groupingSalesPrice.push(saleDetail.price);
          currentSalesPrice.push(saleDetail.price);
        }

        const saleRangeIndex = groupingRanges
          .sort((a, b) => a.minPrice - b.minPrice)
          .findIndex((w) => saleDetail.price < w.minPrice);
        if (saleRangeIndex !== -1) {
          groupingRanges[saleRangeIndex].sale += saleDetail.sale;
          groupingRanges[saleRangeIndex].unitOrder += saleDetail.unitOrder;
          groupingRanges[saleRangeIndex].salePrice += saleDetail.salePrice;
          groupingRanges[saleRangeIndex].purchaseSalePrice +=
            saleDetail.purchaseSalePrice;
          //N1
          groupingRanges[saleRangeIndex].saleN1 += saleDetail.saleN1;
          const rangeInfoIndex = groupingRangeProductInfos.findIndex(
            (w) => w.index === saleRangeIndex,
          );
          //Product info in subgroup range
          if (rangeInfoIndex === -1) {
            groupingRangeProductInfos.push({
              index: saleRangeIndex,
              sale: saleDetail.sale,
              salePrice: saleDetail.salePrice,
              purchaseSalePrice: saleDetail.purchaseSalePrice,
              margin: saleDetail.salePrice - saleDetail.purchaseSalePrice,
              minPrice: groupingRanges[saleRangeIndex].minPrice,
              unitOrder: saleDetail.unitOrder,
              //N1
              saleN1: saleDetail.saleN1,
              unitOrderN1: saleDetail.unitOrderN1,
            });
          } else {
            groupingRangeProductInfos[rangeInfoIndex].sale += saleDetail.sale;
            groupingRangeProductInfos[rangeInfoIndex].unitOrder +=
              saleDetail.unitOrder;
            groupingRangeProductInfos[rangeInfoIndex].salePrice +=
              saleDetail.salePrice;
            groupingRangeProductInfos[rangeInfoIndex].purchaseSalePrice +=
              saleDetail.purchaseSalePrice;
            groupingRangeProductInfos[rangeInfoIndex].margin +=
              saleDetail.salePrice - saleDetail.purchaseSalePrice;
          }
        }
        const currentSaleRangeIndex = currentGroupingRanges
          .sort((a, b) => a.minPrice - b.minPrice)
          .findIndex((w) => saleDetail.price < w.minPrice);
        if (currentSaleRangeIndex !== -1) {
          currentGroupingRanges[currentSaleRangeIndex].sale += saleDetail.sale;
          currentGroupingRanges[currentSaleRangeIndex].unitOrder +=
            saleDetail.unitOrder;
          currentGroupingRanges[currentSaleRangeIndex].totalSale +=
            saleDetail.totalSale;
          currentGroupingRanges[currentSaleRangeIndex].salePrice +=
            saleDetail.salePrice;
          currentGroupingRanges[currentSaleRangeIndex].purchaseSalePrice +=
            saleDetail.purchaseSalePrice;
          //N1
          currentGroupingRanges[currentSaleRangeIndex].totalSaleN1 +=
            saleDetail.totalSaleN1;
          currentGroupingRanges[currentSaleRangeIndex].saleN1 +=
            saleDetail.saleN1;

          const rangeInfoIndex = currentRangeProductInfos.findIndex(
            (w) => w.index === saleRangeIndex,
          );
          if (rangeInfoIndex === -1) {
            currentRangeProductInfos.push({
              index: saleRangeIndex,
              sale: saleDetail.sale,
              salePrice: saleDetail.salePrice,
              purchaseSalePrice: saleDetail.purchaseSalePrice,
              margin: saleDetail.salePrice - saleDetail.purchaseSalePrice,
              minPrice: groupingRanges[saleRangeIndex].minPrice,
              unitOrder: saleDetail.unitOrder,
              saleN1: saleDetail.saleN1,
              unitOrderN1: saleDetail.unitOrderN1,
            });
          } else {
            currentRangeProductInfos[rangeInfoIndex].sale += saleDetail.sale;
            currentRangeProductInfos[rangeInfoIndex].saleN1 +=
              saleDetail.saleN1;
            currentRangeProductInfos[rangeInfoIndex].unitOrder +=
              saleDetail.unitOrder;
            currentRangeProductInfos[rangeInfoIndex].unitOrderN1 +=
              saleDetail.unitOrderN1;
            currentRangeProductInfos[rangeInfoIndex].salePrice +=
              saleDetail.salePrice;
            currentRangeProductInfos[rangeInfoIndex].purchaseSalePrice +=
              saleDetail.purchaseSalePrice;
            currentRangeProductInfos[rangeInfoIndex].margin +=
              saleDetail.salePrice - saleDetail.purchaseSalePrice;
          }
        }
      });
      //Ranges Stock
      //Up Group
      const groupingStockRangeIndex = groupingRanges
        .sort((a, b) => a.minPrice - b.minPrice)
        .findIndex((w) => detail.publicSalePrice < w.minPrice);

      groupingRangeProductInfos.map((rangeProductInfo) => {
        groupingRanges[rangeProductInfo.index].products.push({
          department: detail.department,
          group: detail.group,
          supplier: detail.supplier,
          reference: detail.reference,
          image: detail.image,
          size: detail.size,
          totalSalePrice: rangeProductInfo.salePrice,
          totalSale: rangeProductInfo.sale + rangeProductInfo.unitOrder,
          totalSaleDifferenceN1:
            rangeProductInfo.sale +
            rangeProductInfo.unitOrder -
            (rangeProductInfo.saleN1 + rangeProductInfo.unitOrderN1),
          sale: rangeProductInfo.sale,
          saleDifferenceN1: rangeProductInfo.sale - rangeProductInfo.saleN1,
          unitOrder: rangeProductInfo.unitOrder,
          order: detail.order,
          totalMargin: rangeProductInfo.margin,
          marginRate:
            ((rangeProductInfo.salePrice - rangeProductInfo.purchaseSalePrice) /
              rangeProductInfo.salePrice) *
            100,
          totalStock: 0,
          stockDifferenceN1: 0,
          stockPurchasePrice: 0,
          stockPurchasePriceDifferenceN1: 0,
          publicSalePrice: detail.publicSalePrice,
          ddv: detail.ddv,
          rotationRate: detail.rotationRate,
          coverageRate: detail.coverageRate,
          icon: detail.icon,
          hasStockInOtherRange:
            detail.totalStock > 0 &&
            groupingRanges[groupingStockRangeIndex]?.minPrice !==
            rangeProductInfo.minPrice,
          isPareto: false,
        });
      });
      //Current Group
      const currentGroupingStockRangeIndex = currentGroupingRanges
        .sort((a, b) => a.minPrice - b.minPrice)
        .findIndex((w) => detail.publicSalePrice < w.minPrice);
      currentRangeProductInfos.map((rangeProductInfo) => {
        currentGroupingRanges[rangeProductInfo.index].products.push({
          department: detail.department,
          group: detail.group,
          supplier: detail.supplier,
          reference: detail.reference,
          image: detail.image,
          size: detail.size,
          totalSalePrice: rangeProductInfo.salePrice,
          totalSale: rangeProductInfo.sale + rangeProductInfo.unitOrder,
          totalSaleDifferenceN1:
            rangeProductInfo.sale +
            rangeProductInfo.unitOrder -
            (rangeProductInfo.saleN1 + rangeProductInfo.unitOrderN1),
          sale: rangeProductInfo.sale,
          saleDifferenceN1: rangeProductInfo.sale - rangeProductInfo.saleN1,
          unitOrder: rangeProductInfo.unitOrder,
          order: detail.order,
          totalMargin: rangeProductInfo.margin,
          marginRate:
            ((rangeProductInfo.salePrice - rangeProductInfo.purchaseSalePrice) /
              rangeProductInfo.salePrice) *
            100,
          totalStock: 0,
          stockDifferenceN1: 0,
          stockPurchasePrice: 0,
          stockPurchasePriceDifferenceN1: 0,
          publicSalePrice: detail.publicSalePrice,
          ddv: detail.ddv,
          rotationRate: detail.rotationRate,
          coverageRate: detail.coverageRate,
          icon: detail.icon,
          hasStockInOtherRange:
            detail.totalStock > 0 &&
            groupingRanges[currentGroupingStockRangeIndex]?.minPrice !==
            rangeProductInfo.minPrice,
          isPareto: false,
        });
      });
      if (detail.totalStock > 0 || detail.totalStockN1 > 0) {
        currentGroupingStock += detail.totalStock;
        currentGroupingStockPurchasePrice += detail.totalPaStock;
        currentGroupingStockN1 += detail.totalStockN1;
        currentGroupingStockPurchasePriceN1 += detail.totalStockPurchasePriceN1;
        //UP GROUP
        if (groupingRanges[groupingStockRangeIndex]) {
          groupingRanges[groupingStockRangeIndex].stock += detail.totalStock;
          const productRangeIndex = groupingRanges[
            groupingStockRangeIndex
          ].products.findIndex(
            (w) =>
              w.supplier === detail.supplier &&
              w.reference === detail.reference &&
              w.size === detail.size,
          );
          if (productRangeIndex === -1) {
            groupingRanges[groupingStockRangeIndex].products.push({
              department: detail.department,
              group: detail.group,
              supplier: detail.supplier,
              reference: detail.reference,
              image: detail.image,
              size: detail.size,
              totalSalePrice: 0,
              totalSale: 0,
              totalSaleDifferenceN1: 0,
              sale: 0,
              saleDifferenceN1: 0,
              unitOrder: 0,
              order: detail.order,
              totalMargin: 0,
              marginRate: 0,
              totalStock: detail.totalStock,
              stockDifferenceN1: detail.totalStock - detail.totalStockN1,
              publicSalePrice: detail.publicSalePrice,
              ddv: detail.ddv,
              rotationRate: detail.rotationRate,
              coverageRate: detail.coverageRate,
              icon: detail.icon,
              hasStockInOtherRange: false,
              isPareto: false,
              stockPurchasePrice: 0,
              stockPurchasePriceDifferenceN1: 0,
            });
          } else {
            groupingRanges[groupingStockRangeIndex].products[
              productRangeIndex
            ].totalStock += detail.totalStock;
            groupingRanges[groupingStockRangeIndex].products[
              productRangeIndex
            ].stockPurchasePriceDifferenceN1 +=
              detail.totalPaStock - detail.totalStockPurchasePriceN1;
          }
        }
        //Current GROUP
        if (currentGroupingRanges[currentGroupingStockRangeIndex]) {
          currentGroupingRanges[currentGroupingStockRangeIndex].stock +=
            detail.totalStock;
          currentGroupingRanges[
            currentGroupingStockRangeIndex
          ].stockPurchasePrice += detail.totalPaStock;
          currentGroupingRanges[currentGroupingStockRangeIndex].stockN1 +=
            detail.totalStockN1;
          currentGroupingRanges[
            currentGroupingStockRangeIndex
          ].stockPurchasePriceN1 += detail.totalStockPurchasePriceN1;
          const productRangeIndex = currentGroupingRanges[
            currentGroupingStockRangeIndex
          ].products.findIndex(
            (w) =>
              w.supplier === detail.supplier &&
              w.reference === detail.reference &&
              w.size === detail.size,
          );
          if (productRangeIndex === -1) {
            currentGroupingRanges[currentGroupingStockRangeIndex].products.push(
              {
                department: detail.department,
                group: detail.group,
                supplier: detail.supplier,
                reference: detail.reference,
                image: detail.image,
                size: detail.size,
                totalSalePrice: 0,
                totalSale: 0,
                totalSaleDifferenceN1: 0,
                sale: 0,
                saleDifferenceN1: 0,
                unitOrder: 0,
                order: detail.order,
                totalMargin: 0,
                marginRate: 0,
                totalStock: detail.totalStock,
                stockDifferenceN1: detail.totalStock - detail.totalStockN1,
                stockPurchasePrice: detail.totalPaStock,
                stockPurchasePriceDifferenceN1:
                  detail.totalPaStock - detail.totalStockPurchasePriceN1,
                publicSalePrice: detail.publicSalePrice,
                ddv: detail.ddv,
                rotationRate: detail.rotationRate,
                coverageRate: detail.coverageRate,
                icon: detail.icon,
                hasStockInOtherRange: false,
                isPareto: false,
              },
            );
          } else {
            currentGroupingRanges[currentGroupingStockRangeIndex].products[
              productRangeIndex
            ].totalStock += detail.totalStock;
            currentGroupingRanges[currentGroupingStockRangeIndex].products[
              productRangeIndex
            ].stockDifferenceN1 += detail.totalStock - detail.totalStockN1;
            currentGroupingRanges[currentGroupingStockRangeIndex].products[
              productRangeIndex
            ].stockPurchasePrice += detail.totalPaStock;
            currentGroupingRanges[currentGroupingStockRangeIndex].products[
              productRangeIndex
            ].stockPurchasePriceDifferenceN1 +=
              detail.totalPaStock - detail.totalStockPurchasePriceN1;
          }
        }
      }
      //Total
      currentGroupingSale += detail.totalSale;
      currentGroupingSalePrice += detail.totalSalePrice;
      currentGroupingMargin += detail.totalMargin;

      //N1
      currentGroupingSalePriceN1 += detail.totalSalePriceN1;
      currentGroupingSaleN1 += detail.totalSaleN1;
      currentGroupingMarginN1 += detail.totalMarginN1;
      groupingProducts.push(detail);
    });
    const salePriceMedian = this.median(currentSalesPrice);
    const rangeMedianIndex = currentGroupingRanges
      .sort((a, b) => a.minPrice - b.minPrice)
      .findIndex((w) => salePriceMedian < w.minPrice);

    //Ranges Pareto
    currentGroupingRanges
      .sort((a, b) => b.salePrice - a.salePrice)
      .map((range) => {
        let sumProductSalePrice = 0;
        range.products
          .sort((a, b) => b.totalSalePrice - a.totalSalePrice)
          .map((product) => {
            sumProductSalePrice += product.totalSalePrice;
            const productSumRate =
              (sumProductSalePrice * 100) / range.salePrice;
            product.isPareto = productSumRate <= 80;
          });
      });
    const row: AnalyseRow = {
      label,
      dataColumns: currentGroupingDataColumns,
      totalSale: currentGroupingSale,
      totalSalePrice: currentGroupingSalePrice,
      totalMargin: currentGroupingMargin,
      totalRotationRate: 0,
      stock: currentGroupingStock,
      stockPurchasePrice: currentGroupingStockPurchasePrice,
      //N1
      totalSaleN1: currentGroupingSaleN1,
      totalSalePriceN1: currentGroupingSalePriceN1,
      totalMarginN1: currentGroupingMarginN1,
      stockN1: currentGroupingStockN1,
      stockPurchasePriceN1: currentGroupingStockPurchasePriceN1,
      //Differences
      differenceN1: currentGroupingSale - currentGroupingSaleN1,
      differenceSalePriceN1:
        currentGroupingSalePrice - currentGroupingSalePriceN1,
      differenceSalePricePercentageN1: 0,
      differenceMarginN1: currentGroupingMargin - currentGroupingMarginN1,
      differenceStockN1: currentGroupingStock - currentGroupingStockN1,
      differenceStockPurchasePriceN1:
        currentGroupingStockPurchasePrice - currentGroupingStockPurchasePriceN1,
      ranges: currentGroupingRanges
        .sort((a, b) => a.minPrice - b.minPrice)
        .map((range, index) => ({
          ...range,
          isMedian: index === rangeMedianIndex,
          marginRate:
            ((range.salePrice - range.purchaseSalePrice) / range.salePrice) *
            100,
          differenceN1: range.totalSale - range.totalSaleN1,
          differenceStockN1: range.stock - range.stockN1,
          differenceStockPurchasePriceN1:
            range.stockPurchasePrice - range.stockPurchasePriceN1,
        })),

      details,
      salePriceMedian,
      // cumulativePercentage: 0,
      salePricePercentage: 0,
      salePricePercentageN1: 0,
    };
    return row;
  };

  loadMonthDateRanges = (type: Type, startDate: Date, endDate: Date) => {
    const dateArray: AnalyseHeaderColumn[] = [];
    let index = 0;
    if (type === Type.Yearly) {
      dateArray.push({
        index,
        title: `${format(startDate, 'dd/MM/yyyy')}-${format(endOfDay(endDate), 'dd/MM/yyyy')}`,
        start: startOfDay(startDate),
        end: endOfDay(endDate),
        totalSale: 0,
        totalSalePrice: 0,
        totalMargin: 0,
        totalRotationRate: 0,
      });
    } else {
      while (endOfDay(startDate) < endOfDay(endDate)) {
        if (type === Type.Quarterly) {
          dateArray.push({
            index,
            title: `${format(startDate, 'dd/MM/yyyy')}-${format(add(startDate, { months: 3 }), 'dd/MM/yyyy')}`,
            start: startDate,
            end: endOfDay(add(startDate, { months: 3 })),
            totalSale: 0,
            totalSalePrice: 0,
            totalMargin: 0,
            totalRotationRate: 0,
          });
          this.logger.debug(
            `${startDate.toLocaleDateString()} - ${endOfDay(add(startDate, { months: 3 })).toLocaleDateString()}`,
          );
          index++;
          // startDate = add(startDate, { months: 3, days: 1 });
          startDate = add(startDate, { months: 3 });
        } else {
          dateArray.push({
            index,
            title: format(startDate, 'MM/yyyy'),
            start: startOfDay(startDate),
            end: endOfMonth(startDate),
            totalSale: 0,
            totalSalePrice: 0,
            totalMargin: 0,
            totalRotationRate: 0,
          });
          index++;
          startDate = add(startDate, { months: 1 });
        }
      }
    }
    console.log(dateArray[0]);
    return dateArray;
  };

  median = (arr: number[]) => {
    const mid = Math.floor(arr.length / 2),
      nums = [...arr].sort((a, b) => a - b);
    return arr.length % 2 !== 0 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2;
  };

  formatProductDetails = (
    productDetails: ProductInformation[],
    product: Product,
    periods: AnalyseHeaderColumn[],
  ) => {
    const result: ProductAnalyse[] = [];

    [...new Set(productDetails.map((detail) => detail.supplier))].map(
      (supplier) =>
        [
          ...new Set(
            productDetails
              .filter((w) => w.supplier === supplier)
              .map((detail) => detail.reference),
          ),
        ].map((reference) =>
          [
            ...new Set(
              productDetails
                .filter(
                  (w) => w.supplier === supplier && w.reference === reference,
                )
                .map((detail) => detail.size),
            ),
          ].map((size) => {
            let lastDateIn = new Date(-8640000000000000);
            let lastDateOut = new Date(-8640000000000000);
            let totalSale = 0;

            let totalUnitOrder = 0;
            let totalSalePrice = 0;
            let totalMargin = 0;
            let totalPurchaseSalePrice = 0;
            let totalStock = 0;
            let totalPaStock = 0;
            let publicSalePrice = 0;
            let startStockPurchasePrice = 0;
            const endStockPurchasePrice = 0;
            let inPeriodPurchasePrice = 0;
            let order = 0;

            //N1
            let totalUnitOrderN1 = 0;
            let totalSaleN1 = 0;
            let totalSalePriceN1 = 0;
            let totalMarginN1 = 0;
            let totalStockN1 = 0;
            let totalStockPurchasePriceN1 = 0;
            const saleDetails: SaleDetail[] = [];
            const productPeriods: ProductPeriodAnalyse[] = [];
            periods.map((period, periodIndex) => {
              let unitOrder = 0;
              let sale = 0;

              let salePrice = 0;
              let salePriceN1 = 0;
              let margin = 0;
              let stock = 0;
              let purchaseStockPrice = 0;
              //N1
              let saleN1 = 0;
              let unitOrderN1 = 0;
              let marginN1 = 0;
              let stockN1 = 0;
              let purchaseStockPriceN1 = 0;
              productDetails
                .filter(
                  (w) =>
                    w.supplier === supplier &&
                    w.reference === reference &&
                    w.size === size,
                )
                .map((detail) => {
                  if (detail.publicSalePrice !== 0) {
                    publicSalePrice = detail.publicSalePrice;
                  }

                  if (detail.dateIn !== null && detail.dateIn > lastDateIn)
                    lastDateIn = detail.dateIn;
                  if (detail.dateOut !== null && detail.dateOut > lastDateOut)
                    lastDateOut = detail.dateOut;
                  if (periodIndex === periods.length - 1) order += detail.order;
                  //Start
                  if (detail.date < period.start) {
                    startStockPurchasePrice +=
                      Math.round(detail.stockPurchasePrice * 100) / 100;
                  }
                  //End
                  if (detail.date <= period.end) {
                    stock += Math.round(detail.stock);
                    purchaseStockPrice +=
                      Math.round(detail.stockPurchasePrice * 100) / 100;
                  }
                  //Between
                  if (
                    detail.date >= period.start &&
                    detail.date <= period.end
                  ) {
                    inPeriodPurchasePrice +=
                      Math.round(detail.purchasePrice * 100) / 100;
                    sale += detail.sale;
                    salePrice += Math.round(detail.salePrice * 100) / 100;
                    totalPurchaseSalePrice +=
                      Math.round(detail.purchaseSalePrice * 100) / 100;
                    margin +=
                      Math.round(
                        (detail.salePrice - detail.purchaseSalePrice) * 100,
                      ) / 100;

                    unitOrder += detail.unitOrder;
                    if (detail.sale !== 0 || detail.unitOrder !== 0) {
                      saleDetails.push({
                        price:
                          //TEMP FIX
                          detail.unitOrder !== 0
                            ? Math.round(detail.price * 2 * 100) / 100
                            : Math.round(detail.price * 100) / 100,
                        totalSale: detail.sale + detail.unitOrder,
                        sale: detail.sale,
                        unitOrder: detail.unitOrder,
                        salePrice: Math.round(detail.salePrice * 100) / 100,
                        purchaseSalePrice:
                          Math.round(detail.purchaseSalePrice * 100) / 100,
                        totalSaleN1: 0,
                        saleN1: 0,
                        unitOrderN1: 0,
                        salePriceN1: 0,
                        purchaseSalePriceN1: 0,
                      });
                    }
                  }
                  //Between N-1
                  if (
                    detail.date >= addYears(period.start, -1) &&
                    detail.date <= addYears(period.end, -1)
                  ) {
                    if (detail.sale !== 0 || detail.unitOrder !== 0) {
                      saleN1 += detail.sale;
                      unitOrderN1 += detail.unitOrder;
                      salePriceN1 += Math.round(detail.salePrice * 100) / 100;
                      marginN1 +=
                        Math.round(
                          (detail.salePrice - detail.purchaseSalePrice) * 100,
                        ) / 100;
                      saleDetails.push({
                        price:
                          //TEMP FIX
                          detail.unitOrder !== 0
                            ? Math.round(detail.price * 2 * 100) / 100
                            : Math.round(detail.price * 100) / 100,
                        totalSaleN1: detail.sale + detail.unitOrder,
                        saleN1: detail.sale,
                        unitOrderN1: detail.unitOrder,
                        salePriceN1: Math.round(detail.salePrice * 100) / 100,
                        purchaseSalePriceN1:
                          Math.round(detail.purchaseSalePrice * 100) / 100,
                        totalSale: 0,
                        sale: 0,
                        unitOrder: 0,
                        salePrice: 0,
                        purchaseSalePrice: 0,
                      });
                    }
                  }
                  //End N1
                  if (detail.date <= addYears(period.end, -1)) {
                    if (periodIndex === periods.length - 1) {
                      stockN1 += Math.round(detail.stock);
                      purchaseStockPriceN1 +=
                        Math.round(detail.stockPurchasePrice * 100) / 100;
                    }
                  }
                });

              //N
              totalSale += sale;
              totalSalePrice += salePrice;
              totalSalePriceN1 += salePriceN1;
              totalMargin += margin;
              totalStock = stock;
              totalPaStock = purchaseStockPrice;
              totalUnitOrder += unitOrder;
              //N-1
              totalSaleN1 += saleN1;
              totalUnitOrderN1 += unitOrderN1;
              totalMarginN1 += marginN1;
              totalStockN1 = stockN1;
              totalStockPurchasePriceN1 = purchaseStockPriceN1;
              productPeriods.push({
                index: period.index,
                totalSale: sale + unitOrder,
                sale,
                unitOrder,
                salePrice,
                margin,
                stock,
                //N1
                salePriceN1,
                // stockN1,
              });
            });

            if (
              totalSale !== 0 ||
              totalStock !== 0 ||
              totalUnitOrder !== 0 ||
              totalSaleN1 !== 0 ||
              totalUnitOrderN1 !== 0 ||
              totalStockN1 !== 0
            ) {
              const range = this.gammes[0].gammes.find(
                (w) => w.minPrice < publicSalePrice,
              );
              const ddv =
                totalStock === 0 &&
                  (lastDateOut === null || lastDateIn > lastDateOut)
                  ? null
                  : differenceInDays(
                    lastDateIn > lastDateOut ? new Date() : lastDateOut,
                    lastDateIn,
                  );

              const rotationRate =
                (startStockPurchasePrice +
                  inPeriodPurchasePrice -
                  endStockPurchasePrice) /
                (startStockPurchasePrice + endStockPurchasePrice / 2);

              if (reference === 'DJ35JB') {
                this.logger.debug(
                  `${reference}-${size} totalSale: ${totalSale + totalUnitOrder} sale:${totalSale} unitOrder:${totalUnitOrder}`,
                );
              }

              const item = {
                department: product.department,
                group: product.group,
                family: product.family,
                familyKeyword: product.familyKeyword,
                stone: product.stone,
                image: product.image,
                supplier,
                reference,
                size,
                periods: productPeriods,
                totalSale: totalSale + totalUnitOrder,
                sale: totalSale,
                unitOrder: totalUnitOrder,
                order,
                totalSalePrice,
                totalMargin,
                marginRate:
                  ((totalSalePrice - totalPurchaseSalePrice) / totalSalePrice) *
                  100,
                totalStock,
                totalPaStock,
                publicSalePrice,
                ddv,
                rotationRate,
                coverageRate: totalStock !== 0 ? 365 / rotationRate : 0,
                icon:
                  ddv === null || range === undefined
                    ? AnalyseIcon.Other
                    : ddv <= range!.order
                      ? AnalyseIcon.Order
                      : ddv <= range!.maintain
                        ? AnalyseIcon.Maintain
                        : totalSale >= range!.minSale
                          ? AnalyseIcon.Check
                          : AnalyseIcon.Remove,
                saleDetails,
                isPareto: false,
                //N1
                totalSaleN1: totalSaleN1 + totalUnitOrderN1,
                totalSalePriceN1,
                totalMarginN1,
                totalStockN1,
                totalStockPurchasePriceN1,
              };
              result.push(item);
            }
          }),
        ),
    );
    return result;
  };

  loadProductData = (
    productDetails: ProductInformation[],
    product: Product,
    startDate: Date,
    endDate: Date,
  ): ProductData[] => {
    const productsData: ProductData[] = [];
    const salesDetails: ProductDataSales[] = [];
    [...new Set(productDetails.map((detail) => detail.supplier))].map(
      (supplier) =>
        [
          ...new Set(
            productDetails
              .filter((w) => w.supplier === supplier)
              .map((detail) => detail.reference),
          ),
        ].map((reference) => {
          //Shared
          let publicSalePriceDate: Date | null = null;
          let publicSalePrice = 0;
          let orders = 0;
          let isEnabled = false;
          let productPrice = 0;
          let discountRate = 0;
          let unit = '';
          let purchasePrice = 0;
          let coefficient = 0;
          let productPublicSalePrice = 0;
          let productMarginRate = 0;
          //N
          let sales = 0;
          let totalSalesRevenue = 0;
          let unitOrders = 0;
          let totalSalesPurchasePrice = 0;
          let stock = 0;
          let stockPurchasePrice = 0;
          //N1
          let salesN1 = 0;
          let unitOrdersN1 = 0;
          let totalSalesRevenueN1 = 0;
          let totalSalesPurchasePriceN1 = 0;
          let stockN1 = 0;
          let stockPurchasePriceN1 = 0;
          const details: ProductDetailData[] = [];

          [
            ...new Set(
              productDetails
                .filter(
                  (w) => w.supplier === supplier && w.reference === reference,
                )
                .map((detail) => detail.store),
            ),
          ].map((store) =>
            [
              ...new Set(
                productDetails
                  .filter(
                    (w) =>
                      w.supplier === supplier &&
                      w.reference === reference &&
                      w.store === store,
                  )
                  .map((detail) => detail.size),
              ),
            ].map((size) => {
              //Shared
              let currentPublicSalePrice = 0;
              //N
              let currentSales = 0;
              let currentTotalSalesRevenue = 0;
              let currentUnitOrders = 0;
              let currentTotalSalesPurchasePrice = 0;
              let currentStock = 0;
              let currentStockPurchasePrice = 0;
              //N-1
              let currentTotalSalesRevenueN1 = 0;
              let currentSalesN1 = 0;
              let currentUnitOrdersN1 = 0;
              let currentTotalSalesPurchasePriceN1 = 0;
              let currentStockN1 = 0;
              let currentStockPurchasePriceN1 = 0;
              productDetails
                .filter(
                  (w) =>
                    w.supplier === supplier &&
                    w.reference === reference &&
                    w.store === store &&
                    w.size === size,
                )
                .map((detail) => {
                  productPrice = detail.productPrice;
                  isEnabled = detail.isEnabled;
                  discountRate = detail.discountRate;
                  unit = detail.unit;
                  purchasePrice = detail.purchasePrice;
                  coefficient = detail.coefficient;
                  productPublicSalePrice = detail.productPublicSalePrice;
                  productMarginRate = detail.productMarginRate;
                  orders += detail.order;
                  if (detail.publicSalePrice !== 0) {
                    currentPublicSalePrice = detail.publicSalePrice;
                  }
                  if (
                    detail.publicSalePrice > currentPublicSalePrice ||
                    (detail.publicSalePrice !== 0 &&
                      (publicSalePriceDate === null ||
                        (publicSalePriceDate !== null &&
                          detail.publicSalePriceDate !== null &&
                          detail.publicSalePriceDate >= publicSalePriceDate)))
                  ) {
                    publicSalePrice = detail.publicSalePrice;
                    publicSalePriceDate = detail.publicSalePriceDate;
                  }

                  //Between
                  if (detail.date >= startDate && detail.date <= endDate) {
                    if (product.id === 85520) console.log(detail);
                    sales += detail.sale;
                    currentSales += detail.sale;
                    totalSalesRevenue += detail.salePrice;
                    currentTotalSalesRevenue += detail.salePrice;
                    totalSalesPurchasePrice += detail.purchaseSalePrice;
                    currentTotalSalesPurchasePrice += detail.purchaseSalePrice;
                    unitOrders += detail.unitOrder;
                    currentUnitOrders += detail.unitOrder;
                    if (detail.sale !== 0 || detail.unitOrder !== 0) {
                      const salesPrice = Number(
                        detail.unitOrder !== 0
                          ? detail.price * 2
                          : detail.price,
                      );
                      const salesDetail = salesDetails.find(
                        (w) => w.salesPrice === salesPrice,
                      );
                      if (salesDetail) {
                        salesDetail.totalSales +=
                          detail.sale + detail.unitOrder;
                        salesDetail.sales += detail.sale;
                        salesDetail.totalSalesRevenue += detail.salePrice;
                        salesDetail.totalSalesMargin +=
                          detail.salePrice - detail.purchaseSalePrice;
                        salesDetail.unitOrders += detail.unitOrder;
                      } else {
                        salesDetails.push({
                          salesPrice: salesPrice,
                          totalSales: detail.sale + detail.unitOrder,
                          totalSalesRevenue: detail.salePrice,
                          totalSalesN1: 0,
                          totalSalesRevenueN1: 0,
                          totalSalesMargin:
                            detail.salePrice - detail.purchaseSalePrice,
                          totalSalesMarginN1: 0,
                          sales: detail.sale,
                          salesN1: 0,
                          unitOrders: detail.unitOrder,
                          unitOrdersN1: 0,
                        });
                      }
                    }
                  }
                  //End
                  if (detail.date <= endDate) {
                    stock += detail.stock;
                    currentStock += detail.stock;
                    stockPurchasePrice += detail.stockPurchasePrice;
                    currentStockPurchasePrice += detail.stockPurchasePrice;
                  }

                  //Between
                  if (
                    detail.date >= addYears(startDate, -1) &&
                    detail.date <= addYears(endDate, -1)
                  ) {
                    currentSalesN1 += detail.sale;
                    salesN1 += detail.sale;
                    unitOrdersN1 += detail.unitOrder;
                    currentUnitOrdersN1 += detail.unitOrder;
                    totalSalesRevenueN1 += detail.salePrice;
                    currentTotalSalesRevenueN1 += detail.salePrice;
                    currentTotalSalesPurchasePriceN1 +=
                      detail.purchaseSalePrice;
                    totalSalesPurchasePriceN1 += detail.purchaseSalePrice;
                    if (detail.sale !== 0 || detail.unitOrder !== 0) {
                      const salesPrice = Number(
                        detail.unitOrder !== 0
                          ? detail.price * 2
                          : detail.price,
                      );
                      const salesDetail = salesDetails.find(
                        (w) => w.salesPrice === salesPrice,
                      );
                      if (salesDetail) {
                        salesDetail.totalSalesN1 +=
                          detail.sale + detail.unitOrder;
                        salesDetail.totalSalesRevenueN1 += detail.salePrice;
                        salesDetail.totalSalesMarginN1 +=
                          detail.salePrice - detail.purchaseSalePrice;
                        salesDetail.salesN1 += detail.sale;
                        salesDetail.unitOrdersN1 += detail.unitOrder;
                      } else {
                        salesDetails.push({
                          salesPrice: salesPrice,
                          totalSales: 0,
                          totalSalesRevenue: 0,
                          totalSalesN1: detail.sale + detail.unitOrder,
                          totalSalesRevenueN1: detail.salePrice,
                          totalSalesMarginN1:
                            detail.salePrice - detail.purchaseSalePrice,
                          salesN1: detail.sale,
                          sales: 0,
                          unitOrders: 0,
                          unitOrdersN1: detail.unitOrder,
                          totalSalesMargin: 0,
                        });
                      }
                    }
                  }

                  //End
                  if (detail.date <= addYears(endDate, -1)) {
                    stockN1 += detail.stock;
                    currentStockN1 += detail.stock;
                    stockPurchasePriceN1 += detail.stockPurchasePrice;
                    currentStockPurchasePriceN1 += detail.stockPurchasePrice;
                  }
                });
              details.push({
                //Shared
                lastLifespan: null,
                icon: AnalyseIcon.Check,
                publicSalePrice: currentPublicSalePrice,
                store,
                size,
                //N
                totalSales: currentSales + currentUnitOrders,
                totalSalesRevenue: currentTotalSalesRevenue,
                totalSalesMargin:
                  currentTotalSalesRevenue - currentTotalSalesPurchasePrice,
                sales: currentSales,
                marginRate:
                  ((currentTotalSalesRevenue - currentTotalSalesPurchasePrice) /
                    currentTotalSalesRevenue) *
                  100,
                stock: currentStock,
                stockPurchasePrice: currentStockPurchasePrice,
                //N1
                totalSalesN1: currentSalesN1 + currentUnitOrdersN1,
                totalSalesRevenueN1: currentTotalSalesRevenueN1,
                totalSalesMarginN1:
                  currentTotalSalesRevenueN1 - currentTotalSalesPurchasePriceN1,
                stockN1: currentStockN1,
                stockPurchasePriceN1: currentStockPurchasePriceN1,
              });
            }),
          );
          if (
            sales > 0 ||
            unitOrders > 0 ||
            stock > 0 ||
            salesN1 > 0 ||
            unitOrdersN1 > 0 ||
            stockN1 > 0
          ) {
            productsData.push({
              //Shared
              department: product.department,
              group: product.group,
              family: product.family,
              familyKeyword: product.familyKeyword,
              stone: product.stone,
              supplier: supplier,
              reference: reference,
              image: product.image,
              orders,
              icon: AnalyseIcon.Check,
              publicSalePrice,
              details,
              salesDetails,
              //N
              totalSales: sales + unitOrders,
              totalSalesRevenue,
              totalSalesMargin: totalSalesRevenue - totalSalesPurchasePrice,
              sales,
              stock,
              unitOrders,
              marginRate:
                ((totalSalesRevenue - totalSalesPurchasePrice) /
                  totalSalesRevenue) *
                100,
              stockPurchasePrice,
              //N1
              totalSalesN1: salesN1 + unitOrdersN1,
              totalSalesRevenueN1,
              totalSalesMarginN1:
                totalSalesRevenueN1 - totalSalesPurchasePriceN1,
              stockN1,
              stockPurchasePriceN1,
              isEnabled,
              weight: product.weight,
              productPrice,
              discountRate,
              unit,
              purchasePrice,
              coefficient,
              productPublicSalePrice,
              productMarginRate,
            });
          }
        }),
    );
    return productsData;
  };
}

const hasMatchingKeyword = (searchKeyword: string | string[], productKeywords: string[]) => {
  const searchKeywords = Array.isArray(searchKeyword) ? searchKeyword : [searchKeyword];
  return searchKeywords.some(keyword => productKeywords.includes(keyword));
};
///TODO FIX THIS SHIT
function filterProducts(products: ProductData[], grouping: Grouping) {
  let okProduct: ProductData[] = [];
  const badProduct: ProductData[] = [];
  okProduct = products.filter((w) => {
    if (
      grouping.familyKeyword &&
      grouping.stone != null &&
      w.stone === grouping.stone &&
      hasMatchingKeyword(grouping.familyKeyword, w.familyKeyword) &&
      w.family === grouping.family &&
      grouping.group === w.group &&
      grouping.department === w.department
    ) {
      return true;
    }
    //Keyword
    else if (
      grouping.familyKeyword &&
      hasMatchingKeyword(grouping.familyKeyword, w.familyKeyword) &&
      grouping.family === w.family &&
      grouping.group === w.group &&
      grouping.department === w.department
    )
      return true;
    //Stone
    else if (
      !grouping.familyKeyword &&
      grouping.stone !== null &&
      grouping.stone === w.stone &&
      grouping.family === w.family &&
      grouping.group === w.group &&
      grouping.department === w.department
    )
      return true;
      //With Stone and without family
    else if (
      !grouping.familyKeyword &&
      grouping.withStone !== null &&
      grouping.withStone &&
      w.stone !== null &&
      grouping.family === null &&      
      grouping.group === w.group &&
      grouping.department === w.department
    )
      return true;
    //Without stone and without family
    else if (
      !grouping.familyKeyword &&
      grouping.withStone !== null &&
      !grouping.withStone &&
      w.stone === null &&
      grouping.family === null &&
      grouping.group === w.group &&
      grouping.department === w.department
    )
      return true;    
    //With Stone
    else if (
      !grouping.familyKeyword &&
      grouping.withStone !== null &&
      grouping.withStone &&
      w.stone !== null &&
      grouping.family === w.family &&
      grouping.group === w.group &&
      grouping.department === w.department
    )
      return true;
    //Without stone
    else if (
      !grouping.familyKeyword &&
      grouping.withStone !== null &&
      !grouping.withStone &&
      w.stone === null &&
      grouping.family === w.family &&
      grouping.group === w.group &&
      grouping.department === w.department
    )
      return true;              
    //Family
    else if (
      !grouping.familyKeyword &&
      grouping.stone === null &&
      grouping.withStone === null &&
      grouping.family === w.family &&
      grouping.group === w.group &&
      grouping.department === w.department
    )
      return true;
    //Group
    else if (
      !grouping.familyKeyword &&
      grouping.stone === null &&
      grouping.withStone === null &&
      grouping.group !== null &&
      grouping.family === null &&
      grouping.group === w.group &&
      w.department === grouping.department
    ) {
      return true;
      //Department
    } else if (
      !grouping.familyKeyword &&
      grouping.stone === null &&
      grouping.withStone === null &&
      grouping.family === null &&
      grouping.group === null &&
      w.department === grouping.department
    ) {
      return true;
    }
    badProduct.push(w);
    return false;
  });
  return { okProduct, badProduct };
}

