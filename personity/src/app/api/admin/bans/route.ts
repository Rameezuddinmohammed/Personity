/**
 * IP Ban Management API
 * 
 * Admin endpoints for managing IP bans
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { banIP, unbanIP, getBannedIPs } from '@/lib/fraud/ip-banning';
import { z } from 'zod';

const banSchema = z.object({
  ipAddress: z.string().min(7).max(45), // IPv4 or IPv6
  reason: z.string().min(1).max(500),
  durationDays: z.number().int().positive().optional(),
});

const unbanSchema = z.object({
  ipAddress: z.string().min(7).max(45),
});

/**
 * GET /api/admin/bans
 * Get all banned IPs
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check if user is authenticated (basic auth check)
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get all banned IPs
    const bannedIPs = await getBannedIPs();
    
    return NextResponse.json({
      success: true,
      data: bannedIPs,
    });
  } catch (error) {
    console.error('Error fetching banned IPs:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/bans
 * Ban an IP address
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Validate request body
    const body = await request.json();
    const validation = banSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.issues },
        { status: 400 }
      );
    }
    
    const { ipAddress, reason, durationDays } = validation.data;
    
    // Ban the IP
    const result = await banIP(ipAddress, reason, durationDays || null);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error('Error banning IP:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/bans
 * Unban an IP address
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Validate request body
    const body = await request.json();
    const validation = unbanSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.issues },
        { status: 400 }
      );
    }
    
    const { ipAddress } = validation.data;
    
    // Unban the IP
    const result = await unbanIP(ipAddress);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error('Error unbanning IP:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
