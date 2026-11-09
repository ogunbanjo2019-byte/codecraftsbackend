import { listPublic } from '@/lib/http/content';
export async function GET(req) {
  const u = new URL(req.url);
  return listPublic('portfolio_projects', {
    page: u.searchParams.get('page'),
    limit: u.searchParams.get('limit'),
    category: u.searchParams.get('category'),
  });
}
