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
    .eq('status', 'ACTIVE')
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
            {/* Title */}
            <h1 className="text-2xl md:text-3xl font-bold text-[hsl(var(--color-card-foreground))] mb-4 leading-tight">
              Share Your Thoughts
            </h1>
            
            {/* Subtitle */}
            <p className="text-lg font-medium text-[hsl(var(--color-card-foreground))] mb-3">
              {displayTitle}
            </p>
            
            {/* Description */}
            <p className="text-sm text-[hsl(var(--color-muted-foreground))] mb-8 leading-relaxed">
              We'd love to hear your perspective through a brief conversation. 
              This will take about 5-10 minutes and you can pause anytime.
            </p>
            
            {/* Start Button */}
            <Button asChild size="lg" className="w-full md:w-auto shadow-lg hover:shadow-xl transition-all hover:scale-105">
              <Link href={`/s/${shortUrl}/conversation`}>
                Start Conversation
              </Link>
            </Button>
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
