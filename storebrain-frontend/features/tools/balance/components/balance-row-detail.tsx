import { BalanceRow } from "../type"

export const BalanceRowDetailCard = ({ balanceRow }: { balanceRow: BalanceRow | null }) => {
    return balanceRow ? (
        <div>
            <h1>{balanceRow.reference}</h1>
        </div>
    ) : <p>Sélectionner une ligne</p>;
}