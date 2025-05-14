import { EmployeeAreaAddStepFourData, EmployeeAreaAddStepOneData, EmployeeAreaAddStepThreeData, EmployeeAreaAddStepTwoData } from '@/types/employee-area-types'
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface EmployeeAreaAddFormState {
    createdUserId?: number;
    stepOne: EmployeeAreaAddStepOneData | undefined;
    stepTwo: EmployeeAreaAddStepTwoData | undefined;
    stepThree: EmployeeAreaAddStepThreeData | undefined;
    stepFour: EmployeeAreaAddStepFourData | undefined;
    resetState: () => void;
    setStepOneData: (stepOneData: EmployeeAreaAddStepOneData) => void;
    setStepTwoData: (stepTwoData: EmployeeAreaAddStepTwoData) => void;
    setStepThreeData: (stepThreeData: EmployeeAreaAddStepThreeData) => void;
    setStepFourData: (stepFourData: EmployeeAreaAddStepFourData) => void;
    setCreatedUserId: (id: number) => void;
}

const defaultState: { stepOne: EmployeeAreaAddStepOneData, stepTwo: EmployeeAreaAddStepTwoData, stepThree: EmployeeAreaAddStepThreeData, stepFour: EmployeeAreaAddStepFourData } = {
    stepOne: {
        company: undefined,
        lastName: '',
        firstName: '',
        maidenName: '',
        dateOfBirth: undefined, // or null
        placeOfBirth: '',
        nationality: '',
        socialSecurityNumber: '',
        email: '',
        cellPhone: '',
        familySituation: '',
        numberOfChildren: ''
    },
    stepTwo: {
        address: '',
        zipCode: '',
        city: ''
    },
    stepThree: {
        cni: undefined,
        carteVitale: undefined,
        carteMutuelle: undefined,
        rib: undefined,
        justificatifDomicile: undefined,
        casierJudiciaire: undefined,
        titreSejour: undefined
    },
    stepFour: {
        entryDate: undefined,
        badgeNumber: '',
        job: undefined,
        contract: undefined,
        endDate: undefined,
        zone: '',
        file: undefined
    }
}
export const useEmployeeAreaAddFormStore = create<EmployeeAreaAddFormState>()(persist(
    (set) => ({
        ...defaultState,
        setStepOneData: (stepOneData) => set((state) => ({ stepOne: { ...state.stepOne, ...stepOneData } })),
        setStepTwoData: (stepTwoData) => set((state) => ({ stepTwo: { ...state.stepTwo, ...stepTwoData } })),
        setStepThreeData: (stepThreeData) => set((state) => ({ stepThree: { ...state.stepThree, ...stepThreeData } })),
        setStepFourData: (stepFourData) => set((state) => ({ stepFour: { ...state.stepFour, ...stepFourData } })),
        resetState: () => set(() => defaultState),
        setCreatedUserId: (id: number) => set({ createdUserId: id }),
    }),
    {
        name: "employee-area-add-form",
    }
));



const tempState: { stepOne: EmployeeAreaAddStepOneData, stepTwo: EmployeeAreaAddStepTwoData } = {
    stepOne: {
        company: undefined,
        lastName: 'Hudson',
        firstName: 'Austin',
        maidenName: '',
        dateOfBirth: new Date(1997, 0, 27),
        placeOfBirth: 'Nîmes',
        nationality: 'Francaise',
        email: 'leo.rigal@diamantor.Fr',
        cellPhone: '0676544465',
        familySituation: 'SINGLE',
        numberOfChildren: '',
        socialSecurityNumber: '2580103857455 25'
    },
    stepTwo: {
        address: '69, rue de Penthièvre',
        city: 'QUIMPER',
        zipCode: '29000',
    }
}