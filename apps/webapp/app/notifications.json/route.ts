import { NextResponse } from "next/server";
import { GitHubContentService } from "@/lib/github";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const github = new GitHubContentService();
    const content = await github.getFileContent("notifications.json");
    const notifications = JSON.parse(content);
    return NextResponse.json(notifications, {
      headers: {
        "Cache-Control": "public, max-age=60, s-maxage=60",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch {
    return NextResponse.json([], {
      headers: { "Access-Control-Allow-Origin": "*" },
    });
  }
}
