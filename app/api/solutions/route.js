import { listPublic } from '@/lib/http/content';
export async function GET() {
  return listPublic('solutions');
}
