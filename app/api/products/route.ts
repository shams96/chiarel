import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const products = await db.product.findMany({ orderBy: { ritualOrder: "asc" } });

  const shaped = products.map((p) => ({
    slug: p.slug,
    sku: p.sku,
    name: p.name,
    descriptor: p.descriptor,
    step: p.step,
    ritualOrder: p.ritualOrder,
    family: p.family,
    color: { name: p.colorName, hex: p.colorHex },
    complex: p.complex,
    line: p.line,
    size: p.size,
    price: { subscription: p.priceSub, oneTime: p.priceOneTime },
    image: p.image,
    blurb: p.blurb,
    role: p.role ?? undefined,
    badge: p.badge ?? undefined,
    set: p.isSet,
    icon: p.isIcon,
    actives: p.actives ? JSON.parse(p.actives as string) : undefined,
  }));

  return NextResponse.json(shaped);
}
