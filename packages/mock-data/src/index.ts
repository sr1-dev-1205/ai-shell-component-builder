export type OrderStatus = 'pending' | 'shipped' | 'delivered' | 'cancelled';
export type Region = 'North' | 'South' | 'East' | 'West';

export interface Order {
  id: string;
  customer: string;
  product: string;
  quantity: number;
  status: OrderStatus;
  deliveryDate: string;
  region: Region;
}

export type ShipmentStatus = 'in-transit' | 'delayed' | 'delivered';

export interface Shipment {
  id: string;
  orderId: string;
  carrier: string;
  origin: string;
  destination: string;
  status: ShipmentStatus;
  eta: string;
  weight: number;
}

export interface Inventory {
  id: string;
  sku: string;
  productName: string;
  warehouse: string;
  quantity: number;
  reorderLevel: number;
  lastUpdated: string;
}

export interface Supplier {
  id: string;
  name: string;
  country: string;
  rating: number;
  leadTimeDays: number;
  category: string;
}

export const orders: Order[] = [
  {
    id: 'ORD-1001',
    customer: 'Acme Manufacturing',
    product: 'Industrial Bearings',
    quantity: 500,
    status: 'shipped',
    deliveryDate: '2026-07-02',
    region: 'North',
  },
  {
    id: 'ORD-1002',
    customer: 'Global Retail Co',
    product: 'Packaging Materials',
    quantity: 1200,
    status: 'pending',
    deliveryDate: '2026-07-08',
    region: 'East',
  },
  {
    id: 'ORD-1003',
    customer: 'TechParts Inc',
    product: 'Circuit Boards',
    quantity: 350,
    status: 'delivered',
    deliveryDate: '2026-06-20',
    region: 'West',
  },
  {
    id: 'ORD-1004',
    customer: 'FreshFoods Distribution',
    product: 'Refrigerated Containers',
    quantity: 80,
    status: 'shipped',
    deliveryDate: '2026-06-28',
    region: 'South',
  },
  {
    id: 'ORD-1005',
    customer: 'BuildRight Construction',
    product: 'Steel Beams',
    quantity: 200,
    status: 'shipped',
    deliveryDate: '2026-07-05',
    region: 'North',
  },
  {
    id: 'ORD-1006',
    customer: 'MedSupply Partners',
    product: 'Surgical Gloves',
    quantity: 5000,
    status: 'delivered',
    deliveryDate: '2026-06-15',
    region: 'East',
  },
  {
    id: 'ORD-1007',
    customer: 'AutoDrive Motors',
    product: 'Transmission Gears',
    quantity: 150,
    status: 'cancelled',
    deliveryDate: '2026-06-25',
    region: 'West',
  },
  {
    id: 'ORD-1008',
    customer: 'GreenEnergy Solutions',
    product: 'Solar Panel Mounts',
    quantity: 600,
    status: 'pending',
    deliveryDate: '2026-07-12',
    region: 'South',
  },
  {
    id: 'ORD-1009',
    customer: 'Pacific Logistics',
    product: 'Pallet Racking',
    quantity: 45,
    status: 'shipped',
    deliveryDate: '2026-07-01',
    region: 'West',
  },
  {
    id: 'ORD-1010',
    customer: 'Northern Foods',
    product: 'Cold Chain Sensors',
    quantity: 300,
    status: 'delivered',
    deliveryDate: '2026-06-18',
    region: 'North',
  },
];

export const shipments: Shipment[] = [
  {
    id: 'SHP-2001',
    orderId: 'ORD-1001',
    carrier: 'FedEx Freight',
    origin: 'Chicago, IL',
    destination: 'Detroit, MI',
    status: 'in-transit',
    eta: '2026-06-28',
    weight: 1250,
  },
  {
    id: 'SHP-2002',
    orderId: 'ORD-1005',
    carrier: 'UPS Supply Chain',
    origin: 'Pittsburgh, PA',
    destination: 'Boston, MA',
    status: 'in-transit',
    eta: '2026-07-03',
    weight: 4800,
  },
  {
    id: 'SHP-2003',
    orderId: 'ORD-1003',
    carrier: 'DHL Express',
    origin: 'San Jose, CA',
    destination: 'Seattle, WA',
    status: 'delivered',
    eta: '2026-06-20',
    weight: 320,
  },
  {
    id: 'SHP-2004',
    orderId: 'ORD-1009',
    carrier: 'XPO Logistics',
    origin: 'Portland, OR',
    destination: 'Los Angeles, CA',
    status: 'delayed',
    eta: '2026-07-04',
    weight: 2100,
  },
  {
    id: 'SHP-2005',
    orderId: 'ORD-1006',
    carrier: 'Maersk Ground',
    origin: 'Newark, NJ',
    destination: 'Philadelphia, PA',
    status: 'delivered',
    eta: '2026-06-15',
    weight: 890,
  },
  {
    id: 'SHP-2006',
    orderId: 'ORD-1004',
    carrier: 'Swift Transportation',
    origin: 'Atlanta, GA',
    destination: 'Miami, FL',
    status: 'in-transit',
    eta: '2026-06-29',
    weight: 5600,
  },
  {
    id: 'SHP-2007',
    orderId: 'ORD-1010',
    carrier: 'Old Dominion',
    origin: 'Minneapolis, MN',
    destination: 'Denver, CO',
    status: 'delivered',
    eta: '2026-06-18',
    weight: 450,
  },
  {
    id: 'SHP-2008',
    orderId: 'ORD-1002',
    carrier: 'Estes Express',
    origin: 'Charlotte, NC',
    destination: 'New York, NY',
    status: 'in-transit',
    eta: '2026-07-06',
    weight: 1800,
  },
];

