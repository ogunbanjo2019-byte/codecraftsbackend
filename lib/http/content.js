import { firestore } from '@/lib/firebase/admin';
import { ok, fail } from './responses';

const CONFIG = {
  portfolio_projects: { status: 'published' },
  blog_posts: { status: 'published' },
  careers: { status: 'active' },
  testimonials: { status: 'approved' },
  team_members: { visible: true },
  services: { visible: true },
  solutions: { visible: true },
};

function isPublished(row, collection) {
  const config = CONFIG[collection] || {};
  if (config.status && row.status !== config.status) return false;
  if (
    config.visible &&
    row.is_visible !== true &&
    row.is_active !== true &&
    row.visible !== true
  )
    return false;
  if (
    collection === 'blog_posts' &&
    row.published_at &&
    new Date(row.published_at) > new Date()
  )
    return false;
  return true;
}
function categoryInfo(row) {
  const value = row.category;
  if (value && typeof value === 'object') return value;
  return value
    ? {
        name: String(value),
        slug: String(value)
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, ''),
      }
    : null;
}
function normalize(row, collection) {
  const result = { ...row };
  if (collection === 'blog_posts') {
    result.category = categoryInfo(row);
    result.author =
      row.author ||
      row.author_name ||
      (row.author_full_name ? { full_name: row.author_full_name } : undefined);
  }
  if (collection === 'portfolio_projects') {
    result.title = row.title || row.name;
    result.name = row.name || row.title;
  }
  return result;
}

export async function listPublic(collection, query = {}) {
  try {
    const snapshot = await firestore().collection(collection).get();
    let rows = snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter((row) => isPublished(row, collection));
    if (query.category) {
      const requested = String(query.category).toLowerCase();
      rows = rows.filter((row) => {
        const category = categoryInfo(row);
        return [category?.slug, category?.name, row.category_id].some(
          (value) => String(value || '').toLowerCase() === requested,
        );
      });
    }
    rows.sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(query.limit, 10) || 20));
    const categories = [
      ...new Map(
        rows
          .map(categoryInfo)
          .filter(Boolean)
          .map((category) => [category.slug || category.name, category]),
      ).values(),
    ];
    const items = rows
      .slice((page - 1) * limit, page * limit)
      .map((row) => normalize(row, collection));
    return ok({
      items,
      pagination: {
        page,
        limit,
        total: rows.length,
        total_pages: Math.ceil(rows.length / limit),
      },
      ...(categories.length ? { categories } : {}),
    });
  } catch (error) {
    console.error(
      'Firebase content query failed',
      error.code || 'configuration',
    );
    return fail('Unable to load content', 503);
  }
}

export async function getPublic(collection, slugOrId) {
  try {
    const db = firestore();
    const direct = await db.collection(collection).doc(slugOrId).get();
    let found = direct.exists ? { id: direct.id, ...direct.data() } : null;
    if (!found) {
      const snapshot = await db
        .collection(collection)
        .where('slug', '==', slugOrId)
        .limit(1)
        .get();
      if (!snapshot.empty)
        found = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
    }
    if (!found || !isPublished(found, collection))
      return fail('Content not found', 404);
    return ok(normalize(found, collection));
  } catch (error) {
    console.error(
      'Firebase detail query failed',
      error.code || 'configuration',
    );
    return fail('Unable to load content', 503);
  }
}

export async function getSettings() {
  try {
    const snapshot = await firestore().collection('site_settings').get();
    const rows = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    const settings = {};
    for (const row of rows) {
      if (row.section && row.setting_key) {
        settings[row.section] ||= {};
        settings[row.section][row.setting_key] = row.setting_value;
      } else if (row.id && row.setting_value !== undefined)
        settings[row.id] = row.setting_value;
    }
    for (const key of ['navigation_items', 'social_links', 'seo_metadata']) {
      const match = rows.find(
        (row) => row.id === key || row.setting_key === key,
      );
      if (!Array.isArray(settings[key]) && Array.isArray(match?.setting_value))
        settings[key] = match.setting_value;
    }
    return ok(settings);
  } catch (error) {
    console.error(
      'Firebase settings query failed',
      error.code || 'configuration',
    );
    return fail('Unable to load settings', 503);
  }
}

export async function getAcademyContent() {
  try {
    const db = firestore();
    const doc = await db.collection('academy_content').doc('public').get();
    if (doc.exists) return ok(doc.data());
    const snapshot = await db
      .collection('academy_content')
      .where('is_visible', '==', true)
      .limit(1)
      .get();
    return snapshot.empty ? ok({}) : ok(snapshot.docs[0].data());
  } catch (error) {
    console.error(
      'Firebase academy query failed',
      error.code || 'configuration',
    );
    return fail('Unable to load academy content', 503);
  }
}
