import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';
const prisma = new PrismaClient();

async function main() {

  

  const role = await prisma.role.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'Admin',
      permissions: {
        create: [
          {
            permission: {
              create: {
                action: 'manage',
                subject: 'all'
              }
            }
          }
        ]
      }
    },
  });

  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: await hash('adm1,', 10),
      lastName: 'Brousset',
      firstName: 'Leo',
      name: 'Leo Brousset',
      roles: {
        connect: {
          id: role.id
        }
      }
    },
  });

  //NOTIFICATIONS
  const alertStoreShipment = await prisma.alert.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'Suivi des livraisons',
      description: 'Notification lorsque les livraisons ne se sont pas traitées depuis un certain temps',
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
