import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop, session, topic } = await authenticate.webhook(request);

  console.log(`Received ${topic} webhook for ${shop}`);

  // Delete all data for this shop when app is uninstalled
  // This includes scans, variant snapshots, findings, and sessions
  await prisma.scan.deleteMany({ where: { shop } });
  await prisma.session.deleteMany({ where: { shop } });

  console.log(`Deleted all data for ${shop}`);

  return new Response();
};
