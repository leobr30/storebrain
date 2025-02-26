import { Injectable } from '@nestjs/common';
import { onedocDb } from 'src/providers/database/onerp.database';
import { OneDOCFeuilleDeRoute, OneDOCStoreShipment, OneDOCStoreShipmentItem } from './onedoc.interfaces';

@Injectable()
export class OnedocService {
	getObjective = async (date: string, storeId: number) => {
		const query = await onedocDb<Objective[]>`select
	o.id,
	o.objectif as "objective",
	sum(od."objectifOr") as "objectiveOr",
	sum(od."objectifMode") as "objectiveMode"
from
	"Objectifs" o
join "ObjectifDetails" od on
	od."ObjectifId" = o.id
join "Stores" s on
	s.id = o."StoreId"
	and s."magNumber" = ${storeId}
where
	o."date" = ${date}
group by
	o.id ,
	o.objectif ;`

		return query;
	}

	getPrimeDetails = async (objectiveId: number) => {
		return await onedocDb<PrimeDetail[]>`select
	pd."vendeurId" as "onerpId",
	concat(pd."vendeurNom",
	' ',
	pd."vendeurPrenom") as "fullname",
	upper(z.libelle) as zone,
	pd."aFaire" as objective
from
	"Primes" p
join "PrimeDetails" pd on
	pd."PrimeId" = p.id
join "Zones" z on
	z.id = pd."ZoneId"
where
	p."ObjectifId" = ${objectiveId};`
	}

	getFeuilleDeRoute = async (bon: string) => {
		return await onedocDb<OneDOCFeuilleDeRoute[]>`select
	frm."date",
    frmi.quantity::INTEGER as quantity,
	frmi."CloturerId",
	frmi."ReportId"
from
	"FeuilleRouteMagasinV2s" frm
join "FeuilleRouteMagasinInfos" frmi on
	frmi."FeuilleRouteMagasinV2Id" = frm.id
	and frmi."FeuilleRouteMagasinEtapeId" in (9,5,30,16,14)
join "FeuilleRouteBons" frb on
	frmi.id = frb."FeuilleRouteMagasinInfoId"
join "FeuilleRouteMagasinBons" frmb on
	frb."FeuilleRouteMagasinBonId" = frmb.id
where
	frmb.numero = ${bon}
order by
	frmi."createdAt" desc
limit 1`;
	}

	getStoreShipmentItem = async (bon: string) => {
		return await onedocDb<OneDOCStoreShipment[]>`select
	*
from
	"StoreShipmentItems" ssi
where
	ssi."number" = ${bon};`
	}

	getAllStoreShipmentItemsNotClosed = async () => {
		return await onedocDb<OneDOCStoreShipmentItem[]>`select
	*
from
	"StoreShipmentItems" ssi
where
	"StatutId" != 3;`
	}

	closeStoreShipmentItem = async (id: number) => {
		return await onedocDb<OneDOCStoreShipmentItem[]>`update "StoreShipmentItems" set "StatutId" = 3 where "id" = ${id};`
	}

	getFeuilleDeRouteByNumber = async (number: string) => {
		return await onedocDb<OneDOCFeuilleDeRoute[]>`select "FeuilleRouteMagasinEtapeId" ,quantity,"CloturerId" from "FeuilleRouteMagasinInfos" frmi 
join "FeuilleRouteBons" frb on frb."FeuilleRouteMagasinInfoId" = frmi.id 
join "FeuilleRouteMagasinBons" frmb on frmb.id = frb."FeuilleRouteMagasinBonId" and frmb.numero  = ${number}`
	}

}
