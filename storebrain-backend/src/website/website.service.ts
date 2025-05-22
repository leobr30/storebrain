import { Injectable, Logger } from '@nestjs/common';
import { OnerpService } from 'src/onerp/onerp.service';
import * as csv from 'fast-csv';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class WebsiteService {
  private readonly logger = new Logger(WebsiteService.name);
  constructor(
    private onerpService: OnerpService,
    private prismaService: PrismaService,
  ) {}
  getWebsiteProducts = async () => {
    const onerpProducts = await this.onerpService.getInventory(116, 1);
    const response = await fetch(
      `${process.env.PRESTA_URL}/products?display=[id,reference,state]&output_format=JSON`,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${process.env.PRESTA_KEY}`,
        },
      },
    );
    const { products } = await response.json();
    const result: any[] = [];
    onerpProducts.map((product) => {
      let state = 'NOT_FOUND';
      const prestaProduct = products.find(
        (w: any) => w.reference === product.id.toString(),
      );
      if (prestaProduct) {
        this.logger.debug(`Presta: ${prestaProduct.state}`);
        if (prestaProduct.state === '1') state = 'ONLINE';
        else if (prestaProduct.state === '0') state = 'OFFLINE';
        this.logger.debug(`state:${state}`);
      }
      result.push({
        supplier: product.supplier,
        family: product.family,
        id: product.id,
        reference: product.reference,
        size: product.size,
        stock: product.stock,
        state,
      });
    });

    csv
      .writeToPath('upload/tmp/website.csv', result, {
        headers: true,
        delimiter: ';',
      })
      .on('end', () => this.logger.debug('Debug csv saved'));
  };

  getTracking = async () => {
    const onerpProducts = await this.onerpService.getProductForTracking();
    const response = await fetch(
      `${process.env.PRESTA_URL}/products?display=[id,reference,state]&output_format=JSON`,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${process.env.PRESTA_KEY}`,
        },
      },
    );
    const {products: prestaProducts } = await response.json();
    
    // Récupérer les données de tracking depuis la base de données
    const trackingData = await this.prismaService.websiteProductTracking.findMany();
    
    const editedProductTracking = onerpProducts.filter(w => w.stock_sas >= 5).map((product) => {
      let prestaState = 'NOT_FOUND';
      const prestaProduct = prestaProducts.find(
        (w: any) => w.reference === product.id.toString(),
      );
      if (prestaProduct) {
        if (prestaProduct.state === '1') prestaState = 'ONLINE';
        else if (prestaProduct.state === '0') prestaState = 'OFFLINE';
      }
      
      // Rechercher les infos de tracking pour ce produit
      const productTracking = trackingData.find(t => t.produitId === product.id);
      
      return {
        produitId: product.id,
        fournisseurId: product.fournisseur_id,
        reference: product.reference,
        groupe: product.groupe,
        famille: product.famille,
        stockTotal: product.stock_total,
        stockSas: product.stock_sas,
        prestaState,
        hasPhotos: productTracking?.hasPhotos || false,
        hasProductSheet: productTracking?.hasProductSheet || false,
      };
    });
    return editedProductTracking;
  };
  
  // Nouvelle méthode pour mettre à jour le statut des photos et fiches produit
  updateProductTrackingStatus = async (produitId: number, hasPhotos: boolean, hasProductSheet: boolean) => {
    return await this.prismaService.websiteProductTracking.upsert({
      where: { produitId },
      update: { hasPhotos, hasProductSheet, updatedAt: new Date() },
      create: {
        produitId,
        fournisseurId: 0, // Valeur par défaut, sera mise à jour lors du prochain getTracking
        reference: '', // Valeur par défaut, sera mise à jour lors du prochain getTracking
        hasPhotos,
        hasProductSheet,
      },
    });
  };
}
