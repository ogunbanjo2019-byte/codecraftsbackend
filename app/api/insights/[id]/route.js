import { getPublic } from '@/lib/http/content';
export async function GET(_request, { params }) {
  const { id } = await params;
  return getPublic('blog_posts', id);
}
