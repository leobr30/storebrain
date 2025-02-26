"use client"
import { CardTableWithButtons } from '@/components/tables/card-table-with-action'
import { Analyze1Form } from './analyze1-form'
import Card from "@/components/ui/card-snippet"
import { useState } from 'react'
import { Analyze1Result } from './analyze1-result'
import { Analyze1Dialog } from './analyze1-dialog'
import { GroupingResult } from './analyze1-types'
const Analyze1 = () => {
    const [analyzeData, setAnalyzeData] = useState<null | GroupingResult[]>(null)
    const [dialogsData, setDialogsData] = useState<GroupingResult[]>([]);
    return (
        <>
            <div className='pt-5' />
            <div className="space-y-5">
                <div className="grid grid-cols-1 gap-6">
                    <Card title="Analyze 1" code={undefined}>
                        <Analyze1Form analyzeData={analyzeData} setAnalyzeData={setAnalyzeData} />
                    </Card>
                    {/* {analyzeData ? <Analyze1Result 
                    analyzeData={analyzeData.quarterlyTable}
                    setDialogsData={setDialogsData}
                      /> : ''} */}

                    {analyzeData ? <Analyze1Result
                        analyzeData={analyzeData}
                        setDialogsData={setDialogsData}
                    /> : ''}
                </div>

            </div>
            {dialogsData.sort((a, b) => b.index - a.index).map((dialogData, index) => (
                <Analyze1Dialog
                    key={index}
                    index={index}
                    setDialogsData={setDialogsData}
                    data={dialogData} />
            ))}
        </>

    )
}

export default Analyze1