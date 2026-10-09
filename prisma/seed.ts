import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not configured.");
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  await prisma.project.upsert({
    where: {
      id: 1,
    },
    update: {
      title: "CampusFlow",
      category: "EDUCATION • SAAS • AI",
      status: "IN DEVELOPMENT",
      description:
        "An AI-powered education platform being designed to bring schools, coaching centers, teachers, students, parents, and administrators into one connected ecosystem — combining academics, attendance, fees, communication, admissions, analytics, and intelligent learning tools.",
      tags: "Next.js,React,AI & GenAI,Database",
      featured: true,
    },
    create: {
      title: "CampusFlow",
      category: "EDUCATION • SAAS • AI",
      status: "IN DEVELOPMENT",
      description:
        "An AI-powered education platform being designed to bring schools, coaching centers, teachers, students, parents, and administrators into one connected ecosystem — combining academics, attendance, fees, communication, admissions, analytics, and intelligent learning tools.",
      tags: "Next.js,React,AI & GenAI,Database",
      featured: true,
    },
  });

  console.log("CampusFlow seeded successfully.");

  await prisma.project.upsert({
    where: {
      id: 2,
    },
    update: {
      title: "Coming Soon",
      category: "FUTURE PROJECT",
      status: "EXPLORING",
      description:
        "The next project will appear here as I turn another idea into a real-world product.",
      tags: "Ideas,Experiments,Building",
      featured: false,
    },
    create: {
      id: 2,
      title: "Coming Soon",
      category: "FUTURE PROJECT",
      status: "EXPLORING",
      description:
        "The next project will appear here as I turn another idea into a real-world product.",
      tags: "Ideas,Experiments,Building",
      featured: false,
    },
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
