import { Injectable } from '@nestjs/common';
import {
	InventoryProduct,
	Product,
	ProductInformation,
	Revenue,
	RevenueDetail,
} from 'src/common/interfaces/onerp.interface';
import { onerpDb } from 'src/providers/database/onerp.database';

@Injectable()
export class OnerpService {
   
	getProducts = async ({ rayon }: { rayon: string[] }) => {
		return await onerpDb<Product[]>`select
	p.id,
	p.image,
	p.rayon as department,
	cf.groupe as group,
	cf.libelle as family,
	pcm.valeur as "weight",
	array (
	select
		m.libelle
	from
		produitcomposantmotcle pcmf
	join motcle m on
		m.id = pcmf.motcle_id
	where
		pcmf.composant_id = pcf.id
	limit 10) as "familyKeyword",
	cs.libelle as stone
from
	produit p
join produitcomposant pcf on
	pcf.id = p.famille_id
join composant cf on
	cf.id = pcf.composant_id
	left join produitcomposant pcm on pcm.id = p.matiere_id
left join produitcomposant pcs on
	pcs.id = p.pierre_id
left join composant cs on
	cs.id = pcs.composant_id
where
	rayon = ANY(${rayon});
	`;
	};

	getProductDetailsStore = async (
		storeId: number,
		productId: number,
		filter: string,
		image: string | null,
		supplierIds: number[],
	) => {
		return await onerpDb<ProductInformation[]>`
    select
	${filter} as "filter",
	${image} as image,
	u.*,
	coalesce(amm.prixventettc,
	0)::float as "publicSalePrice"
from
	(
    --ORDER   
	select
		null::date as "date",
		null::date as "dateIn",
		null::date as "dateOut",
		m.numero as "store",
		f.libelle as "supplier",
		cfa.type as "type",
		a.reference as "reference",
		a.taille as "size",
		null as "itemId",
		0 as "stock",
		0 as "stockPurchasePrice",
		0 as purchase,
		0 as "purchasePrice",
		0 as "sale",
		0 as "salePrice",
		0 as "price",
		0 as "purchaseSalePrice",
		0 as "unitOrder",
		sum(cfa.reste)::int as "order"
	from
		commandefournisseurarticle cfa
	join article a on
		cfa.article_id = a.id
		and a.produit_id = ${productId}
	join magasin m on
		m.id = cfa.magasin_id
		and (cfa.magasin_id = ${storeId} or cfa.magasin_id = 1)
	join fournisseur f on
		f.id = a.fournisseur_id and f.id = ANY(${supplierIds})
	where
		cfa.type in ('CONFIE', 'STOCK')
	group by		
		m.numero,
		f.libelle,
		cfa.type,
		a.reference,
		a.taille
union all
	--DELIVERY
	select
		lfa."date" as "date",
		lfa."date" as "dateIn",
		null::date as "dateOut",
		m.numero as "store",
		f.libelle as "supplier",
		lfa."type" as "type",
		a.reference as "reference",
		a.taille as "size",
		a.id as "itemId",
		sum(lfa.quantite)::int as stock,
		sum(lfa.quantite * lfa.prixachatht)::float as "stockPurchasePrice",
		sum(lfa.quantite)::int as purchase,
		sum(lfa.quantite * lfa.prixachatht)::float as "purchasePrice",
		0 as "sale",
		0 as "salePrice",
		0 as "price",
		0 as "purchaseSalePrice",
		0 as "unitOrder",
		0 as "order"
	from
		livraisonfournisseurarticle lfa
	join article a on
		lfa.article_id = a.id
		and a.produit_id = ${productId}
	join fournisseur f on
		f.id = a.fournisseur_id and f.id = ANY(${supplierIds})
	join magasin m on
		lfa.magasin_id = m.id
		and lfa.magasin_id = ${storeId}
	where
		lfa.type in ('STOCK', 'CONFIE')
	group by
		lfa."date" ,
		m.numero ,
		f.libelle ,
		lfa."type" ,
		a.reference ,
		a.taille,
		a.id
union all
	-- RETURN
	select
		rfa.date as "date",
		null as "dateIn",
		null::date as "dateOut",
		m.numero as "store",
		f.libelle as "supplier",
		rfa.type as "type",
		a.reference as "reference",
		a.taille as size,
		a.id as "itemId",
		-sum(rfa.quantite)::int as stock,
		-sum( rfa.quantite * rfa.prixachatht )::float as "stockPurchasePrice",
		0 as purchase,
		0 as "purchasePrice",
		0 as "sale",
		0 as "salePrice",
		0 as "price",
		0 as "purchaseSalePrice",
		0 as "unitOrder",
		0 as "order"
	from
		retourfournisseurarticle rfa
	join article a on
		rfa.article_id = a.id
		and a.produit_id = ${productId}
	join fournisseur f on
		f.id = a.fournisseur_id and f.id = ANY(${supplierIds})
	join magasin m on
		rfa.magasin_id = m.id
		and rfa.magasin_id = ${storeId}
	where
		rfa.type in ('STOCK', 'CONFIE')
	group by
		rfa.date,
		m.numero ,
		f.libelle ,
		rfa."type" ,
		a.reference ,
		a.taille,
		a.id
union all
	--TRANSFER IN
	select
		ta.date as "date",
		ta.date as "dateIn",
		null::date as "dateOut",
		m.numero as "store",
		f.libelle as "supplier",
		ta.type as "type",
		a.reference as "reference",
		a.taille as "size",
		a.id as "itemId",
		sum(ta.quantite)::int as "stock",
		sum(ta.quantite * ta.prixachatht ) as "stockPurchasePrice",
		0 as purchase,
		0 as "purchasePrice",
		0 as "sale",
		0 as "salePrice",
		0 as "price",
		0 as "purchaseSalePrice",
		0 as "unitOrder",
		0 as "order"
	from
		transfertarticle ta
	join transfert t on
		ta.transfert_id = t.id
	join article a on
		ta.article_id = a.id
		and a.produit_id = ${productId}
	join fournisseur f on
		a.fournisseur_id = f.id and f.id = ANY(${supplierIds})
	join magasin m on
		ta.magasin_id = m.id
		and ta.magasin_id = ${storeId}
	where
		ta.type in ('STOCK', 'CONFIE')
	group by
		ta."date",
		m.numero,
		f.libelle,
		ta."type",
		a.reference,
		a.taille,
		a.id
union all
	-- TRANSFER OUT
	select
		ta.date as "date",
		null as "dateIn",
		null::date as "dateOut",
		m.numero as "store",
		f.libelle as "supplier",
		ta.type as "type",
		a.reference as "reference",
		a.taille as size,
		a.id as "itemId",
		-sum(ta.quantite)::int as stock,
		-sum(ta.quantite * ta.prixachathta) "purchasePrice",
		0 as purchase,
		0 as "purchasePrice",
		0 as "sale",
		0 as "salePrice",
		0 as "price",
		0 as "purchaseSalePrice",
		0 as "unitOrder",
		0 as "order"
	from
		transfertarticle ta
	join transfert t on
		ta.transfert_id = t.id
	join article a on
		ta.article_id = a.id
		and a.produit_id = ${productId}
	join fournisseur f on
		a.fournisseur_id = f.id and f.id = ANY(${supplierIds})
	join magasin m on
		t.magasina_id = m.id
		and t.magasina_id = ${storeId}
	where
		ta.type in ('STOCK', 'CONFIE')
	group by
		ta.date,
		m.numero,
		f.libelle ,
		ta.type,
		a.reference,
		a.taille,
		a.id
union all
	--REGULATE
	select
		ra.date as "date",
		case
			when sum(ra.quantite) >0 then ra.date
			else null
		end as "dateIn",
		null::date as "dateOut",
		m.numero as "store",
		f.libelle as "supplier",
		ra.type as "type",
		a.reference as "reference",
		a.taille as "size",
		a.id as "itemId",
		sum(ra.quantite)::int as stock,
		sum(ra.quantite * ra.prixachatht) "purchaseStockPrice",
		sum(ra.quantite) as purchase,
		sum(ra.quantite * ra.prixachatht) as "purchasePrice",
		0 as "sale",
		0 as "salePrice",
		0 as "price",
		0 as "purchaseSalePrice",
		0 as "unitOrder",
		0 as "order"
	from
		regulearticle ra
	join article a on
		ra.article_id = a.id
		and a.produit_id = ${productId}
	join fournisseur f on
		f.id = a.fournisseur_id and f.id = ANY(${supplierIds})
	join magasin m on
		ra.magasin_id = m.id
		and ra.magasin_id = ${storeId}
	where
		ra.type in ('STOCK', 'CONFIE')
	group by
		ra.date,
		m.numero,
		f.libelle,
		ra.type,
		a.reference,
		a.numero,
		a.taille,
		a.id
union all
	--TAKEN BACK
	select
		fca.date as "date",
		fca.date as "dateIn",
		null::date as "dateOut",
		m.numero as "store",
		f.libelle as "supplier",
		fca.type as "type",
		a.reference as "reference",
		a.taille as "size",
		a.id as "itemId",
		sum(fca.quantite)::int "stock",
		sum(fca.quantite * fca.prixachatht)::float "purchaseStockPrice",
		0 as purchase,
		0 as "purchasePrice",
		-sum(fca.quantite)::int "sales",
		-sum(fca.quantite * fcl.prixvenduht)::float "salePrice",
		prixventettc as "price",
		-sum(fca.quantite * fca.prixachatht)::float as "purchaseSalePrice",
		0 as "unitOrder",
		0 as "order"
	from
		factureclientarticle fca
	join factureclientligne fcl on
		fca.factureligne_id = fcl.id
		and fcl.mouvement = 'REPRISE'
	join article a on
		fca.article_id = a.id
		and a.produit_id = ${productId}
	join fournisseur f on
		f.id = a.fournisseur_id and f.id = ANY(${supplierIds})
	join magasin m on
		fca.magasin_id = m.id
		and fca.magasin_id = ${storeId}
	where
		fca.type in ('STOCK', 'CONFIE')
	group by
		fca.date,
		m.numero,
		f.libelle,
		fca.type,
		a.reference,
		a.taille,
		a.id,
		fcl.prixventettc
union all
	--SALE
	select
		fca.date as "date",
		null as "dateIn",
		fca.date as "dateOut",
		m.numero as "store",
		f.libelle as "supplier",
		fca.type as "type",
		a.reference as "reference",
		a.taille as "size",
		a.id as "itemId",
		-sum(fca.quantite)::int "stock",
		-sum(fca.quantite * fca.prixachatht)::float "purchaseStockPrice",
		0 as purchase,
		0 as "purchasePrice",
		sum(fca.quantite)::int "sale",
		sum(fca.quantite * fcl.prixvenduht)::float "salePrice",
		prixventettc as "price",
		sum(fca.quantite * fca.prixachatht)::float as "purchaseSalePrice",
		0 as "unitOrder",
		0 as "order"
	from
		factureclientarticle fca
	join factureclientligne fcl on
		fca.factureligne_id = fcl.id
		and fcl.mouvement = 'VENTE'
	join article a on
		fca.article_id = a.id
		and a.produit_id = ${productId}
	join fournisseur f on
		f.id = a.fournisseur_id and f.id = ANY(${supplierIds})
	join magasin m on
		fca.magasin_id = m.id
		and fca.magasin_id = ${storeId}
	where
		fca.type in ('STOCK', 'CONFIE')
	group by
		fca.date,
		m.numero,
		f.libelle,
		fca.type,
		a.reference,
		a.numero ,
		a.taille,
		a.id,
		fcl.prixventettc
union all
	--CU DELIVERY
	select
		cc.date as "date",		
		null::date as "dateIn",		
		cc.date::date as "dateOut",
		m.numero as "store",
		f.libelle as "supplier",
		lfa."type" as "type",
		a.reference as "reference",
		a.taille as "size",		
		a.id as "itemId",
		0 as stock,
		0 as "stockPurchasePrice",
		0 as purchase,
		0 as "purchasePrice",
		0 as "sale",
		sum(ccl.prixventettcproduit) as "salePrice",
		ccl.prixventettcproduit as "price",
		sum(lfa.quantite * lfa.prixachatht)::float as "purchaseSalePrice",
		sum(lfa.quantite)::int as "unitOrder",
		0 as "order"
	from
		livraisonfournisseurarticle lfa
	join livraisonfournisseurligne lfl on
		lfl.id = lfa.livraisonligne_id
	join commandeclientligne ccl on
		ccl.id = lfl.commandeclientligne_id
	join commandeclient cc on
		cc.id = ccl.commande_id
	join article a on
		lfa.article_id = a.id
		and a.produit_id = ${productId} 
	join fournisseur f on
		f.id = a.fournisseur_id and f.id = ANY(${supplierIds})
	join magasin m on
		lfa.magasin_id = m.id
		and lfa.magasin_id = ${storeId}
	where
		lfa.type = 'CU'
	group by
		cc."date" ,
		m.numero ,
		f.libelle ,
		lfa."type" ,
		a.reference ,		
		a.taille,
		a.id,
		ccl.prixventettcproduit
union all
	--TRANSFER UNIT ORDER
	select
		cc.date as "date",
		null::date as "dateIn",
		cc.date::date as "dateOut",
		m.numero as "store",
		f.libelle as "supplier",
		t."type" as "type",
		a.reference as "reference",
		a.taille as "size",
		a.id as "itemId",
		0 as stock,
		0 as "stockPurchasePrice",
		0 as purchase,
		0 as "purchasePrice",
		0 as "sale",
		sum(ccl.prixventettcproduit) as "salePrice",
		ccl.prixventettcproduit as "price",
		sum(ta.quantite * ta.prixachatht)::float as "purchaseSalePrice",
		sum(ta.quantite)::int as "unitOrder",
		0 as "order"
	from
		transfertarticle ta
	join transfertligne tl on
		tl.id = ta.transfertligne_id
	join transfert t on
		t.id = tl.transfert_id
		and t."type" = 'CU'
	join commandeclientligne ccl on
		ccl.id = tl.commandeclientligne_id
	join commandeclient cc on
		cc.id = ccl.commande_id
	join article a on
		a.id = ta.article_id
		and a.produit_id = ${productId}
	join fournisseur f on
		f.id = a.fournisseur_id and f.id = ANY(${supplierIds})
	join magasin m on
		m.id = ta.magasin_id
		and ta.magasin_id = ${storeId}
	group by
		cc."date",
		m.numero ,
		f.libelle ,
		t."type" ,
		a.reference ,
		a.taille ,
		a.id ,
		ccl.prixventettcproduit 
        ) u
left join articlemagasinmouvement amm on
	amm.article_id = u."itemId"
	and amm.magasin_id = ${storeId}
	and amm.dateprixventettc = (
	select
		max(amm2.dateprixventettc)
	from
		articlemagasinmouvement amm2
	where
		amm2.article_id = amm.article_id
		and amm2.magasin_id = amm.magasin_id)
group by
	u.date,
		u."dateIn",
		u."dateOut",
		u.store,
		u.supplier,
		u.type,
		u.reference,
		u.size,
		u."itemId",
		u.stock,
		u."stockPurchasePrice",
		u.purchase,
		u."purchasePrice",
		u.sale,
		u."salePrice",
		u.price,
		u."purchaseSalePrice",
	u."unitOrder",
	u.order,
		amm.prixventettc
    `;
	};

