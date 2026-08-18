import { Customer } from '../models/index.js';
import { createCrudController } from './factory.js';

const base = createCrudController(Customer, {
  searchFields: ['companyName', 'gstNumber', 'iecCode', 'email'],
  filterFields: ['customerType', 'isActive'],
  entityName: 'Customer',
});

export const getAllCustomers = base.getAll;
export const getCustomer = base.getOne;
export const createCustomer = base.create;
export const updateCustomer = base.update;
export const deleteCustomer = base.remove;
