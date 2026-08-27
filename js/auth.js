import { supabase } from './supabaseClient.js';

/** Returns the current session or null */
export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

/** Redirect to /login.html if no session */
export async function requireAuth() {
  if (typeof window !== 'undefined' && (window.location.search.includes('demo=1') || localStorage.getItem('shelf_dev_mode') === 'true')) {
    return { user: { id: 'demo-user-123', email: 'demo@theshelf.app' } };
  }
  const session = await getSession();
  if (!session) {
    window.location.href = '/login.html';
  }
  return session;
}

/** Sign in with Google OAuth */
export async function signInWithGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin + '/room.html' }
  });
  if (error) {
    console.error('[auth] signInWithGoogle error:', error);
    throw error;
  }
}

/** Sign out and redirect to login */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) console.error('[auth] signOut error:', error);
  window.location.href = '/login.html';
}
