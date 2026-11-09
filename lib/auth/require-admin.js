import { cookies } from 'next/headers';
import { firebaseAuth, firestore } from '@/lib/firebase/admin';
export class AuthError extends Error {
  constructor(status) {
    super(status === 401 ? 'Authentication required' : 'Permission denied');
    this.status = status;
  }
}
export async function requireAdmin(permission) {
  const token = (await cookies()).get('__session')?.value;
  if (!token) throw new AuthError(401);
  let decoded;
  try {
    decoded = await firebaseAuth().verifySessionCookie(token, true);
  } catch {
    throw new AuthError(401);
  }
  const admin = await firestore()
    .collection('admin_users')
    .doc(decoded.uid)
    .get();
  if (!admin.exists || admin.get('status') !== 'active')
    throw new AuthError(403);
  const role = admin.get('role');
  if (role === 'Super Admin') return { user: decoded };
  const permissions = admin.get('permissions') || [];
  if (!permissions.includes(permission)) throw new AuthError(403);
  return { user: decoded };
}
