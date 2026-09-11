export interface RequestTrip {
    id: number;
    startAddress: Address;
    endAddress: Address;
    clientId: number;
    distanceMeters: number;
    initialPrice: number;
    state: string;
    createdAt: string;
    expiresAt?: string | null;
}

export interface Address {
    streetNumber?: string;
    street?: string;
    city?: string;
    colony?: string;
    state?: string;
    postalCode?: number;
    location: Location;
}

export interface Location {
    latitude?: number;
    longitude?: number;
}
