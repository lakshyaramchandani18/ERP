const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config({path: '.env.local'});
require('dotenv').config({path: '.env'});

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

console.log("Keys on prisma:", Object.keys(prisma).filter(k => !k.startsWith('_')));
console.log("Is prisma.loan defined?", typeof prisma.loan);
