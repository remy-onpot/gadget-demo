"use server";

import { createClient } from "@/lib/supabase-server";

export async function fetchTeamMembers(storeId: string) {
  const supabase = await createClient();
  
  try {
    // Fetch store_members
    const { data: members, error } = await supabase
      .from('store_members')
      .select('id, user_id, role, created_at')
      .eq('store_id', storeId)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    // Fetch profiles for all user_ids
    const userIds = (members || []).map(m => m.user_id);
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .in('id', userIds);
    
    // Create a map of profiles by id
    const profileMap = new Map((profiles || []).map(p => [p.id, p]));
    
    // Merge the data
    const membersWithDetails = (members || []).map(member => {
      const profile = profileMap.get(member.user_id);
      return {
        id: member.id,
        user_id: member.user_id,
        role: member.role,
        created_at: member.created_at,
        email: profile?.email || 'Unknown',
        full_name: profile?.full_name || null
      };
    });
    
    return { success: true, data: membersWithDetails };
  } catch (e) {
    console.error('Failed to fetch team members:', e);
    return { success: false, error: 'Failed to load team members' };
  }
}