	getProductDetails = async (
		productId: number,
		storeIds: number[],
		supplierIds: number[],
	) => {
		const isStoreIds = storeIds.length > 0;
		const isSupplierIds = supplierIds.length > 0;

		return await onerpDb<ProductInformation[]>` select
	m.numero as "store",
	f.libelle as "supplier",
	u.*,
	coalesce(amm.prixventettc,
	0)::float as "publicSalePrice",
	amm.dateprixventettc as "publicSalePriceDate",
	pf.actif as "isEnabled",
	pf.prixfaconht as "productPrice",
	pf.tauxremise as "discountRate",
	pf.unite as "unit",
	pf.prixachatht as "purchasePrice",
	pf.coef as "coefficient",
	pf.prixventettc as "productPublicSalePrice",
	pf.margebrute as "marginRate"
from
	(
	--ORDER
	select
		null::date as "date",
		null::date as "dateIn",
		null::date as "dateOut",
		cfa.magasin_id as "storeId",
		a.fournisseur_id as "supplierId",
		cfa.type as "type",
		a.reference as "reference",
		a.produit_id as "productId",
		a.taille as "size",
		null as "itemId",
		0 as "stock",
		0 as "stockPurchasePrice",
		0 as purchase,
		0 as "purchasePrice",
		0 as "sale",
		0 as "salePrice",
		0 as "price",
		0 as "purchaseSalePrice",
		0 as "unitOrder",
		sum(cfa.reste)::int as "order"
	from
		commandefournisseurarticle cfa
	join article a on
		cfa.article_id = a.id
		and a.produit_id = ${productId}
	where
		cfa.type in ('CONFIE', 'STOCK')
		${isStoreIds ? onerpDb`and cfa.magasin_id in ${onerpDb(storeIds)}` : onerpDb``} 
		${isSupplierIds ? onerpDb`and a.fournisseur_id in ${onerpDb(supplierIds)}` : onerpDb``}
	group by
		cfa.magasin_id,
		cfa.type,
		a.reference,
		a.produit_id,
		a.taille,
		a.fournisseur_id
union all
	--DELIVERY
	select
		lfa."date" as "date",
		lfa."date" as "dateIn",
		null::date as "dateOut",
		lfa.magasin_id as "storeId",
				a.fournisseur_id as "supplierId",
		lfa."type" as "type",
		a.reference as "reference",
		a.produit_id as "productId",
		a.taille as "size",
		a.id as "itemId",
		sum(lfa.quantite)::int as stock,
		sum(lfa.quantite * lfa.prixachatht)::float as "stockPurchasePrice",
		sum(lfa.quantite)::int as purchase,
		sum(lfa.quantite * lfa.prixachatht)::float as "purchasePrice",
		0 as "sale",
		0 as "salePrice",
		0 as "price",
		0 as "purchaseSalePrice",
		0 as "unitOrder",
		0 as "order"
	from
		livraisonfournisseurarticle lfa
	join article a on
		lfa.article_id = a.id
		and a.produit_id = ${productId}
	where
		lfa.type in ('STOCK', 'CONFIE')
		${isStoreIds ? onerpDb`and lfa.magasin_id in ${onerpDb(storeIds)}` : onerpDb``}
		${isSupplierIds ? onerpDb`and a.fournisseur_id in ${onerpDb(supplierIds)}` : onerpDb``}
	group by
		lfa."date" ,
		lfa.magasin_id,
		lfa."type" ,
		a.reference ,
		a.produit_id,
		a.taille,
		a.id
union all
	-- RETURN
	select
		rfa.date as "date",
		null as "dateIn",
		null::date as "dateOut",
		rfa.magasin_id as "storeId",
		a.fournisseur_id as "supplierId",
		rfa.type as "type",
		a.reference as "reference",
		a.produit_id as "productId",
		a.taille as size,
		a.id as "itemId",
		-sum(rfa.quantite)::int as stock,
		-sum( rfa.quantite * rfa.prixachatht )::float as "stockPurchasePrice",
		0 as purchase,
		0 as "purchasePrice",
		0 as "sale",
		0 as "salePrice",
		0 as "price",
		0 as "purchaseSalePrice",
		0 as "unitOrder",
		0 as "order"
	from
		retourfournisseurarticle rfa
	join article a on
		rfa.article_id = a.id
		and a.produit_id = ${productId}
	where
		rfa.type in ('STOCK', 'CONFIE')
		${isSupplierIds ? onerpDb`and a.fournisseur_id in ${onerpDb(supplierIds)}` : onerpDb``}
		${isStoreIds ? onerpDb`and rfa.magasin_id in ${onerpDb(storeIds)}` : onerpDb``}
	group by
		rfa.date,
		rfa.magasin_id,
		a.fournisseur_id,
		rfa."type" ,
		a.reference ,
		a.produit_id,
		a.taille,
		a.id
union all
	--TRANSFER IN
	select
		ta.date as "date",
		ta.date as "dateIn",
		null::date as "dateOut",
		ta.magasin_id as "storeId",
		a.fournisseur_id as "supplierId",
		ta.type as "type",
		a.reference as "reference",
		a.produit_id as "productId",
		a.taille as "size",
		a.id as "itemId",
		sum(ta.quantite)::int as "stock",
		sum(ta.quantite * ta.prixachatht ) as "stockPurchasePrice",
		0 as purchase,
		0 as "purchasePrice",
		0 as "sale",
		0 as "salePrice",
		0 as "price",
		0 as "purchaseSalePrice",
		0 as "unitOrder",
		0 as "order"
	from
		transfertarticle ta
	join article a on
		ta.article_id = a.id
		and a.produit_id = ${productId}
	where
		ta.type in ('STOCK', 'CONFIE')
		${isSupplierIds ? onerpDb`and a.fournisseur_id in ${onerpDb(supplierIds)}` : onerpDb``}
		${isStoreIds ? onerpDb`and ta.magasin_id in ${onerpDb(storeIds)}` : onerpDb``}
	group by
		ta."date",
		ta.magasin_id,
		a.fournisseur_id,
		ta."type",
		a.reference,
		a.produit_id,
		a.taille,
		a.id
union all
	-- TRANSFER OUT
	select
		ta.date as "date",
		null as "dateIn",
		null::date as "dateOut",
		t.magasina_id as "storeId",
		a.fournisseur_id as "supplierId",
		ta.type as "type",
		a.reference as "reference",
		a.produit_id as "productId",
		a.taille as size,
		a.id as "itemId",
		-sum(ta.quantite)::int as stock,
		-sum(ta.quantite * ta.prixachathta) "purchasePrice",
		0 as purchase,
		0 as "purchasePrice",
		0 as "sale",
		0 as "salePrice",
		0 as "price",
		0 as "purchaseSalePrice",
		0 as "unitOrder",
		0 as "order"
	from
		transfertarticle ta
	join transfert t on
		ta.transfert_id = t.id
	join article a on
		ta.article_id = a.id
		and a.produit_id = ${productId}
	where
		ta.type in ('STOCK', 'CONFIE')
		${isStoreIds ? onerpDb`and t.magasina_id in ${onerpDb(storeIds)}` : onerpDb``}
		${isSupplierIds ? onerpDb`and a.fournisseur_id in ${onerpDb(supplierIds)}` : onerpDb``}
	group by
		ta.date,
				t.magasina_id,
				a.fournisseur_id,
		ta.type,
		a.reference,
		a.produit_id,
		a.taille,
		a.id
union all
	--REGULATE
	select
		ra.date as "date",
		case
			when sum(ra.quantite) >0 then ra.date
			else null
		end as "dateIn",
		null::date as "dateOut",
		ra.magasin_id as "storeId",
		a.fournisseur_id as "supplierId",
		ra.type as "type",
		a.reference as "reference",
		a.produit_id as "productId",
		a.taille as "size",
		a.id as "itemId",
		sum(ra.quantite)::int as stock,
		sum(ra.quantite * ra.prixachatht) "purchaseStockPrice",
		sum(ra.quantite) as purchase,
		sum(ra.quantite * ra.prixachatht) as "purchasePrice",
		0 as "sale",
		0 as "salePrice",
		0 as "price",
		0 as "purchaseSalePrice",
		0 as "unitOrder",
		0 as "order"
	from
		regulearticle ra
	join article a on
		ra.article_id = a.id
		and a.produit_id = ${productId}
	where
		ra.type in ('STOCK', 'CONFIE')
		${isStoreIds ? onerpDb`and ra.magasin_id in ${onerpDb(storeIds)}` : onerpDb``}
		${isSupplierIds ? onerpDb`and a.fournisseur_id in ${onerpDb(supplierIds)}` : onerpDb``}
	group by
		ra.date,
		ra.magasin_id,
		a.fournisseur_id,
		ra.type,
		a.reference,
		a.produit_id,
		a.numero,
		a.taille,
		a.id
union all
	--SALE
	select
		fca.date as "date",
		(case
			when fcl.mouvement = 'REPRISE' then fca.date
			else null
		end) as "dateIn",
		(case
			when fcl.mouvement = 'VENTE' then fca.date
			else null
		end) as "dateOut",
		fca.magasin_id as "storeId",
		a.fournisseur_id as "supplierId",
		fca.type as "type",
		a.reference as "reference",
		a.produit_id as "productId",
		a.taille as "size",
		a.id as "itemId",
		sum(case when fcl.mouvement = 'VENTE' then -fca.quantite else fca.quantite end )::int "stock",
		sum(case when fcl.mouvement = 'VENTE' then -fca.quantite * fca.prixachatht else fca.quantite * fca.prixachatht end)::float "purchaseStockPrice",
		0 as purchase,
		0 as "purchasePrice",
		sum(case when fcl.mouvement = 'VENTE' then fca.quantite else -fca.quantite end)::int "sale",
		sum(case when fcl.mouvement = 'VENTE' then fca.quantite * fcl.prixvenduht else -fca.quantite * fcl.prixvenduht end )::float "salePrice",
		prixventettc as "price",
		sum(case when fcl.mouvement = 'VENTE' then fca.quantite * fca.prixachatht else -fca.quantite * fca.prixachatht end)::float as "purchaseSalePrice",
		0 as "unitOrder",
		0 as "order"
	from
		factureclientarticle fca
	join factureclientligne fcl on
		fca.factureligne_id = fcl.id		
	join article a on
		fca.article_id = a.id
		and a.produit_id = ${productId}
	where
		fca.type in ('STOCK', 'CONFIE')
	${isStoreIds ? onerpDb`and fca.magasin_id in ${onerpDb(storeIds)}` : onerpDb``}
  ${isSupplierIds ? onerpDb`and a.fournisseur_id in ${onerpDb(supplierIds)}` : onerpDb``}
	group by
		fca.date,
		fca.magasin_id,
		a.fournisseur_id,
		fca.type,
		a.reference,
		a.produit_id,
		a.numero ,
		a.taille,
		a.id,
		fcl.prixventettc,
		fcl.mouvement
union all
	--CU DELIVERY
	select
		cc.date as "date",
		null::date as "dateIn",
		cc.date::date as "dateOut",
		lfa.magasin_id as "storeId",
		a.fournisseur_id as "supplierId",
		lfa."type" as "type",
		a.reference as "reference",
		a.produit_id as "productId",
		a.taille as "size",
		a.id as "itemId",
		0 as stock,
		0 as "stockPurchasePrice",
		0 as purchase,
		0 as "purchasePrice",
		0 as "sale",
		sum(ccl.prixventettcproduit) as "salePrice",
		ccl.prixventettcproduit as "price",
		sum(lfa.quantite * lfa.prixachatht)::float as "purchaseSalePrice",
		sum(lfa.quantite)::int as "unitOrder",
		0 as "order"
	from
		livraisonfournisseurarticle lfa
	join livraisonfournisseurligne lfl on
		lfl.id = lfa.livraisonligne_id
	join commandeclientligne ccl on
		ccl.id = lfl.commandeclientligne_id
	join commandeclient cc on
		cc.id = ccl.commande_id
	join article a on
		lfa.article_id = a.id
		and a.produit_id = ${productId}
	where
		lfa.type = 'CU'
		${isStoreIds ? onerpDb`and lfa.magasin_id in ${onerpDb(storeIds)}` : onerpDb``}
		${isSupplierIds ? onerpDb`and a.fournisseur_id in ${onerpDb(supplierIds)}` : onerpDb``}
		
	group by
		cc."date" ,
				lfa.magasin_id,
				a.fournisseur_id,
		lfa."type" ,
		a.reference ,
		a.produit_id,
		a.taille,
		a.id,
		ccl.prixventettcproduit
union all
	--TRANSFER UNIT ORDER
	select
		cc.date as "date",
		null::date as "dateIn",
		cc.date::date as "dateOut",
		ta.magasin_id as "storeId",
		a.fournisseur_id as "supplierId",
		t."type" as "type",
		a.reference as "reference",
		a.produit_id as "productId",
		a.taille as "size",
		a.id as "itemId",
		0 as stock,
		0 as "stockPurchasePrice",
		0 as purchase,
		0 as "purchasePrice",
		0 as "sale",
		sum(ccl.prixventettcproduit) as "salePrice",
		ccl.prixventettcproduit as "price",
		sum(ta.quantite * ta.prixachatht)::float as "purchaseSalePrice",
		sum(ta.quantite)::int as "unitOrder",
		0 as "order"
	from
		transfertarticle ta
	join transfertligne tl on
		tl.id = ta.transfertligne_id
	join transfert t on
		t.id = tl.transfert_id
		and t."type" = 'CU'
	join commandeclientligne ccl on
		ccl.id = tl.commandeclientligne_id
	join commandeclient cc on
		cc.id = ccl.commande_id
	join article a on
		a.id = ta.article_id
		and a.produit_id = ${productId}
	where
		t.type = 'CU'
		${isStoreIds ? onerpDb`and ta.magasin_id in ${onerpDb(storeIds)}` : onerpDb``}
		${isSupplierIds ? onerpDb`and a.fournisseur_id in ${onerpDb(supplierIds)}` : onerpDb``}
	group by
		cc."date",
		ta.magasin_id,
		a.fournisseur_id,
		a.produit_id,
		t."type" ,
		a.reference ,
		a.taille ,
		a.id ,
		ccl.prixventettcproduit
        ) u
left join articlemagasinmouvement amm on
	amm.article_id = u."itemId"
	and amm.magasin_id = u."storeId"
	and amm.dateprixventettc = (
	select
		max(amm2.dateprixventettc)
	from
		articlemagasinmouvement amm2
	where
		amm2.article_id = amm.article_id
		and amm2.magasin_id = amm.magasin_id)
join magasin m on
	m.id = u."storeId"
join fournisseur f on
	f.id = u."supplierId"
	left join produitfournisseur pf on pf.fournisseur_id = u."supplierId" and pf.produit_id = u."productId"
group by
	f.libelle,
	m.numero,
	u.date,
	u."dateIn",
	u."dateOut",
	u."storeId",
	u."supplierId",
	u.type,
	u.reference,
	u."productId",
	u.size,
	u."itemId",
	u.stock,
	u."stockPurchasePrice",
	u.purchase,
	u."purchasePrice",
	u.sale,
	u."salePrice",
	u.price,
	u."purchaseSalePrice",
	u."unitOrder",
	u.order,
	amm.prixventettc,
	amm.dateprixventettc,
	pf.actif,
	pf.prixfaconht,
	pf.tauxremise,
	pf.unite,
	pf.prixachatht,
	pf.coef,
	pf.prixventettc,
	pf.margebrute`;
	};

