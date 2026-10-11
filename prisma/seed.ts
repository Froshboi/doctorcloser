import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  await prisma.appointment.deleteMany();
  await prisma.doctorSlot.deleteMany();
  await prisma.doctor.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.verificationToken.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("password123", 10);

  const user = await prisma.user.create({
    data: {
      name: "Demo Patient",
      email: "patient@example.com",
      phone: "+2348000000000",
      passwordHash,
    },
  });

  await prisma.doctor.createMany({
    data: [
      {
        name: "Dr. Amaka Chukwu",
        specialty: "General practice",
        clinicName: "Rumuola Family Clinic",
        city: "Port Harcourt",
        rating: 4.9,
        reviewCount: 312,
        price: 8000,
        initials: "AC",
        color: "#1F5C4A",
        bio: "Dr. Chukwu has run general practice at Rumuola Family Clinic for nine years, seeing everything from malaria and typhoid to routine checkups and referrals.",
      },
      {
        name: "Dr. Tunde Balogun",
        specialty: "Dentistry",
        clinicName: "Brightsmile Dental, GRA",
        city: "Port Harcourt",
        rating: 4.8,
        reviewCount: 201,
        price: 15000,
        initials: "TB",
        color: "#C85A24",
        bio: "Dr. Balogun trained in Lagos and now runs Brightsmile Dental in GRA, focused on fillings, extractions, and teeth whitening.",
      },
      {
        name: "Dr. Ngozi Eze",
        specialty: "OB-GYN",
        clinicName: "Wellwoman Clinic, Rumuokwuta",
        city: "Port Harcourt",
        rating: 5.0,
        reviewCount: 178,
        price: 12000,
        initials: "NE",
        color: "#8B5E3C",
        bio: "Dr. Eze specializes in prenatal care and women's health, with a focus on making first-time pregnancies feel less overwhelming.",
      },
    ],
  });

  const doctorRecords = await prisma.doctor.findMany({ orderBy: { createdAt: "asc" } });
  const start = new Date();

  for (const doctor of doctorRecords) {
    const slotStarts = [
      new Date(start.getTime() + 12 * 60 * 60 * 1000),
      new Date(start.getTime() + 24 * 60 * 60 * 1000 + 9 * 60 * 60 * 1000),
      new Date(start.getTime() + 24 * 60 * 60 * 1000 + 15 * 60 * 60 * 1000),
    ];

    for (const startsAt of slotStarts) {
      const endsAt = new Date(startsAt.getTime() + 30 * 60 * 1000);
      await prisma.doctorSlot.create({
        data: { doctorId: doctor.id, startsAt, endsAt },
      });
    }
  }

  const firstDoctor = doctorRecords[0];
  const firstSlot = await prisma.doctorSlot.findFirst({ where: { doctorId: firstDoctor.id } });

  if (firstSlot) {
    await prisma.appointment.create({
      data: {
        userId: user.id,
        doctorId: firstDoctor.id,
        slotId: firstSlot.id,
        status: "CONFIRMED",
      },
    });

    await prisma.doctorSlot.update({
      where: { id: firstSlot.id },
      data: { status: "BOOKED" },
    });
  }

  console.log(`Seeded ${doctorRecords.length} doctors, ${doctorRecords.length * 3} slots, and demo account ${user.email}.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
