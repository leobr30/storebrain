"use client"
import { useState } from "react";
import { BalanceForm } from "./balance-form";
import { Balance, BalanceRowDetail } from "../type";
import { BalanceRowsCard } from "./balance-rows";
import { completeBalanceRow, deleteBalanceRow, downloadBalance, updateBalanceRow } from "../actions";
import { Button } from "@/components/ui/button";

export const BalanceView = ({lastBalance}: {lastBalance: {balance: Balance, headers: {id:number,label:string}[]}}) => {
    const [balance, setBalance] = useState<Balance | null>(lastBalance?.balance ?? null);
    const [headers, setHeaders] = useState<{id:number,label:string}[]>(lastBalance?.headers ?? []);

    const handleDeleteBalanceRow = async (id: number) => {
        await deleteBalanceRow(id);
        setBalance(balance => {
            if(!balance) return balance;
            const newBalance = {...balance};
            newBalance.rows = newBalance.rows.filter(row => row.id !== id);
            return newBalance;
        })
    }

    const handleUpdateBalanceRow = async (id: number, data: any) => {        
        await updateBalanceRow(id, data);
        setBalance(balance => {
            if(!balance) return balance;
            const newBalance = {...balance};
            const row = newBalance.rows.find(row => row.id === id);
            if(!row) return balance;
            row.remaining = data.stock - data.details.reduce((acc: number, d: BalanceRowDetail) => acc + d.quantity, 0);
            row.details = data.details;
            return newBalance;
        })
    }

    const handleCompleteBalanceRow = async (id: number) => {
        await completeBalanceRow(id);
        setBalance(balance => {
            if(!balance) return balance;
            const newBalance = {...balance};
            const row = newBalance.rows.find(row => row.id === id);
            if(!row) return balance;
            row.status = 'COMPLETED';
            return newBalance;
        })
    }

    return (
        <>
            <div className="flex items-center flex-wrap justify-between gap-4">
                <div className="text-2xl font-medium text-default-800 ">
                    Equilibrage
                </div>
            </div>
            <BalanceForm setBalance={setBalance} setHeaders={setHeaders} />
            {balance ? <>
                {/* <BalanceRowsCard balance={balance} headers={headers} onDeleteBalanceRow={handleDeleteBalanceRow} onUpdateBalanceRow={handleUpdateBalanceRow} onCompleteBalanceRow={handleCompleteBalanceRow} /> */}
                <Button onClick={() => downloadBalance(balance.id)}>Télécharger</Button>
            </> : null}
                 
        </>
    );
};


