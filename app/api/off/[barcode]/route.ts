import { isValidBarcode, mapOffToFood, type OffProduct } from "../../../nutrition/_lib/off";

export const runtime = "nodejs";


const OFF_FIELDS =
  "code,product_name,product_name_it,brands,quantity,serving_size,image_front_small_url,nutriments,categories_tags";

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ barcode: string }> }
) {
  const { barcode } = await params;

  if (!isValidBarcode(barcode)) {
    return json({ error: "invalid_barcode" }, 400);
  }

  try {
    const res = await fetch(
      `https://world.openfoodfacts.org/api/v2/product/${barcode}.json?fields=${OFF_FIELDS}`,
      {
        headers: { "User-Agent": "FitnessApp/0.1 (fuocoluke@gmail.com)" },
        signal: AbortSignal.timeout(6000),
        next: { revalidate: 86400 },
      }as any
    );

    if (res.status === 404) {
      return json({ error: "not_found", barcode }, 404);
    }
    if (res.status === 429) {
      return json({ error: "rate_limited" }, 429);
    }
    if (!res.ok) {
      console.error("[off] upstream status", res.status);
      return json({ error: "upstream_error" }, 502);
    }

    const data = (await res.json()) as { status: number; product?: OffProduct };

    if (data.status === 0 || !data.product) {
      return json({ error: "not_found", barcode }, 404);
    }

    const food = mapOffToFood(data.product);
    return json({ food }, 200);
  } catch (err) {
    const isTimeout =
      err instanceof Error && (err.name === "AbortError" || err.name === "TimeoutError");
    if (isTimeout) {
      console.error("[off] timeout", barcode);
      return json({ error: "timeout" }, 504);
    }
    console.error("[off]", err);
    return json({ error: "upstream_error" }, 502);
  }
}
