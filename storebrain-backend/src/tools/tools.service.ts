import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { createReadStream, readFile, readFileSync, writeFileSync } from 'fs';
const zip = require("@zip.js/zip.js");
import fs from 'fs';

import Papa from 'papaparse';
import { OnerpService } from 'src/onerp/onerp.service';

import * as csv from 'fast-csv';
import { PrismaService } from 'src/prisma/prisma.service';
import { BalanceRowDetail, PriceUpdateRowArticle, Status } from '@prisma/client';
import { add, differenceInDays, endOfDay, format, max, startOfDay } from 'date-fns';
import { CreateBalanceDto } from './dto/create-balance.dto';
import { InjectPinoLogger } from 'nestjs-pino';
import ExcelJS from 'exceljs';
import archiver from 'archiver';
import { createWriteStream } from 'fs';

@Injectable()
export class ToolsService {
  constructor(
    @InjectPinoLogger(ToolsService.name)
    private readonly logger: Logger,
    private onerpService: OnerpService, private prisma: PrismaService) { }
  async readMissingSizeForOrderCsv(file: Express.Multer.File) {
    const csvFile = readFileSync(file.path, { encoding: 'utf8' });
    const parsedData = Papa.parse<CsvMissingSizeForOrder>(csvFile, {
      header: true,
      dynamicTyping: true,
      delimiter: ';',
      skipEmptyLines: true,
      transformHeader(header, index) {
        if (index === 0) return 'supplier';
        if (index === 1) return 'reference';
        return '';
      },
    });
    const onerpOrderRows: OneRPOrderRow[] = [];
    console.log(parsedData.data[parsedData.data.length - 1]);
    await Promise.all(
      parsedData.data.map(async (data) => {
        const supplierId = 1;
        const productData = await this.onerpService.getDefaultSizeForProduct(
          supplierId,
          data.reference,
        );
        if (!productData.isEnabled) console.log(`${data.reference} inactif`);
        else {
          onerpOrderRows.push({
            supplier: supplierId,
            reference: data.reference,
            size: productData.size,
            store: 116,
            qty: 1,
            type: 'STOCK',
            weightCount: 'N',
          });
        }
      }),
    );
    csv.writeToPath('upload/tmp/order.csv', onerpOrderRows, {
      headers: true,
      delimiter: ';',
    });
    return;
  }

  async readPriceUpdateCsv(file: Express.Multer.File) {
    const priceUpdates: PriceUpdate[] = [];
    const csvFile = readFileSync(file.path, { encoding: 'utf8' });
    const parsedData = Papa.parse<CsvPriceUpdate>(csvFile, {
      header: true,
      dynamicTyping: true,
      delimiter: ';',
      skipEmptyLines: true,
      transformHeader(header, index) {
        if (index === 0) return 'supplierId';
        if (index === 1) return 'reference';
        if (index === 2) return 'price';
        return '';
      },
      transform: (value, field) => {
        if (field === 'price') {
          return parseFloat(value.replace(',', '.'));
        }
        return value;
      },
    });

    const validItems = parsedData.data.filter(row => {
      return typeof row.reference === 'string' &&
        typeof row.price === 'number' &&
        !isNaN(row.price);
    });

    await Promise.all(validItems.map(async (item) => {
      const produitFournisseur = await this.onerpService.getProduitFournisseur(item.supplierId, item.reference);
      if (produitFournisseur[0]) {
        const lastPrice = Math.round(produitFournisseur[0].prixfaconht * 100) / 100;
        const newPrice = Math.round(item.price * 100) / 100;

        let cours = 80;


        if (produitFournisseur[0].unite !== "€/pc") {
          console.log(`${item.reference} ATTENTION GR`);
        }
        const newPurchasePrice = this.calculatePurchasePrice(item.price, cours, produitFournisseur[0].perte, produitFournisseur[0].frais, produitFournisseur[0].poidsmatiere);
        const newSalePrice = this.roundSalePrice(newPurchasePrice * 6);
        const priceUpdateArticles: PriceUpdateArticle[] = [];
        const articleMagasinMouvements = await this.onerpService.getArticleMagasinMouvement(item.reference, item.supplierId);


        articleMagasinMouvements.forEach(articleMagasinMouvement => {
          priceUpdateArticles.push({
            shop: articleMagasinMouvement.magasin,
            article: articleMagasinMouvement.article,
            purchasePrice: articleMagasinMouvement.prixachatht,
            lastSalePrice: articleMagasinMouvement.prixventettc,
            newSalePrice: newSalePrice,
            stock: articleMagasinMouvement.stock,
            coefficient: Math.round(newSalePrice / articleMagasinMouvement.prixachatht * 100) / 100,
            salePriceDifference: newSalePrice - articleMagasinMouvement.prixventettc,
          })
        })
        console.log(priceUpdateArticles);

        await this.prisma.priceUpdate.createMany({
          data: []
        })

        priceUpdates.push({
          supplier: 'X',
          reference: item.reference,
          newPrice: newPrice,
          lastPrice: lastPrice,
          priceDifference: newPrice - lastPrice,
          newPurchasePrice: newPurchasePrice,
          newSalePrice: newSalePrice,
          priceUpdateArticles: priceUpdateArticles,
          stock: priceUpdateArticles.reduce((acc, curr) => acc + curr.stock, 0),
        })


      }
    }));

    const priceUpdate = await this.prisma.priceUpdate.create({
      data: {
        date: new Date(),
        rows: {
          create: priceUpdates.filter(w => w.stock > 0).map(priceUpdate => ({
            reference: priceUpdate.reference,
            lastPrice: priceUpdate.lastPrice,
            newPrice: priceUpdate.newPrice,
            priceDifference: priceUpdate.priceDifference,
            newPurchasePrice: priceUpdate.newPurchasePrice,
            newSalePrice: priceUpdate.newSalePrice,
            stock: priceUpdate.stock,
            articles: {
              create: priceUpdate.priceUpdateArticles.map(article => ({
                shop: article.shop,
                article: article.article,
                stock: article.stock,
                purchasePrice: article.purchasePrice,
                lastSalePrice: article.lastSalePrice,
                newSalePrice: article.newSalePrice,
              }))
            }
          }))

        }
      }
    })

    return priceUpdate;
  }

  calculatePurchasePrice(price: number, cours: number, perte: number, frais: number, poidsmatiere: number) {
    const materialPrice = (cours * perte + frais) * poidsmatiere;
    return Math.round((price + materialPrice) * 100) / 100;
  }

