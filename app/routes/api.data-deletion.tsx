import type { ActionFunctionArgs } from "react-router";
import prisma from "../db.server";

export async function action({ request }: ActionFunctionArgs) {
  const body = await request.json();
  const { shop } = body;

  if (!shop) {
    return Response.json({ error: "Shop domain is required" }, { status: 400 });
  }

  try {
    // Delete all data for this shop
    // Prisma will cascade delete related records due to our schema relations
    await prisma.scan.deleteMany({
      where: { shop },
    });

    // Also delete sessions for this shop
    await prisma.session.deleteMany({
      where: { shop },
    });

    return Response.json({
      success: true,
      message: `All data for ${shop} has been deleted`,
    });
  } catch (error) {
    console.error("Data deletion error:", error);
    return Response.json(
      { error: "Failed to delete data" },
      { status: 500 }
    );
  }
}
