import { Router } from 'express';

import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import roleRoutes from './roleRoutes.js';
import customerRoutes from './customerRoutes.js';
import dashboardRoutes from './dashboardRoutes.js';

import airCargoRoutes from './airCargoRoutes.js';
import manifestRoutes from './manifestRoutes.js';
import courierRoutes from './courierRoutes.js';
import transshipmentRoutes from './transshipmentRoutes.js';
import raComplianceRoutes from './raComplianceRoutes.js';

import warehouseRoutes from './warehouseRoutes.js';
import securityRoutes from './securityRoutes.js';
import customsRoutes from './customsRoutes.js';
import seaCargoRoutes from './seaCargoRoutes.js';
import billingRoutes from './billingRoutes.js';
import trackingRoutes from './trackingRoutes.js';
import reportsRoutes from './reportsRoutes.js';
import notificationRoutes from './notificationRoutes.js';
import masterRoutes from './masterRoutes.js';
import operationsRoutes from './operationsRoutes.js';
import fileRoutes from './fileRoutes.js';

const router = Router();

// MODULE 0 – Auth, Admin, Dashboard
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/roles', roleRoutes);
router.use('/customers', customerRoutes);
router.use('/dashboard', dashboardRoutes);

// MODULE 1 – Air Cargo Management
router.use('/air-cargo', airCargoRoutes);
router.use('/manifests', manifestRoutes);
router.use('/courier', courierRoutes);
router.use('/transshipment', transshipmentRoutes);
router.use('/ra-compliance', raComplianceRoutes);

// MODULE 2 – Warehouse Management
router.use('/warehouses', warehouseRoutes);

// MODULE 3 – Security Management
router.use('/security', securityRoutes);

// MODULE 4 – Customs Integration
router.use('/customs', customsRoutes);

// MODULE 5 – Billing & Finance
router.use('/billing', billingRoutes);

// MODULE 6 – Sea Cargo Management
router.use('/sea-cargo', seaCargoRoutes);

// MODULE 7 – Tracking System
router.use('/tracking', trackingRoutes);

// MODULE 8 – Reports & Analytics
router.use('/reports', reportsRoutes);

// MODULE 10 – Admin Panel (Masters) + Notifications
router.use('/masters', masterRoutes);
router.use('/notifications', notificationRoutes);
router.use('/operations', operationsRoutes);
router.use('/files', fileRoutes);

export default router;
