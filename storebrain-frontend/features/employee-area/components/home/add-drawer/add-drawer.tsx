import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Step, StepLabel, Stepper } from "@/components/ui/steps";
import { Plus, UserPlus } from "lucide-react"
import { useState } from "react";
import AddDrawerFormStepOne from "./add-drawer-form-step-one";
import { Company } from "@/types/company-types";
import AddDrawerFormStepTwo from "./add-drawer-form-step-two";
import { AddDrawerFormStepFour } from "./add-drawer-form-step-four";
import AddDrawerFormStepThree from "./add-drawer-form-step-three";
import { Job } from "@/types/employee-area-types";
import { useEmployeeAreaAddFormStore } from "@/store/emloyeeAreaDrawerAddStore";
import { addEmployee } from "@/features/employee-area/actions";

type Props = {
    companies: Company[]
    jobs: Job[]
}

export default function AddDrawer({ companies, jobs }: Props) {
    const [open, setOpen] = useState<boolean>(false);
    const [activeStep, setActiveStep] = useState<number>(0);
    const drawerState = useEmployeeAreaAddFormStore();
    const steps = ["Informations personnelles", "Adresse", "Documents", "Emploi & Contrat"];

    const handleNext = () => {
        setActiveStep((prevActiveStep: number) => prevActiveStep + 1);
    };

    const handleBack = () => {
        setActiveStep((prevActiveStep: number) => prevActiveStep - 1);
    };

    const handleFormSubmit = async (formData: FormData) => {
        const response = await addEmployee(formData);
        setActiveStep(0);
        drawerState.resetState();
        setOpen(false);
        return response; // <-- ✅ ici
    };



    return (
        <Sheet open={open} onOpenChange={setOpen} >
            <SheetTrigger asChild>
                <Button>
                    <Plus className="w-6 h-6 mr-2  " />
                    Nouvelle déclaration
                </Button>
            </SheetTrigger>
            <SheetContent side={'bottom'} disableOutsideClick className="max-h-[90vh] overflow-y-auto">
                <div className="flex ">
                    <div className="rounded-md border p-1 drop-shadow-md	mr-2">
                        <UserPlus />
                    </div>

                    <SheetTitle> Déclaration d'un nouveau salarié</SheetTitle>
                </div>
                <Stepper current={activeStep}
                    className="m-5"
                    direction="horizontal"
                // direction={isTablet ? "vertical" : "horizontal"}
                >
                    {steps.map((label, index) => {
                        return (
                            <Step key={index} className="items-center" >
                                <StepLabel>{label}</StepLabel>
                            </Step>
                        );
                    })}
                </Stepper>
                {activeStep === 0 && <AddDrawerFormStepOne companies={companies} handleNext={handleNext} />}
                {activeStep === 1 && <AddDrawerFormStepTwo handleNext={handleNext} handleBack={handleBack} />}
                {activeStep === 2 && <AddDrawerFormStepThree handleNext={handleNext} handleBack={handleBack} />}
                {activeStep === 3 && <AddDrawerFormStepFour handleBack={handleBack} jobs={jobs} handleFormSubmit={handleFormSubmit} />}
            </SheetContent>

        </Sheet>
    )
}