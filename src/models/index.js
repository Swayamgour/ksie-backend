// Mongoose models are self-contained (refs are declared inline in each schema),
// so this file just re-exports everything from one place for convenient imports
// across controllers/routes — mirroring the previous Sequelize models/index.js API.

import { Role } from './Role.js';
import { User } from './User.js';
import { Customer } from './Customer.js';

import { AirShipment } from './AirShipment.js';
import { AirManifest } from './AirManifest.js';
import { CourierShipment } from './CourierShipment.js';
import { Transshipment } from './Transshipment.js';
import { RaCompliance } from './RaCompliance.js';

import { Warehouse } from './Warehouse.js';
import { WarehouseRack } from './WarehouseRack.js';
import { CargoStorage } from './CargoStorage.js';

import { SecurityScreening } from './SecurityScreening.js';
import { SecurityAuditLog } from './SecurityAuditLog.js';

import { CustomsDeclaration } from './CustomsDeclaration.js';
import { CustomsDocument } from './CustomsDocument.js';

import { Container } from './Container.js';
import { GateOperation } from './GateOperation.js';
import { Weighment } from './Weighment.js';
import { ContainerStuffing } from './ContainerStuffing.js';
import { ReeferOperation } from './ReeferOperation.js';

import { Tariff } from './Tariff.js';
import { Invoice } from './Invoice.js';
import { Payment } from './Payment.js';

import { ShipmentTracking } from './ShipmentTracking.js';
import { ReportLog } from './ReportLog.js';
import { Notification } from './Notification.js';
import { Master } from './Master.js';

export const db = {
  Role,
  User,
  Customer,
  AirShipment,
  AirManifest,
  CourierShipment,
  Transshipment,
  RaCompliance,
  Warehouse,
  WarehouseRack,
  CargoStorage,
  SecurityScreening,
  SecurityAuditLog,
  CustomsDeclaration,
  CustomsDocument,
  Container,
  GateOperation,
  Weighment,
  ContainerStuffing,
  ReeferOperation,
  Tariff,
  Invoice,
  Payment,
  ShipmentTracking,
  ReportLog,
  Notification,
  Master,
};

export {
  Role, User, Customer,
  AirShipment, AirManifest, CourierShipment, Transshipment, RaCompliance,
  Warehouse, WarehouseRack, CargoStorage,
  SecurityScreening, SecurityAuditLog,
  CustomsDeclaration, CustomsDocument,
  Container, GateOperation, Weighment, ContainerStuffing, ReeferOperation,
  Tariff, Invoice, Payment,
  ShipmentTracking, ReportLog, Notification, Master,
};
