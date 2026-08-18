import { Role } from '../models/index.js';
import { createCrudController } from './factory.js';

const base = createCrudController(Role, {
  searchFields: ['name'],
  filterFields: ['isActive'],
  entityName: 'Role',
});

export const getAllRoles = base.getAll;
export const getRole = base.getOne;
export const createRole = base.create;
export const updateRole = base.update;
export const deleteRole = base.remove;
