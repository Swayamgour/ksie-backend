import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { Role, User } from '../models/index.js';

const DEFAULT_ROLES = [
  { name: 'super_admin', description: 'Full system access', permissions: ['*:*'] },
  { name: 'operations_manager', description: 'Air & Sea cargo operations', permissions: ['air:*', 'sea:*', 'warehouse:*', 'tracking:*'] },
  { name: 'customs_officer', description: 'Customs declarations & ICEGATE filing', permissions: ['customs:*', 'air:read', 'sea:read'] },
  { name: 'billing_officer', description: 'Tariffs, invoicing, GST, payments', permissions: ['billing:*'] },
  { name: 'security_officer', description: 'Security screening, RA/RA3 compliance, audits', permissions: ['security:*', 'ra:*'] },
  { name: 'customer', description: 'Customer portal — view own shipments only', permissions: ['tracking:read'] },
];

const seed = async () => {
  try {
    await connectDB();
    console.log('Connected to MongoDB for seeding...');

    for (const roleData of DEFAULT_ROLES) {
      const existing = await Role.findOne({ name: roleData.name });
      if (existing) {
        console.log(`ℹ️  Exists role: ${roleData.name}`);
      } else {
        await Role.create(roleData);
        console.log(`✅ Created role: ${roleData.name}`);
      }
    }

    const superAdminRole = await Role.findOne({ name: 'super_admin' });

    const adminEmail = process.env.SUPER_ADMIN_EMAIL || 'admin@ksie.com';
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (!existingAdmin) {
      await User.create({
        fullName: 'Super Admin',
        email: adminEmail,
        passwordHash: process.env.SUPER_ADMIN_PASSWORD || 'Admin@12345', // hashed via pre-save hook
        Role: superAdminRole._id,
        department: 'Administration',
      });
      console.log(`✅ Super admin created: ${adminEmail}`);
    } else {
      console.log(`ℹ️  Super admin already exists: ${adminEmail}`);
    }

    console.log('🎉 Seeding complete.');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
};

seed();
