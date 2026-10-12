import type { Variant } from "./types";

export async function fetchVariants(admin: any): Promise<Variant[]> {
  const variants: Variant[] = [];
  let hasNextPage = true;
  let cursor: string | null = null;

  // Fetch all products with pagination
  while (hasNextPage) {
    const response = await admin.graphql(
      `#graphql
        query ($cursor: String) {
          products(first: 50, after: $cursor, query: "status:active AND gift_card:false") {
            edges {
              cursor
              node {
                id
                title
                variants(first: 50) {
                  edges {
                    node {
                      id
                      title
                      sku
                      inventoryItem {
                        tracked
                        inventoryLevels(first: 50) {
                          edges {
                            node {
                              quantities(names: ["available"]) {
                                name
                                quantity
                              }
                            }
                          }
                        }
                      }
                      inventoryPolicy
                    }
                  }
                }
              }
            }
            pageInfo {
              hasNextPage
              endCursor
            }
          }
        }
      `,
      {
        variables: { cursor },
      },
    );

    const responseJson = await response.json();
    const data = responseJson.data?.products;

    if (!data) {
      break;
    }

    // Process each product
    for (const productEdge of data.edges) {
      const product = productEdge.node;

      // Process each variant
      for (const variantEdge of product.variants.edges) {
        const variant = variantEdge.node;

        // Calculate total available across all locations
        let totalAvailable = 0;
        if (variant.inventoryItem?.inventoryLevels?.edges) {
          for (const levelEdge of variant.inventoryItem.inventoryLevels.edges) {
            const level = levelEdge.node;
            if (level.quantities) {
              const availableQuantity = level.quantities.find(
                (q: any) => q.name === "available"
              );
              if (availableQuantity) {
                totalAvailable += availableQuantity.quantity;
              }
            }
          }
        }

        // Map to Variant type
        variants.push({
          variantId: variant.id,
          productId: product.id,
          productTitle: product.title,
          variantTitle: variant.title,
          sku: variant.sku || null,
          tracked: variant.inventoryItem?.tracked || false,
          sellWhenEmpty: variant.inventoryPolicy === "CONTINUE",
          available: totalAvailable,
          soldLast30Days: 0, // Will be filled in from order data
        });
      }
    }

    // Check if there are more pages
    hasNextPage = data.pageInfo.hasNextPage;
    cursor = data.pageInfo.endCursor;
  }

  // Fetch orders from the last 30 days to calculate soldLast30Days
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const dateFilter = thirtyDaysAgo.toISOString().split('T')[0]; // Format: YYYY-MM-DD

    const salesByVariant = new Map<string, number>();
    hasNextPage = true;
    cursor = null;

    while (hasNextPage) {
      const queryStr = `#graphql
        query ($cursor: String) {
          orders(first: 50, after: $cursor, query: "created_at:>${dateFilter}") {
            edges {
              cursor
              node {
                lineItems(first: 50) {
                  edges {
                    node {
                      variant {
                        id
                      }
                      quantity
                    }
                  }
                }
              }
            }
            pageInfo {
              hasNextPage
              endCursor
            }
          }
        }
      `;

      const orderResponse = await admin.graphql(queryStr, {
        variables: { cursor },
      });

      const orderResponseJson = await orderResponse.json();
      const orderData = orderResponseJson.data?.orders;

      if (!orderData) {
        break;
      }

      // Process each order
      for (const orderEdge of orderData.edges) {
        const order = orderEdge.node;

        // Process each line item
        for (const lineItemEdge of order.lineItems.edges) {
          const lineItem = lineItemEdge.node;

          if (lineItem.variant?.id) {
            const currentQuantity = salesByVariant.get(lineItem.variant.id) || 0;
            salesByVariant.set(lineItem.variant.id, currentQuantity + lineItem.quantity);
          }
        }
      }

      // Check if there are more pages
      hasNextPage = orderData.pageInfo.hasNextPage;
      cursor = orderData.pageInfo.endCursor;
    }

    // Update soldLast30Days for each variant
    for (const variant of variants) {
      variant.soldLast30Days = salesByVariant.get(variant.variantId) || 0;
    }
  } catch (error) {
    // If orders query fails (e.g., scope not approved), set soldLast30Days to 0
    for (const variant of variants) {
      variant.soldLast30Days = 0;
    }
  }

  return variants;
}
