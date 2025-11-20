export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      AggregateAnalysis: {
        Row: {
          createdAt: string
          executiveSummary: string
          id: string
          responseCount: number
          surveyId: string
          topThemes: Json
          userSegments: Json | null
        }
        Insert: {
          createdAt?: string
          executiveSummary: string
          id?: string
          responseCount: number
          surveyId: string
          topThemes: Json
          userSegments?: Json | null
        }
        Update: {
          createdAt?: string
          executiveSummary?: string
          id?: string
          responseCount?: number
          surveyId?: string
          topThemes?: Json
          userSegments?: Json | null
        }
      }
      ApiUsage: {
        Row: {
          context: string | null
          cost: number
          createdAt: string
          id: string
          model: string
          provider: string
          tokensInput: number
          tokensOutput: number
        }
        Insert: {
          context?: string | null
          cost: number
          createdAt?: string
          id?: string
          model: string
          provider: string
          tokensInput: number
          tokensOutput: number
        }
        Update: {
          context?: string | null
          cost?: number
          createdAt?: string
          id?: string
          model?: string
          provider?: string
          tokensInput?: number
          tokensOutput?: number
        }
      }
      BannedIp: {
        Row: {
          bannedAt: string
          expiresAt: string | null
          id: string
          ipAddress: string
          reason: string | null
        }
        Insert: {
          bannedAt?: string
          expiresAt?: string | null
          id?: string
          ipAddress: string
          reason?: string | null
        }
        Update: {
          bannedAt?: string
          expiresAt?: string | null
          id?: string
          ipAddress?: string
          reason?: string | null
        }
      }
      Conversation: {
        Row: {
          createdAt: string
          durationSeconds: number
          exchanges: Json
          id: string
          sessionId: string
          tokenUsage: Json
        }
        Insert: {
          createdAt?: string
          durationSeconds: number
          exchanges: Json
          id?: string
          sessionId: string
          tokenUsage: Json
        }
        Update: {
          createdAt?: string
          durationSeconds?: number
          exchanges?: Json
          id?: string
          sessionId?: string
          tokenUsage?: Json
        }
      }
      ConversationSession: {
        Row: {
          completedAt: string | null
          countryCode: string | null
          currentState: Json
          id: string
          ipAddress: string
          lastMessageAt: string
          metadata: Json | null
          sessionToken: string
          startedAt: string
          status: Database['public']['Enums']['SessionStatus']
          surveyId: string
          userAgent: string
        }
        Insert: {
          completedAt?: string | null
          countryCode?: string | null
          currentState: Json
          id?: string
          ipAddress: string
          lastMessageAt?: string
          metadata?: Json | null
          sessionToken: string
          startedAt?: string
          status?: Database['public']['Enums']['SessionStatus']
          surveyId: string
          userAgent: string
        }
        Update: {
          completedAt?: string | null
          countryCode?: string | null
          currentState?: Json
          id?: string
          ipAddress?: string
          lastMessageAt?: string
          metadata?: Json | null
          sessionToken?: string
          startedAt?: string
          status?: Database['public']['Enums']['SessionStatus']
          surveyId?: string
          userAgent?: string
        }
      }
      ResponseAnalysis: {
        Row: {
          conversationId: string
          createdAt: string
          id: string
          isFlagged: boolean
          keyThemes: Json
          opportunities: Json
          painPoints: Json
          qualityScore: number
          sentiment: Database['public']['Enums']['Sentiment']
          summary: string
          topQuotes: Json
        }
        Insert: {
          conversationId: string
          createdAt?: string
          id?: string
          isFlagged?: boolean
          keyThemes: Json
          opportunities: Json
          painPoints: Json
          qualityScore: number
          sentiment: Database['public']['Enums']['Sentiment']
          summary: string
          topQuotes: Json
        }
        Update: {
          conversationId?: string
          createdAt?: string
          id?: string
          isFlagged?: boolean
          keyThemes?: Json
          opportunities?: Json
          painPoints?: Json
          qualityScore?: number
          sentiment?: Database['public']['Enums']['Sentiment']
          summary?: string
          topQuotes?: Json
        }
      }
      Survey: {
        Row: {
          context: Json | null
          createdAt: string
          id: string
          masterPrompt: string
          objective: string
          settings: Json
          shortUrl: string
          status: Database['public']['Enums']['SurveyStatus']
          title: string
          topics: Json
          updatedAt: string
          userId: string
        }
        Insert: {
          context?: Json | null
          createdAt?: string
          id?: string
          masterPrompt: string
          objective: string
          settings: Json
          shortUrl: string
          status?: Database['public']['Enums']['SurveyStatus']
          title: string
          topics: Json
          updatedAt?: string
          userId: string
        }
        Update: {
          context?: Json | null
          createdAt?: string
          id?: string
          masterPrompt?: string
          objective?: string
          settings?: Json
          shortUrl?: string
          status?: Database['public']['Enums']['SurveyStatus']
          title?: string
          topics?: Json
          updatedAt?: string
          userId?: string
        }
      }
      User: {
        Row: {
          createdAt: string
          email: string
          id: string
          name: string
          passwordHash: string
          paymentLinkId: string | null
          paymentProviderId: string | null
          plan: Database['public']['Enums']['Plan']
          responsesUsedThisMonth: number
          subscriptionRenewsAt: string | null
          subscriptionStatus: Database['public']['Enums']['SubscriptionStatus']
          updatedAt: string
        }
        Insert: {
          createdAt?: string
          email: string
          id?: string
          name: string
          passwordHash: string
          paymentLinkId?: string | null
          paymentProviderId?: string | null
          plan?: Database['public']['Enums']['Plan']
          responsesUsedThisMonth?: number
          subscriptionRenewsAt?: string | null
          subscriptionStatus?: Database['public']['Enums']['SubscriptionStatus']
          updatedAt?: string
        }
        Update: {
          createdAt?: string
          email?: string
          id?: string
          name?: string
          passwordHash?: string
          paymentLinkId?: string | null
          paymentProviderId?: string | null
          plan?: Database['public']['Enums']['Plan']
          responsesUsedThisMonth?: number
          subscriptionRenewsAt?: string | null
          subscriptionStatus?: Database['public']['Enums']['SubscriptionStatus']
          updatedAt?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      Plan: 'FREE' | 'STARTER' | 'PRO' | 'BUSINESS'
      Sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE'
      SessionStatus: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'ABANDONED'
      SubscriptionStatus: 'ACTIVE' | 'CANCELED' | 'PAST_DUE'
      SurveyStatus: 'ACTIVE' | 'PAUSED' | 'COMPLETED'
    }
  }
}
