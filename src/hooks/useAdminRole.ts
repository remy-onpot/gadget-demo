"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

// 1. Define the specific role type
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

      // Fetch role from DB
      const { data, error } = await supabase
        .from('admin_roles')
        .select('role')
        .eq('id', user.id)
        .single();
      
      // 2. SECURITY FIX: Fail Closed
      // If error or no data, access is DENIED (null), not granted.
      if (error || !data) {
         console.warn("User has no admin role assigned.");
         setRole(null);
      } else {
         // 3. TYPE FIX: Cast to specific string union
         setRole(data.role as AdminRole); 
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