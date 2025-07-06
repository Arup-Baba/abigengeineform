import { ServiceSelection } from './types';

export const ADDON_PRICES = {
  standardWash: 20,
  interiorCleaning: 35,
  premiumWash: 40,
  waxService: 15,
  engineDetailing: 50,
  wheelBalancing: 25,
};

export const SERVICE_PRICES = {
  carWashBase: 75,
  carWashSubscriptionDiscount: 0.2, // 20% discount
  tyreReplacement: 150,
};

export const SERVICE_SELECTION_OPTIONS: ServiceSelection[] = [
  ServiceSelection.CarWashing,
  ServiceSelection.TyreReplacement,
  ServiceSelection.BatteryReplacement,
  ServiceSelection.Addons,
];

export const ADDON_CATEGORIES = [
    "Parts",
    "Lubricants",
    "Accessories",
    "Labor",
    "Other",
];

export const MOCK_CUSTOMERS = [
    {
        mobileNumber: "9876543210",
        firstName: "John",
        lastName: "Doe",
        streetAddress: "123 Main St, Anytown",
        carNumber: "TS09AB1234",
        carBrandModel: "Toyota Camry"
    },
    {
        mobileNumber: "8765432109",
        firstName: "Jane",
        lastName: "Smith",
        streetAddress: "456 Oak Ave, Otherville",
        carNumber: "MH12CD5678",
        carBrandModel: "Honda Civic"
    }
];