"use client"
import { useEffect, useState } from "react";
import ToolForm from "./tool-form";
import { deletePriceUpdateRow, deletePriceUpdateRowArticle, getOrderDownload, sendFile, updatePriceUpdateRowArticle, updatePriceUpdateRowStatus } from "../actions";
import { UpdatePriceCard } from "./update-price-card";

const ToolView = ({lastPriceUpdate}: {lastPriceUpdate: PriceUpdate}) => {

    const [data,setData] = useState<PriceUpdate>();
    const [formOpen, setFormOpen] = useState(true);

    const updateData = async (rowId: number, articleId: number, value: number) => {
        console.log(articleId, value)
        await updatePriceUpdateRowArticle(articleId, {newSalePrice: value});
        setData(data => {
            if(!data) return data;            
            const newData = {...data};
            const row = newData.rows.find(row => row.id === rowId);
            if(!row) return data;
            const article = row.articles.find(article => article.id === articleId);
            if(!article) return data;
            article.newSalePrice = value;            
            return newData;
        })
    }

    const handleDeletePriceUpdateRowArticle =  async(rowId: number, articleId: number) => {
        await deletePriceUpdateRowArticle(articleId);
        setData(data => {
            if(!data) return data;
            const newData = {...data};
            const row = newData.rows.find(row => row.id === rowId);
            if(!row) return data;
            row.articles = row.articles.filter(article => article.id !== articleId);
            return newData;
        })
    }
    const handleDeletePriceUpdateRow = async (rowId: number) => {
        await deletePriceUpdateRow(rowId);
        setData(data => {
            if(!data) return data;
            const newData = {...data};
            newData.rows = newData.rows.filter(row => row.id !== rowId);
            return newData;
        })
    }

    const handleUpdatePriceUpdateRowStatus = async (rowId: number) => {
        await updatePriceUpdateRowStatus(rowId);
        setData(data => {
            if(!data) return data;
            const newData = {...data};
            const row = newData.rows.find(row => row.id === rowId);
            if(!row) return data;
            row.status = 'COMPLETED';
            return newData;
        })
    }
    useEffect(() => {        
        if(lastPriceUpdate) {            
            setData(lastPriceUpdate);
            setFormOpen(false);
        }
    }, [lastPriceUpdate]);

    const handleSubmit = async (formData: FormData) => {
        const response = await sendFile(formData);
        setData(response);
        setFormOpen(false);
    }

    const handleOrderDownload = async () => {
        const response = await getOrderDownload(data!.id);
        console.log(response);
    }

    return (<div className="space-y-5">
        <div className="flex items-center flex-wrap justify-between gap-4">
            <div className="text-2xl font-medium text-default-800 ">
                Changement de prix
            </div>
        </div>
        <ToolForm onSubmit={handleSubmit} formOpen={formOpen} setFormOpen={setFormOpen} />    
        {data ? <UpdatePriceCard priceUpdate={data} updateData={updateData} handleDeletePriceUpdateRowArticle={handleDeletePriceUpdateRowArticle} handleDeletePriceUpdateRow={handleDeletePriceUpdateRow} handleUpdatePriceUpdateRowStatus={handleUpdatePriceUpdateRowStatus} handleOrderDownload={handleOrderDownload} /> : null}
    </div>
    );
};

export default ToolView;