  roundSalePrice(price: number) {
    const roundedPrice = Math.floor(price)

    if (roundedPrice >= 1000) {
      const dividend = Math.floor(roundedPrice / 100);
      const modulo = roundedPrice % 100;
      return dividend * 100 + (modulo > 50 ? 90 : 50);
    } else if (roundedPrice >= 100) {
      const dividend = Math.floor(roundedPrice / 10);
      const modulo = roundedPrice % 100;
      return dividend * 10 + (modulo > 50 ? 9 : 5);
    } else {
      const dividend = Math.floor(roundedPrice / 10);
      const modulo = roundedPrice % 10;
      if (modulo === 0) {
        return dividend * 10;
      }
      return dividend * 10 + (modulo > 5 ? 9.90 : 4.90);
    }
  }

  async getLastPriceUpdate() {
    return await this.prisma.priceUpdate.findFirst({
      orderBy: {
        date: 'desc'
      },
      include: {
        rows: {
          include: {
            articles: true
          }
        }
      }
    });
  }

  async deletePriceUpdateRow(id: number) {
    try {
      await this.prisma.priceUpdateRow.delete({
        where: { id },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`PriceUpdateRow avec l'id ${id} non trouvé`);
      }
      throw error;
    }
  }

  async deletePriceUpdateRowArticle(id: number) {
    try {
      await this.prisma.priceUpdateRowArticle.delete({
        where: { id },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`PriceUpdateRowArticle avec l'id ${id} non trouvé`);
      }
      throw error;
    }
  }

