const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');

const adapter = new PrismaBetterSqlite3({ url: 'file:./database.db' });
const prisma = new PrismaClient({ adapter });

async function seed() {
  try {
    let role = await prisma.role.findUnique({ where: { name: 'ADMIN' } });
    if (!role) {
      role = await prisma.role.create({
        data: {
          name: 'ADMIN',
          permissions: ['*']
        }
      });
    }

    const hashedPassword = await bcrypt.hash('password', 10);
    
    let user = await prisma.user.findUnique({ where: { email: 'admin@example.com' } });
    if (!user) {
      await prisma.user.create({
        data: {
          email: 'admin@example.com',
          name: 'Admin User',
          password: hashedPassword,
          roleId: role.id
        }
      });
      console.log("Admin user seeded!");
    } else {
      console.log("Admin user already exists!");
    }
  } catch (err) {
    console.error("Error seeding admin user:", err);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