	getProductDetailsTest = async (productId: number, supplierIds: number[]) => {
		const storeIds = [3, 7];
		const isStoreIds = storeIds.length > 0;
		const isSupplierIds = supplierIds.length > 0;

		return await onerpDb<ProductInformation[]>` select
	m.numero as "store",
	f.libelle as "supplier",
	u.*,
	coalesce(amm.prixventettc,
	0)::float as "publicSalePrice",
	amm.dateprixventettc as "publicSalePriceDate"
from
	(
	--ORDER
	select
		null::date as "date",
		null::date as "dateIn",
		null::date as "dateOut",
		cfa.magasin_id as "storeId",
		a.fournisseur_id as "supplierId",
		cfa.type as "type",
		a.reference as "reference",
		a.produit_id as "productId",
		a.taille as "size",
		null as "itemId",
		0 as "stock",
		0 as "stockPurchasePrice",
		0 as purchase,
		0 as "purchasePrice",
		0 as "sale",
		0 as "salePrice",
		0 as "price",
		0 as "purchaseSalePrice",
		0 as "unitOrder",
		sum(cfa.reste)::int as "order"
	from
		commandefournisseurarticle cfa
	join article a on
		cfa.article_id = a.id
		and a.produit_id = ${productId}
	where
		cfa.type in ('CONFIE', 'STOCK')
		${isStoreIds ? onerpDb`and cfa.magasin_id  IN (3, 7)` : onerpDb``} 
		${isSupplierIds && onerpDb`and a.fournisseur_id in (1)`}
	group by
		cfa.magasin_id,
		cfa.type,
		a.reference,
		a.taille,
		a.fournisseur_id
        ) u
left join articlemagasinmouvement amm on
	amm.article_id = u."itemId"
	and amm.magasin_id = u."storeId"
	and amm.dateprixventettc = (
	select
		max(amm2.dateprixventettc)
	from
		articlemagasinmouvement amm2
	where
		amm2.article_id = amm.article_id
		and amm2.magasin_id = amm.magasin_id)
join magasin m on
	m.id = u."storeId"
join fournisseur f on
	f.id = u."supplierId"
group by
	f.libelle,
	m.numero,
	u.date,
	u."dateIn",
	u."dateOut",
	u."storeId",
	u."supplierId",
	u.type,
	u.reference,
	u.size,
	u."itemId",
	u.stock,
	u."stockPurchasePrice",
	u.purchase,
	u."purchasePrice",
	u.sale,
	u."salePrice",
	u.price,
	u."purchaseSalePrice",
	u."unitOrder",
	u.order,
	amm.prixventettc,
	amm.dateprixventettc`;
	};

