'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function ResumePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    async function resumeSession() {
      if (!token) {
        setError('Invalid resume link');
        setIsLoading(false);
        return;
      }
      
      try {
        const response = await fetch(`/api/conversations/${token}/resume`, {
          method: 'POST',
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to resume conversation');
        }
        
        const data = await response.json();
        
        if (data.success) {
          // Redirect to conversation page with token
          // The conversation page will need to handle resume state
          router.push(`/s/${window.location.pathname.split('/')[2]}/conversation?resume=${token}`);
        } else {
          throw new Error(data.error || 'Failed to resume conversation');
        }
      } catch (err: any) {
        console.error('Resume error:', err);
        setError(err.message || 'Failed to resume conversation');
        setIsLoading(false);
      }
    }
    
    resumeSession();
  }, [token, router]);
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="text-[14px] text-[#71717A]">Resuming conversation...</div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-[14px] text-[#DC2626] mb-4">{error}</p>
          <Link
            href="/"
            className="text-[14px] text-[#2563EB] hover:text-[#1D4ED8]"
          >
            Go to homepage
          </Link>
        </div>
      </div>
    );
  }
  
  return null;
}
