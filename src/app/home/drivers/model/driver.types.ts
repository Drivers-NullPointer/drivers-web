import { DriverStatus } from "./driver.status";

export type Driver = {
    id: number;
    name: string;
    lastname: string;
    email: string;
    phone: string;
    birthdate: string;
    imageProfile?: string;
    status: string;
}


export type UpdateDriverDto = Partial<Omit<Driver, 'id' | 'imageProfile' | 'status'>> & {
    imageProfileFile?: File;
};

export type CreateDriverDto = Omit<Driver, 'id' | 'imageProfile'> & { imageProfileFile?: File };
