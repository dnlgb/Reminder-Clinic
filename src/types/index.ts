export type CallbackStatus =
    | "pending"
    | "completed"
    | "cancelled"

export type CallResult =
    | "accepted"
    | "rescheduled"
    | "declined"

export type Callback = {
    id: string
    client_id: string
    scheduled_at: string
    status: CallbackStatus
    notes: string | null
    call_result: CallResult | null
    next_reminder_at: string | null
    created_at: string
}
export type CallbackWithClient = Callback & {
clientes: {
    id: string
    name: string
    phone: string
} | null
}

export type Client = {
    id: string
    name: string
    phone: string
    source: string
    active: boolean
}

export type App = {
    id: string
    name: string
}

export type ClientWithApp = Client & {
    apps: App | null
}

export type NewClient = {
    name: string
    phone: string
    source: string
}

export type NewCallback = {
    client_id: string
    scheduled_at: string
    notes?: string
}