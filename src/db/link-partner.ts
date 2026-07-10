import { db } from "./index";
import { companyUsers, companies, users } from "./schema";
import { eq } from "drizzle-orm";

async function link() {
  const email = process.argv[2];
  const companyName = process.argv[3];

  if (!email || !companyName) {
    console.error('Usage: npm run db:link-partner -- "<email>" "<company name>"');
    process.exit(1);
  }

  const [user] = await db.select().from(users).where(eq(users.email, email));
  if (!user) throw new Error(`No user found with email ${email}`);

  const [company] = await db.select().from(companies).where(eq(companies.name, companyName));
  if (!company) throw new Error(`No company found named "${companyName}"`);

  await db.insert(companyUsers).values({
    userId: user.id,
    companyId: company.id,
    role: "owner",
  });

  console.log(`Linked ${email} as owner of ${companyName}`);
}

link()
  .then(() => {
    process.exitCode = 0;
  })
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  });