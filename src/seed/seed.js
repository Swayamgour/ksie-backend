import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import {
  Role, User, Customer,
  AirShipment, AirManifest, CourierShipment, Transshipment, RaCompliance,
  Warehouse, WarehouseRack, CargoStorage,
  SecurityScreening, SecurityAuditLog,
  CustomsDeclaration, CustomsDocument,
  Container, GateOperation, Weighment, ContainerStuffing, ReeferOperation,
  Tariff, Invoice, Payment,
  ShipmentTracking, ReportLog, Notification, Master,
} from '../models/index.js';

// ---------- small helpers (idempotent: reseed karne par duplicate error nahi aayega) ----------
const upsertOne = async (Model, findQuery, data, label) => {
  const existing = await Model.findOne(findQuery);
  if (existing) {
    console.log(`ℹ️  Exists ${label}: ${JSON.stringify(findQuery)}`);
    return existing;
  }
  const created = await Model.create(data);
  console.log(`✅ Created ${label}: ${JSON.stringify(findQuery)}`);
  return created;
};

// =====================================================================================
// 1) ROLES
// =====================================================================================
const DEFAULT_ROLES = [
  { name: 'super_admin', description: 'Full system access', permissions: ['*:*'] },
  { name: 'operations_manager', description: 'Air & Sea cargo operations', permissions: ['air:*', 'sea:*', 'warehouse:*', 'tracking:*'] },
  { name: 'customs_officer', description: 'Customs declarations & ICEGATE filing', permissions: ['customs:*', 'air:read', 'sea:read'] },
  { name: 'billing_officer', description: 'Tariffs, invoicing, GST, payments', permissions: ['billing:*'] },
  { name: 'security_officer', description: 'Security screening, RA/RA3 compliance, audits', permissions: ['security:*', 'ra:*'] },
  { name: 'customer', description: 'Customer portal — view own shipments only', permissions: ['tracking:read'] },
];

// =====================================================================================
// 2) USERS — har role ka kam se kam ek user (login credentials neeche console me print honge)
// =====================================================================================
const DEFAULT_USERS = [
  {
    fullName: 'Super Admin',
    email: process.env.SUPER_ADMIN_EMAIL || 'admin@ksie.com',
    passwordHash: process.env.SUPER_ADMIN_PASSWORD || 'Admin@12345',
    roleName: 'super_admin',
    department: 'Administration',
    phone: '9800000001',
  },
  {
    fullName: 'Rajesh Kumar',
    email: 'ops.manager@ksie.com',
    passwordHash: 'Ops@12345',
    roleName: 'operations_manager',
    department: 'Air & Sea Operations',
    phone: '9800000002',
  },
  {
    fullName: 'Priya Sharma',
    email: 'customs.officer@ksie.com',
    passwordHash: 'Customs@12345',
    roleName: 'customs_officer',
    department: 'Customs',
    phone: '9800000003',
  },
  {
    fullName: 'Anil Mehta',
    email: 'billing.officer@ksie.com',
    passwordHash: 'Billing@12345',
    roleName: 'billing_officer',
    department: 'Billing',
    phone: '9800000004',
  },
  {
    fullName: 'Suresh Nair',
    email: 'security.officer@ksie.com',
    passwordHash: 'Security@12345',
    roleName: 'security_officer',
    department: 'Security',
    phone: '9800000005',
  },
  {
    fullName: 'Vikram Singh',
    email: 'customer@ksie.com',
    passwordHash: 'Customer@12345',
    roleName: 'customer',
    department: 'Customer Portal',
    phone: '9800000006',
  },
];

