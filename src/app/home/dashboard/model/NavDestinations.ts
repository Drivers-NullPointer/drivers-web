
export interface NavDestination {
    label: string;
    icon: string;
    route: string;
}


export const navDestinations: NavDestination[] = [
    { label: 'Despacho', icon: 'support_agent', route: 'dispatch' },
    {
        label: 'Resumen',
        icon: 'space_dashboard',
        route: 'overview'
    },
    {
        label: 'Conductores',
        icon: 'badge',
        route: 'drivers'
    },
    {
        label: 'Vehículos',
        icon: 'local_taxi',
        route: 'vehicles'
    },
    {
        label: 'Clientes',
        icon: 'people',
        route: 'clients'
    },
    {
        label: 'Solicitudes',
        icon: 'hail',
        route: 'requests'
    },
    {
        label: 'Viajes',
        icon: 'route',
        route: 'trips'
    },
    {
        label: 'Mapa',
        icon: 'location_on',
        route: 'maps'
    },
];