	getInventory = async (storeNumber: number, minStock: number) => {
		return await onerpDb<InventoryProduct[]>`
	  select
		cf.libelle as family,
	  p.id as id,
	  f.libelle as supplier,
	  a.reference,
	  a.taille as size,
	  sum(amm.stock) as stock
from
	  articlemagasinmouvement amm
join article a on
	  a.id = amm.article_id
join fournisseur f on
	  f.id = a.fournisseur_id
join produit p on
	  p.id = a.produit_id
	and p.rayon = 'OR'
join produitcomposant pcf on
	pcf.id = p.famille_id
join composant cf on
	cf.id = pcf.composant_id
join magasin m on
	  m.id = amm.magasin_id
	and m.numero = ${storeNumber}
group by
	cf.libelle ,
	p.id,
	  f.libelle ,
	  a.reference ,
	  a.taille
having
	  sum(stock) > ${minStock};
	  `;
	};

	getDefaultSizeForProduct = async (supplierId: number, reference: string) => {
		let isEnabled = false;
		let size = null;
		const sizeResult = await onerpDb<
			{ size: number | null; isEnabled: boolean }[]
		>`
	select valeur as size,pf.actif as "isEnabled" from produitcomposant pc
join produit p on p.famille_id  = pc.id 
join produitfournisseur pf on pf.produit_id  = p.id and pf.fournisseur_id  = ${supplierId} and pf.reference  = ${reference};
	`;
		if (sizeResult.at(0) !== null) {
			size = sizeResult.at(0)!.size;
			isEnabled = sizeResult.at(0)!.isEnabled;
		}
		return { size, isEnabled };
	};

	readRealizedRevenue = async (startDate: string, endDate: string, store: number) => {
		return await onerpDb<Revenue[]>`
	select
	SUM(ca) as revenue
from
	(
	select
		SUM(fcl.quantite * fcl.prixvenduttc) as ca
	from
		factureclient fc
	join magasin m on
		fc.magasin_id = m.id
	join factureclientligne fcl on
		fc.id = fcl.facture_id
	join utilisateur u on
		fcl.employe_id = u.id
	left join article a on
		fcl.article_id = a.id
	left join produit p on
		a.produit_id = p.id
	left join horsstock hs on
		fcl.horsstock_id = hs.id
	where
		fc.statut <> 'FICHE_NAVETTE'
		and fc.date between ${startDate} and ${endDate}
		and m.numero = ${store}
		and coalesce(p.rayon,
		'') <> 'ZAUTRE'
		and coalesce(hs.rayon,
		'') <> 'ZAUTRE'
		and coalesce(p.rayon,
		'') <> 'CONSOMMABLE'
		and coalesce(hs.rayon,
		'') <> 'CONSOMMABLE'
union all
	select
		SUM(fcr.montant) as ca
	from
		factureclient fc
	join magasin m on
		fc.magasin_id = m.id
	join factureclientreglement fcr on
		fc.id = fcr.facture_id
		and fcr.mouvement = 'SORTIE'
	join reglement r on
		fcr.reglement_id = r.id
	join modereglement mr on
		r.modereglement_id = mr.id
		and mr.type = 'OPERATION'
	where
		fc.statut <> 'FICHE_NAVETTE'
		and fc.date between ${startDate} and ${endDate}
		and m.numero = ${store}
) x
	`
	}

