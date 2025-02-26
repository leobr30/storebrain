"use client"
import { Button } from "@/components/ui/button";
import { createBalance } from "../actions";
import { Balance, BalanceRow } from "../type";

export const BalanceForm = ({setBalance, setHeaders}: {setBalance: (balance: Balance) => void, setHeaders: (headers: {id:number,label:string}[]) => void}) => {
  return <div><Button onClick={async () => {
    const {balance, headers} = await createBalance();
    setBalance(balance);
    setHeaders(headers);
  }}>Créer un équilibrage</Button></div>;
};
