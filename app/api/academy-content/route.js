import { getAcademyContent } from '@/lib/http/content';
export async function GET() {
  return getAcademyContent();
}
