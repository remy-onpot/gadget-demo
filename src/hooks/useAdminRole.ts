"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export type AdminRole = 'owner' | 'staff';

export function useAdminRole() {
  const [role, setRole] = useState<AdminRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function check() {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
         setRole(null);
         setLoading(false);
         return;
      }

      // 1. Check if they explicitly have a staff role
      // We assume the user is in the context of their "active" store (or first store)
      const { data: roleData } = await supabase
        .from('admin_roles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle(); // Use maybeSingle to avoid 406 errors if no row exists
      
      // 2. LOGIC: 
      // If they are in the 'admin_roles' table, use that role (e.g., 'staff').
      // If NOT, but they are logged in, assume they are the 'owner' (Store Creator).
      if (roleData) {
         setRole(roleData.role as AdminRole);
      } else {
         setRole('owner');
      }
      
      setLoading(false);
    }
    check();
  }, []);

  return { 
    role, 
    isOwner: role === 'owner',
    isStaff: role === 'staff',
    loading
  };
}