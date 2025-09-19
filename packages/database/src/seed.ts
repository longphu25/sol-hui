import { prisma } from "./client"

// Wallet and group addresses used in seed data
const WALLET_ADDRESS_USER1 = '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM';
const WALLET_ADDRESS_USER2 = '8VzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWN';
const GROUP_ONCHAIN_ADDRESS = '9PZCzbuowY4pmsmJ4P6DAJm2jZVpxHbskKfpos3hVBo1';

async function main() {
  console.log('🌱 Starting database seed...')

  // Create sample users
  const user1 = await prisma.user.upsert({
    where: { walletAddress: WALLET_ADDRESS_USER1 },
    update: {},
    create: {
      walletAddress: WALLET_ADDRESS_USER1,
      name: 'John Doe',
      email: 'john@example.com',
      reputation: 100,
      isVerified: true,
    },
  })

  const user2 = await prisma.user.upsert({
    where: { walletAddress: '8VzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWN' },
    update: {},
    create: {
      walletAddress: '8VzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWN',
      name: 'Jane Smith',
      email: 'jane@example.com',
      reputation: 85,
      isVerified: true,
    },
  })

  // Create sample group
  const group = await prisma.group.upsert({
    where: { onChainAddress: '9PZCzbuowY4pmsmJ4P6DAJm2jZVpxHbskKfpos3hVBo1' },
    update: {},
    create: {
      onChainAddress: '9PZCzbuowY4pmsmJ4P6DAJm2jZVpxHbskKfpos3hVBo1',
      name: 'Monthly Savings Group',
      description: 'A group for monthly savings and investment',
      maxMembers: 10,
      contributionAmount: 100,
      roundDuration: 30,
      totalRounds: 10,
      status: 'CREATED',
      creatorId: user1.id,
    },
  })

  // Add members to group
  await prisma.groupMember.upsert({
    where: {
      groupId_userId: {
        groupId: group.id,
        userId: user1.id
      }
    },
    update: {},
    create: {
      groupId: group.id,
      userId: user1.id,
      status: 'ACTIVE',
      position: 1,
    },
  })

  await prisma.groupMember.upsert({
    where: {
      groupId_userId: {
        groupId: group.id,
        userId: user2.id
      }
    },
    update: {},
    create: {
      groupId: group.id,
      userId: user2.id,
      status: 'ACTIVE',
      position: 2,
    },
  })

  // Create sample settings
  await prisma.settings.upsert({
    where: { key: 'app_name' },
    update: {},
    create: {
      key: 'app_name',
      value: 'Sontine',
      type: 'string',
    },
  })

  await prisma.settings.upsert({
    where: { key: 'max_groups_per_user' },
    update: {},
    create: {
      key: 'max_groups_per_user',
      value: '5',
      type: 'number',
    },
  })

  console.log('✅ Database seeded successfully!')
  console.log(`👤 Created users: ${user1.name}, ${user2.name}`)
  console.log(`👥 Created group: ${group.name}`)
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
