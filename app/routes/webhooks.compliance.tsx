import type { ActionFunctionArgs } from "react-router";
import crypto from "crypto";
import prisma from "../db.server";

export async function action({ request }: ActionFunctionArgs) {
  const body = await request.text();
  const hmac = request.headers.get("x-shopify-hmac-sha256");
  const topic = request.headers.get("x-shopify-topic");

  // Verify HMAC signature
  const calculatedHmac = crypto
    .createHmac("sha256", process.env.SHOPIFY_API_SECRET || "")
    .update(body)
    .digest("base64");

  if (hmac !== calculatedHmac) {
    return new Response("Invalid HMAC", { status: 401 });
  }

  const payload = JSON.parse(body);
  const shop = payload.shop || payload.domain;

  if (!shop) {
    return new Response("Missing shop domain", { status: 400 });
  }

  // Handle different compliance topics
  switch (topic) {
    case "customers/data_request":
      // We store no customer data, just acknowledge
      break;

    case "customers/redact":
      // We store no customer data, just acknowledge
      break;

    case "shop/redact":
      // Delete all data for this shop
      await prisma.scan.deleteMany({ where: { shop } });
      await prisma.session.deleteMany({ where: { shop } });
      await prisma.alert.deleteMany({ where: { shop } });
      await prisma.shopSettings.deleteMany({ where: { shop } });
      console.log(`Deleted all data for ${shop} due to shop/redact`);
      break;

    default:
      return new Response("Unknown topic", { status: 400 });
  }

  return new Response("OK", { status: 200 });
}
