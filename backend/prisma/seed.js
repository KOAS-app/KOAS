import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const existingAdmin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });

  if (!existingAdmin) {
    const adminPassword = await bcrypt.hash('admin123', 10);

    const admin = await prisma.user.create({
      data: {
        name: 'Super Admin',
        email: 'admin@koas.com',
        password: adminPassword,
        role: 'ADMIN',
        isApproved: true,
      },
    });

    console.log(`Admin created: ${admin.email} / password: admin123`);
    console.log('Change this password immediately after first login.');
  } else {
    console.log(`Admin already exists: ${existingAdmin.email}`);
  }

  // Create owner seed accounts for each plan tier
  const ownerAccounts = [
    {
      name: 'Starter Owner',
      email: 'starter.owner@koas.com',
      password: 'starter123',
      subscriptionPlan: 'STARTER',
    },
    {
      name: 'Pro Owner',
      email: 'pro.owner@koas.com',
      password: 'pro123',
      subscriptionPlan: 'PRO',
    },
    {
      name: 'Elite Owner',
      email: 'elite.owner@koas.com',
      password: 'elite123',
      subscriptionPlan: 'ELITE',
    },
  ];

  for (const account of ownerAccounts) {
    const existingOwner = await prisma.user.findUnique({
      where: { email: account.email },
    });

    if (existingOwner) {
      console.log(`Owner already exists: ${account.email}`);
      continue;
    }

    const hashedPassword = await bcrypt.hash(account.password, 10);
    
    // Set createdAt to 15 days ago so trial has ended (14 day trial)
    const trialEndedDate = new Date();
    trialEndedDate.setDate(trialEndedDate.getDate() - 15);

    const owner = await prisma.user.create({
      data: {
        name: account.name,
        email: account.email,
        password: hashedPassword,
        role: 'OWNER',
        isApproved: true,
        subscriptionPlan: account.subscriptionPlan,
        createdAt: trialEndedDate,
      },
    });

    console.log(`${account.subscriptionPlan} Owner created: ${owner.email} / password: ${account.password}`);
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
