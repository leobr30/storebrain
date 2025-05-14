export type EmployeeAreaAddStepOneData = {
    company:{value:number,label:string} | undefined
    lastName: string;
    firstName: string;
    maidenName: string;
    dateOfBirth: Date | undefined;
    placeOfBirth: string;
    nationality: string;
    socialSecurityNumber: string;
    email: string;
    cellPhone: string;
    familySituation: string,
    numberOfChildren: number | string,
}

export type EmployeeAreaAddStepTwoData = {
    address: string;
    zipCode: string;
    city: string;    
}

export type EmployeeAreaAddStepFourData = {
    entryDate: Date | undefined,
    badgeNumber: string
    job:{value:number,label:string, contracts: JobContract[]} | undefined
    contract:{value:number,label:string} | undefined
    endDate: Date | undefined
    zone:string
    file: File | undefined
}

export type EmployeeAreaAddStepThreeData = {
    cni: File | undefined
    carteVitale: File | undefined
    carteMutuelle: File | undefined
    rib: File | undefined
    justificatifDomicile: File | undefined
    casierJudiciaire: File | undefined
    titreSejour: File | undefined
}



export type Job = {
    id: number;
    name: string;
    jobContracts:
}

export  type JobContract = {
    id: number;
    type: string;
    workingHoursPerWeek: number;    
}