	readRevenueDetail = async (startDate: string, endDate: string, store: number) => {
		return await onerpDb<RevenueDetail[]>`
	select
	u.id as "onerpId",
	concat(MAX(u.nom),
	' ',
	MAX(u.prenom)) as "fullname",	 
	u.zone,
	SUM(fcl.quantite * fcl.prixvenduttc)::FLOAT as revenue,
	-- OR    
    coalesce(SUM(case when coalesce(p.rayon, hs.rayon) in ('OR', 'GEMME') then fcl.quantite * fcl.prixvenduttc end),
	0)::FLOAT as "revenueOr",
	-- MODE
    coalesce(SUM(case when coalesce(p.rayon, hs.rayon) in ('ARGENT', 'ACIER', 'MONTRE', 'PLAQUE_OR', 'FANTAISIE') then fcl.quantite * fcl.prixvenduttc end),
	0)::FLOAT as "revenueMode",
	-- FOURNITURES    
coalesce(SUM(case when coalesce(p.rayon, hs.rayon) = 'FOURNITURE' then fcl.quantite * fcl.prixvenduttc end),
	0)::FLOAT as "revenueFourniture",
	-- SERVICE
coalesce(SUM(case when coalesce(p.rayon, hs.rayon) = 'SERVICE' then fcl.quantite * fcl.prixvenduttc end),
	0)::FLOAT as "revenueService"	
from
	factureclient fc
join magasin m on
	fc.magasin_id = m.id
join factureclientligne fcl on
	fc.id = fcl.facture_id
join utilisateur u on
	fcl.employe_id = u.id
left join article a on
	fcl.article_id = a.id
left join produit p on
	a.produit_id = p.id
left join horsstock hs on
	fcl.horsstock_id = hs.id
where
	fc.statut <> 'FICHE_NAVETTE'
	and fc.date between ${startDate} and ${endDate}
	and m.numero = ${store}
	and coalesce(p.rayon,
	hs.rayon) not in ('ZAUTRE', 'CONSOMMABLE')
group by
	u.id
order by
	MAX(u.nom)
	`
	}

	getProduitFournisseur = async (supplierId: number, reference: string) => {
		return await onerpDb<ProduitFournisseur[]>`
       SELECT reference,prixfaconht,tauxremise,unite,coef,pf.prixventettc,pcm.valeur as poidsmatiere,perte,frais
   FROM produitfournisseur pf
   join produit p on p.id = pf.produit_id 
   join produitcomposant pcm on pcm.id = p.matiere_id 
   join fournisseurcomposant fc on fc.composant_id  = pcm.composant_id  and fc.fournisseur_id = pf.fournisseur_id 
   where pf.fournisseur_id = ${supplierId} and pf.reference = ${reference};
    `
	}

	getArticleMagasinMouvement = async (reference: string, supplierId: number) => {
		return await onerpDb<ArticleMagasinMouvement[]>`
	select
	m.numero magasin,
	a.numero article,
	amm.prixachatht::float,
	amm.prixventettc::float,
	sum(amm.stock)::int stock
from
	articlemagasinmouvement amm
join article a on
	a.id = amm.article_id
	and a.fournisseur_id = ${supplierId}
	and a.reference = ${reference}
join magasin m on
	m.id = amm.magasin_id
where
	amm.stock > 0
group by
	m.numero ,
	a.numero ,
	amm.prixachatht ,
	amm.prixventettc
	`
	}

	getMagasin = async (): Promise<Magasin[]> => {
		return await onerpDb<Magasin[]>`
    SELECT id,numero,siege,site FROM magasin WHERE actif=true;
    `
	}

	getHistorique = async (reference: string, supplierId: number, start: string, end: string) => {
		return await onerpDb<Historique[]>`
    select
	m.numero,
	max(cf.libelle) famille,
	max(pcf.valeur) taille,
	max(cm.libelle) matiere,
	max(cp.libelle) pierre,
	max(u.reference),
	sum(u.achat)::integer as achat,
	sum(u.vente)::integer as vente,
	sum(u.commande)::integer as commande,
	sum(u.cu)::integer as cu,
	sum(u.stock)::integer as stock,
	max(entree) entree,
	max(sortie) sortie,
	case
		when max(u.sortie) > max(u.entree) 
	then max(u.sortie)-max(u.entree)
		else case
			when sum(u.stock) > 0 then now()::date - max(u.entree)
		end
	end as ddv,
	max(p.libellecommercial) as libellecommercial
from
	(
	--COMMANDE
	select
		cfa.magasin_id,
		max(a.produit_id) produit_id,
		max(a.reference) reference,
		0 achat,
		0 vente,		
		sum(cfa.reste) commande,
		0 cu,
		0 stock,
		cast(null as date) entree,
		cast(null as date) sortie
	from
		commandefournisseurarticle cfa
	join article a on
		cfa.article_id = a.id
		and a.reference = ${reference}
	where
		cfa.type in ('STOCK', 'CONFIE')
	group by
		cfa.magasin_id
union all
	--LIVRAISON STOCK
	select
		lfa.magasin_id,
				max(a.produit_id) produit_id,
		max(a.reference) reference,		
		sum(case when lfa.date between ${start} and ${end} then lfa.quantite else 0 end) achat,
		0 commande,
		0 vente,
		0 cu,
		sum(lfa.quantite) stock,
		MAX(lfa.date) as entree,
		cast(null as date) as sortie
	from
		livraisonfournisseurarticle lfa
	join article a on
		a.id = lfa.article_id
		and a.reference = ${reference}
	where
		lfa.type in ('STOCK', 'CONFIE')
	group by
		lfa.magasin_id
union all
	--RETOUR FOURNISSEUR STOCK
	select
		rfa.magasin_id,
				max(a.produit_id) produit_id,
		max(a.reference) reference,
		sum(case when rfa.date between ${start} and ${end} then -rfa.quantite else 0 end) achat,		
		0 vente,
		0 commande,
		0 cu,
		-sum(rfa.quantite) stock,
		cast(null as date) entree,
		cast(null as date) sortie
	from
		retourfournisseurarticle rfa
	join article a on
		a.id = rfa.article_id
		and a.reference = ${reference}
	join magasin m on
		m.id = rfa.magasin_id
	where
		rfa.type in ('STOCK', 'CONFIE')
	group by
		rfa.magasin_id
union all
	--TRANSFERT STOCK IN
	select	
		ta.magasin_id,
				max(a.produit_id) produit_id,
		max(a.reference) reference,
		0 test,	
		0 vente,
		0 commande,
		0 cu,
		sum(ta.quantite) stock,
		max(ta.date) as entree,
		cast(null as date) sortie
	from
		transfertarticle ta
	join 
    transfert t on
		ta.transfert_id = t.id
	join 
    article a on
		ta.article_id = a.id
		and a.reference = ${reference}
	where
		ta.type in ('STOCK', 'CONFIE')
	group by
		ta.magasin_id
union all
	--TRANSFERT STOCK OUT
	select	
		t.magasina_id,
				max(a.produit_id) produit_id,
		max(a.reference) reference,
		0 test,	
		0 vente,
		0 commande,
		0 cu,
		-sum(ta.quantite) stock,
		cast(null as date) entree,
		cast(null as date) sortie
	from
		transfertarticle ta
	join 
    transfert t on
		ta.transfert_id = t.id
	join 
    article a on
		ta.article_id = a.id
		and a.reference = ${reference}
	where
		ta.type in ('STOCK', 'CONFIE')
	group by
		t.magasina_id
union all
	--REGULES			
	select
		ra.magasin_id ,
				max(a.produit_id) produit_id,
		max(a.reference) reference,
		0 achat,
		0 vente,
		0 commande,
		0 cu,
		sum(ra.quantite) stock,
		max(case when ra.quantite>0 then ra.date end) entree,
		cast(null as date) sortie
	from
		regulearticle ra
	join article a on
		ra.article_id = a.id
		and a.reference = ${reference}
	where
		ra.type in ('STOCK', 'CONFIE')
	group by
		magasin_id
union all
	--REPRISE
	select
		fca.magasin_id,
				max(a.produit_id) produit_id,
		max(a.reference) reference,
		0 achat,
			sum(case when fca.date between ${start} and ${end} then -fca.quantite else 0 end) vente,
			0 commande,
				0 cu,
				sum(fca.quantite) as stock,
				max(fca.date) entree,
		cast(null as date) sortie
	from
		factureclientarticle fca
	join factureclientligne fcl on
		fca.factureligne_id = fcl.id
		and fcl.mouvement = 'REPRISE'
	join article a on
		a.id = fca.article_id
		and a.reference = ${reference}
	join magasin m on
		m.id = fca.magasin_id
	where
		fca.type in ('STOCK', 'CONFIE')
	group by
		fca.magasin_id
union all
	--VENTE
	select
		fca.magasin_id,
				max(a.produit_id) produit_id,
		max(a.reference) reference,
		0 achat,
				sum(case when fca.date between ${start} and ${end} then fca.quantite else 0 end) vente,
				0 commande,
				0 cu,
				-sum(fca.quantite) as stock,
				cast(null as date) entree,
		max(fca.date) sortie
	from
		factureclientarticle fca
	join factureclientligne fcl on
		fca.factureligne_id = fcl.id
		and fcl.mouvement = 'VENTE'
	join article a on
		a.id = fca.article_id
		and a.reference = ${reference}
	join magasin m on
		m.id = fca.magasin_id
	where
		fca.type in ('STOCK', 'CONFIE')
	group by
		fca.magasin_id
union all
	--LIVRAISON CU
	select
		lfa.magasin_id,
				max(a.produit_id) produit_id,
		max(a.reference) reference,		
		0 achat,
		0 vente,
		0 commande,
		sum(lfa.quantite) cu,
		0 stock,
		cast(null as date) entree ,
		max(cc.date) sortie
	from
		livraisonfournisseurarticle lfa
	join livraisonfournisseurligne lfl on
		lfa.livraisonligne_id = lfl.id
	join article a on
		a.id = lfa.article_id
		and a.reference = ${reference}
	join commandeclientligne ccl on
		lfl.commandeclientligne_id = ccl.id
	join commandeclient cc on
		ccl.commande_id = cc.id
	join magasin m on
		m.id = lfa.magasin_id
	where
		lfa.type = 'CU'
		and cc."date" between ${start} and ${end}
	group by
		lfa.magasin_id
union all
	--TRANSFERT CU
	select
		 ta.magasin_id,
		 		max(a.produit_id) produit_id,
		max(a.reference) reference,				
		0 achat,
		0 vente,
		0 commande,
		sum(ta.quantite) cu,
		0 stock,
		cast(null as date) entree ,
		max(cc.date) sortie
	from
		transfertarticle ta
	join transfert t on
		ta.transfert_id = t.id
	join transfertligne tl on
		ta.transfertligne_id = tl.id
	join commandeclientligne ccl on
		tl.commandeclientligne_id = ccl.id
	join commandeclient cc on
		ccl.commande_id = cc.id
	join article a on
		a.id = ta.article_id
		and a.reference = ${reference}
	join magasin m on
		m.id = ta.magasin_id
	where
		t.type = 'CU'
		and cc."date" between ${start} and ${end}
	group by
		 ta.magasin_id
union all
	--REGULE CU
	select
		ra.magasin_id,
				max(a.produit_id) produit_id,
		max(a.reference) reference,		
		0 achat,
		0 vente,
		0 commande,
		sum(ra.quantite) cu,
		0 stock,
		cast(null as date) entree ,
		max(cc.date) sortie
	from
		regulearticle ra
	join regule r on
		ra.regule_id = r.id
	join reguleligne rl on
		ra.reguleligne_id = rl.id
	join commandeclientligne ccl on
		rl.commandeclientligne_id = ccl.id
	join commandeclient cc on
		ccl.commande_id = cc.id
	join article a on
		a.id = ra.article_id
		and a.reference = ${reference}
	join magasin m on
		m.id = ra.magasin_id
	where
		r.type = 'CU'
		and cc."date" between ${start} and ${end}
	group by
		ra.magasin_id
)u
join magasin m on
	m.id = u.magasin_id
join produit p on
	p.id = u.produit_id
join produitcomposant pcf on
	p.famille_id = pcf.id
join composant cf on
	cf.id = pcf.composant_id
left join produitcomposant pcm on
	pcm.id = p.matiere_id
join composant cm on
	cm.id = pcm.composant_id
left join produitcomposant pcp on
	pcp.id = p.pierre_id
join composant cp on
	cp.id = pcp.composant_id
group by
	m.numero,
	u.reference;
    `
	}

