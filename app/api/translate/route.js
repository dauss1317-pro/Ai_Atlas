import { NextResponse } from "next/server";
import { Translate } from "@google-cloud/translate/build/src/v2"; // use v2 API

const translate = new Translate({ key: process.env.GCLOUD_KEY}); // <- key, not keyFilename

export async function POST(req) {
  const { text, target } = await req.json();

  try {
    const [translation] = await translate.translate(text, target);
    return NextResponse.json({ translation });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Translation failed" }, { status: 500 });
  }
}
