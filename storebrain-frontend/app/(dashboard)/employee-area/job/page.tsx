import { CardTable } from "@/app/(dashboard)/employee-area/job/card-table";
import { getJobs } from "../employee-area-action";
import { Suspense } from "react";

const Job = async () => {

    const jobs = await getJobs();



    return (
        <div className="flex flex-col">
            <div className="space-y-6">
                <div className="w-full">
                    <Suspense fallback={<div>Loading...</div>}>
                        <CardTable jobs={jobs} title="Job" />
                    </Suspense>

                </div>
            </div>
        </div>

    )
}

export default Job;