	getHistory2 = async (rayons: string[], magasinIds: number[], start: string, end: string) => {
		return await onerpDb<Historique2[]>`
	select
	magasin_id::integer as "magasinId",
	m.numero,
	max(cf.libelle) famille,
	max(pcf.valeur) taille,
	max(cm.libelle) matiere,
	max(cp.libelle) pierre,
	max(p.image) as image,
	max(u.reference) reference,
	max(u.article) article,
	sum(u.achat)::integer as achat,
	sum(u.vente)::integer as vente,
	sum(u.commande)::integer as commande,
	sum(u.cu)::integer as cu,
	sum(u.stock)::integer as stock,
	max(entree) entree,
	max(sortie) sortie,
	case
		when max(u.sortie) > max(u.entree) 
	then max(u.sortie)-max(u.entree)
		else case
			when sum(u.stock) > 0 then now()::date - max(u.entree)
		end
	end as ddv,
	max(p.libellecommercial) as libellecommercial
from
	(
	--COMMANDE
	select
		cfa.magasin_id,
		max(a.produit_id) produit_id,
		max(a.reference) reference,
		max(a.numero) article,
		max(a.taille) taille,
		0 achat,
		0 vente,		
		sum(cfa.reste) commande,
		0 cu,
		0 stock,
		cast(null as date) entree,
		cast(null as date) sortie
	from
		commandefournisseurarticle cfa
	join article a on
		cfa.article_id = a.id
	join produit p on
		p.id = a.produit_id
		and p.rayon = any(${rayons})
	where
		cfa.type in ('STOCK', 'CONFIE')
		and cfa.magasin_id = any(${magasinIds})
	group by
		cfa.magasin_id,
		cfa.article_id
union all
	--LIVRAISON STOCK
	select
		lfa.magasin_id,
				max(a.produit_id) produit_id,
		max(a.reference) reference,		
				max(a.numero) article,
		max(a.taille) taille,
		sum(case when lfa.date between ${start} and ${end} then lfa.quantite else 0 end) achat,
		0 commande,
		0 vente,
		0 cu,
		sum(lfa.quantite) stock,
		MAX(lfa.date) as entree,
		cast(null as date) as sortie
	from
		livraisonfournisseurarticle lfa
	join article a on
		a.id = lfa.article_id
	join produit p on
		p.id = a.produit_id
		and p.rayon = any(${rayons})
	where
		lfa.type in ('STOCK', 'CONFIE')
		and lfa.magasin_id = any(${magasinIds})
	group by
		lfa.magasin_id,
		lfa.article_id
union all
	--RETOUR FOURNISSEUR STOCK
	select
		rfa.magasin_id,
				max(a.produit_id) produit_id,
		max(a.reference) reference,
				max(a.numero) article,
		max(a.taille) taille,
		sum(case when rfa.date between ${start} and ${end} then -rfa.quantite else 0 end) achat,		
		0 vente,
		0 commande,
		0 cu,
		-sum(rfa.quantite) stock,
		cast(null as date) entree,
		cast(null as date) sortie
	from
		retourfournisseurarticle rfa
	join article a on
		a.id = rfa.article_id
	join produit p on
		p.id = a.produit_id
		and p.rayon = any(${rayons})
	join magasin m on
		m.id = rfa.magasin_id
	where
		rfa.type in ('STOCK', 'CONFIE')
		and rfa.magasin_id = any(${magasinIds})
	group by
		rfa.magasin_id,
		rfa.article_id
union all
	--TRANSFERT STOCK IN
	select	
		ta.magasin_id,
				max(a.produit_id) produit_id,
		max(a.reference) reference,
				max(a.numero) article,
		max(a.taille) taille,
		0 test,	
		0 vente,
		0 commande,
		0 cu,
		sum(ta.quantite) stock,
		max(ta.date) as entree,
		cast(null as date) sortie
	from
		transfertarticle ta
	join 
    transfert t on
		ta.transfert_id = t.id
	join 
    article a on
		ta.article_id = a.id
	join produit p on
		p.id = a.produit_id
		and p.rayon = any(${rayons})
	where
		ta.type in ('STOCK', 'CONFIE')
		and ta.magasin_id = any(${magasinIds})
	group by
		ta.magasin_id,
		ta.article_id
union all
	--TRANSFERT STOCK OUT
	select	
		t.magasina_id,
				max(a.produit_id) produit_id,
		max(a.reference) reference,
				max(a.numero) article,
		max(a.taille) taille,
		0 test,	
		0 vente,
		0 commande,
		0 cu,
		-sum(ta.quantite) stock,
		cast(null as date) entree,
		cast(null as date) sortie
	from
		transfertarticle ta
	join 
    transfert t on
		ta.transfert_id = t.id
	join 
    article a on
		ta.article_id = a.id
	join produit p on
		p.id = a.produit_id
		and p.rayon = any(${rayons})
	where
		ta.type in ('STOCK', 'CONFIE')
		and t.magasina_id = any(${magasinIds})
	group by
		t.magasina_id,
		ta.article_id
union all
	--REGULES			
	select
		ra.magasin_id ,
				max(a.produit_id) produit_id,
		max(a.reference) reference,
				max(a.numero) article,
		max(a.taille) taille,
		0 achat,
		0 vente,
		0 commande,
		0 cu,
		sum(ra.quantite) stock,
		max(case when ra.quantite>0 then ra.date end) entree,
		cast(null as date) sortie
	from
		regulearticle ra
	join article a on
		ra.article_id = a.id
	join produit p on
		p.id = a.produit_id
		and p.rayon = any(${rayons})
	where
		ra.type in ('STOCK', 'CONFIE')
		and ra.magasin_id = any(${magasinIds})
	group by
		magasin_id,
		article_id
union all
	--REPRISE
	select
		fca.magasin_id,
				max(a.produit_id) produit_id,
		max(a.reference) reference,		
				max(a.numero) article,
				max(a.taille) taille,
		0 achat,
			sum(case when fca.date between ${start} and ${end} then -fca.quantite else 0 end) vente,
			0 commande,
				0 cu,
				sum(fca.quantite) as stock,
				max(fca.date) entree,
		cast(null as date) sortie
	from
		factureclientarticle fca
	join factureclientligne fcl on
		fca.factureligne_id = fcl.id
		and fcl.mouvement = 'REPRISE'
	join article a on
		a.id = fca.article_id
	join produit p on
		p.id = a.produit_id
		and p.rayon = any(${rayons})
	where
		fca.type in ('STOCK', 'CONFIE')
		and fca.magasin_id = any(${magasinIds})
	group by
		fca.magasin_id,
		fca.article_id
union all
	--VENTE
	select
		fca.magasin_id,
				max(a.produit_id) produit_id,
		max(a.reference) reference,
				max(a.numero) article,
		max(a.taille) taille,
		0 achat,
				sum(case when fca.date between ${start} and ${end} then fca.quantite else 0 end) vente,
				0 commande,
				0 cu,
				-sum(fca.quantite) as stock,
				cast(null as date) entree,
		max(fca.date) sortie
	from
		factureclientarticle fca
	join factureclientligne fcl on
		fca.factureligne_id = fcl.id
		and fcl.mouvement = 'VENTE'
	join article a on
		a.id = fca.article_id
	join produit p on
		p.id = a.produit_id
		and p.rayon = any(${rayons})
	where
		fca.type in ('STOCK', 'CONFIE')
		and fca.magasin_id = any(${magasinIds})
	group by
		fca.magasin_id,
		fca.article_id
union all
	--LIVRAISON CU
	select
		lfa.magasin_id,
				max(a.produit_id) produit_id,
		max(a.reference) reference,		
				null article,
		max(ccl.taille) taille,
		0 achat,
		0 vente,
		0 commande,
		sum(lfa.quantite) cu,
		0 stock,
		cast(null as date) entree ,
		max(cc.date) sortie
	from
		livraisonfournisseurarticle lfa
	join livraisonfournisseurligne lfl on
		lfa.livraisonligne_id = lfl.id
	join article a on
		a.id = lfa.article_id
	join produit p on
		p.id = a.produit_id
		and p.rayon = any(${rayons})
	join commandeclientligne ccl on
		lfl.commandeclientligne_id = ccl.id
	join commandeclient cc on
		ccl.commande_id = cc.id
	where
		lfa.type = 'CU'
		and cc."date" between ${start} and ${end}
		and lfa.magasin_id = any(${magasinIds})
	group by
		lfa.magasin_id,
		lfa.article_id
union all
	--TRANSFERT CU
	select
		 ta.magasin_id,
		 		max(a.produit_id) produit_id,
		max(a.reference) reference,				
				null article,
				max(ccl.taille) taille,
		0 achat,
		0 vente,
		0 commande,
		sum(ta.quantite) cu,
		0 stock,
		cast(null as date) entree ,
		max(cc.date) sortie
	from
		transfertarticle ta
	join transfert t on
		ta.transfert_id = t.id
	join transfertligne tl on
		ta.transfertligne_id = tl.id
	join commandeclientligne ccl on
		tl.commandeclientligne_id = ccl.id
	join commandeclient cc on
		ccl.commande_id = cc.id
	join article a on
		a.id = ta.article_id
	join produit p on
		p.id = a.produit_id
		and p.rayon = any(${rayons})
	where
		t.type = 'CU'
		and cc."date" between ${start} and ${end}
		and ta.magasin_id = any(${magasinIds})
	group by
		 ta.magasin_id,
		 ta.article_id
union all
	--REGULE CU
	select
		ra.magasin_id,
				max(a.produit_id) produit_id,
		max(a.reference) reference,				
				null article,
				max(ccl.taille) taille,
		0 achat,
		0 vente,
		0 commande,
		sum(ra.quantite) cu,
		0 stock,
		cast(null as date) entree ,
		max(cc.date) sortie
	from
		regulearticle ra
	join regule r on
		ra.regule_id = r.id
	join reguleligne rl on
		ra.reguleligne_id = rl.id
	join commandeclientligne ccl on
		rl.commandeclientligne_id = ccl.id
	join commandeclient cc on
		ccl.commande_id = cc.id
	join article a on
		a.id = ra.article_id
	join produit p on
		p.id = a.produit_id
		and p.rayon = any(${rayons})
	where
		r.type = 'CU'
		and cc."date" between ${start} and ${end}
		and ra.magasin_id = any(${magasinIds})
	group by
		ra.magasin_id,
		ra.article_id
)u
join magasin m on
	m.id = u.magasin_id
join produit p on
	p.id = u.produit_id
join produitcomposant pcf on
	p.famille_id = pcf.id
join composant cf on
	cf.id = pcf.composant_id
left join produitcomposant pcm on
	pcm.id = p.matiere_id
join composant cm on
	cm.id = pcm.composant_id
left join produitcomposant pcp on
	pcp.id = p.pierre_id
join composant cp on
	cp.id = pcp.composant_id
group by
	magasin_id,
	m.numero,
	u.reference,
	u.article;
	`;
	}

