import type { Callback } from "../types"
import type {Client} from "../types"

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
