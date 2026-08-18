import { Master } from '../models/index.js';
import { createCrudController } from './factory.js';

const base = createCrudController(Master, {
  searchFields: ['code', 'name'],
  filterFields: ['masterType', 'isActive'],
  entityName: 'Master Record',
});

export const listMasters = base.getAll;
export const getMaster = base.getOne;
export const createMaster = base.create;
export const updateMaster = base.update;
export const deleteMaster = base.remove;