	getHistory2ByReference = async (reference: string, magasinIds: number[], start: string, end: string) => {
		return await onerpDb<Historique2[]>`
	select
	u.magasin_id::integer as "magasinId",
	m.numero,
	max(cf.libelle) famille,
	max(pcf.valeur) taille,
	max(cm.libelle) matiere,
	max(cp.libelle) pierre,
	max(p.image) as image,
	max(u.reference) reference,
	max(u.article) article,
	sum(u.achat)::integer as achat,
	sum(u.vente)::integer as vente,
	sum(u.commande)::integer as commande,
	sum(u.cu)::integer as cu,
	sum(u.stock)::integer as stock,
	max(entree) entree,
	max(sortie) sortie,
	case
		when max(u.sortie) > max(u.entree) 
	then max(u.sortie)-max(u.entree)
		else case
			when sum(u.stock) > 0 then now()::date - max(u.entree)
		end
	end as ddv,
	max(p.libellecommercial) as libellecommercial
from
	(
	--COMMANDE
	select
		cfa.magasin_id::integer,
		max(a.produit_id) produit_id,
		max(a.reference) reference,
		max(a.numero) article,
		max(a.taille) taille,
		0 achat,
		0 vente,		
		sum(cfa.reste) commande,
		0 cu,
		0 stock,
		cast(null as date) entree,
		cast(null as date) sortie
	from
		commandefournisseurarticle cfa
	join article a on
		cfa.article_id = a.id
		and a.reference = ${reference}
	where
		cfa.type in ('STOCK', 'CONFIE')
		and cfa.magasin_id = any(${magasinIds})
	group by
		cfa.magasin_id,
		cfa.article_id
union all
	--LIVRAISON STOCK
	select
		lfa.magasin_id,
				max(a.produit_id) produit_id,
		max(a.reference) reference,		
				max(a.numero) article,
		max(a.taille) taille,
		sum(case when lfa.date between ${start} and ${end} then lfa.quantite else 0 end) achat,
		0 commande,
		0 vente,
		0 cu,
		sum(lfa.quantite) stock,
		MAX(lfa.date) as entree,
		cast(null as date) as sortie
	from
		livraisonfournisseurarticle lfa
	join article a on
		a.id = lfa.article_id
		and a.reference = ${reference}
	where
		lfa.type in ('STOCK', 'CONFIE')
		and lfa.magasin_id = any(${magasinIds})
	group by
		lfa.magasin_id,
		lfa.article_id
union all
	--RETOUR FOURNISSEUR STOCK
	select
		rfa.magasin_id,
				max(a.produit_id) produit_id,
		max(a.reference) reference,
				max(a.numero) article,
		max(a.taille) taille,
		sum(case when rfa.date between ${start} and ${end} then -rfa.quantite else 0 end) achat,		
		0 vente,
		0 commande,
		0 cu,
		-sum(rfa.quantite) stock,
		cast(null as date) entree,
		cast(null as date) sortie
	from
		retourfournisseurarticle rfa
	join article a on
		a.id = rfa.article_id
		and a.reference = ${reference}
	join magasin m on
		m.id = rfa.magasin_id
	where
		rfa.type in ('STOCK', 'CONFIE')
		and rfa.magasin_id = any(${magasinIds})
	group by
		rfa.magasin_id,
		rfa.article_id
union all
	--TRANSFERT STOCK IN
	select	
		ta.magasin_id,
				max(a.produit_id) produit_id,
		max(a.reference) reference,
				max(a.numero) article,
		max(a.taille) taille,
		0 test,	
		0 vente,
		0 commande,
		0 cu,
		sum(ta.quantite) stock,
		max(ta.date) as entree,
		cast(null as date) sortie
	from
		transfertarticle ta
	join 
    transfert t on
		ta.transfert_id = t.id
	join 
    article a on
		ta.article_id = a.id
		and a.reference = ${reference}
	where
		ta.type in ('STOCK', 'CONFIE')
		and ta.magasin_id = any(${magasinIds})
	group by
		ta.magasin_id,
		ta.article_id
union all
	--TRANSFERT STOCK OUT
	select	
		t.magasina_id,
				max(a.produit_id) produit_id,
		max(a.reference) reference,
				max(a.numero) article,
		max(a.taille) taille,
		0 test,	
		0 vente,
		0 commande,
		0 cu,
		-sum(ta.quantite) stock,
		cast(null as date) entree,
		cast(null as date) sortie
	from
		transfertarticle ta
	join 
    transfert t on
		ta.transfert_id = t.id
	join 
    article a on
		ta.article_id = a.id
		and a.reference = ${reference}
	where
		ta.type in ('STOCK', 'CONFIE')
		and t.magasina_id = any(${magasinIds})
	group by
		t.magasina_id,
		ta.article_id
union all
	--REGULES			
	select
		ra.magasin_id ,
				max(a.produit_id) produit_id,
		max(a.reference) reference,
				max(a.numero) article,
		max(a.taille) taille,
		0 achat,
		0 vente,
		0 commande,
		0 cu,
		sum(ra.quantite) stock,
		max(case when ra.quantite>0 then ra.date end) entree,
		cast(null as date) sortie
	from
		regulearticle ra
	join article a on
		ra.article_id = a.id
		and a.reference = ${reference}
	where
		ra.type in ('STOCK', 'CONFIE')
		and ra.magasin_id = any(${magasinIds})
	group by
		magasin_id,
		article_id
union all
	--REPRISE
	select
		fca.magasin_id,
				max(a.produit_id) produit_id,
		max(a.reference) reference,		
				max(a.numero) article,
				max(a.taille) taille,
		0 achat,
			sum(case when fca.date between ${start} and ${end} then -fca.quantite else 0 end) vente,
			0 commande,
				0 cu,
				sum(fca.quantite) as stock,
				max(fca.date) entree,
		cast(null as date) sortie
	from
		factureclientarticle fca
	join factureclientligne fcl on
		fca.factureligne_id = fcl.id
		and fcl.mouvement = 'REPRISE'
	join article a on
		a.id = fca.article_id
		and a.reference = ${reference}
	where
		fca.type in ('STOCK', 'CONFIE')
		and fca.magasin_id = any(${magasinIds})
	group by
		fca.magasin_id,
		fca.article_id
union all
	--VENTE
	select
		fca.magasin_id,
				max(a.produit_id) produit_id,
		max(a.reference) reference,
				max(a.numero) article,
		max(a.taille) taille,
		0 achat,
				sum(case when fca.date between ${start} and ${end} then fca.quantite else 0 end) vente,
				0 commande,
				0 cu,
				-sum(fca.quantite) as stock,
				cast(null as date) entree,
		max(fca.date) sortie
	from
		factureclientarticle fca
	join factureclientligne fcl on
		fca.factureligne_id = fcl.id
		and fcl.mouvement = 'VENTE'
	join article a on
		a.id = fca.article_id
		and a.reference = ${reference}
	where
		fca.type in ('STOCK', 'CONFIE')
		and fca.magasin_id = any(${magasinIds})
	group by
		fca.magasin_id,
		fca.article_id
union all
	--LIVRAISON CU
	select
		lfa.magasin_id,
				max(a.produit_id) produit_id,
		max(a.reference) reference,		
				null article,
		max(ccl.taille) taille,
		0 achat,
		0 vente,
		0 commande,
		sum(lfa.quantite) cu,
		0 stock,
		cast(null as date) entree ,
		max(cc.date) sortie
	from
		livraisonfournisseurarticle lfa
	join livraisonfournisseurligne lfl on
		lfa.livraisonligne_id = lfl.id
	join article a on
		a.id = lfa.article_id
		and a.reference = ${reference}
	join commandeclientligne ccl on
		lfl.commandeclientligne_id = ccl.id
	join commandeclient cc on
		ccl.commande_id = cc.id
	where
		lfa.type = 'CU'
		and cc."date" between ${start} and ${end}
		and lfa.magasin_id = any(${magasinIds})
	group by
		lfa.magasin_id,
		lfa.article_id
union all
	--TRANSFERT CU
	select
		 ta.magasin_id,
		 		max(a.produit_id) produit_id,
		max(a.reference) reference,				
				null article,
				max(ccl.taille) taille,
		0 achat,
		0 vente,
		0 commande,
		sum(ta.quantite) cu,
		0 stock,
		cast(null as date) entree ,
		max(cc.date) sortie
	from
		transfertarticle ta
	join transfert t on
		ta.transfert_id = t.id
	join transfertligne tl on
		ta.transfertligne_id = tl.id
	join commandeclientligne ccl on
		tl.commandeclientligne_id = ccl.id
	join commandeclient cc on
		ccl.commande_id = cc.id
	join article a on
		a.id = ta.article_id
		and a.reference = ${reference}
	where
		t.type = 'CU'
		and cc."date" between ${start} and ${end}
		and ta.magasin_id = any(${magasinIds})
	group by
		 ta.magasin_id,
		 ta.article_id
union all
	--REGULE CU
	select
		ra.magasin_id,
				max(a.produit_id) produit_id,
		max(a.reference) reference,				
				null article,
				max(ccl.taille) taille,
		0 achat,
		0 vente,
		0 commande,
		sum(ra.quantite) cu,
		0 stock,
		cast(null as date) entree ,
		max(cc.date) sortie
	from
		regulearticle ra
	join regule r on
		ra.regule_id = r.id
	join reguleligne rl on
		ra.reguleligne_id = rl.id
	join commandeclientligne ccl on
		rl.commandeclientligne_id = ccl.id
	join commandeclient cc on
		ccl.commande_id = cc.id
	join article a on
		a.id = ra.article_id
		and a.reference = ${reference}
	where
		r.type = 'CU'
		and cc."date" between ${start} and ${end}
		and ra.magasin_id = any(${magasinIds})
	group by
		ra.magasin_id,
		ra.article_id
)u
join magasin m on
	m.id = u.magasin_id
join produit p on
	p.id = u.produit_id
join produitcomposant pcf on
	p.famille_id = pcf.id
join composant cf on
	cf.id = pcf.composant_id
left join produitcomposant pcm on
	pcm.id = p.matiere_id
join composant cm on
	cm.id = pcm.composant_id
left join produitcomposant pcp on
	pcp.id = p.pierre_id
join composant cp on
	cp.id = pcp.composant_id
group by
	magasin_id,
	m.numero,
	u.reference,
	u.article;
    `;
	}

