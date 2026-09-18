import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
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
  // Optional: a product's price can be approved and on record without it
  // being purchasable yet — see `hidePriceUntilApproved` below and
  // CHIAREL_LAUNCH_PRICING_UPDATE.md. Not-yet-purchasable products are
  // skipped below, never seeded with a fabricated value.
  price?: { subscription: number; oneTime: number };
  // True when `price` is approved but withheld pending final formula,
  // package size, image, availability, and claims approval (currently N1).
  hidePriceUntilApproved?: boolean;
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
  const isSeedable = (p: SeedProduct): p is SeedProduct & { price: NonNullable<SeedProduct["price"]> } =>
    p.price != null && !p.hidePriceUntilApproved;
  const seedable = products.filter(isSeedable);
  const skipped = products.filter((p) => !isSeedable(p));
  if (skipped.length > 0) {
    console.log(
      `Skipping ${skipped.length} product(s) not yet purchasable (no price, or price withheld pending approval): ${skipped
        .map((p) => p.slug)
        .join(", ")}`
    );
  }

  for (const p of seedable) {
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

  console.log(`Seeded ${seedable.length} products.`);

  // Bootstraps the first Admin account so RBAC has someone to log in as, without
  // baking in a default email/password (predeploy-security-audit anti-pattern) —
  // this only creates an account when the operator explicitly sets both env vars.
  // See claudedocs/specs/admin-rbac/.
  const bootstrapEmail = process.env.BOOTSTRAP_ADMIN_EMAIL;
  const bootstrapPassword = process.env.BOOTSTRAP_ADMIN_PASSWORD;
  if (bootstrapEmail && bootstrapPassword) {
    await prisma.user.upsert({
      where: { email: bootstrapEmail },
      update: {},
      create: {
        email: bootstrapEmail,
        passwordHash: await bcrypt.hash(bootstrapPassword, 12),
        role: "ADMIN",
      },
    });
    console.log(`Bootstrapped Admin account: ${bootstrapEmail}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
