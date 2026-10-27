// Create an Admin account, or reset its password, in whichever database
// DATABASE_URL points at. Run from the operator's machine; see
// claudedocs/runbooks/admin-access.md.
//
//   BOOTSTRAP_ADMIN_EMAIL, BOOTSTRAP_ADMIN_PASSWORD (min 12 chars) come from the
//   environment, never argv (argv shows up in process listings and shell history).
//   The password is never printed. Existing sessions for the account are deleted
//   so a reset takes effect immediately.
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const email = process.env.BOOTSTRAP_ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.BOOTSTRAP_ADMIN_PASSWORD;
const url = process.env.DATABASE_URL;

if (!email || !password || !url) {
  console.error("Set DATABASE_URL, BOOTSTRAP_ADMIN_EMAIL and BOOTSTRAP_ADMIN_PASSWORD.");
  process.exit(1);
}
if (password.length < 12) {
  console.error("BOOTSTRAP_ADMIN_PASSWORD must be at least 12 characters.");
  process.exit(1);
}

const prisma = new PrismaClient();
try {
  console.log(`Target database host: ${new URL(url).host}`);
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.upsert({
    where: { email },
    update: { passwordHash, role: "ADMIN" },
    create: { email, passwordHash, role: "ADMIN" },
  });
  const revoked = await prisma.session.deleteMany({ where: { userId: user.id } });
  console.log(`Admin ready: ${user.email} (${revoked.count} old sessions revoked)`);
} finally {
  await prisma.$disconnect();
}