	async getCurrentStoreShipments() {
		return await onerpDb<StoreShipmentTracking[]>`select
	lm."date",
	lm."datecreation",
	lm.numero as bon,
	m.numero as magasin,
	case
		when lm.magasina_id = lm.magasinb_id then true
		else false
	end as "livraison_site",
	em."date" as "date_expedition",
	rm."date" as "date_reception",
	lm.ged,
	sum(case when p.rayon in ('OR', 'ARGENT', 'MONTRE', 'ACIER', 'PLAQUE_OR', 'FANTAISIE', 'GEMME') then lml.quantite else 0 end)::INTEGER as produit_quantite,
	t."type" as "transfert_type"
from
	livraisonmagasin lm
join livraisonmagasinligne lml on
	lml.livraison_id = lm.id
join article a on
	a.id = lml.article_id
join produit p on
	p.id = a.produit_id
join magasin m on
	m.id = lm.magasinb_id
	and m.siege != true
	and m.site != true
left join expeditionmagasinligne eml on
	eml.livraisonmagasin_id = lm.id 
left join expeditionmagasin em on
	em.id = eml.expedition_id and em.statut != 'SAISI'
left join receptionmagasinligne rml on
	rml.livraisonmagasin_id = lm.id
left join receptionmagasin rm on
	rm.id = rml.reception_id
	left join transfert t on t.id = lm.transfert_id
where
	lm."date" > '2024-12-01'
	and lm."type" in ('LIVRAISON_FOURNISSEUR', 'TRANSFERT')
	and lm.cloturer_ged is false
group by
	lm."date",
	lm."datecreation",
	lm.numero ,
	m.numero ,
	em."date",
	rm."date",
	lm.magasina_id,
	lm.magasinb_id,
	lm.ged,
	t."type";`;
	}

	async getStoreShipment(bon: string) {
		return await onerpDb`select * from livraisonmagasin lm where lm.numero = ${bon};`;
	}

	async getReferenceByFournisseurId(fournisseurId: number) {
		return await onerpDb`select
	pf.reference
from 
	produitfournisseur pf
join produit p on
	p.id = pf.produit_id
where
			pf.fournisseur_id = ${fournisseurId}`;
	}

	async getLivraisonFournisseurData() {
		return await onerpDb`select
	type,
	concat(U.prenom,
	' ',
	u.nom) as utilisateur,
	sum(lf.quantite) as qtt_lf,
	sum(case when lf.magasinlivraison_id = 1 then lf.quantite else 0 end) as qtt_sas
from
	livraisonfournisseur lf
join utilisateur u on
	u.id = lf.utilisateurcreation_id
where
	lf."date" = now()::date
group by
	"type",
	u.prenom,
	u.nom
	order by
	"type" ,
	concat(u.prenom,
	' ',
	u.nom) ;`;
	}

	async getTransfertData() {
		return await onerpDb`select
	t."type",
	concat(u.prenom,
	' ',
	u.nom) as "utilisateur",
	sum(t.quantite)::INTEGER as qtt
from
	transfert t
join utilisateur u on
	u.id = t.utilisateurcreation_id
where
	t."date" = now()::date
group by
	t."type" ,
	u.prenom ,
	u.nom
order by
	t."type" ,
	concat(u.prenom,
	' ',
	u.nom) `;
	}

	async getDemandeTransfertData() {
		return await onerpDb`select
	dt."type",
	concat(u.prenom,
	' ',
	u.nom) as utilisateur,
	sum(dt.quantite)::INTEGER as qtt
from
	demandetransfert dt
join utilisateur u on
	u.id = dt.utilisateurcreation_id
where
	dt."date" = now()::date
group by
	dt."type" ,
	u.prenom ,
	u.nom
order by
	dt."type" ,
	concat(u.prenom,
	' ',
	u.nom)`;
	}

	async getCommandeFournisseurData() {
		return await onerpDb`select
	cf."type",
	concat(u.prenom,
	' ',
	u.nom) as utilisateur,
	sum(cf.quantite)::INTEGER as qtt
from
	commandefournisseur cf
join utilisateur u on
	u.id = cf.utilisateurcreation_id
where
	cf."date" = now()::date
group by
	cf."type" ,
	u.prenom ,
	u.nom
order by
	cf."type" ,
	concat(u.prenom,
	' ',
	u.nom)`;
	}

	async getProductForTracking() {
		return await onerpDb`select p.id,
pf.fournisseur_id ,
pf.reference,
cf.groupe,
cf.libelle as famille,
sum(amm.stock) stock_total,
sum(case when amm.magasin_id = 1 then amm.stock else 0 end) stock_sas
from produit p 
join article a on a.produit_id = p.id
join articlemagasinmouvement amm on amm.article_id = a.id
join produitfournisseur pf on pf.produit_id = p.id and a.fournisseur_id = pf.fournisseur_id and pf.actif = true 
join produitcomposant pcf on pcf.id  = p.famille_id
join composant cf on cf.id = pcf.composant_id
where p.actif = true
group by p.id,
pf.fournisseur_id,
pf.reference,
cf.groupe,
cf.libelle;`;
	}
}
