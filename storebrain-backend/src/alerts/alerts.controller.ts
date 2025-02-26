import { Controller, Get, HttpStatus, Param, Post, Put } from '@nestjs/common';
import { AlertsService } from './alerts.service';

@Controller('alerts')
export class AlertsController {
    constructor(private alertsService: AlertsService) {}

    @Get()
    async getAlerts() {
        return await this.alertsService.getAlerts();
    }

    @Put('lunch/:id')
    async storeShipmentAlert(@Param('id') id: number) {
        switch(id) {
            case 1:
                return await this.alertsService.storeShipmentAlert();
            default:
                return HttpStatus.NOT_FOUND;
        }
    
    }
}
