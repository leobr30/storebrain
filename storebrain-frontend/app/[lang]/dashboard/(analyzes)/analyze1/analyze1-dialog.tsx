import { CardTableWithButtons } from "@/components/tables/card-table-with-action"
import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TabsContent } from "@radix-ui/react-tabs"
import { Dispatch, useState } from "react"
import { analyze1Columns, analyze1ProductColumns, getAnalyze1Columns, getAnalyze1ProductColumns } from "./analyze1-columns"
import { Analyze1DialogRanges } from "./analyze1-dialog-ranges"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Icon } from "@iconify/react";
import { VirtualizedTable } from "@/components/tables/virtualized-table"
import { Analyze1DialogTableProduct } from "./analyze1-dialog-table-product"
import { GroupingResult } from "./analyze1-types"
import { Analyze1DialogProduct } from "./analyze1-dialog-product"
type Props = {
    data: GroupingResult,
    index: number,
    setDialogsData: Dispatch<any>
}

export const Analyze1Dialog = ({
    data,
    index,
    setDialogsData
}: Props) => {

    const closeDialog = () => {
        setDialogsData((prevState: GroupingResult[]) => prevState.filter((_w: any, itemIndex: any) => itemIndex !== index))
    }

    const openNewDialog = (row: any) => {
        setDialogsData((prevState: any) => [...prevState, ({
            ...row,
            label: data.label + ' - ' + row.label,            
        })])
    }

    const analyze1Columns = getAnalyze1Columns({ openNewDialog })    
    //Product Dialog
    const [productDialogData, setProductDialogData] = useState<null | any>(null);
    
    return (
        <>
        {productDialogData && <Analyze1DialogProduct dialogData={productDialogData} closeDialog={() => setProductDialogData(null)}/>}
        <Dialog open onOpenChange={closeDialog}>
            <DialogContent size="full" className={"flex flex-col"}>
                <DialogHeader>
                    <DialogTitle className="text-base font-medium text-default-700 ">
                        {data.label}
                    </DialogTitle>
                </DialogHeader>

                {data.subGroupings ?
                    <Analyze1DialogTableProduct
                        columns={analyze1Columns}
                        data={data.subGroupings}
                        defaultSorting={{ id: 'totalSalesRevenue', desc: true }}                        
                    />
                    :
                    data.ranges ?
                        <>
                            {/* <Alert color="secondary">
                                <Icon
                                    icon="heroicons:information-circle"
                                    className="h-6 w-6 self-start relative top-1  "
                                />
                                <div className=" flex-1">
                                    <AlertTitle>Aide</AlertTitle>
                                    <AlertDescription>
                                       Pour voir le details des produits  il faut cliquer :
                                       - Pour une game sur le titre de la gamme
                                       - Pour tous voir sur Total
                                    </AlertDescription>
                                </div>
                            </Alert> */}
                            <Analyze1DialogRanges
                                title={data.label}
                                data={data.ranges as []}
                                salePriceMedian={0}
                                setDialogsData={setDialogsData}
                                products={data.products as []}
                            />
                        </>
                        : 
                        <Analyze1DialogTableProduct
                        data={data.products as []}
                        columns={getAnalyze1ProductColumns(setProductDialogData)}
                        defaultSorting={{ id: 'totalSalesRevenue', desc: true }}/>
                
                        // <CardTableWithButtons
                        //     columns={productColumns}
                        //     data={data.products}
                        //     defaultSorting={{ id: 'totalSalePrice', desc: true }}
                        //     dense
                        //     bordered
                        // />
                }
                {/* <Tabs defaultValue={data.subRow ? "subRows" : "ranges"} className="md:w-[400px]">
                        {data.subRows ?
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="subRows">Details</TabsTrigger>
                                <TabsTrigger value="password">Gamme</TabsTrigger>
                            </TabsList> : ''}
                        {data.subRows ? <TabsContent value="subRows">
                            <CardTableWithButtons
                                columns={columns}
                                data={data.subRows}
                                dense
                                bordered
                            />
                        </TabsContent> : ''}
                        <TabsContent value="ranges">
                                <Analyze1DialogRanges
                                 data={data.ranges}
                                 salePriceMedian={data.salePriceMedian}/>
                        </TabsContent>
                    </Tabs> */}



            </DialogContent>
        </Dialog>
        </>
        
    )
}