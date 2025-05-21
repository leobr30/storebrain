"use client"
import { CardTableWithButtons } from '@/components/tables/card-table-with-action'
import { Analyze1Form } from './analyze1-form'
import Card from "@/components/ui/card-snippet"
import { useEffect, useState } from 'react'
import { Analyze1Result } from './analyze1-result'
import { Analyze1Dialog } from './analyze1-dialog'
import { GroupingResult } from './analyze1-types'
import { useSession } from "next-auth/react";
import { useRouter } from 'next/navigation';


const Analyze1 = () => {

    const { data: session, status } = useSession();
    const router = useRouter();
    const [analyzeData, setAnalyzeData] = useState<null | GroupingResult[]>(null)
    const [dialogsData, setDialogsData] = useState<GroupingResult[]>([]);


    useEffect(() => {
        if (status !== "loading") {
            const hasPermission = session?.user?.permissions?.some(
                (p) => p.action === "manage" && p.subject === "all"
            );

            if (!hasPermission) {
                router.replace("/error-page/403");
            }
        }
    }, [session, status, router]);

    if (status === "loading") return null;




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