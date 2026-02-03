"use server";

import { createClient } from "@supabase/supabase-js"; // Use Admin Client for file upload permission
import { redirect } from "next/navigation";

// Service Role needed for storage upload without auth session
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// Max file size: 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export async function submitApplicationOnly(formData: FormData) {
  // 1. Extract Data
  const legalName = formData.get("legalName") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  
  // We don't create the account yet, but we can store their 'desired' password 
  // if you want to auto-set it later, OR just ignore it and generate one yourself.
  // For security, let's ignore the password field here and generate one upon approval.
  
  const governmentId = formData.get("governmentId") as string;
  const digitalAddress = formData.get("digitalAddress") as string;
  const physicalAddress = formData.get("physicalAddress") as string;
  const idFile = formData.get("idDocument") as File;
  
  const storeName = formData.get("storeName") as string;
  const storeSlug = formData.get("storeSlug") as string;
  const planId = formData.get("planId") as string;

  // 2. Validate
  if (!email || !legalName || !idFile) return { error: "Missing required fields." };

  // 2a. Validate file size (5MB max)
  if (idFile.size > MAX_FILE_SIZE) {
    return { error: "ID document must be less than 5MB." };
  }

  // 2b. Validate file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
  if (!allowedTypes.includes(idFile.type)) {
    return { error: "Invalid file type. Please upload JPG, PNG, or PDF." };
  }

  // 2c. Check if email already has a pending application
  const { data: existingApp } = await supabaseAdmin
    .from('onboarding_applications')
    .select('id')
    .eq('email', email)
    .eq('status', 'pending')
    .single();
  
  if (existingApp) {
    return { error: "You already have a pending application. Please wait for review." };
  }

  // 3. Upload ID Document to a "Temp/Pending" path
  // Since we don't have a userId yet, we use the email or a random ID as the folder
  const tempId = crypto.randomUUID(); 
  const fileExt = idFile.name.split('.').pop();
  const filePath = `pending/${tempId}.${fileExt}`;

  const { error: uploadError } = await supabaseAdmin.storage
    .from('kyc-documents')
    .upload(filePath, idFile, { contentType: idFile.type });

  if (uploadError) return { error: "Document upload failed." };

  // 4. Save Application to 'Holding Tank'
  const { error: dbError } = await supabaseAdmin
    .from('onboarding_applications')
    .insert({
      // We DO NOT set 'user_id' yet because the user doesn't exist.
      // Make sure your table column 'user_id' is nullable, 
      // OR remove the foreign key constraint for this column.
      email: email, // Store email directly in the table
      legal_name: legalName,
      phone: phone,
      
      digital_address: digitalAddress,
      physical_address: physicalAddress,
      id_card_url: filePath,
      
      business_name: storeName,
      business_slug: storeSlug,
      plan_id: planId,
      status: 'pending'
    });

  if (dbError) {
    console.error(dbError);
    return { error: "Application Error. Please try again." };
  }

  // 5. Success -> Redirect to a "Thank You" page (No login state)
  return { success: true };
}

export async function checkSlug(slug: string) {
    const { data } = await supabaseAdmin.from('stores').select('id').eq('slug', slug).single();
    // Also check pending applications so two people don't ask for 'nike'
    const { data: app } = await supabaseAdmin.from('onboarding_applications').select('id').eq('business_slug', slug).single();
    return { available: !data && !app };
}