import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createNotification } from "@/lib/notifications";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauth" }, { status: 401 });

  const { assetType, count, title } = (await req.json()) as {
    assetType?: string;
    count?: number;
    title?: string;
  };

  if (typeof count !== "number" || count < 1) {
    return NextResponse.json({ ok: true });
  }

  await createNotification({
    userId: user.id,
    variant: "post",
    category: "asset",
    title: `${count} assets enviados`,
    description: `Em ${title ?? assetType}`,
    actionUrl: `/assets/${assetType}`,
    entityType: "asset-batch",
    metadata: { assetType, count },
  });

  return NextResponse.json({ ok: true });
}
