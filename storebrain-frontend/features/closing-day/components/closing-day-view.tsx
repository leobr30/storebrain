import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClosingDay } from "../types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDuration } from "date-fns";
import { ClosingDayAddCommentDialog } from "./closing-day-add-comment-dialog";
import { createComment } from "../action";
import { Button } from "@/components/ui/button";
import { ClosingDayCloseDialog } from "./closing-day-close-dialog";

const ClosingDayView = ({ closingDay }: { closingDay: ClosingDay }) => {
    const date = new Date();
    console.log('CLOSING DAY', closingDay);

   

    const LivraisonFournisseur = () => {
        const nbRowSpan = [...new Set(closingDay.livraisonData.filter(item => item.qtt_lf > 0).map(item => item.type))].length + 2;
        return (
            <>
                <TableRow>
                    <TableCell rowSpan={nbRowSpan}>Livraison Fournisseur</TableCell>
                </TableRow>
                {closingDay.onerpData.livraisonData.filter(item => item.type === 'STOCK').length > 0 ? <TableRow>
                    <TableCell>Stock: {closingDay.onerpData.livraisonData.filter(item => item.type === 'STOCK').reduce((acc, curr) => acc + parseInt(curr.qtt_lf.toString()), 0)}</TableCell>
                    <TableCell><div className="flex flex-col gap-2">
                        {closingDay.onerpData.livraisonData.filter(item => item.type === 'STOCK').map((item, index) => (
                            <div key={`LF_STOCK_${index}`}>{item.utilisateur}: {item.qtt_lf}</div>
                        ))}
                    </div></TableCell>
                </TableRow> : null}
                {closingDay.onerpData.livraisonData.filter(item => item.type === 'CONFIE').length > 0 ? <TableRow>
                    <TableCell>Confie: {closingDay.onerpData.livraisonData.filter(item => item.type === 'CONFIE').reduce((acc, curr) => acc + parseInt(curr.qtt_lf.toString()), 0)}</TableCell>
                    <TableCell><div className="flex flex-col gap-2">
                        {closingDay.onerpData.livraisonData.filter(item => item.type === 'CONFIE').map((item,index) => (
                            <div key={`LF_CONFIE_${index}`}>{item.utilisateur}: {item.qtt_lf}</div>
                        ))}
                    </div></TableCell>
                </TableRow> : null}
                {closingDay.onerpData.livraisonData.filter(item => item.type === 'CU').length > 0 ? <TableRow>
                    <TableCell>CU: {closingDay.onerpData.livraisonData.filter(item => item.type === 'CU').reduce((acc, curr) => acc + parseInt(curr.qtt_lf.toString()), 0)}</TableCell>
                    <TableCell><div className="flex flex-col gap-2">
                        {closingDay.onerpData.livraisonData.filter(item => item.type === 'CU').map((item,index) => (
                            <div key={`LF_CU_${index}`}>{item.utilisateur}: {item.qtt_lf}</div>
                        ))}
                    </div></TableCell>
                </TableRow> : null}
                {closingDay.onerpData.livraisonData.filter(item => item.qtt_sas).length > 0 ? <TableRow>
                    <TableCell >Position SAS: {closingDay.onerpData.livraisonData.reduce((acc, curr) => acc + parseInt(curr.qtt_sas.toString()), 0)}</TableCell>
                    <TableCell></TableCell>
                </TableRow> : null}
            </>
        )
    }

    const Transfert = () => {
        const nbRowSpan = [...new Set(closingDay.onerpData.transfertData.filter(item => item.qtt > 0).map(item => item.type))].length + 1;
        return (
            <>
                <TableRow>
                    <TableCell rowSpan={nbRowSpan}>Transfert</TableCell>
                </TableRow>
                {closingDay.onerpData.transfertData.filter(item => item.type === 'STOCK').length > 0 ? <TableRow>

                    <TableCell>Stock: {closingDay.onerpData.transfertData.filter(item => item.type === 'STOCK').reduce((acc, curr) => acc + curr.qtt, 0)}</TableCell>
                    <TableCell><div className="flex flex-col gap-2">
                        {closingDay.onerpData.transfertData.filter(item => item.type === 'STOCK').map((item,index) => (
                            <div key={`T_STOCK_${index}`}>{item.utilisateur}: {item.qtt}</div>
                        ))}
                    </div></TableCell>
                </TableRow> : null}
                {closingDay.onerpData.transfertData.filter(item => item.type === 'CU').length > 0 ? <TableRow>
                    <TableCell>CU: {closingDay.onerpData.transfertData.filter(item => item.type === 'CU').reduce((acc, curr) => acc + curr.qtt, 0)}</TableCell>
                    <TableCell><div className="flex flex-col gap-2">
                        {closingDay.onerpData.transfertData.filter(item => item.type === 'CU').map((item,index) => (
                            <div key={`T_CU_${index}`}>{item.utilisateur}: {item.qtt}</div>
                        ))}
                    </div></TableCell>
                </TableRow> : null}
                {closingDay.onerpData.transfertData.filter(item => item.type === 'SAV').length > 0 ? <TableRow>
                    <TableCell>SAV: {closingDay.onerpData.transfertData.filter(item => item.type === 'SAV').reduce((acc, curr) => acc + curr.qtt, 0)}</TableCell>
                    <TableCell><div className="flex flex-col gap-2">
                        {closingDay.onerpData.transfertData.filter(item => item.type === 'SAV').map((item,index) => (
                            <div key={`T_SAV_${index}`}>{item.utilisateur}: {item.qtt}</div>
                        ))}
                    </div></TableCell>
                </TableRow> : null}
                {closingDay.onerpData.transfertData.filter(item => item.type === 'CLIENT').length > 0 ? <TableRow>
                    <TableCell>Client: {closingDay.onerpData.transfertData.filter(item => item.type === 'CLIENT').reduce((acc, curr) => acc + curr.qtt, 0)}</TableCell>
                    <TableCell><div className="flex flex-col gap-2">
                        {closingDay.onerpData.transfertData.filter(item => item.type === 'CLIENT').map((item,index) => (
                            <div key={`T_CLIENT_${index}`}>{item.utilisateur}: {item.qtt}</div>
                        ))}
                    </div></TableCell>
                </TableRow> : null}
            </>
        )
    }

    const DemandeTransfert = () => {
        const nbRowSpan = [...new Set(closingDay.onerpData.demandeTransfertData.filter(item => item.qtt > 0).map(item => item.type))].length + 1;
        return (
            <>
                <TableRow>
                    <TableCell rowSpan={nbRowSpan}>Demande Transfert</TableCell>
                </TableRow>
                {closingDay.onerpData.demandeTransfertData.filter(item => item.type === 'STOCK').length > 0 ? <TableRow>

                    <TableCell>Stock: {closingDay.onerpData.demandeTransfertData.filter(item => item.type === 'STOCK').reduce((acc, curr) => acc + parseInt(curr.qtt.toString()), 0)}</TableCell>
                    <TableCell><div className="flex flex-col gap-2">
                        {closingDay.onerpData.demandeTransfertData.filter(item => item.type === 'STOCK').map((item,index) => (
                            <div key={`DT_STOCK_${index}`}>{item.utilisateur}: {item.qtt}</div>
                        ))}
                    </div></TableCell>
                </TableRow> : null}
                {closingDay.onerpData.demandeTransfertData.filter(item => item.type === 'PICKING').length > 0 ? <TableRow>
                    <TableCell>Picking: {closingDay.onerpData.demandeTransfertData.filter(item => item.type === 'PICKING').reduce((acc, curr) => acc + parseInt(curr.qtt.toString()), 0)}</TableCell>
                    <TableCell><div className="flex flex-col gap-2">
                        {closingDay.onerpData.demandeTransfertData.filter(item => item.type === 'PICKING').map((item,index) => (
                            <div key={`DT_PICKING_${index}`}>{item.utilisateur}: {item.qtt}</div>
                        ))}
                    </div></TableCell>
                </TableRow> : null}
                {closingDay.onerpData.demandeTransfertData.filter(item => item.type === 'EQUILIBRAGE').length > 0 ? <TableRow>
                    <TableCell>Equilibrage: {closingDay.onerpData.demandeTransfertData.filter(item => item.type === 'EQUILIBRAGE').reduce((acc, curr) => acc + parseInt(curr.qtt.toString()), 0)}</TableCell>
                    <TableCell><div className="flex flex-col gap-2">
                        {closingDay.onerpData.demandeTransfertData.filter(item => item.type === 'EQUILIBRAGE').map((item,index) => (
                            <div key={`DT_EQUILIBRAGE_${index}`}>{item.utilisateur}: {item.qtt}</div>
                        ))}
                    </div></TableCell>
                </TableRow> : null}
                {closingDay.onerpData.demandeTransfertData.filter(item => item.type === 'CU').length > 0 ? <TableRow>
                    <TableCell>CU: {closingDay.onerpData.demandeTransfertData.filter(item => item.type === 'CU').reduce((acc, curr) => acc + parseInt(curr.qtt.toString()), 0)}</TableCell>
                    <TableCell><div className="flex flex-col gap-2">
                        {closingDay.onerpData.demandeTransfertData.filter(item => item.type === 'CU').map((item,index) => (
                            <div key={`DT_CU_${index}`}>{item.utilisateur}: {item.qtt}</div>
                        ))}
                    </div></TableCell>
                </TableRow> : null}
                {closingDay.onerpData.demandeTransfertData.filter(item => item.type === 'SAV').length > 0 ? <TableRow>
                    <TableCell>SAV: {closingDay.onerpData.demandeTransfertData.filter(item => item.type === 'SAV').reduce((acc, curr) => acc + parseInt(curr.qtt.toString()), 0)}</TableCell>
                    <TableCell><div className="flex flex-col gap-2">
                        {closingDay.onerpData.demandeTransfertData.filter(item => item.type === 'SAV').map((item,index) => (
                            <div key={`DT_SAV_${index}`}>{item.utilisateur}: {item.qtt}</div>
                        ))}
                    </div></TableCell>
                </TableRow> : null}
                {closingDay.onerpData.demandeTransfertData.filter(item => item.type === 'CLIENT').length > 0 ? <TableRow>
                    <TableCell>Client: {closingDay.onerpData.demandeTransfertData.filter(item => item.type === 'CLIENT').reduce((acc, curr) => acc + parseInt(curr.qtt.toString()), 0)}</TableCell>
                    <TableCell><div className="flex flex-col gap-2">
                        {closingDay.onerpData.demandeTransfertData.filter(item => item.type === 'CLIENT').map((item,index) => (
                            <div key={`DT_CLIENT_${index}`}>{item.utilisateur}: {item.qtt}</div>
                        ))}
                    </div></TableCell>
                </TableRow> : null}
            </>
        )
    }

    const CommandeFournisseur = () => {
        const nbRowSpan = [...new Set(closingDay.onerpData.commandeFournisseurData.filter(item => item.qtt > 0).map(item => item.type))].length + 1;
        return closingDay.onerpData.commandeFournisseurData.length > 0 ? (
            <>
                <TableRow>
                    <TableCell rowSpan={nbRowSpan}>Commande Fournisseur</TableCell>
                </TableRow>
                {closingDay.onerpData.commandeFournisseurData.filter(item => item.type === 'STOCK').length > 0 ? <TableRow>
                    <TableCell>Stock: {closingDay.onerpData.commandeFournisseurData.filter(item => item.type === 'STOCK').reduce((acc, curr) => acc + parseInt(curr.qtt.toString()), 0)}</TableCell>
                    <TableCell><div className="flex flex-col gap-2">
                        {closingDay.onerpData.commandeFournisseurData.filter(item => item.type === 'STOCK').map((item,index) => (
                            <div key={`CF_STOCK_${index}`}>{item.utilisateur}: {item.qtt}</div>
                        ))}
                    </div></TableCell>
                </TableRow> : null}
                {closingDay.onerpData.commandeFournisseurData.filter(item => item.type === 'CONFIE').length > 0 ? <TableRow>
                    <TableCell>Confié: {closingDay.onerpData.commandeFournisseurData.filter(item => item.type === 'CONFIE').reduce((acc, curr) => acc + parseInt(curr.qtt.toString()), 0)}</TableCell>
                    <TableCell><div className="flex flex-col gap-2">
                        {closingDay.onerpData.commandeFournisseurData.filter(item => item.type === 'CONFIE').map((item,index) => (
                            <div key={`CF_CONFIE_${index}`}>{item.utilisateur}: {item.qtt}</div>
                        ))}
                    </div></TableCell>
                </TableRow> : null}
                {closingDay.onerpData.commandeFournisseurData.filter(item => item.type === 'CU').length > 0 ? <TableRow>
                    <TableCell>CU: {closingDay.onerpData.commandeFournisseurData.filter(item => item.type === 'CU').reduce((acc, curr) => acc + parseInt(curr.qtt.toString()), 0)}</TableCell>
                    <TableCell><div className="flex flex-col gap-2">
                        {closingDay.onerpData.commandeFournisseurData.filter(item => item.type === 'CU').map((item,index) => (
                            <div key={`CF_CU_${index}`}>{item.utilisateur}: {item.qtt}</div>
                        ))}
                    </div></TableCell>
                </TableRow> : null}
            </>
        ) : null
    }

    return <div className="space-y-5">
        <div className="text-2xl font-medium text-default-800 ">Clôture de journée du {date.toLocaleDateString('fr-FR')}</div>
        <Card>
            <CardHeader>
                <CardTitle>Etiquetage</CardTitle>
            </CardHeader>
            <CardContent>
                <Table className="text-center">
                    <TableHeader>
                        <TableRow>
                            <TableHead>Informations</TableHead>
                            <TableHead>Quantité</TableHead>
                            
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow>
                            <TableCell>
                                Début de journée
                            </TableCell>
                            <TableCell>
                                {closingDay.closingDay.startRemainingLabeling}
                            </TableCell>
                        </TableRow>
                        {closingDay.closingDay.status !== 'PENDING' ? 
                        <>
                        <TableRow>
                            <TableCell>
                                Réaliser fin de journée
                            </TableCell>
                            <TableCell>
                                {closingDay.closingDay.realizedLabeling}
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>
                                Restant au lendemain
                            </TableCell>
                            <TableCell>
                                {closingDay.closingDay.endRemainingLabeling}
                            </TableCell>
                        </TableRow>
                        </>
                         : null}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>  
                    <div className="flex justify-between items-center">
                        Commentaires <ClosingDayAddCommentDialog closingDayId={closingDay.closingDay.id} />
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Table className="text-center">
                    <TableHeader>
                        <TableRow>
                            <TableHead>Utilisateur</TableHead>
                            <TableHead>Commentaire</TableHead>
                            <TableHead>Quantité / Temps</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {closingDay.closingDay.comments.map((comment, index) => (
                            <TableRow key={`comment_${index}`}>
                                <TableCell>{comment.user.firstName} {comment.user.lastName}</TableCell>
                                <TableCell>{comment.comment}</TableCell>
                                <TableCell>{comment.quantity} / {comment.time}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Produits</CardTitle>
            </CardHeader>
            <CardContent>
                <Table className="text-center">
                    <TableHeader>
                        <TableRow>
                            <TableHead>Mouvement</TableHead>
                            <TableHead>Par Type</TableHead>
                            <TableHead>Par Utilisateur</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody className="p-0 m-0">
                        <LivraisonFournisseur />
                        <Transfert />
                        <DemandeTransfert />
                        <CommandeFournisseur />
                    </TableBody>
                </Table>

            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>SAV</CardTitle>
            </CardHeader>
            <CardContent>
                <Table className="text-center">
                    <TableHeader>
                        <TableRow>
                            <TableHead>Mouvement</TableHead>
                            <TableHead>Quantité</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody className="p-0 m-0">
                        {closingDay.savData.atelier_devis > 0 ? <TableRow>
                            <TableCell>Sachet présent atelier devis</TableCell>
                            <TableCell>{closingDay.savData.atelier_devis}</TableCell>
                        </TableRow> : null}
                        {closingDay.savData.attente_devis > 0 ? <TableRow>
                            <TableCell>Sachet en attente de devis</TableCell>
                            <TableCell>{closingDay.savData.attente_devis}</TableCell>
                        </TableRow> : null}
                        {closingDay.savData.attente_reponse > 0 ? <TableRow>
                            <TableCell>Sachet en attente de réponse</TableCell>
                            <TableCell>{closingDay.savData.attente_reponse}</TableCell>
                        </TableRow> : null}
                        {closingDay.savData.savReceptionAtelierData.length > 0 ? <TableRow>
                            <TableCell rowSpan={closingDay.savData.savReceptionAtelierData.length +1}>Sachet réceptionné atelier</TableCell>                            
                        </TableRow> : null}
                        {closingDay.savData.savReceptionAtelierData.map((item,index) => (
                            <TableRow key={`RA_${index}`}>
                                <TableCell>
                                    {item.nom} : {item.quantite_reception}
                                </TableCell>
                            </TableRow>
                        ))}
                        {closingDay.savData.savReceptionMagasinData.length > 0 ? <TableRow>
                            <TableCell rowSpan={closingDay.savData.savReceptionMagasinData.length +1}>Sachet réceptionné magasin</TableCell>                            
                        </TableRow> : null}
                        {closingDay.savData.savReceptionMagasinData.map((item,index) => (
                            <TableRow key={`RM_${index}`}>  
                                <TableCell>
                                    {item.nom} : {item.quantite_reception}
                                </TableCell>
                            </TableRow>
                        ))}
                        {closingDay.savData.savEnvoiMagasinData.length > 0 ? <TableRow>
                            <TableCell rowSpan={closingDay.savData.savEnvoiMagasinData.length +1}>Sachet envoyé magasin</TableCell>                            
                        </TableRow> : null}
                        {closingDay.savData.savEnvoiMagasinData.map((item,index) => (
                            <TableRow key={`EM_${index}`}>  
                                <TableCell>
                                    {item.nom} : {item.quantite_envoyer}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Réception</CardTitle>
            </CardHeader>
            <CardContent>
                <Table className="text-center">
                    <TableHeader>
                        <TableRow>
                            <TableHead>Utilisateur</TableHead>
                            <TableHead>Quantité</TableHead>
                            <TableHead>Temps</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody className="p-0 m-0">
                        {closingDay.receptionData.map((item,index) => (
                            <TableRow key={`R_${index}`}>
                                <TableCell>{item.prenom} {item.nom}</TableCell>
                                <TableCell>{item.colis}</TableCell>
                                <TableCell>{item.temps.hours > 0 ? `${item.temps.hours}h ${item.temps.minutes}min` : `${item.temps.minutes}min`}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
        {closingDay.closingDay.status === 'PENDING' ? <ClosingDayCloseDialog closingDayId={closingDay.closingDay.id} /> : null}
    </div>;
};

export default ClosingDayView;
