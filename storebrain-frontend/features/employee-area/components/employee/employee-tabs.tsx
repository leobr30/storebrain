// features/employee-area/components/employee/employee-tabs.tsx
"use client";
import { Tabs, TabsList } from "@/components/ui/tabs";
import { TabsContent, TabsTrigger } from "@radix-ui/react-tabs";
import { EmployeeHistory } from "./employee-history";
import { EmployeeOnboardings } from "./emloyee-onboarding";
import { Badge } from "@/components/ui/badge";
import { EmployeeAbsence } from "./employee-absense";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import EmployeeFormation from "./employee-formation";
import { Employee } from "../../types";
import EmployeeDocuments from "./documents";
import EmployeeOmar from "./omar";

type EmployeeTabsProps = {
  employee: Employee;
  // jobOnboardingId: number | null; // Accepter jobOnboardingId en tant que prop
};

export const EmployeeTabs = ({ employee }: EmployeeTabsProps) => {
  const [tab, setTab] = useState("history");
  const searchParams = useSearchParams();
  const searchTab = searchParams.get("tab");

  console.log(employee);
  useEffect(() => {
    if (searchTab) {
      setTab(searchTab);
    }
    console.log(employee);
  }, [searchParams]);
  return (
    <Tabs value={tab} onValueChange={setTab} defaultValue="history">
      <TabsList className="bg-card overflow-x-auto md:overflow-hidden  w-full px-5 pt-6 pb-2.5 h-fit border-b border-default-200  rounded-none justify-start gap-12 rounded-t-md">
        <TabsTrigger value="history" className="apitalize px-0  data-[state=active]:shadow-none  data-[state=active]:bg-transparent data-[state=active]:text-primary transition duration-150 before:transition-all before:duration-150 relative before:absolute
           before:left-1/2 before:-bottom-[11px] before:h-[2px]
             before:-translate-x-1/2 before:w-0 data-[state=active]:before:bg-primary data-[state=active]:before:w-full">Historique</TabsTrigger>

        <TabsTrigger disabled={employee.status === 'PENDING' || employee.status === 'PENDING_ONBOARDING'} value="onboarding" className="apitalize px-0  data-[state=active]:shadow-none  data-[state=active]:bg-transparent data-[state=active]:text-primary transition duration-150 before:transition-all before:duration-150 relative before:absolute
           before:left-1/2 before:-bottom-[11px] before:h-[2px]
             before:-translate-x-1/2 before:w-0 data-[state=active]:before:bg-primary data-[state=active]:before:w-full">Integration <Badge color="destructive" variant="soft">{employee.jobOnboardings.length > 0 ? Math.round(employee.jobOnboardings.filter(jobOnboarding => jobOnboarding.status === 'COMPLETED').length * 100 / employee.jobOnboardings.length) : 0}%</Badge></TabsTrigger>
        <TabsTrigger value="training" className="apitalize px-0  data-[state=active]:shadow-none  data-[state=active]:bg-transparent data-[state=active]:text-primary transition duration-150 before:transition-all before:duration-150 relative before:absolute
           before:left-1/2 before:-bottom-[11px] before:h-[2px]
             before:-translate-x-1/2 before:w-0 data-[state=active]:before:bg-primary data-[state=active]:before:w-full">Formations</TabsTrigger>
        <TabsTrigger value="absence" className="apitalize px-0  data-[state=active]:shadow-none  data-[state=active]:bg-transparent data-[state=active]:text-primary transition duration-150 before:transition-all before:duration-150 relative before:absolute
           before:left-1/2 before:-bottom-[11px] before:h-[2px]
             before:-translate-x-1/2 before:w-0 data-[state=active]:before:bg-primary data-[state=active]:before:w-full">Absences / Vacances</TabsTrigger>
        <TabsTrigger value="document" className="apitalize px-0  data-[state=active]:shadow-none  data-[state=active]:bg-transparent data-[state=active]:text-primary transition duration-150 before:transition-all before:duration-150 relative before:absolute
           before:left-1/2 before:-bottom-[11px] before:h-[2px]
             before:-translate-x-1/2 before:w-0 data-[state=active]:before:bg-primary data-[state=active]:before:w-full">Documents</TabsTrigger>
        <TabsTrigger value="omar" className="apitalize px-0  data-[state=active]:shadow-none  data-[state=active]:bg-transparent data-[state=active]:text-primary transition duration-150 before:transition-all before:duration-150 relative before:absolute
           before:left-1/2 before:-bottom-[11px] before:h-[2px]
             before:-translate-x-1/2 before:w-0 data-[state=active]:before:bg-primary data-[state=active]:before:w-full">Omar</TabsTrigger>
      </TabsList>

      <TabsContent value="history" className="mt-2.5">
        <EmployeeHistory histories={employee.histories} />
      </TabsContent>
      <TabsContent value="onboarding" className="mt-2.5">
        <EmployeeOnboardings steps={employee.jobOnboardings} id={employee.id} />
      </TabsContent>
      <TabsContent value="absence" className="mt-2.5">
        <EmployeeAbsence employeeId={employee.id} absences={employee.absences} vacations={employee.vacations} />
      </TabsContent>
      <TabsContent value="training" className="mt-2.5">
        <EmployeeFormation employeeId={employee.id} trainings={employee.trainings} jobOnboardings={employee.jobOnboardings} />
      </TabsContent>
      <TabsContent value="document" className="mt-2.5">
        <EmployeeDocuments />
      </TabsContent>
      <TabsContent value="omar" className="mt-2.5">
        <EmployeeOmar />
      </TabsContent>

    </Tabs>
  );
};