export const inventory: Inventory[] = [
  {
    id: 'INV-3001',
    sku: 'BRG-4500',
    productName: 'Industrial Bearings',
    warehouse: 'Chicago Central',
    quantity: 2400,
    reorderLevel: 500,
    lastUpdated: '2026-06-25',
  },
  {
    id: 'INV-3002',
    sku: 'PKG-2200',
    productName: 'Packaging Materials',
    warehouse: 'Newark East',
    quantity: 85,
    reorderLevel: 200,
    lastUpdated: '2026-06-26',
  },
  {
    id: 'INV-3003',
    sku: 'PCB-8800',
    productName: 'Circuit Boards',
    warehouse: 'San Jose Tech Hub',
    quantity: 1200,
    reorderLevel: 300,
    lastUpdated: '2026-06-24',
  },
  {
    id: 'INV-3004',
    sku: 'REF-1100',
    productName: 'Refrigerated Containers',
    warehouse: 'Atlanta South',
    quantity: 42,
    reorderLevel: 50,
    lastUpdated: '2026-06-27',
  },
  {
    id: 'INV-3005',
    sku: 'STL-9900',
    productName: 'Steel Beams',
    warehouse: 'Pittsburgh Steel',
    quantity: 180,
    reorderLevel: 100,
    lastUpdated: '2026-06-23',
  },
  {
    id: 'INV-3006',
    sku: 'SGL-3300',
    productName: 'Surgical Gloves',
    warehouse: 'Philadelphia Med',
    quantity: 15000,
    reorderLevel: 3000,
    lastUpdated: '2026-06-26',
  },
  {
    id: 'INV-3007',
    sku: 'TRN-7700',
    productName: 'Transmission Gears',
    warehouse: 'Detroit Auto',
    quantity: 28,
    reorderLevel: 75,
    lastUpdated: '2026-06-22',
  },
  {
    id: 'INV-3008',
    sku: 'SLR-5500',
    productName: 'Solar Panel Mounts',
    warehouse: 'Phoenix Solar',
    quantity: 890,
    reorderLevel: 200,
    lastUpdated: '2026-06-25',
  },
  {
    id: 'INV-3009',
    sku: 'PLT-4400',
    productName: 'Pallet Racking',
    warehouse: 'Portland West',
    quantity: 65,
    reorderLevel: 40,
    lastUpdated: '2026-06-27',
  },
  {
    id: 'INV-3010',
    sku: 'SNS-6600',
    productName: 'Cold Chain Sensors',
    warehouse: 'Minneapolis North',
    quantity: 520,
    reorderLevel: 150,
    lastUpdated: '2026-06-24',
  },
  {
    id: 'INV-3011',
    sku: 'HYD-2200',
    productName: 'Hydraulic Pumps',
    warehouse: 'Houston Gulf',
    quantity: 15,
    reorderLevel: 30,
    lastUpdated: '2026-06-26',
  },
  {
    id: 'INV-3012',
    sku: 'FLT-8800',
    productName: 'Forklift Batteries',
    warehouse: 'Dallas Central',
    quantity: 110,
    reorderLevel: 50,
    lastUpdated: '2026-06-25',
  },
];

export const suppliers: Supplier[] = [
  {
    id: 'SUP-4001',
    name: 'Precision Parts Global',
    country: 'Germany',
    rating: 4.8,
    leadTimeDays: 14,
    category: 'Industrial Components',
  },
  {
    id: 'SUP-4002',
    name: 'Pacific Packaging Solutions',
    country: 'USA',
    rating: 4.5,
    leadTimeDays: 7,
    category: 'Packaging',
  },
  {
    id: 'SUP-4003',
    name: 'Shenzhen Electronics Co',
    country: 'China',
    rating: 4.2,
    leadTimeDays: 21,
    category: 'Electronics',
  },
  {
    id: 'SUP-4004',
    name: 'Nordic Steel Works',
    country: 'Sweden',
    rating: 4.9,
    leadTimeDays: 18,
    category: 'Raw Materials',
  },
  {
    id: 'SUP-4005',
    name: 'MedTech Supplies Ltd',
    country: 'India',
    rating: 4.6,
    leadTimeDays: 10,
    category: 'Medical Supplies',
  },
];

export const mockData = { orders, shipments, inventory, suppliers };
