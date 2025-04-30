import { CardTable } from "@/app/[lang]/dashboard/employee-area/job/card-table";
import { getJobs } from "../employee-area-action";
import { DataTableColumnHeader } from "@/components/tables/data-table-column-header";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Icon } from "@iconify/react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
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