  async updatePriceUpdateRowArticle(id: number, updateData: Partial<PriceUpdateRowArticle>) {
    try {
      const updatedArticle = await this.prisma.priceUpdateRowArticle.update({
        where: { id },
        data: updateData,
      });
      return updatedArticle;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`PriceUpdateRowArticle avec l'id ${id} non trouvé`);
      }
      throw error;
    }
  }

  async updatePriceUpdateRowStatus(id: number) {
    try {
      const updatedRow = await this.prisma.priceUpdateRow.update({
        where: { id },
        data: { status: Status.COMPLETED },
      });
      return updatedRow;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`PriceUpdateRow avec l'id ${id} non trouvé`);
      }
      throw error;
    }
  }

  async getOrderDownload(id: number) {
    const priceUpdateOrderRows: PriceUpdateOrderRow[] = [];
    const priceUpdate = await this.prisma.priceUpdate.findUnique({
      where: { id },
      include: {
        rows: {
          include: {
            articles: true
          }
        }
      }
    })
    if (!priceUpdate) throw new NotFoundException(`PriceUpdate avec l'id ${id} non trouvé`);

    const magasins = await this.onerpService.getMagasin();
    const supplier = 'Sofabi';
    await Promise.all(priceUpdate.rows.filter(w => w.status === Status.COMPLETED).map(async row => {
      const details = await this.onerpService.getHistorique(row.reference, 1, format(add(new Date(), { years: -1 }), 'yyyy-MM-dd'), format(new Date(), 'yyyy-MM-dd'));
      const currentOrderRow: PriceUpdateOrderRow[] = [];
      magasins.forEach(magasin => {
        let purchase = 0;
        let sale = 0;
        let unitOrder = 0;
        let stock = 0;

        const shopDetail = details.find(detail => detail.numero === magasin.numero);

        if (shopDetail) {
          purchase = shopDetail.achat;
          sale = shopDetail.vente;
          stock = shopDetail.stock;
          unitOrder = shopDetail.cu;
        }
        currentOrderRow.push({
          family: shopDetail?.famille ?? '',
          material: shopDetail?.matiere ?? null,
          stone: shopDetail?.pierre ?? null,
          supplier: supplier,
          reference: row.reference,
          size: shopDetail?.taille ?? null,
          shop: magasin.numero,
          purchase: purchase,
          sale: sale,
          stock: stock,
          order: shopDetail?.commande ?? 0,
          unitOrder: unitOrder,
          lastLifeSpan: shopDetail?.ddv ?? null,
          newPurchasePrice: row.newPurchasePrice,
          newSalePrice: row.newSalePrice,
          commercialLabel: shopDetail?.libellecommercial ?? '',
        })
      })
      priceUpdateOrderRows.push({
        family: details[0]?.famille ?? '',
        material: details[0]?.matiere ?? null,
        stone: details[0]?.pierre ?? null,
        supplier: supplier,
        reference: row.reference,
        size: details[0]?.taille ?? null,
        shop: 0,
        purchase: details.reduce((acc, curr) => acc + curr.achat, 0),
        sale: details.reduce((acc, curr) => acc + curr.vente, 0),
        stock: details.reduce((acc, curr) => acc + curr.stock, 0),
        order: details.reduce((acc, curr) => acc + curr.commande, 0),
        unitOrder: details.reduce((acc, curr) => acc + curr.cu, 0),
        lastLifeSpan: null,
        newPurchasePrice: row.newPurchasePrice,
        newSalePrice: row.newSalePrice,
        commercialLabel: details[0]?.libellecommercial ?? '',
      })
      priceUpdateOrderRows.push(...currentOrderRow.sort((a, b) => a.shop! - b.shop!));
    }))


    // Formater newSalePrice avec une virgule
    const formattedRows = priceUpdateOrderRows.map(row => ({
      ...row,
      newPurchasePrice: row.newPurchasePrice.toString().replace('.', ','),
      newSalePrice: row.newSalePrice.toString().replace('.', ','),
    }));

    // Définir le chemin du fichier CSV
    const csvFilePath = 'upload/tmp/price_update_order.csv';

    // Convertir les données en CSV avec Papa Parse
    const csv = Papa.unparse(formattedRows, {
      delimiter: ';',
      header: true
    });

    // Écrire le CSV dans un fichier
    writeFileSync(csvFilePath, csv, 'utf8');

    // Retourner le chemin du fichier CSV
    return csvFilePath;
  }

  async createBalance(createBalanceDto: CreateBalanceDto) {
    const removeIfAllStoreHasStock = true;
    console.log('Start Balance')
    const magasins = await this.onerpService.getMagasin();
    const receiverStore: { id: number, numero: number }[] = [];
    createBalanceDto.receiverStoreIds.map(receiverStoreId => {
      const magasin = magasins.find(magasin => magasin.id === receiverStoreId);
      if (magasin) receiverStore.push({ id: magasin.id, numero: magasin.numero });
    });
    const histories = await this.onerpService.getHistory2(createBalanceDto.departments, [...createBalanceDto.senderStoreIds, ...createBalanceDto.receiverStoreIds], format(startOfDay(add(new Date(), { years: -1 })), "yyyy-MM-dd"), format(endOfDay(new Date()), "yyyy-MM-dd"));
    const references = [...new Set(histories.filter(w => createBalanceDto.senderStoreIds.includes(w.magasinId) && w.stock > 0).map(w => w.reference))];
    const balanceRows: CreateBalanceRow[] = [];
    references.map(async reference => {
      const referenceHistories = histories.filter(w => w.reference === reference);
      const balanceRow: CreateBalanceRow = {
        image: referenceHistories[0]?.image ?? null,
        reference: reference,
        stock: 0,
        remaining: 0,
        details: []

      }
      const balanceRowDetails: CreateBalanceRowDetail[] = []
      createBalanceDto.senderStoreIds.map(async senderStoreId => {
        const magasin = magasins.find(magasin => magasin.id === senderStoreId);
        const senderHistories = referenceHistories.filter(w => w.magasinId === senderStoreId);
        const senderStock = senderHistories.reduce((acc, curr) => acc + curr.stock, 0);
        const senderTotalSales = senderHistories.reduce((acc, curr) => acc + curr.vente + curr.cu, 0);
        //SIEGE TAKE ALL
        if (magasin?.siege) {
          balanceRow.stock += senderStock;
        }
        //SINON SI PAS DE VENTE
        else if (senderStock > 0 && senderTotalSales === 0) balanceRow.stock += senderStock;
      })
      if (balanceRow.stock === 0) return;

      createBalanceDto.receiverStoreIds.map(async receiverStoreId => {
        const receiverHistories = referenceHistories.filter(w => w.magasinId === receiverStoreId);
        let maxEntree: Date | null = null;
        let maxSortie: Date | null = null;
        maxEntree = max(receiverHistories.filter(w => w.entree !== null).map(w => w.entree!));
        maxSortie = max(receiverHistories.filter(w => w.sortie !== null).map(w => w.sortie!));
        let lastLifeSpan = null;
        if (maxSortie && maxEntree && maxSortie > maxEntree) lastLifeSpan = differenceInDays(maxSortie, maxEntree);
        else if (maxEntree && receiverHistories.reduce((acc, curr) => acc + curr.stock, 0) > 0) lastLifeSpan = differenceInDays(new Date(), maxEntree);
        balanceRowDetails.push({
          receiverStoreId: receiverStoreId,
          storeNumber: receiverStoreId,
          stock: receiverHistories.reduce((acc, curr) => acc + curr.stock, 0),
          qty: 0,
          totalSales: receiverHistories.reduce((acc, curr) => acc + curr.vente + curr.cu, 0),
          lastLifeSpan,
        })
      })
      if (removeIfAllStoreHasStock && balanceRowDetails.every(w => w.stock > 0)) return;
      balanceRows.push({
        ...balanceRow,
        details: balanceRowDetails
      });
    })
    const balance = await this.prisma.balance.create({
      data: {
        senderStoreIds: createBalanceDto.senderStoreIds,
        receiverStoreIds: createBalanceDto.receiverStoreIds,
        rows: {
          create: balanceRows.map(row => ({
            reference: row.reference,
            stock: row.stock,
            remaining: row.stock,
            image: row.image,
            details: {
              create: row.details.map(detail => ({
                receiverStoreId: detail.receiverStoreId,
                stock: detail.stock,
                quantity: detail.qty,
                totalSales: detail.totalSales,
                lastLifeSpan: detail.lastLifeSpan
              }))
            }
          }))
        }
      }
    })
    const senderStore = magasins.filter(magasin => balance.senderStoreIds.includes(magasin.id));
    return { balance, headers: [...senderStore.map(magasin => ({ id: magasin.id, label: magasin.numero.toString() })), ...receiverStore.map(magasin => ({ id: magasin.id, label: magasin.numero.toString() }))] };
  }

  async getBalance(id: number) {
    const magasins = await this.onerpService.getMagasin();
    const balance = await this.prisma.balance.findUnique({
      where: { id },
      include: { rows: { include: { details: true } } }
    });
    if (!balance) throw new NotFoundException(`Balance avec l'id ${id} non trouvé`);
    const receiverStore = magasins.filter(magasin => balance.receiverStoreIds.includes(magasin.id));
    return { balance, headers: receiverStore.map(magasin => ({ id: magasin.id, label: magasin.numero.toString() })) };
  }

  async getLastBalance() {
    const magasins = await this.onerpService.getMagasin();
    const balance = await this.prisma.balance.findFirst({ orderBy: { id: 'desc' }, include: { rows: { include: { details: true } } } });
    if (!balance) return null;
    const receiverStore = magasins.filter(magasin => balance.receiverStoreIds.includes(magasin.id));
    return { balance, headers: receiverStore.map(magasin => ({ id: magasin.id, label: magasin.numero.toString() })) };
  }

  async deleteBalanceRow(id: number) {
    await this.prisma.balanceRow.delete({ where: { id } });
  }

  async updateBalanceRow(id: number, data: any) {
    await this.prisma.balanceRow.update({
      where: { id },
      data: {
        remaining: data.stock - data.details.reduce((acc: number, curr: { quantity: number }) => acc + curr.quantity, 0),
        details: {
          update: data.details.map((detail: { id: number, quantity: number }) => ({
            where: { id: detail.id },
            data: {
              quantity: detail.quantity
            }
          }))
        }
      }
    });
  }

  async completeBalanceRow(id: number) {
    await this.prisma.balanceRow.update({ where: { id }, data: { status: Status.COMPLETED } });

  }

  async downloadBalance(id: number) {
    console.log('downloadBalance', id);
    const { balance } = await this.getBalance(id);
    const magasins = await this.onerpService.getMagasin();
    await Promise.all(balance.rows.filter(w => w.status === Status.COMPLETED).map(async row => {
      const histories = await this.onerpService.getHistory2ByReference(row.reference, [...balance.receiverStoreIds, ...balance.senderStoreIds], format(add(balance.date, { years: -1 }), 'yyyy-MM- dd'), format(balance.date, 'yyyy-MM-dd'));
      const senderStoreItems: SenderStoreItem[] = [];
      balance.senderStoreIds.map(async senderStoreId => {
        const senderMagasin = magasins.find(magasin => magasin.id === senderStoreId);
        const stock = histories.find(w => w.magasinId === senderStoreId)?.stock ?? 0;
        if (stock > 0) {
          senderStoreItems.push({
            reference: row.reference,
            storeNumber: senderMagasin?.numero ?? 0,
            type: senderMagasin?.siege ? 'SIEGE' : 'MAGASIN',
            lastLifeSpan: this.calculateLastLifeSpan(histories.filter(w => w.magasinId === senderStoreId)),
            stock: stock,
            details: histories.filter(w => w.stock > 0).map(w => ({
              article: w.article,
              stock: w.stock
            }))
          })
        }
      })
      console.log(senderStoreItems);
    }))

    return;
  }

  private calculateLastLifeSpan(histories: Historique2[]) {
    let maxEntree: Date | null = null;
    let maxSortie: Date | null = null;
    maxEntree = max(histories.filter(w => w.entree !== null).map(w => w.entree!));
    maxSortie = max(histories.filter(w => w.sortie !== null).map(w => w.sortie!));
    let lastLifeSpan = null;
    if (maxSortie && maxEntree && maxSortie > maxEntree) lastLifeSpan = differenceInDays(maxSortie, maxEntree);
    else if (maxEntree && histories.reduce((acc, curr) => acc + curr.stock, 0) > 0) lastLifeSpan = differenceInDays(new Date(), maxEntree);
    return lastLifeSpan;
  }

  async generateOnerp(onerpType: string, file: Express.Multer.File) {
    let items: OneRPProductModel[] = [];
    let csvFilePath = '';
    if (onerpType === 'additif-coque') {
      items = await this.readOnerpAdditifCoqueFile(file);
      csvFilePath = 'upload/tmp/additif-coque.csv';


    } else if (onerpType === 'creation-fairbelle') {
      items = this.readOnerpCreationFairbelleFile(file);
      csvFilePath = 'upload/tmp/creation-fairbelle.csv';
    } else if (onerpType === 'fairbelle-pictures') {
      const pictures = this.readOnerpFairbellePictures(file);
      csvFilePath = 'upload/tmp/fairbelle-pictures.zip';
    }

    if(onerpType === 'additif-coque' || onerpType === 'creation-fairbelle') {
    // Convertir les données en CSV avec Papa Parse
    const csv = Papa.unparse(items, {
      delimiter: ';',
      header: true
    });

    // Écrire le CSV dans un fichier
    writeFileSync(csvFilePath, csv, 'utf8');
  }
  }

  private async readOnerpAdditifCoqueFile(file: Express.Multer.File) {
    const cleanKeywords = [
      '750',
      '925',
      'ROSE',
      'RUTHENIUM',
      'NOIRE',
      'NOIR',
      'BLEUE',
      'ROUGE',
      'PIERRE DE LAVE',
      'PERLE MIYUKI',
      'TIGE',
      'APATITE',
      'OBSIDIENNE',
      'IMITATION ONYX',
      "A L'UNITE",
      'A L UNITE',
      'RESINE',
      'RUBIS ZOISITE',
      'FLUORITE',
      'JASPE DALMATIEN',
      'VERT',
      'SODALITE',
      'DIVERS',
      'DORE',
      'OR',
      'LABRADITE',
      'CAOUTCHOUC',
      '10/000',
      'CALCEDOINE',
      'HEMATITE',
      'VERTE',
      'BLEU',
      'TRAITE',
      'BIWA',
      'SYNTH',
      'ET'
    ]
    const rayonFilters = [
      {value: 'ARGENT', onerp: 'ARGENT'}, 
      {value: 'PL-OR', onerp: 'PLAQUE_OR'},
      {value: 'PL OR', onerp: 'PLAQUE_OR'},
      {value:'ACIER', onerp: 'ACIER'},
      {value:'CUIR', onerp: 'FANTAISIE'},
      {value:'BRACELET DIVERS', onerp: 'FANTAISIE'},
    ]
   const matiereFilters = [
    {value: 'ARGENT', onerp: '58'}, 
    {value: 'PL-OR', onerp: '59'},
    {value: 'PL OR', onerp: '59'},
    {value: 'ACIER', onerp: '60'},  
    {value: 'CUIR', onerp: '62'},
  ]

  const matiereMotCleFilters = [
    {value: '3MIC', motCles: '855'},
    {value: 'RHODIE', motCles: '301'},
    {value: 'LAQUE', motCles: '421'},
    {value: 'BICOLORE', motCles: '49'},
    {value: 'BIC', motCles: '49'},
    {value: 'NACRE', motCles: '241'},
    {value: 'PVD', motCles: '1525'},
    {value: 'CARBONE', motCles: '137'},
    {value: 'MATE', motCles: '1138'},
  ]

  const familleFilters = [
    {value: "BAGUE D'OREILLE", onerp: '55'},
    {value: "BAGUE D OREILLE", onerp: '55'},
    {value: 'CHAINE CHEVILLE', onerp: '21'},
    {value: 'COLLIER', onerp: '46'},
    {value: 'CORDON', onerp: '46'},
    {value: 'SAUTOIR', onerp: '46'},
    {value: 'BAGUE', onerp: '26'},    
    {value: 'BRACELET', onerp: '44'},
    {value: 'PENDENTIF', onerp: '49'},
    {value: 'CHAINE', onerp: '48'},
    {value: 'CREOLES', onerp: '56'},
    {value: 'CREOLE', onerp: '56'},
    {value: 'JONC', onerp: '125'},
    {value: 'B.O', onerp: '55'},
    {value: 'BO', onerp: '55'},
    {value: 'IDENTITE', onerp: '45'},
    {value: 'MOUSQUETON', onerp: '88'},
    {value: 'MOUSQUETONS', onerp: '88'},
    {value: 'PAIRE DE BRELOQUES', onerp: '88'},
    {value: 'FERMOIR', onerp: '88'},
    {value: 'RALLONGE', onerp: '88'},
    
  ]

  const familleMotClesFilters = [
    {value:'COQUILLAGE', onerp: '168'},
    {value:'VERSEAU', onerp: '604'},
    {value:'POISSON', onerp: '297'},
    {value:'POISSONS', onerp: '297'},
    {value:'BELIER', onerp: '598'},
    {value:'TAUREAU', onerp: '380'},
    {value:'GEMEAUX', onerp: '599'},
    {value:'CANCER', onerp: '600'},
    {value:'LION', onerp: '537'},
    {value:'VIERGE', onerp: '65'},
    {value:'SCORPION', onerp: '540'},
    {value:'CAPRICORNE', onerp: '603'},
    {value:'BALANCE', onerp: '601'},
    {value:'SAGITTAIRE', onerp: '602'},
    
  ]
  const pierreFilters = [
    {value: 'OZ', onerp: '28'},
    {value: 'CRISTAL', onerp: '28'},
    {value: 'CERAMIQUE', onerp: '28'},
    {value: 'PS', onerp: '37'},
    {value: 'PV', onerp: '37'},
    {value: 'IMITATION PIERRE', onerp: '37'},
    {value: 'AGATE', onerp: '38'},
    {value: 'AMAZONITE', onerp: '153'},
    {value: 'AVENTURINE', onerp: '156'},
    {value: 'AMETHYSTE', onerp: '35'},
    {value: 'LABRADORITE', onerp: '132'},
    {value: 'PERLE IMITATION', onerp: '39'},
    {value: 'IMITATIONPERLE', onerp: '39'},
    {value: 'IMITATION PERLE', onerp: '39'},
    {value: 'PERLES IMITATION', onerp: '39'},
    {value: 'MALACHITE', onerp: '173'},
    {value: 'PERLE DE CULTURE', onerp: '39'},
    {value: 'PERLES DE CULTURE', onerp: '39'},
    {value: 'OEIL DE TIGRE', onerp: '129'},
    {value: 'PIERRE DE LUNE', onerp: '174'},
    {value: 'RHODONITE', onerp: '167'},
    {value: 'QUARTZITE', onerp: '155'},
    {value: 'QUARTZ', onerp: '155'},
    {value: 'GRENAT', onerp: '33'},
    {value: 'TOURMALINE', onerp: '166'},
    {value: 'ONYX', onerp: '157'},
    {value: 'PERIDOT', onerp: '175'},
    {value: 'JASPE', onerp: '159'},
  
    

  ]
    const items: OneRPProductModel[] = [];
    const csv = Papa.parse(file.buffer.toString(),
      {
        delimiter: ';',
        header: true, dynamicTyping: true, transformHeader(header, index) {
          switch (index) {
            case 0: return 'reference';
            case 1: return 'designation';
            case 2: return 'poids';
            case 3: return 'prixAchat';
          }
          return header;
        },
      });

      const fournisseurId = 46;
      const referencesResult = await this.onerpService.getReferenceByFournisseurId(fournisseurId);
      const references = referencesResult.map(row => row.reference);    csv.data
    .filter((item: OnerpAdditifCoqueFile) =>   !references.includes(item.reference.toString()) && !item.designation.includes('PRESENTOIR') )
    .forEach((item: OnerpAdditifCoqueFile) => { 
      if(items.length > 1999 || items.find(findItem => findItem.reference.toString() === item.reference.toString())) return;
      let reference = item.reference;
      let rayon = null;
      let matiere = null;
      let matiereMotCles: string[] = [];
      let famille = null;
      let familleMotCles: string[] = [];
      let pierre = null;
      let pierreMotCles: string[] = [];
      let taille = null;
      let taillMin = null;
      let taillMax = null;
      let increment = null;
      let poids: number | null = item.poids ;
      let prixAchat = item.prixAchat;
      const facon = 'P'
      const remise = 0;
      let coursMatiere: number | null = 0;

      if (item.designation) {
        
        //RAYON
        rayonFilters.forEach(rayonFilter=> {
          if (item.designation.includes(rayonFilter.value)) {
            rayon = rayonFilter.onerp;
          }
        })
        if(!rayon) { rayon='FANTAISIE'}
        //MATIERE
        matiereFilters.forEach(matiereFilter=> {
          if (item.designation.includes(matiereFilter.value)) {
            matiere = matiereFilter.onerp;
            item.designation = item.designation.replace( new RegExp(`\\b${matiereFilter.value}\\b`, 'i'), '').trim();
          }
        })
        matiereMotCleFilters.forEach(matiereMotCleFilter=> {
          if (item.designation.includes(matiereMotCleFilter.value)) {
            matiereMotCles.push(matiereMotCleFilter.motCles);
            item.designation = item.designation.replace( new RegExp(`\\b${matiereMotCleFilter.value}\\b`, 'i'), '').trim();
          }
        })
        //FAMILLE
        familleFilters.forEach(familleFilter=> {
          if (item.designation.includes(familleFilter.value)) {
            famille = familleFilter.onerp;
            item.designation = item.designation.replace( new RegExp(`\\b${familleFilter.value}\\b`, 'i'), '').trim();
          }
        })
        familleMotClesFilters.forEach(familleMotClesFilter=> {
          if (item.designation.includes(familleMotClesFilter.value)) {
            familleMotCles.push(familleMotClesFilter.onerp);
            item.designation = item.designation.replace( new RegExp(`\\b${familleMotClesFilter.value}\\b`, 'i'), '').trim();
          }
        })
        cleanKeywords.forEach(cleanKeyword=> {
          if (item.designation.includes(cleanKeyword)) {
            item.designation = item.designation.replace( new RegExp(`\\b${cleanKeyword}\\b`, 'i'), '').trim();
          }
        })

        //PIERRE
        pierreFilters.forEach(pierreFilter=> {
          if (item.designation.includes(pierreFilter.value)) {
            pierre = pierreFilter.onerp;
            item.designation = item.designation.replace( new RegExp(`\\b${pierreFilter.value}\\b`, 'i'), '').trim();
          }
        })

        //CLEAN LOT DE NOMBRE
        item.designation = item.designation.replace(/LOT DE \d+/g, '').trim();


         //TAILLE
         if (famille === "26") {
          taille = 54;
          taillMin = 50;
          taillMax = 60;
          increment = 2;
        } else if (famille === "44" || famille === "46" || famille === "125" || famille === "48" || famille === "21" || famille === "45") {
          taille = parseInt(item.reference.toString().slice(-2));
          taillMin = taille;
          taillMax = taille;
          increment = 2;
        }
        
        //CLEAN POIDS FANTAISIE
        if(rayon === 'FANTAISIE') {
          poids = null;
          coursMatiere = null;
          if(!matiere) {matiere = '70'}
        } else if(rayon === 'PLAQUE_OR') {
          coursMatiere = null;
        } else if(rayon === 'ACIER') {
          coursMatiere = null;
        }

        if(!rayon) {
          // console.log('RAYON MANQUANT ', reference,' ', item.designation);
        } else if(rayon !== 'FANTAISIE' && !matiere) {
          // console.log('MATIERE MANQUANT ', reference,' ', item.designation);
        } else if(!famille) {
          // console.log('FAMILLE MANQUANT ', reference,' ', item.designation);
        } else if(item.designation.length > 0) {
          console.log('MANQUANT ', reference,' ', item.designation);
        }
        else {
          items.push({
            marque: null,
            reference: reference.toString().replaceAll('-', ''),
            rayon: rayon!,
            famille: famille!,
            taille: taille,
            taillMin: taillMin,
            taillMax: taillMax,
            increment: increment,
            familleMotCles: matiereMotCles.join(','),
            matiere: matiere!,
            poids: poids ? poids.toString().replace(',', '.') : null,
            matiereCours: coursMatiere,
            matiereMotCles: matiereMotCles.join(','),
            pierre: pierre!,
            poidsPierre: null,
            pierreMotCles: pierreMotCles.join(','),
            composant: null,
            poidsComposant: null,
            coursComposant: null,
            composantMotCles: null,
            prixFacon: prixAchat.toString().replace(',', '.'),
            remise: remise,
            facon: facon,
            prixAchat: prixAchat.toString().replace(',', '.'),
            coefficient: 6,
            min: null,
            max: null,
            pvp: null,
            pvpFixe: null,
            pvpMin: null,
            pvpMax: null,
            commentaire: item.designation,
            complete: 'N',
            catalogue: 'N',
            produit: null,
            magasins: null,
            stockMini: null,
            stockMax: null,
            referenceInterne: null,
            tailles: null,
          })
        }
        
      }
    })
    return items;
  }

  private readOnerpCreationFairbelleFile(file: Express.Multer.File) {
    const items: OneRPProductModel[] = [];
    const csv = Papa.parse(file.buffer.toString(),
      {
        header: true, dynamicTyping: true, transformHeader(header, index) {
          switch (index) {
            case 0: return 'reference_18';
            case 1: return 'reference_9';
            case 2: return 'reference_pt';
            case 3: return 'reference_pd';
            case 4: return 'nb_pierre';
            case 5: return 'carat_total';
            case 6: return 'qualite_pierre';
            case 7: return 'libelle';
            case 8: return 'taille_standard';
            case 9: return 'alliage';
            case 10: return 'facon';
            case 11: return 'poids_18';
            case 12: return 'prix_facon_18';
            case 13: return 'poids_9';
            case 14: return 'prix_facon_9';
            case 15: return 'poids_pt';
            case 16: return 'prix_facon_pt';
            case 17: return 'poids_pd';
            case 18: return 'prix_facon_pd';
          }
          return header;
        },
      });
      const familleFilter = [
        {value: 'FANTAISIE', motCles: '76'},
        {value: 'FANT', motCles: '76'},
        {value: 'RUBAN', motCles: '704'},
        {value: 'PLAT', motCles: '885'},
        {value: 'CONFORT', motCles: '1662'},
        {value: '1/2 JONC', motCles: '429'},
        {value: '1/2 BOMBE', motCles: '423'},
        {value: 'BOMBE', motCles: '1001'},
        {value: 'ENTRELACEE', motCles: '747'},
        {value: 'PRENOMS POLIE', motCles: '1666'},
        {value:'LEGERE', motCles: '1667'},
        {value:'MOBILE', motCles: '768'},
        {value:'TOURNANTE', motCles: '768'},
      ]
      const matierFilter = [
        {value: 'MATE', motCles: '1138'},
        {value: 'BROSSEE', motCles: '940'},
        {value: 'BROSSE', motCles: '940'},
        {value:'SABLE', motCles: '1663'},
        {value:'MARTELEE', motCles: '170'},
        {value:'GIVRE', motCles: '1664'},
        {value:'DIAMANTEE', motCles: '745'},
        {value:'DIAMANTE', motCles: '745'},
        {value:'Pyrite', motCles: '745'},
        {value:'RHODIEES', motCles: '301'},
        {value:'MARTELE', motCles: '170'},
        {value:'POLIE', motCles: '500'},
      ]
      const pierreFilter = [
        {value: 'SERTI GRAIN', motCles: '1265'},
        {value:'SERTI PAVE', motCles: '202'},
        {value:'PRINCESSE', motCles: '121'},
        {value:'NOIR', motCles: '134'},
      ]
      csv.data.forEach((item: OnerpCreationFairbelleFile) => {
        const famille = '25';
        let familleMotCles: string[] = [];
        item.libelle = item.libelle
        .replace('ALLIANCE','')
        .replace('ALL','')
        .replace('SERIE 135 -','')
        .replace('SERIE 130 -','')
        .replace('STANDARD','')
        .replace('SERIE 111 -','')
        .replace('SERIE 110 -','')
        .replace('PD 950','')
        .replace('PT','')
        .replace('DTS','')
        .replace('DT','')
        .replace('MECA','')
        .replace('DEUX ORS','')
        .replace('2ORS','')
        .replace('TROIS ORS','')
        .replace('T/C','')
        .replace('TC','')
        .replace('SERIE 210','')
        .replace('SERIE 216','')
        .replace('DT','')
        .replace('DIAMANTS','')
        .replace('PRESTIGE','')
        .trim();
        familleFilter.forEach(famille => {
          if(item.libelle.includes(famille.value)) {
            familleMotCles.push(famille.motCles);
            item.libelle = item.libelle.replace(famille.value,'').trim();
          }
        })
        let matiere = '';
        let matiereMotCles = [];
        matierFilter.forEach(matiere => {
          if(item.libelle.includes(matiere.value)) {
            matiereMotCles.push(matiere.motCles);
            item.libelle = item.libelle.replace(matiere.value,'').trim();
          }
        })
        let pierre = '';
        let quantityPierre = '';
        let carat = null;
        let pierreMotCles: string[] = [];
        if(item.nb_pierre) {
          quantityPierre = item.nb_pierre.toString();
          item.libelle = item.libelle.replace(quantityPierre ,'').trim();
          carat = item.carat_total;
          pierre = '27';
          if(item.qualite_pierre === 'HSI') {
            pierreMotCles.push('124');
          }
        }
        pierreFilter.forEach(pierre => {
          if(item.libelle.includes(pierre.value)) {
            pierreMotCles.push(pierre.motCles);
            item.libelle = item.libelle.replace(pierre.value,'').trim();
          }
        })
        item.libelle = item.libelle
        .replace('OR','')
        .replace('SERTI','')
        .trim();
        if(item.libelle ) {
          console.log('MANQUANT',item.reference_18, item.libelle);
        } else if(item.nb_pierre && pierre.length === 0) {
          console.log("PIERRE", item.reference_18, item.libelle);
        }
        else {
          if (item.reference_18 && !items.find(w => w.reference === item.reference_18)) {
            switch(item.alliage) {
              case 'OR BLANC':
              case 'DEUX ORS':
              case 'TROIS ORS':
                matiere = '200';
                break;
              case 'OR JAUNE':
                matiere = '24';
                break;
              case 'OR ROSE':
                matiere = '24';
                matiereMotCles.push('120');
                break;
            }
            if(matiere.length === 0) {
              console.log(item.alliage);
            } 
            else {
              //CREATE 18K          
            console.log("18K",item.reference_18);
            items.push({
              marque: null,
              reference: item.reference_18,
              rayon: 'OR',
              famille: famille,
              taille: item.taille_standard,
              taillMin: 45,
              taillMax: 75,
              increment: 1,
              familleMotCles: familleMotCles.join(','),
              matiere:  matiere,
              poids: item.poids_18.toString().replace(',', '.'),
              matiereCours: 56,
              matiereMotCles: matiereMotCles.join(','),
              pierre: pierre,
              poidsPierre: carat ? carat.toString().replace(',', '.') : null,
              pierreMotCles: '',
              composant: null,
              poidsComposant: null,
              coursComposant: null,
              composantMotCles: null,
              prixFacon: item.prix_facon_18.toString().replace(',', '.'),
              remise: 0,
              facon: 'P',
              prixAchat: 0,
              coefficient: 6,
              min: null,
              max: null,
              pvp: null,
              pvpFixe: null,
              pvpMin: null,
              pvpMax: null,
              commentaire: null,
              complete: 'N',
              catalogue: 'N',
              produit: null,
              magasins: null,
              stockMini: null,
              stockMax: null,
              referenceInterne: null,
              tailles: null,
            });
            }
          } 
          if (item.reference_9 && !items.find(w => w.reference === item.reference_9)) {
            switch(item.alliage) {
              case 'OR BLANC':
              case 'DEUX ORS':
              case 'TROIS ORS':
                matiere = '201';
                break;
              case 'OR JAUNE':
                matiere = '23';
                break;
              case 'OR ROSE':
                matiere = '23';
                matiereMotCles.push('120');
                break;
            }
            if(matiere.length === 0) {
              console.log(item.alliage);
            } 
            else {
              //CREATE 9K          
            console.log("9K",item.reference_9);
            items.push({
              marque: null,
              reference: item.reference_9,
              rayon: 'OR',
              famille: famille,
              taille: item.taille_standard,
              taillMin: 45,
              taillMax: 75,
              increment: 1,
              familleMotCles: familleMotCles.join(','),
              matiere:  matiere,
              poids: item.poids_9.toString().replace(',', '.'),
              matiereCours: 56,
              matiereMotCles: matiereMotCles.join(','),
              pierre: pierre,
              poidsPierre: carat ? carat.toString().replace(',', '.') : null,
              pierreMotCles: '',
              composant: null,
              poidsComposant: null,
              coursComposant: null,
              composantMotCles: null,
              prixFacon: item.prix_facon_9.toString().replace(',', '.'),
              remise: 0,
              facon: 'P',
              prixAchat: 0,
              coefficient: 6,
              min: null,
              max: null,
              pvp: null,
              pvpFixe: null,
              pvpMin: null,
              pvpMax: null,
              commentaire: null,
              complete: 'N',
              catalogue: 'N',
              produit: null,
              magasins: null,
              stockMini: null,
              stockMax: null,
              referenceInterne: null,
              tailles: null,
            });
            }
          } 
          if (item.reference_pt && !items.find(w => w.reference === item.reference_pt)) {
            switch(item.alliage) {
              case 'PT 950':
              case 'PLATINE':
                matiere = '199';
                break;
            }
            if(matiere.length === 0) {
              console.log("MANQUANT PT",item.reference_pt, item.alliage);
            } 
            else {
              //CREATE PT          
            console.log("PT",item.reference_pt,item.poids_pt);
            items.push({
              marque: null,
              reference: item.reference_pt,
              rayon: 'OR',
              famille: famille,
              taille: item.taille_standard,
              taillMin: 45,
              taillMax: 75,
              increment: 1,
              familleMotCles: familleMotCles.join(','),
              matiere:  matiere,
              poids: item.poids_pt.toString().replace(',', '.'),
              matiereCours: 56,
              matiereMotCles: matiereMotCles.join(','),
              pierre: pierre,
              poidsPierre: carat ? carat.toString().replace(',', '.') : null,
              pierreMotCles: '',
              composant: null,
              poidsComposant: null,
              coursComposant: null,
              composantMotCles: null,
              prixFacon: item.prix_facon_pt.toString().replace(',', '.'),
              remise: 0,
              facon: 'P',
              prixAchat: 0,
              coefficient: 6,
              min: null,
              max: null,
              pvp: null,
              pvpFixe: null,
              pvpMin: null,
              pvpMax: null,
              commentaire: null,
              complete: 'N',
              catalogue: 'N',
              produit: null,
              magasins: null,
              stockMini: null,
              stockMax: null,
              referenceInterne: null,
              tailles: null,
            });
            }
          } 
          if (item.reference_pd && !items.find(w => w.reference === item.reference_pd)) {
            switch(item.alliage) {
              case 'PD 950':
                matiere = '43';
                break;
            }
            if(matiere.length === 0) {
              console.log("PD",item.reference_pd, item.alliage);
            } 
            else {
              //CREATE PD          
            console.log("PD",item.reference_pd);
            items.push({
              marque: null,
              reference: item.reference_pd,
              rayon: 'OR',
              famille: famille,
              taille: item.taille_standard,
              taillMin: 45,
              taillMax: 75,
              increment: 1,
              familleMotCles: familleMotCles.join(','),
              matiere:  matiere,
              poids: item.poids_pd.toString().replace(',', '.'),
              matiereCours: 56,
              matiereMotCles: matiereMotCles.join(','),
              pierre: pierre,
              poidsPierre: carat ? carat.toString().replace(',', '.') : null,
              pierreMotCles: '',
              composant: null,
              poidsComposant: null,
              coursComposant: null,
              composantMotCles: null,
              prixFacon: item.prix_facon_pd.toString().replace(',', '.'),
              remise: 0,
              facon: 'P',
              prixAchat: 0,
              coefficient: 6,
              min: null,
              max: null,
              pvp: null,
              pvpFixe: null,
              pvpMin: null,
              pvpMax: null,
              commentaire: null,
              complete: 'N',
              catalogue: 'N',
              produit: null,
              magasins: null,
              stockMini: null,
              stockMax: null,
              referenceInterne: null,
              tailles: null,
            });
            }
          } 

        }
      

      })
      return items;
  }

  private async readOnerpFairbellePictures(file: Express.Multer.File) {
    try {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(file.buffer);
      
      const worksheet = workbook.getWorksheet(1);
      if (!worksheet) {
        throw new Error('Worksheet not found');
      }

      const MAX_SIZE = 450 * 1024 * 1024; // 450 Mo en bytes
      let currentSize = 0;
      let zipIndex = 1;
      let currentArchive = archiver('zip', { zlib: { level: 9 } });
      let currentZipPath = `upload/tmp/fairbelle-pictures_${zipIndex}.zip`;
      currentArchive.pipe(createWriteStream(currentZipPath));
      
      let currentMappingRows = [
        ['reference', 'filename'] // En-têtes CSV
      ];

      // Parcourir les images et les références
      for (const image of worksheet.getImages()) {
        let found = false;
        const imageId = parseInt(image.imageId);
        const imageData = workbook.getImage(imageId);
                if (imageData) {
                            const rowIndex = image.range.br.nativeRow + 1;
          const reference_18 = worksheet.getCell(rowIndex, 2).value || null; 
          const reference_9 = worksheet.getCell(rowIndex, 3).value || null;  
          const reference_pt = worksheet.getCell(rowIndex, 4).value || null; 
          const reference_pd = worksheet.getCell(rowIndex, 5).value || null; 

          console.log(`Row ${rowIndex}:`, { reference_18, reference_9, reference_pt, reference_pd });

          const imageSize = imageData.buffer?.byteLength || 0;

          if (currentSize + imageSize > MAX_SIZE) {
            const csvContent = Papa.unparse(currentMappingRows, {
              delimiter: ';',
              header: true
            });
            currentArchive.append(Buffer.from(csvContent), { name: 'mapping.csv' });
            
            await currentArchive.finalize();

            zipIndex++;
            currentSize = 0;
            currentArchive = archiver('zip', { zlib: { level: 9 } });
            currentZipPath = `upload/tmp/fairbelle-pictures_${zipIndex}.zip`;
            currentArchive.pipe(createWriteStream(currentZipPath));
            
            currentMappingRows = [
              ['reference', 'filename']
            ];
          }
          const imageName = imageId.toString() + '.' + imageData.extension ;
          if (reference_18 && !currentMappingRows.find(w => w[0] === reference_18.toString()) && imageData.buffer) {
            currentMappingRows.push([reference_18.toString(), imageName]);
            currentMappingRows.push([reference_18.toString() + '_SIMILI', imageName]);
            found = true;
          }
          if (reference_9 && !currentMappingRows.find(w => w[0] === reference_9.toString()) && imageData.buffer) {
            currentMappingRows.push([reference_9.toString(), imageName]);
            currentMappingRows.push([reference_9.toString() + '_SIMILI', imageName]);
            found = true;
          }
          if (reference_pt && !currentMappingRows.find(w => w[0] === reference_pt.toString()) && imageData.buffer) {
            currentMappingRows.push([reference_pt.toString(), imageName]);
            currentMappingRows.push([reference_pt.toString() + '_SIMILI', imageName]);
            found = true;
          }
          if (reference_pd && !currentMappingRows.find(w => w[0] === reference_pd.toString()) && imageData.buffer) {
            currentMappingRows.push([reference_pd.toString(), imageName]);
            currentMappingRows.push([reference_pd.toString() + '_SIMILI', imageName]);
            found = true;
          }
          if (found && imageData.buffer) {
            currentArchive.append(Buffer.from(imageData.buffer), { name: imageId.toString() + '.' + imageData.extension });
            currentSize += imageSize;
          }
        }
      }

      const finalCsvContent = Papa.unparse(currentMappingRows, {
        delimiter: ';',
        header: true
      });
      currentArchive.append(Buffer.from(finalCsvContent), { name: 'mapping.csv' });
      await currentArchive.finalize();

      return zipIndex;
    } catch (error) {
      this.logger.error('Erreur lors de la lecture du fichier Excel:', error);
      throw error;
    }
  }
}

