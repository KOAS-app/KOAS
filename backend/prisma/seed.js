import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.user.findFirst({ where: { role: 'ADMIN' } });

  if (existing) {
    console.log(`Admin already exists: ${existing.email}`);
    return;
  }

  const password = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.create({
    data: {
      name: 'Super Admin',
      email: 'admin@koas.com',
      password,
      role: 'ADMIN',
    },
  });

  console.log(`Admin created: ${admin.email} / password: admin123`);
  console.log('Change this password immediately after first login.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
