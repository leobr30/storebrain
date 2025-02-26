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

export type EmployeeAreaAddStepThreeData = {
    entryDate: Date | undefined,
    badgeNumber: string
    job:{value:number,label:string} | undefined
    contract:{value:number,label:string} | undefined
    endDate: Date | undefined
    zone:string
    file: File | undefined
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