interface SenderStoreItem {
  reference: string;
  storeNumber: number;
  type: 'SIEGE' | 'MAGASIN';
  lastLifeSpan: number | null;
  stock: number;
  details: SenderStoreItemDetail[];
}

interface SenderStoreItemDetail {
  article: string;
  stock: number;
}


interface CsvMissingSizeForOrder {
  supplier: string;
  reference: string;
}

interface OneRPOrderRow {
  supplier: number;
  reference: string;
  size: null | number;
  store: number;
  qty: number;
  type: string;
  weightCount: 'O' | 'N';
}

interface CsvPriceUpdate {
  supplierId: number;
  reference: string;
  price: number;
}

interface OnerpAdditifCoqueFile {
  reference: string;
  designation: string;
  poids: number;
  prixAchat: number;
}

interface OnerpCreationFairbelleFile {
  photo: string;
  reference_18: string;
  reference_9: string;
  reference_pt: string;
  reference_pd: string;
  nb_pierre: number;
  carat_total: number;
  qualite_pierre: string;
  libelle: string;
  taille_standard: number;
  alliage: string;
  poids_18: number;
  prix_facon_18: number;
  poids_9: number;
  prix_facon_9: number;
  poids_pt: number;
  prix_facon_pt: number;
  poids_pd: number;
  prix_facon_pd: number;
}

interface OneRPProductModel {
  marque: string | null;
  reference: string;
  rayon: string;
  famille: string;
  taille: number | null;
  taillMin: number | null;
  taillMax: number | null;
  increment: number | null;
  familleMotCles: string;
  matiere: string;
  poids: number | null | string;
  matiereCours: number | null;
  matiereMotCles: string;
  pierre: string;
  poidsPierre: number | null | string;
  pierreMotCles: string;
  composant: string | null;
  poidsComposant: number | null;
  coursComposant: number | null;
  composantMotCles: string | null;
  prixFacon: number | null | string;
  remise: number;
  facon: string;
  prixAchat: number | null | string;
  coefficient: number | null;
  min: number | null;
  max: number | null;
  pvp: number | null;
  pvpFixe: number | null;
  pvpMin: number | null;
  pvpMax: number | null;
  commentaire: string | null;
  complete: 'O' | 'N';
  catalogue: 'O' | 'N';
  produit: number | null;
  magasins: string | null;
  stockMini: number | null;
  stockMax: number | null;
  referenceInterne: string | null;
  tailles: string | null;
}

