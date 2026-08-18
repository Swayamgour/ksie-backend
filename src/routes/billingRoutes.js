import { Router } from 'express';
import {
  listTariffs, getTariff, createTariff, updateTariff, deleteTariff,
  listInvoices, getInvoice, generateInvoice, generateEInvoice, deleteInvoice,
  listPayments, getPayment, recordPayment, revenueSummary,
} from '../controllers/billingController.js';
import { authenticate } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/rbac.js';

const router = Router();
router.use(authenticate);

const billingOnly = authorizeRoles('super_admin', 'billing_officer');

// Tariff Management
router.get('/tariffs', listTariffs);
router.post('/tariffs', billingOnly, createTariff);
router.get('/tariffs/:id', getTariff);
router.put('/tariffs/:id', billingOnly, updateTariff);
router.delete('/tariffs/:id', authorizeRoles('super_admin'), deleteTariff);

// GST Billing / Invoices
router.get('/invoices', listInvoices);
router.post('/invoices/generate', billingOnly, generateInvoice);
router.get('/invoices/revenue-summary', revenueSummary);
router.get('/invoices/:id', getInvoice);
router.post('/invoices/:id/e-invoice', billingOnly, generateEInvoice);
router.delete('/invoices/:id', authorizeRoles('super_admin'), deleteInvoice);

// Payments
router.get('/payments', listPayments);
router.post('/payments', billingOnly, recordPayment);
router.get('/payments/:id', getPayment);

export default router;
