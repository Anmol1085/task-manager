import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('password123', 10);

  const alice = await prisma.user.upsert({
    where: { email: 'alice@example.com' },
    update: {},
    create: { email: 'alice@example.com', name: 'Alice', password }
  });

  const bob = await prisma.user.upsert({
    where: { email: 'bob@example.com' },
    update: {},
    create: { email: 'bob@example.com', name: 'Bob', password }
  });

  await prisma.task.upsert({
    where: { id: 'task-1' },
    update: {},
    create: {
      id: 'task-1',
      title: 'Welcome Task',
      description: 'This is a seeded task',
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24),
      priority: 'Medium',
      status: 'To_Do',
      creatorId: alice.id,
      assignedToId: bob.id
    }
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
