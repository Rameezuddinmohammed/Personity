import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Database } from '@/types/supabase';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

type Survey = Database['public']['Tables']['Survey']['Row'];

interface PageProps {
  params: Promise<{
    shortUrl: string;
  }>;
}

async function getSurvey(shortUrl: string): Promise<Survey | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('Survey')
    .select('*')
    .eq('shortUrl', shortUrl)
    .single();
  
  if (error || !data) {
    return null;
  }
  
  return data;
}

export default async function SurveyLandingPage({ params }: PageProps) {
  const { shortUrl } = await params;
  const survey = await getSurvey(shortUrl);
  
  if (!survey) {
    notFound();
  }
  
  // Check if survey is paused or inactive
  const isPaused = survey.status === 'PAUSED';
  const isInactive = survey.status !== 'ACTIVE' && survey.status !== 'PAUSED';
  
  // Generate a friendly title from the objective
  const generateTitle = (objective: string): string => {
    // Extract the main topic from common patterns
    const patterns = [
      /I want to (?:understand|learn about|gather feedback on|explore) (.+?)(?:\.|$)/i,
      /(?:understand|learn about|gather feedback on|explore) (.+?)(?:\.|$)/i,
    ];
    
    for (const pattern of patterns) {
      const match = objective.match(pattern);
      if (match && match[1]) {
        // Capitalize first letter and clean up
        const topic = match[1].trim();
        return topic.charAt(0).toUpperCase() + topic.slice(1);
      }
    }
    
    // Fallback: use first sentence or first 60 chars
    const firstSentence = objective.split(/[.!?]/)[0];
    return firstSentence.length > 60 
      ? firstSentence.substring(0, 60) + '...'
      : firstSentence;
  };
  
  const displayTitle = generateTitle(survey.objective);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--color-background))] via-[hsl(var(--color-muted))] to-[hsl(var(--color-background))] flex flex-col">
      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-[640px] animate-scale-in">
          {/* Card */}
          <div className="bg-[hsl(var(--color-card))] border shadow-xl rounded-2xl p-8 md:p-12 hover:shadow-2xl transition-shadow duration-300">
            {isPaused ? (
              <>
                {/* Paused State */}
                <div className="text-center">
                  <div className="w-16 h-16 bg-orange-100 dark:bg-orange-950/30 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-orange-600 dark:text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h1 className="text-2xl md:text-3xl font-bold text-[hsl(var(--color-card-foreground))] mb-4">
                    Survey Temporarily Paused
                  </h1>
                  <p className="text-lg font-medium text-[hsl(var(--color-card-foreground))] mb-3">
                    {displayTitle}
                  </p>
                  <p className="text-sm text-[hsl(var(--color-muted-foreground))] mb-6 leading-relaxed">
                    This survey has been temporarily paused by the creator. Please check back later or contact them for more information.
                  </p>
                </div>
              </>
            ) : isInactive ? (
              <>
                {/* Inactive State */}
                <div className="text-center">
                  <div className="w-16 h-16 bg-neutral-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-neutral-400 dark:text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                  </div>
                  <h1 className="text-2xl md:text-3xl font-bold text-[hsl(var(--color-card-foreground))] mb-4">
                    Survey Not Available
                  </h1>
                  <p className="text-sm text-[hsl(var(--color-muted-foreground))] mb-6 leading-relaxed">
                    This survey is no longer accepting responses. Thank you for your interest.
                  </p>
                </div>
              </>
            ) : (
              <>
                {/* Active State */}
                <h1 className="text-2xl md:text-3xl font-bold text-[hsl(var(--color-card-foreground))] mb-4 leading-tight">
                  Share Your Thoughts
                </h1>
                
                <p className="text-lg font-medium text-[hsl(var(--color-card-foreground))] mb-3">
                  {displayTitle}
                </p>
                
                <p className="text-sm text-[hsl(var(--color-muted-foreground))] mb-8 leading-relaxed">
                  We'd love to hear your perspective through a brief conversation. 
                  This will take about 5-10 minutes and you can pause anytime.
                </p>
                
                <Button asChild size="lg" className="w-full md:w-auto shadow-lg hover:shadow-xl transition-all hover:scale-105">
                  <Link href={`/s/${shortUrl}/conversation`}>
                    Start Conversation
                  </Link>
                </Button>
              </>
            )}
          </div>
          
          {/* Branding */}
          <div className="mt-8 text-center animate-fade-in animate-delay-200">
            <Link
              href="/"
              className="text-sm text-[hsl(var(--color-muted-foreground))] hover:text-[hsl(var(--color-foreground))] transition-colors inline-flex items-center gap-1"
            >
              Powered by <span className="font-semibold text-[hsl(var(--color-primary))]">Personity</span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
