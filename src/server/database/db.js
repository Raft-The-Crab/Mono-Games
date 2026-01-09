/**
 * Database Query Interface
 * Simple SQL-like query interface that wraps Supabase
 */

import { supabase } from '../utils/db.js';

/**
 * Execute a SQL query
 * This is a minimal implementation for compatibility
 */
async function query(sql, params = []) {
  if (!supabase) {
    console.warn('[DB] Database not available');
    return [];
  }

  try {
    // This is a simplified implementation
    // In production, you'd want proper SQL parsing or use Supabase's query builder
    console.warn('[DB] Raw SQL queries not fully supported with Supabase');
    return [];
  } catch (error) {
    console.error('[DB] Query error:', error);
    throw error;
  }
}

export default { query };
