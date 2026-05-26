import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding 3 players...');

  const players = [
    {
      name: 'Ahmed Hassan',
      email: 'ahmed.hassan@example.com',
      phoneNumber: '+251912345678',
      password: 'Player123!',
      role: 'PLAYER'
    },
    {
      name: 'Fatima Mohammed',
      email: 'fatima.mohammed@example.com',
      phoneNumber: '+251923456789',
      password: 'Player123!',
      role: 'PLAYER'
    },
    {
      name: 'Yonas Tesfaye',
      email: 'yonas.tesfaye@example.com',
      phoneNumber: '+251934567890',
      password: 'Player123!',
      role: 'PLAYER'
    }
  ];

  for (const playerData of players) {
    // Check if player already exists
    const existing = await prisma.user.findUnique({
      where: { email: playerData.email }
    });

    if (existing) {
      console.log(`⏭️  Player ${playerData.email} already exists, skipping...`);
      continue;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(playerData.password, 10);

    // Create player
    const player = await prisma.user.create({
      data: {
        name: playerData.name,
        email: playerData.email,
        phoneNumber: playerData.phoneNumber,
        password: hashedPassword,
        role: playerData.role
      }
    });

    console.log(`✅ Created player: ${player.name} (${player.email})`);
  }

  console.log('✨ Seeding completed!');
  console.log('\n📋 Player Credentials:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  players.forEach(p => {
    console.log(`Email: ${p.email}`);
    console.log(`Password: ${p.password}`);
    console.log(`Phone: ${p.phoneNumber}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  });
}

main()
  .catch((e) => {
    console.error('❌ Error seeding players:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
