// features/employee-area/components/employee/employee-view.tsx
import { Employee } from "../../types";
import { AbsenceDialog } from "../absence-dialog";
import { TrainingDrawer } from "../training-drawer/training-drawer";
import { EmployeeActions } from "./employee-actions";
import { EmployeeInformation } from "./employee-information";
import { EmployeeProfile } from "./employee-profile";
import { EmployeeTabs } from "./employee-tabs";
import { getJobOnboardingIdForEmployee } from "../../actions"; // Importez la fonction pour récupérer jobOnboardingId

type EmployeeViewProps = {
    employee: Employee;
};

export const EmployeeView = async ({ employee }: EmployeeViewProps) => {
    // Récupérer jobOnboardingId depuis la base de données
    //const jobOnboardingId = await getJobOnboardingIdForEmployee(employee.id);

    return (
        <>
            <TrainingDrawer userId={employee.id} />
            <AbsenceDialog />
            <div className="grid grid-cols-12 gap-5">
                <div className="col-span-12 lg:col-span-4 space-y-5">
                    <EmployeeProfile name={employee.name} image={undefined} />
                    <EmployeeInformation employee={employee} />
                </div>
                <div className="col-span-12 lg:col-span-8">
                    <EmployeeActions id={employee.id} status={employee.status} />
                    {/* Passer jobOnboardingId à EmployeeTabs */}
                    <EmployeeTabs employee={employee} /* jobOnboardingId={jobOnboardingId} */ /> {/* ✅ On supprime jobOnboardingId */}
                </div>
            </div>
        </>
    );
};
