
export type Callback = {
    id: number
    patient: string
    date: string
    reason: string
    status: string
}
export type Client = {
    id: string
    name: string
    phone: string
    source: string
}
export type ClientWithApp = Client & {
apps: {
    name: string
    }| null
}
export type NewClient = {
    name: string
    phone: string
    source: string
}

export type NewCallback = {
    patient: string
    date: string
    reason: string
    status: string
}
