export interface Vehicle {
    id: number;
    number: number;
    isRotulated: boolean;
    year: number;
    makeId: number;
    make: string;
    modelId: number;
    model: string;
    colorId: number;
    color: string;
    colorHex?: string;
    plates: string;
    status?: string;
    assignedDriverId?: number | null;
    createdAt?: string;
}

export type SaveVehicle = Pick<Vehicle, 'number' | 'plates' | 'isRotulated' | 'year' | 'modelId' | 'colorId'>;
