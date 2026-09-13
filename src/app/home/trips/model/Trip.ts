export interface Trip {
    id: string;
    startAt: string | null;
    endAt: string | null;
    state: string;
    driverReceivedAt?: string | null;
    clientId: number;
    driverId: number;
    driver?: {
        id: number;
        name: string;
        lastname: string;
    } | null;
    route?: {
        encodedPolyline: string;
        polylinePrecision: number;
    } | null;
}
