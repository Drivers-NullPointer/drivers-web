
export enum RequestStates {
    PENDING = "PENDING",
    ACCEPTED = "ACCEPTED",
    CANCELLED = "CANCELLED",
    EXPIRED = "EXPIRED",
    REJECTED = "REJECTED"
}

export enum RequestStatesLabel {
    PENDING = 'Pendiente',
    ACCEPTED = 'Aceptada',
    CANCELLED = 'Cancelado',
    EXPIRED = 'Expirada',
    REJECTED = 'Rechazado'
}


export const requestStatesToLabel = (state: RequestStates): string => {
    switch (state) {
        case RequestStates.PENDING:
            return RequestStatesLabel.PENDING;
        case RequestStates.ACCEPTED:
            return RequestStatesLabel.ACCEPTED;
        case RequestStates.CANCELLED:
            return RequestStatesLabel.CANCELLED;
        case RequestStates.EXPIRED:
            return RequestStatesLabel.EXPIRED;
        case RequestStates.REJECTED:
            return RequestStatesLabel.REJECTED;
    }
}
