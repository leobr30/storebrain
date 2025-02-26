import { Injectable, Logger } from '@nestjs/common';
import { OnerpService } from 'src/onerp/onerp.service';
import * as csv from 'fast-csv';
@Injectable()
export class WebsiteService {
  private readonly logger = new Logger(WebsiteService.name);
  constructor(private onerpService: OnerpService) {}
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
}
