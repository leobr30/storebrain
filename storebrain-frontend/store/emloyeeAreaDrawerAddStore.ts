import { EmployeeAreaAddStepOneData, EmployeeAreaAddStepThreeData, EmployeeAreaAddStepTwoData } from '@/types/employee-area-types'
import { create } from 'zustand'

interface EmployeeAreaAddFormState {
    stepOne: EmployeeAreaAddStepOneData | undefined,
    stepTwo: EmployeeAreaAddStepTwoData | undefined,
    stepThree: EmployeeAreaAddStepThreeData | undefined
    resetState: () => void
    setStepOneData: (stepOneData: EmployeeAreaAddStepOneData) => void
    setStepTwoData: (stepTwoData: EmployeeAreaAddStepTwoData) => void
    setStepThreeData: (stepTwoData: EmployeeAreaAddStepThreeData) => void
}

const defaultState: { stepOne: EmployeeAreaAddStepOneData, stepTwo: EmployeeAreaAddStepTwoData, stepThree: EmployeeAreaAddStepThreeData } = {
    stepOne: {
        company: undefined,
        lastName: '',
        firstName: '',
        maidenName: '',
        dateOfBirth: undefined,
        placeOfBirth: '',
        nationality: '',
        socialSecurityNumber: '',
        email: '',
        cellPhone: '',
        familySituation: '',
        numberOfChildren: ''
    },
    stepTwo:{
        address:'',
        zipCode: '',
        city:''
    },    
    stepThree: {
        entryDate: undefined,
        badgeNumber: '',
        job: undefined,
        contract: undefined,
        endDate: undefined,
        zone: '',
        file: undefined
    }
}

export const useEmployeeAreaAddFormStore = create<EmployeeAreaAddFormState>((set) => ({
    stepOne: defaultState.stepOne,
    stepTwo: defaultState.stepTwo,
    stepThree: defaultState.stepThree,
    setStepOneData: (stepOneData: EmployeeAreaAddStepOneData) => set((state) => ({ stepOne: { ...state.stepOne, ...stepOneData } })),
    setStepTwoData: (stepTwoData: EmployeeAreaAddStepTwoData) => set((state) => ({ stepTwo: { ...state.stepTwo, ...stepTwoData } })),
    setStepThreeData: (stepThreeData: EmployeeAreaAddStepThreeData) => set((state) => ({ stepThree: { ...state.stepThree, ...stepThreeData } })),
    resetState: () => set(() => (defaultState))
}))



const tempState: { stepOne: EmployeeAreaAddStepOneData, stepTwo:EmployeeAreaAddStepTwoData } = {
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