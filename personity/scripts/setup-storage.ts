/**
 * Setup Supabase Storage Bucket for Exports
 * 
 * Run this script once to create the "exports" bucket
 * Usage: npx tsx scripts/setup-storage.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupStorage() {
  console.log('Setting up Supabase Storage...');

  // Check if bucket exists
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();

  if (listError) {
    console.error('Error listing buckets:', listError);
    process.exit(1);
  }

  const exportsBucket = buckets?.find((b) => b.name === 'exports');

  if (exportsBucket) {
    console.log('✓ Bucket "exports" already exists');
  } else {
    // Create bucket
    const { data, error } = await supabase.storage.createBucket('exports', {
      public: false, // Private bucket - requires signed URLs
      fileSizeLimit: 10485760, // 10MB limit per file
      allowedMimeTypes: ['application/pdf', 'text/csv'],
    });

    if (error) {
      console.error('Error creating bucket:', error);
      process.exit(1);
    }

    console.log('✓ Created bucket "exports"');
  }

  console.log('\nStorage setup complete!');
  console.log('Bucket: exports');
  console.log('Access: Private (signed URLs only)');
  console.log('File size limit: 10MB');
  console.log('Allowed types: PDF, CSV');
}

setupStorage();
