import { getSettings } from '@/lib/http/content';
export async function GET() {
  return getSettings();
}
