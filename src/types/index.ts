
export type Callback = {
    id: number
    patient: string
    date: string
    reason: string
    status: string
}
export type Client = {
    name: string
    phone: string
    email: string
    source: string
    treatmentStatus: string
    notes: string
}
export type NewCallback = {
    patient: string
    date: string
    reason: string
    status: string
}
