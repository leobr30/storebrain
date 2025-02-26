import { Injectable } from '@nestjs/common';
import { savDb } from 'src/providers/database/onerp.database';
import { Client } from 'pg';
import { Duration, interval, intervalToDuration } from 'date-fns';
@Injectable()
export class SavService {
     
    async getSavDevisData() {
        const client = new Client({
            user: 'postgres',
            host: '192.168.1.45',
            database: 'diamantor',
            password: 'p0stgres',
        })
        await client.connect()
        const res = await client.query(`select
	count(distinct s.id)::integer as atelier_devis ,
	count(distinct (case when sid.id is null then s.id end))::integer as attente_devis,
	count(distinct ( case when sid.id is not null and sid.reponse is null then s.id end) )::integer as attente_reponse
from
	sachet s
join sachet_livraison sl on
	sl.sachet = s.id
	and sl.atelier = 51
	and sl.date_fin is null
left join sachet_intervention si on
	si.sachet = s.id
left join sachet_intervention_devis sid on
	sid.sachet_intervention = si.id `)
        await client.end()
        return res.rows
    }

    async getSavReceptionAtelierData() {
        const client = new Client({
            user: 'postgres',
            host: '192.168.1.45',
            database: 'diamantor',
            password: 'p0stgres',
        })
        await client.connect()
        const res = await client.query(`select
	a.nom ,
	count(distinct s.id)::integer as quantite_reception
from
	sachet s
join sachet_livraison sl on
	sl.sachet = s.id
	and sl.magasin_cible = 16
	and sl.date_debut::date = now()::date
join atelier a on
	a.id = sl.atelier
group by
	a.nom
order by
	a.nom `)
        await client.end()
        return res.rows
    }

    async getSavReceptionMagasinData() {
        const client = new Client({
            user: 'postgres',
            host: '192.168.1.45',
            database: 'diamantor',
            password: 'p0stgres',
        })
        await client.connect()
        const res = await client.query(`select
	m.nom_long as nom ,
	count(distinct s.id)::integer as quantite_reception
from
	sachet s
join sachet_livraison sl on
	sl.sachet = s.id
	and sl.magasin_cible = 16
	and sl.date_arrivee ::date = now()::date
join magasin m on
	m.id = sl.magasin_source
group by
	m.nom_long
order by
	m.nom_long`)
        await client.end()
        return res.rows
    }
    
    async getSavEnvoiMagasinData() {
        const client = new Client({
            user: 'postgres',
            host: '192.168.1.45',
            database: 'diamantor',
            password: 'p0stgres',
        })
        await client.connect()
        const res = await client.query(`
            	select
	m.nom_long as nom ,
	count(distinct s.id)::integer as quantite_envoyer
from
	sachet s
join sachet_livraison sl on
	sl.sachet = s.id
	and sl.magasin_source = 16
	and sl.date_debut::date = now()::date
join magasin m on
	m.id = sl.magasin_cible
group by
	m.nom_long
order by
	m.nom_long`)
        await client.end()
        return res.rows
    }

    async getReceptionData() {
        const result: {
            prenom: string,
            nom: string,
            colis: number,
            temps: number,
        }[] = [];
        const client = new Client({
            user: 'postgres',
            host: '192.168.1.45',
            database: 'diamantor2',
            password: 'p0stgres',
        })
        await client.connect()
        const res = await client.query(`
            select e.prenom , e.nom,sum(r.quantite_colis) as colis,sum(r.date_fin - r.date_debut) as reception_temps  from reception r 
join magasin m on m.acteur = r.magasin and m.acteur = 'FKY'
join livreur l on l.acteur = r.livreur 
join employe e on e.numero = r.employe_cloture 
where date_creation::date = now()::date
group by employe_cloture,e.prenom,e.nom 
order by reception_temps desc;
        `)
        await client.end()
        res.rows.forEach(row => {

            if(result.find(item => item.prenom === row.prenom && item.nom === row.nom)) {
                result.find(item => item.prenom === row.prenom && item.nom === row.nom)!.temps += row.reception_temps;
                result.find(item => item.prenom === row.prenom && item.nom === row.nom)!.colis += row.colis;
            } else {
                result.push({
                    prenom: row.prenom,
                    nom: row.nom,
                    colis: row.colis,
                    temps: row.reception_temps,
                });
            }
        });
        console.log(result)
        return result;
    }
}
