import rawVehicles from '../data/vehicles.json';
import rawDealership from '../data/dealership.json';
import { catalogSchema, dealershipSchema } from './model';
export const vehicles = catalogSchema.parse(rawVehicles);
export const dealership = dealershipSchema.parse(rawDealership);
export const visibleVehicles = vehicles.filter(v => !['removed','unavailable'].includes(v.status));
export const featuredVehicles = (dealership.featuredIds.length ? dealership.featuredIds.map(id => visibleVehicles.find(v => v.id === id)).filter(v => v !== undefined) : visibleVehicles).slice(0, 3);
