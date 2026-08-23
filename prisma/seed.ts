import { PrismaClient } from "@prisma/client";
import data from "../data/products.json";

const prisma = new PrismaClient();

type SeedProduct = {
  slug: string;
  sku: string;
  name: string;
  descriptor: string;
  step: string;
  ritualOrder: number | null;
  family: string;
  color: { name: string; hex: string };
  complex: string;
  line: string;
  size: string;
  price: { subscription: number; oneTime: number };
  image: string;
  blurb: string;
  role?: string;
  badge?: string;
  set?: boolean;
  icon: boolean;
  actives?: { name: string; percent: string | null }[];
};

async function main() {
  const products = data as SeedProduct[];

  for (const p of products) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        sku: p.sku,
        name: p.name,
        descriptor: p.descriptor,
        step: p.step,
        ritualOrder: p.ritualOrder,
        family: p.family,
        colorName: p.color.name,
        colorHex: p.color.hex,
        complex: p.complex,
        line: p.line,
        size: p.size,
        priceSub: p.price.subscription,
        priceOneTime: p.price.oneTime,
        image: p.image,
        blurb: p.blurb,
        role: p.role ?? null,
        badge: p.badge ?? null,
        isSet: p.set ?? false,
        isIcon: p.icon,
        actives: p.actives ? JSON.stringify(p.actives) : undefined,
      },
      create: {
        slug: p.slug,
        sku: p.sku,
        name: p.name,
        descriptor: p.descriptor,
        step: p.step,
        ritualOrder: p.ritualOrder,
        family: p.family,
        colorName: p.color.name,
        colorHex: p.color.hex,
        complex: p.complex,
        line: p.line,
        size: p.size,
        priceSub: p.price.subscription,
        priceOneTime: p.price.oneTime,
        image: p.image,
        blurb: p.blurb,
        role: p.role ?? null,
        badge: p.badge ?? null,
        isSet: p.set ?? false,
        isIcon: p.icon,
        actives: p.actives ? JSON.stringify(p.actives) : undefined,
      },
    });
  }

  console.log(`Seeded ${products.length} products.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
