// types.ts
export interface Patient {
    id: string
    name: string
    age: number
    gender: string
    mrn: string
    dob: string
    phone: string
    address: string
    emergencyContact: string
}

export interface Condition {
    name: string
    onset: string
}

export interface Medication {
    name: string
    dose: string
}

export interface Allergy {
    name: string
    reaction: string
}

export interface LabResult {
    test: string
    value: string
    status: "normal" | "high" | "low"
}

export interface Vital {
    time: string
    systolic: number
    heartRate: number
}
