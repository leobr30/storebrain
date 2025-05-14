// features/employee-area/components/employee/employee-view.tsx
import { Employee } from "../../types";
import { AbsenceDialog } from "../absence-dialog";
import { TrainingDrawer } from "../training-drawer/training-drawer";
import { EmployeeActions } from "./employee-actions";
import { EmployeeInformation } from "./employee-information";
import { EmployeeProfile } from "./employee-profile";
import { EmployeeTabs } from "./employee-tabs";
import { DocumentType } from "../../types";

type EmployeeViewProps = {
    employee: Employee;
};

export const EmployeeView = async ({ employee }: EmployeeViewProps) => {
    // Récupérer jobOnboardingId depuis la base de données
    //const jobOnboardingId = await getJobOnboardingIdForEmployee(employee.id);

    const requiredDocuments: DocumentType[] = [
        DocumentType.CNI,
        DocumentType.VITAL_CARD,
        DocumentType.MUTUAL_CARD,
        DocumentType.RIB,
        DocumentType.ADDRESS_PROOF,
        DocumentType.CRIMINAL_RECORD,
    ];

    const hasAllDocuments = requiredDocuments.every((type) =>
        employee.Document?.some((doc) => doc.type === type)
    );

    const missingDocuments = requiredDocuments.filter((type) =>
        !employee.Document?.some((doc) => doc.type === type)
    );


    console.log("📄 Documents de l'employé :", employee.Document);



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
                    <EmployeeActions
                        id={employee.id}
                        status={employee.status}
                        hasAllDocuments={hasAllDocuments}
                        missingDocuments={missingDocuments}
                    />

                    {/* Passer jobOnboardingId à EmployeeTabs */}
                    <EmployeeTabs employee={employee} /* jobOnboardingId={jobOnboardingId} */ /> {/* ✅ On supprime jobOnboardingId */}
                </div>
            </div>
        </>
    );
};
