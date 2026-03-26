import { NextRequest, NextResponse } from 'next/server';

const VISION_API_URL = 'https://vision.googleapis.com/v1/images:annotate';

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, mediaType } = await req.json();

    if (!imageBase64 || !mediaType) {
      console.error('[ocr] missing imageBase64 or mediaType');
      return NextResponse.json({ error: '画像データが必要です' }, { status: 400 });
    }

    console.log(`[ocr] received image: mediaType=${mediaType}, base64Length=${imageBase64.length}`);

    const apiKey = process.env.GOOGLE_CLOUD_API_KEY;
    if (!apiKey || apiKey === 'your_google_cloud_api_key_here') {
      console.error('[ocr] GOOGLE_CLOUD_API_KEY is not set');
      return NextResponse.json(
        { error: 'Google Cloud APIキーが設定されていません', detail: 'GOOGLE_CLOUD_API_KEY env var is missing' },
        { status: 500 },
      );
    }

    console.log('[ocr] calling Vision API...');
    const visionRes = await fetch(`${VISION_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requests: [
          {
            image: { content: imageBase64 },
            features: [{ type: 'DOCUMENT_TEXT_DETECTION' }],
          },
        ],
      }),
    });

    if (!visionRes.ok) {
      const err = await visionRes.json();
      console.error(`[ocr] Vision API error: status=${visionRes.status}`, JSON.stringify(err));
      const detail = err?.error?.message ?? JSON.stringify(err);
      return NextResponse.json(
        { error: `OCR処理に失敗しました (HTTP ${visionRes.status})`, detail },
        { status: 500 },
      );
    }

    const visionData = await visionRes.json();
    const fullText: string = visionData.responses?.[0]?.fullTextAnnotation?.text ?? '';
    console.log(`[ocr] Vision API success, extracted text length=${fullText.length}`);

    if (!fullText) {
      console.warn('[ocr] No text detected in image');
      return NextResponse.json(
        { error: 'テキストを検出できませんでした' },
        { status: 422 },
      );
    }

    const result = parseBusinessCardText(fullText);
    console.log('[ocr] parse result:', JSON.stringify(result));
    return NextResponse.json(result);
  } catch (error) {
    console.error('[ocr] unexpected error:', error);
    return NextResponse.json(
      { error: 'OCR処理中にエラーが発生しました', detail: String(error) },
      { status: 500 },
    );
  }
}

interface OcrResult {
  name?: string | null;
  company?: string | null;
  department?: string | null;
  title?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  website?: string | null;
}

function parseBusinessCardText(fullText: string): OcrResult {
  const result: OcrResult = {};
  const lines = fullText
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  // --- Email ---
  const emailMatch = fullText.match(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/);
  if (emailMatch) result.email = emailMatch[0];

  // --- Website ---
  const urlMatch = fullText.match(/https?:\/\/[^\s\u3000-\u9FFF、。]+|www\.[^\s\u3000-\u9FFF、。]+/);
  if (urlMatch) result.website = urlMatch[0].replace(/[、。,]$/, '');

  // --- Phone (Japanese format) ---
  const phoneMatch = fullText.match(
    /(?:Tel|TEL|電話|携帯|Mobile)?[\s:：]*([0-9０-９]{2,4}[-\-・ ][0-9０-９]{2,4}[-\-・ ][0-9０-９]{3,4})/,
  );
  if (phoneMatch) result.phone = phoneMatch[1].replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xFEE0));

  // --- Address (postal code or prefecture name) ---
  const addressLineIdx = lines.findIndex((l) =>
    /〒?\d{3}-\d{4}/.test(l) ||
    /(東京都|大阪府|京都府|北海道|神奈川県|愛知県|福岡県|.{2,3}県|.{2,3}市|.{2,3}区)/.test(l),
  );
  if (addressLineIdx !== -1) {
    const nextLine = lines[addressLineIdx + 1];
    result.address =
      nextLine && !/[a-zA-Z@]/.test(nextLine) && nextLine.length < 50
        ? `${lines[addressLineIdx]} ${nextLine}`.trim()
        : lines[addressLineIdx];
  }

  // --- Build candidate lines (exclude already detected values) ---
  const usedTexts = [result.email, result.website, result.phone].filter(Boolean) as string[];
  const candidates = lines.filter((l) => {
    if (usedTexts.some((v) => l.includes(v.slice(0, 6)))) return false;
    if (/^(Tel|TEL|FAX|Fax|http|www|〒|\d{3}-\d{4}|[0-9]{2,4}[-・])/.test(l)) return false;
    return true;
  });

  // --- Company ---
  const companyRe = /株式会社|有限会社|合同会社|一般社団法人|公益財団法人|Co\.|Ltd\.|Inc\.|Corp\.|LLC/i;
  const companyIdx = candidates.findIndex((l) => companyRe.test(l));
  if (companyIdx !== -1) {
    result.company = candidates[companyIdx];
    candidates.splice(companyIdx, 1);
  }

  // --- Department ---
  const deptRe = /部$|局$|室$|課$|グループ$|チーム$|センター$|Division|Department/i;
  const deptIdx = candidates.findIndex((l) => deptRe.test(l));
  if (deptIdx !== -1) {
    result.department = candidates[deptIdx];
    candidates.splice(deptIdx, 1);
  }

  // --- Title ---
  const titleRe =
    /代表取締役|取締役|社長|副社長|専務|常務|部長|課長|係長|主任|マネージャー|リーダー|Director|Manager|President|CEO|CTO|CFO|COO|Engineer|エンジニア|営業|開発|Designer|デザイナー/i;
  const titleIdx = candidates.findIndex((l) => titleRe.test(l));
  if (titleIdx !== -1) {
    result.title = candidates[titleIdx];
    candidates.splice(titleIdx, 1);
  }

  // --- Name ---
  // Prefer a short Japanese-character-only line, or a Western name pattern
  const jaNameRe = /^[\u4E00-\u9FFF\u3040-\u309F\u30A0-\u30FF]{2,8}$/;
  const enNameRe = /^[A-Z][a-z]+([\s\u00C0-\u024F][A-Z][a-z]+)+$/;
  const nameIdx = candidates.findIndex((l) => jaNameRe.test(l) || enNameRe.test(l));
  if (nameIdx !== -1) {
    result.name = candidates[nameIdx];
  } else if (candidates.length > 0) {
    // Fall back to shortest remaining line (likely a name)
    result.name = candidates.sort((a, b) => a.length - b.length)[0];
  }

  return result;
}
