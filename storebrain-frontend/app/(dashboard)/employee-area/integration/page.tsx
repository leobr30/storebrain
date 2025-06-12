import { Suspense } from "react"
import { IntegrationTable } from "./integration-table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getIntegrations, getJobs } from "../employee-area-action"

const Integration = async () => {
    const integrations = await getIntegrations()

    console.log('INTE',integrations);
    const jobs = await getJobs()
    return (
        <div className="pt-1 space-y-5">
            <Card>
                <CardHeader>
                    <CardTitle>Intégrations </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Suspense fallback={<div>Loading...</div>}>
                        <IntegrationTable jobs={jobs} integrations={integrations} />
                    </Suspense>
                </CardContent>
            </Card>
        </div>
    )
}

export default Integration 