const seed = async () => {
  try {
    await connectDB();
    console.log('Connected to MongoDB for seeding...\n--- Roles ---');

    const roleMap = {}; // name -> role doc
    for (const roleData of DEFAULT_ROLES) {
      roleMap[roleData.name] = await upsertOne(Role, { name: roleData.name }, roleData, 'role');
    }

    console.log('\n--- Users ---');
    const userMap = {}; // roleName -> user doc
    for (const u of DEFAULT_USERS) {
      const { roleName, ...rest } = u;
      const user = await upsertOne(
        User,
        { email: rest.email },
        { ...rest, Role: roleMap[roleName]._id },
        'user'
      );
      userMap[roleName] = user;
    }

    // ===================================================================================
    // 3) CUSTOMERS (company master — importer/exporter jinke shipments hote hain)
    // ===================================================================================
    console.log('\n--- Customers ---');
    const customer1 = await upsertOne(
      Customer,
      { gstNumber: '27AAECG1234H1Z5' },
      {
        companyName: 'Global Traders Pvt Ltd',
        gstNumber: '27AAECG1234H1Z5',
        panNumber: 'AAECG1234H',
        iecCode: '0312345678',
        contactPerson: 'Rohit Verma',
        email: 'rohit@globaltraders.com',
        phone: '9811111111',
        address: 'Plot 12, Andheri East, Mumbai, Maharashtra',
        customerType: 'importer',
        creditLimit: 500000,
      },
      'customer'
    );

    const customer2 = await upsertOne(
      Customer,
      { gstNumber: '07AAFCB5678K1Z2' },
      {
        companyName: 'Bharat Exports Ltd',
        gstNumber: '07AAFCB5678K1Z2',
        panNumber: 'AAFCB5678K',
        iecCode: '0398765432',
        contactPerson: 'Neha Kapoor',
        email: 'neha@bharatexports.com',
        phone: '9822222222',
        address: 'Sector 18, Gurugram, Haryana',
        customerType: 'exporter',
        creditLimit: 750000,
      },
      'customer'
    );

    // ===================================================================================
    // 4) AIR CARGO MODULE — AirShipment, AirManifest, CourierShipment, Transshipment, RaCompliance
    // ===================================================================================
    console.log('\n--- Air Cargo Module ---');
    const airShipment1 = await upsertOne(
      AirShipment,
      { awbNumber: '098-12345670' },
      {
        shipmentType: 'import',
        awbNumber: '098-12345670',
        Customer: customer1._id,
        originAirport: 'DXB',
        destinationAirport: 'BOM',
        airlineCode: 'EK',
        flightNumber: 'EK509',
        pieces: 25,
        grossWeightKg: 480,
        chargeableWeightKg: 500,
        natureOfGoods: 'Electronics components',
        isDangerousGoods: false,
        status: 'customs_processing',
        securityScreeningStatus: 'passed',
        customsStatus: 'in_process',
        remarks: 'High priority import shipment',
        createdBy: userMap.operations_manager._id,
      },
      'air shipment'
    );

    const airShipment2 = await upsertOne(
      AirShipment,
      { awbNumber: '098-98765432' },
      {
        shipmentType: 'export',
        awbNumber: '098-98765432',
        Customer: customer2._id,
        originAirport: 'DEL',
        destinationAirport: 'LHR',
        airlineCode: 'AI',
        flightNumber: 'AI111',
        pieces: 40,
        grossWeightKg: 620,
        chargeableWeightKg: 650,
        natureOfGoods: 'Textiles & garments',
        isDangerousGoods: false,
        status: 'security_screened',
        securityScreeningStatus: 'passed',
        customsStatus: 'pending',
        remarks: 'Export booking confirmed',
        createdBy: userMap.operations_manager._id,
      },
      'air shipment'
    );

    await upsertOne(
      AirManifest,
      { manifestNumber: 'MFT-2026-0001' },
      {
        manifestNumber: 'MFT-2026-0001',
        flightNumber: 'EK509',
        flightDate: new Date('2026-08-15'),
        airlineCode: 'EK',
        originAirport: 'DXB',
        destinationAirport: 'BOM',
        totalAwbCount: 18,
        totalPieces: 340,
        totalWeightKg: 6200,
        fileUrl: '/uploads/manifests/mft-2026-0001.pdf',
        status: 'processed',
        uploadedBy: userMap.operations_manager._id,
      },
      'air manifest'
    );

    await upsertOne(
      AirManifest,
      { manifestNumber: 'MFT-2026-0002' },
      {
        manifestNumber: 'MFT-2026-0002',
        flightNumber: 'AI111',
        flightDate: new Date('2026-08-17'),
        airlineCode: 'AI',
        originAirport: 'DEL',
        destinationAirport: 'LHR',
        totalAwbCount: 22,
        totalPieces: 410,
        totalWeightKg: 7100,
        fileUrl: '/uploads/manifests/mft-2026-0002.pdf',
        status: 'uploaded',
        uploadedBy: userMap.operations_manager._id,
      },
      'air manifest'
    );

    await upsertOne(
      CourierShipment,
      { courierNumber: 'CR-2026-1001' },
      {
        courierNumber: 'CR-2026-1001',
        Customer: customer1._id,
        shipmentType: 'import',
        senderName: 'Tech Supplies LLC',
        receiverName: 'Global Traders Pvt Ltd',
        originCountry: 'UAE',
        destinationCountry: 'India',
        weightKg: 3.5,
        natureOfGoods: 'Sample electronic parts',
        declaredValue: 12000,
        status: 'customs_processing',
        currentLocation: 'Mumbai Air Cargo Complex',
        bookedBy: userMap.operations_manager._id,
      },
      'courier shipment'
    );

    await upsertOne(
      CourierShipment,
      { courierNumber: 'CR-2026-1002' },
      {
        courierNumber: 'CR-2026-1002',
        Customer: customer2._id,
        shipmentType: 'export',
        senderName: 'Bharat Exports Ltd',
        receiverName: 'London Fashion Co.',
        originCountry: 'India',
        destinationCountry: 'UK',
        weightKg: 8.2,
        natureOfGoods: 'Garment samples',
        declaredValue: 25000,
        status: 'booked',
        currentLocation: 'Delhi Air Cargo Complex',
        bookedBy: userMap.operations_manager._id,
      },
      'courier shipment'
    );

    await upsertOne(
      Transshipment,
      { transferNumber: 'TS-2026-0001' },
      {
        transferNumber: 'TS-2026-0001',
        awbNumber: '098-55511122',
        originAirport: 'JFK',
        transitAirport: 'DXB',
        destinationAirport: 'BOM',
        inboundFlight: 'EK202',
        outboundFlight: 'EK509',
        pieces: 12,
        weightKg: 210,
        status: 'in_transit',
        remarks: 'Transit cargo — connecting flight',
      },
      'transshipment'
    );

    await upsertOne(
      RaCompliance,
      { referenceNumber: 'RA-2026-0001' },
      {
        referenceNumber: 'RA-2026-0001',
        awbNumber: '098-12345670',
        agentType: 'RA3',
        screeningMethod: 'X-ray',
        documentUrl: '/uploads/ra-compliance/ra-2026-0001.pdf',
        auditStatus: 'compliant',
        verifiedBy: userMap.security_officer._id,
        verifiedAt: new Date(),
        remarks: 'RA3 screening verified as per BCAS norms',
      },
      'RA compliance'
    );

    // ===================================================================================
    // 5) WAREHOUSE MODULE — Warehouse, WarehouseRack, CargoStorage
    // ===================================================================================
    console.log('\n--- Warehouse Module ---');
    const warehouse1 = await upsertOne(
      Warehouse,
      { code: 'WH-AIR-01' },
      {
        name: 'Air Cargo Warehouse 1',
        code: 'WH-AIR-01',
        location: 'Mumbai Air Cargo Complex',
        type: 'air_cargo',
        totalCapacitySqft: 20000,
        usedCapacitySqft: 6500,
      },
      'warehouse'
    );

    const warehouse2 = await upsertOne(
      Warehouse,
      { code: 'WH-SEA-01' },
      {
        name: 'Sea Cargo Cold Storage',
        code: 'WH-SEA-01',
        location: 'Nhava Sheva Port',
        type: 'cold_storage',
        totalCapacitySqft: 15000,
        usedCapacitySqft: 4200,
      },
      'warehouse'
    );

    const rack1 = await upsertOne(
      WarehouseRack,
      { warehouseId: warehouse1._id, rackCode: 'A-01' },
      {
        warehouseId: warehouse1._id,
        rackCode: 'A-01',
        binCode: 'A-01-B1',
        capacityUnits: 100,
        occupiedUnits: 40,
        status: 'partial',
      },
      'warehouse rack'
    );

    await upsertOne(
      WarehouseRack,
      { warehouseId: warehouse2._id, rackCode: 'B-01' },
      {
        warehouseId: warehouse2._id,
        rackCode: 'B-01',
        binCode: 'B-01-C1',
        capacityUnits: 80,
        occupiedUnits: 80,
        status: 'full',
      },
      'warehouse rack'
    );

    await upsertOne(
      CargoStorage,
      { warehouseId: warehouse1._id, rackId: rack1._id, referenceType: 'air_shipment', referenceId: airShipment1._id },
      {
        warehouseId: warehouse1._id,
        rackId: rack1._id,
        referenceType: 'air_shipment',
        referenceId: airShipment1._id,
        pieces: 25,
        weightKg: 480,
        storedAt: new Date('2026-08-15'),
        damageReported: false,
        status: 'stored',
      },
      'cargo storage'
    );

    await upsertOne(
      CargoStorage,
      { warehouseId: warehouse1._id, rackId: rack1._id, referenceType: 'air_shipment', referenceId: airShipment2._id },
      {
        warehouseId: warehouse1._id,
        rackId: rack1._id,
        referenceType: 'air_shipment',
        referenceId: airShipment2._id,
        pieces: 40,
        weightKg: 620,
        storedAt: new Date('2026-08-10'),
        releasedAt: new Date('2026-08-14'),
        damageReported: false,
        status: 'released',
      },
      'cargo storage'
    );

    // ===================================================================================
    // 6) SECURITY MODULE — SecurityScreening, SecurityAuditLog
    // ===================================================================================
    console.log('\n--- Security Module ---');
    await upsertOne(
      SecurityScreening,
      { referenceType: 'air_shipment', referenceId: airShipment1._id },
      {
        referenceType: 'air_shipment',
        referenceId: airShipment1._id,
        screeningMethod: 'xray',
        deviceId: 'XR-DEVICE-01',
        result: 'cleared',
        screenedBy: userMap.security_officer._id,
        screenedAt: new Date(),
        approvedBy: userMap.security_officer._id,
        approvedAt: new Date(),
        remarks: 'No threat items detected',
      },
      'security screening'
    );

    await upsertOne(
      SecurityScreening,
      { referenceType: 'air_shipment', referenceId: airShipment2._id },
      {
        referenceType: 'air_shipment',
        referenceId: airShipment2._id,
        screeningMethod: 'etd',
        deviceId: 'ETD-DEVICE-02',
        result: 'pending',
        screenedBy: userMap.security_officer._id,
        remarks: 'Scheduled for screening before flight loading',
      },
      'security screening'
    );

    await upsertOne(
      SecurityAuditLog,
      { eventType: 'screening_alarm', referenceType: 'air_shipment', referenceId: airShipment2._id },
      {
        eventType: 'screening_alarm',
        referenceType: 'air_shipment',
        referenceId: airShipment2._id,
        severity: 'medium',
        description: 'ETD alarm triggered — piece sent for physical inspection',
        raisedBy: userMap.security_officer._id,
        resolvedStatus: 'investigating',
      },
      'security audit log'
    );

    // ===================================================================================
    // 7) CUSTOMS MODULE — CustomsDeclaration, CustomsDocument
    // ===================================================================================
    console.log('\n--- Customs Module ---');
    const declaration1 = await upsertOne(
      CustomsDeclaration,
      { declarationNumber: 'BOE-2026-0001' },
      {
        declarationType: 'bill_of_entry',
        declarationNumber: 'BOE-2026-0001',
        referenceType: 'air_shipment',
        referenceId: airShipment1._id,
        icegateReferenceId: 'ICG-REF-778899',
        filingStatus: 'assessed',
        filedBy: userMap.customs_officer._id,
        filedAt: new Date('2026-08-16'),
      },
      'customs declaration'
    );

    const declaration2 = await upsertOne(
      CustomsDeclaration,
      { declarationNumber: 'SB-2026-0001' },
      {
        declarationType: 'shipping_bill',
        declarationNumber: 'SB-2026-0001',
        referenceType: 'air_shipment',
        referenceId: airShipment2._id,
        icegateReferenceId: 'ICG-REF-990011',
        filingStatus: 'filed',
        filedBy: userMap.customs_officer._id,
        filedAt: new Date('2026-08-17'),
      },
      'customs declaration'
    );

    await upsertOne(
      CustomsDocument,
      { declarationId: declaration1._id, documentType: 'commercial_invoice' },
      {
        declarationId: declaration1._id,
        documentType: 'commercial_invoice',
        fileUrl: '/uploads/customs-docs/boe-2026-0001-invoice.pdf',
        uploadedBy: userMap.customs_officer._id,
        verifiedStatus: 'verified',
      },
      'customs document'
    );

    await upsertOne(
      CustomsDocument,
      { declarationId: declaration2._id, documentType: 'packing_list' },
      {
        declarationId: declaration2._id,
        documentType: 'packing_list',
        fileUrl: '/uploads/customs-docs/sb-2026-0001-packing-list.pdf',
        uploadedBy: userMap.customs_officer._id,
        verifiedStatus: 'pending',
      },
      'customs document'
    );

    // ===================================================================================
    // 8) SEA CARGO / CONTAINER MODULE — Container, GateOperation, Weighment, ContainerStuffing, ReeferOperation
    // ===================================================================================
    console.log('\n--- Sea Cargo / Container Module ---');
    const container1 = await upsertOne(
      Container,
      { containerNumber: 'MSCU1234567' },
      {
        containerNumber: 'MSCU1234567',
        shipmentType: 'import',
        Customer: customer1._id,
        containerSize: '40ft',
        containerType: 'dry',
        vesselName: 'MSC Aurora',
        voyageNumber: 'V.2026-33',
        billOfLading: 'BL-556677',
        sealNumber: 'SL-998877',
        grossWeightKg: 18500,
        status: 'examination',
        currentLocation: 'Nhava Sheva Terminal 2',
        remarks: 'Awaiting customs examination',
      },
      'container'
    );

    const container2 = await upsertOne(
      Container,
      { containerNumber: 'TCLU7654321' },
      {
        containerNumber: 'TCLU7654321',
        shipmentType: 'export',
        Customer: customer2._id,
        containerSize: '20ft',
        containerType: 'reefer',
        vesselName: 'Maersk Sealand',
        voyageNumber: 'V.2026-41',
        billOfLading: 'BL-112233',
        sealNumber: 'SL-334455',
        grossWeightKg: 12800,
        status: 'stuffed',
        currentLocation: 'Nhava Sheva Terminal 1',
        remarks: 'Reefer cargo — temperature monitored',
      },
      'container'
    );

    await upsertOne(
      GateOperation,
      { containerId: container1._id, gateType: 'gate_in' },
      {
        containerId: container1._id,
        vehicleNumber: 'MH-04-AB-1234',
        driverName: 'Ramesh Yadav',
        driverLicense: 'MH0420210012345',
        gateType: 'gate_in',
        gateTimestamp: new Date('2026-08-14T09:30:00'),
        securityClearance: 'cleared',
        remarks: 'Container gated in for examination',
        operatedBy: userMap.security_officer._id,
      },
      'gate operation'
    );

    await upsertOne(
      GateOperation,
      { containerId: container2._id, gateType: 'gate_out' },
      {
        containerId: container2._id,
        vehicleNumber: 'HR-26-CD-5678',
        driverName: 'Sunil Chauhan',
        driverLicense: 'HR2620190067890',
        gateType: 'gate_out',
        gateTimestamp: new Date('2026-08-17T14:15:00'),
        securityClearance: 'cleared',
        remarks: 'Container gated out post stuffing',
        operatedBy: userMap.security_officer._id,
      },
      'gate operation'
    );

    await upsertOne(
      Weighment,
      { containerId: container1._id },
      {
        containerId: container1._id,
        vehicleNumber: 'MH-04-AB-1234',
        grossWeightKg: 22500,
        tareWeightKg: 4000,
        weighbridgeId: 'WB-01',
        weighedAt: new Date('2026-08-14T09:45:00'),
        weighedBy: userMap.operations_manager._id,
      },
      'weighment'
    );

    await upsertOne(
      Weighment,
      { containerId: container2._id },
      {
        containerId: container2._id,
        vehicleNumber: 'HR-26-CD-5678',
        grossWeightKg: 16800,
        tareWeightKg: 4000,
        weighbridgeId: 'WB-02',
        weighedAt: new Date('2026-08-17T14:00:00'),
        weighedBy: userMap.operations_manager._id,
      },
      'weighment'
    );

    await upsertOne(
      ContainerStuffing,
      { containerId: container2._id },
      {
        containerId: container2._id,
        stuffingLocation: 'CFS Bay 3',
        supervisedBy: userMap.operations_manager._id,
        cargoDescription: 'Cotton garments — export cargo',
        totalPackages: 480,
        sfMessageFiled: true,
        sfMessageRef: 'SF-2026-4455',
        sealNumber: 'SL-334455',
        stuffedAt: new Date('2026-08-16'),
        status: 'sealed',
      },
      'container stuffing'
    );

    await upsertOne(
      ReeferOperation,
      { containerId: container2._id },
      {
        containerId: container2._id,
        plugInLocation: 'CFS Reefer Point 3',
        plugInAt: new Date('2026-08-16T10:00:00'),
        setTemperatureC: -18,
        currentTemperatureC: -17.5,
        humidityPercent: 65,
        monitoringStatus: 'normal',
        lastCheckedAt: new Date(),
        remarks: 'Temperature within acceptable range',
      },
      'reefer operation'
    );

    // ===================================================================================
    // 9) BILLING MODULE — Tariff, Invoice, Payment
    // ===================================================================================
    console.log('\n--- Billing Module ---');
    await upsertOne(
      Tariff,
      { chargeCode: 'THC-001' },
      {
        chargeCode: 'THC-001',
        chargeName: 'Terminal Handling Charges',
        chargeCategory: 'handling',
        unit: 'per_container',
        rate: 8500,
        gstPercent: 18,
      },
      'tariff'
    );

    await upsertOne(
      Tariff,
      { chargeCode: 'STO-001' },
      {
        chargeCode: 'STO-001',
        chargeName: 'Warehouse Storage Charges',
        chargeCategory: 'storage',
        unit: 'per_day',
        rate: 250,
        gstPercent: 18,
      },
      'tariff'
    );

    await upsertOne(
      Tariff,
      { chargeCode: 'SCR-001' },
      {
        chargeCode: 'SCR-001',
        chargeName: 'Security Screening Charges',
        chargeCategory: 'security',
        unit: 'per_awb',
        rate: 750,
        gstPercent: 18,
      },
      'tariff'
    );

    const invoice1 = await upsertOne(
      Invoice,
      { invoiceNumber: 'INV-2026-0001' },
      {
        invoiceNumber: 'INV-2026-0001',
        Customer: customer1._id,
        referenceType: 'air_shipment',
        referenceId: airShipment1._id,
        lineItems: [
          { chargeCode: 'THC-001', description: 'Handling charges', qty: 1, rate: 8500, amount: 8500, gstPercent: 18, gstAmount: 1530 },
          { chargeCode: 'STO-001', description: 'Storage — 3 days', qty: 3, rate: 250, amount: 750, gstPercent: 18, gstAmount: 135 },
        ],
        subTotal: 9250,
        totalGst: 1665,
        totalAmount: 10915,
        eInvoiceIrn: 'IRN-AAAA1111BBBB2222',
        eInvoiceStatus: 'generated',
        status: 'issued',
        dueDate: new Date('2026-08-30'),
        generatedBy: userMap.billing_officer._id,
      },
      'invoice'
    );

    const invoice2 = await upsertOne(
      Invoice,
      { invoiceNumber: 'INV-2026-0002' },
      {
        invoiceNumber: 'INV-2026-0002',
        Customer: customer2._id,
        referenceType: 'container',
        referenceId: container2._id,
        lineItems: [
          { chargeCode: 'THC-001', description: 'Handling charges', qty: 1, rate: 8500, amount: 8500, gstPercent: 18, gstAmount: 1530 },
        ],
        subTotal: 8500,
        totalGst: 1530,
        totalAmount: 10030,
        eInvoiceStatus: 'not_generated',
        status: 'partially_paid',
        dueDate: new Date('2026-08-28'),
        generatedBy: userMap.billing_officer._id,
      },
      'invoice'
    );

    await upsertOne(
      Payment,
      { paymentReference: 'PAY-2026-0001' },
      {
        invoiceId: invoice1._id,
        paymentReference: 'PAY-2026-0001',
        amount: 10915,
        paymentMode: 'neft',
        paymentDate: new Date('2026-08-18'),
        status: 'confirmed',
        recordedBy: userMap.billing_officer._id,
        remarks: 'Full payment received',
      },
      'payment'
    );

    await upsertOne(
      Payment,
      { paymentReference: 'PAY-2026-0002' },
      {
        invoiceId: invoice2._id,
        paymentReference: 'PAY-2026-0002',
        amount: 5000,
        paymentMode: 'upi',
        paymentDate: new Date('2026-08-17'),
        status: 'confirmed',
        recordedBy: userMap.billing_officer._id,
        remarks: 'Partial payment — balance pending',
      },
      'payment'
    );

    // ===================================================================================
    // 10) TRACKING / REPORTS / NOTIFICATIONS / MASTERS
    // ===================================================================================
    console.log('\n--- Tracking / Reports / Notifications / Masters ---');
    await upsertOne(
      ShipmentTracking,
      { referenceType: 'air_shipment', referenceId: airShipment1._id, eventCode: 'CUSTOMS_PROCESSING' },
      {
        referenceType: 'air_shipment',
        referenceId: airShipment1._id,
        eventCode: 'CUSTOMS_PROCESSING',
        eventDescription: 'Bill of entry filed and under assessment',
        location: 'Mumbai Air Cargo Complex',
        eventTimestamp: new Date('2026-08-16T11:00:00'),
        recordedBy: userMap.customs_officer._id,
      },
      'shipment tracking'
    );

    await upsertOne(
      ShipmentTracking,
      { referenceType: 'container', referenceId: container2._id, eventCode: 'GATE_OUT' },
      {
        referenceType: 'container',
        referenceId: container2._id,
        eventCode: 'GATE_OUT',
        eventDescription: 'Container gated out from CFS after stuffing',
        location: 'Nhava Sheva Terminal 1',
        eventTimestamp: new Date('2026-08-17T14:15:00'),
        recordedBy: userMap.operations_manager._id,
      },
      'shipment tracking'
    );

    await upsertOne(
      ReportLog,
      { reportType: 'kpi', 'filters.month': 'August', 'filters.year': 2026 },
      {
        reportType: 'kpi',
        filters: { month: 'August', year: 2026 },
        generatedBy: userMap.super_admin._id,
        fileUrl: '/uploads/reports/kpi-aug-2026.pdf',
        generatedAt: new Date(),
      },
      'report log'
    );

    await upsertOne(
      Notification,
      { userId: userMap.customs_officer._id, title: 'New declaration assigned' },
      {
        userId: userMap.customs_officer._id,
        channel: 'in_app',
        title: 'New declaration assigned',
        message: 'Bill of Entry BOE-2026-0001 assigned to you for filing.',
        referenceType: 'customs_declaration',
        referenceId: declaration1._id,
        status: 'sent',
        sentAt: new Date(),
      },
      'notification'
    );

    await upsertOne(
      Notification,
      { userId: userMap.customer._id, title: 'Shipment update' },
      {
        userId: userMap.customer._id,
        channel: 'email',
        title: 'Shipment update',
        message: 'Your shipment AWB 098-12345670 is under customs processing.',
        referenceType: 'air_shipment',
        referenceId: airShipment1._id,
        status: 'sent',
        sentAt: new Date(),
      },
      'notification'
    );

    const MASTER_DATA = [
      { masterType: 'airport', code: 'BOM', name: 'Chhatrapati Shivaji Maharaj International Airport' },
      { masterType: 'airport', code: 'DEL', name: 'Indira Gandhi International Airport' },
      { masterType: 'cargo_type', code: 'GEN', name: 'General Cargo' },
      { masterType: 'container_type', code: '40HC', name: '40ft High Cube' },
      { masterType: 'currency', code: 'INR', name: 'Indian Rupee' },
    ];
    for (const m of MASTER_DATA) {
      await upsertOne(Master, { masterType: m.masterType, code: m.code }, m, 'master');
    }

    console.log('\n🎉 Seeding complete.\n');
    console.log('===== Login credentials (har role ka user) =====');
    for (const u of DEFAULT_USERS) {
      console.log(`${u.roleName.padEnd(20)} -> email: ${u.email.padEnd(28)} password: ${u.passwordHash}`);
    }
    console.log('=================================================\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
};

seed();