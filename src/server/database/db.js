/**
 * Database Query Interface
 * Simple SQL-like query interface that wraps Supabase
 * Note: This is a minimal stub implementation for compatibility
 */

import { supabase } from '../utils/db.js';

/**
 * Execute a SQL query
 * This is a stub implementation for compatibility with legacy code.
 * New code should use Supabase's query builder directly.
 */
async function query(sql, params = []) {
  if (!supabase) {
    console.warn('[DB] Database not available');
    return [];
  }

  try {
    // This is a stub implementation - raw SQL queries are not supported with Supabase
    // Legacy code using this should be migrated to use Supabase's query builder
    console.warn('[DB] query() is a stub - raw SQL not supported. Please use Supabase query builder.');
    console.warn('[DB] Query attempted:', sql.substring(0, 100));
    return [];
  } catch (error) {
    console.error('[DB] Query error:', error);
    throw error;
  }
}

export default { query };
