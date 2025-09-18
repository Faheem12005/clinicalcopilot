// api.ts
import { Patient, Condition, Medication, Allergy, LabResult, Vital } from "./types"

const API_BASE = "http://localhost:3001/api" // change to your backend URL

export async function fetchPatient(): Promise<Patient> {
    const res = await fetch(`${API_BASE}/patient`)
    return res.json()
}

export async function fetchConditions(): Promise<Condition[]> {
    const res = await fetch(`${API_BASE}/conditions`)
    return res.json()
}

export async function fetchMedications(): Promise<Medication[]> {
    const res = await fetch(`${API_BASE}/medications`)
    return res.json()
}

export async function fetchAllergies(): Promise<Allergy[]> {
    const res = await fetch(`${API_BASE}/allergies`)
    return res.json()
}

export async function fetchLabResults(): Promise<LabResult[]> {
    const res = await fetch(`${API_BASE}/labs`)
    return res.json()
}

export async function fetchVitals(): Promise<Vital[]> {
    const res = await fetch(`${API_BASE}/vitals`)
    return res.json()
}
