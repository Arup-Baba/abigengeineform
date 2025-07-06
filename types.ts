export interface User {
  username: string;
  password?: string;
  role: 'admin' | 'user';
}

export enum ServiceSelection {
  CarWashing = "Car Washing",
  TyreReplacement = "Tyre Replacement",
  BatteryReplacement = "Battery Replacement",
  Addons = "Add-ons",
}

export enum ServiceStatus {
  Draft = "Draft",
  Submitted = "Submitted",
}

export interface Customer {
  mobileNumber: string;
  firstName: string;
  lastName: string;
  streetAddress: string;
  carNumber: string;
  carBrandModel: string;
}

export interface TyreDetail {
  tyreId: string;
  relatedServiceId: string;
  dotCode: string;
  dotSerialNumberImage: string;
  tyreSize: string;
  brand: string;
  model: string;
}

export interface BatteryDetail {
  batteryId: string;
  relatedServiceId: string;
  serialNumber: string;
  brand: string;
  exchangeValue: number;
  newBatteryAmount: number;
}

export interface CustomService {
  customServiceId: string;
  relatedServiceId: string;
  serviceDescription: string;
  amount: number;
}

export interface CategorizedAddon {
  id: string;
  relatedServiceId: string;
  category: string;
  productName: string;
  quantity: number;
  amount: number;
}

export interface Service {
  submissionId: string;
  timestamp: string;
  customerFirstName: string;
  customerLastName: string;
  streetAddress: string;
  mobileNumber: string;
  carNumber: string;
  carBrandModel: string;
  serviceSelection: ServiceSelection[];
  
  isSubscription: boolean;
  carwashQuantity: number;
  carWashPrice: number;
  carwashTotalAmount: number;
  beforeWashingPhoto: string;
  beforeVideoInventory: string;
  beforeVideoTopBody: string;
  beforeVideoUnderchassis: string;
  afterWashingPhoto: string;
  afterVideoInterior: string;
  afterVideoExterior: string;
  afterVideoUnderchassis: string;

  tyreReplacementQuantity: number;
  tyreReplacementPrice: number;
  tyreReplacementTotalAmount: number;
  tyreDetails: TyreDetail[];

  batteryReplacementQuantity: number;
  batteryReplacementTotalAmount: number;
  batteryDetails: BatteryDetail[];

  standardWashQty: number;
  interiorCleaningQty: number;
  premiumWashQty: number;
  waxServiceQty: number;
  engineDetailingQty: number;
  wheelBalancingQty: number;
  addonsTotal: number;

  categorizedAddons: CategorizedAddon[];
  categorizedAddonsTotal: number;

  customServices: CustomService[];
  customServicesTotal: number;

  grandTotal: number;
  acknowledgement: boolean;
  status: ServiceStatus;
}

export interface Settings {
    googleSheetsUrl: string;
    googleDriveUploadUrl: string;
    customLogoUrl: string;
}

export interface AppData {
    submissions: Service[];
    users: User[];
    settings: Settings;
}
