export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
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
        Relationships: [
          {
            foreignKeyName: "AggregateAnalysis_surveyId_fkey"
            columns: ["surveyId"]
            isOneToOne: false
            referencedRelation: "Survey"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: []
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
        Relationships: []
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
        Relationships: [
          {
            foreignKeyName: "Conversation_sessionId_fkey"
            columns: ["sessionId"]
            isOneToOne: true
            referencedRelation: "ConversationSession"
            referencedColumns: ["id"]
          },
        ]
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
          status: Database["public"]["Enums"]["SessionStatus"]
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
          status?: Database["public"]["Enums"]["SessionStatus"]
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
          status?: Database["public"]["Enums"]["SessionStatus"]
          surveyId?: string
          userAgent?: string
        }
        Relationships: [
          {
            foreignKeyName: "ConversationSession_surveyId_fkey"
            columns: ["surveyId"]
            isOneToOne: false
            referencedRelation: "Survey"
            referencedColumns: ["id"]
          },
        ]
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
          sentiment: Database["public"]["Enums"]["Sentiment"]
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
          sentiment: Database["public"]["Enums"]["Sentiment"]
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
          sentiment?: Database["public"]["Enums"]["Sentiment"]
          summary?: string
          topQuotes?: Json
        }
        Relationships: [
          {
            foreignKeyName: "ResponseAnalysis_conversationId_fkey"
            columns: ["conversationId"]
            isOneToOne: true
            referencedRelation: "Conversation"
            referencedColumns: ["id"]
          },
        ]
      }
      Survey: {
        Row: {
          context: Json | null
          createdAt: string
          id: string
          masterPrompt: string
          mode: Database["public"]["Enums"]["SurveyMode"]
          objective: string
          settings: Json
          shortUrl: string
          status: Database["public"]["Enums"]["SurveyStatus"]
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
          mode?: Database["public"]["Enums"]["SurveyMode"]
          objective: string
          settings: Json
          shortUrl: string
          status?: Database["public"]["Enums"]["SurveyStatus"]
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
          mode?: Database["public"]["Enums"]["SurveyMode"]
          objective?: string
          settings?: Json
          shortUrl?: string
          status?: Database["public"]["Enums"]["SurveyStatus"]
          title?: string
          topics?: Json
          updatedAt?: string
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "Survey_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
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
          plan: Database["public"]["Enums"]["Plan"]
          responsesUsedThisMonth: number
          subscriptionRenewsAt: string | null
          subscriptionStatus: Database["public"]["Enums"]["SubscriptionStatus"]
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
          plan?: Database["public"]["Enums"]["Plan"]
          responsesUsedThisMonth?: number
          subscriptionRenewsAt?: string | null
          subscriptionStatus?: Database["public"]["Enums"]["SubscriptionStatus"]
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
          plan?: Database["public"]["Enums"]["Plan"]
          responsesUsedThisMonth?: number
          subscriptionRenewsAt?: string | null
          subscriptionStatus?: Database["public"]["Enums"]["SubscriptionStatus"]
          updatedAt?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_responses_used: {
        Args: { user_id: string }
        Returns: undefined
      }
    }
    Enums: {
      Plan: "FREE" | "STARTER" | "PRO" | "BUSINESS"
      Sentiment: "POSITIVE" | "NEUTRAL" | "NEGATIVE"
      SessionStatus: "ACTIVE" | "PAUSED" | "COMPLETED" | "ABANDONED"
      SubscriptionStatus: "ACTIVE" | "CANCELED" | "PAST_DUE"
      SurveyMode:
        | "PRODUCT_DISCOVERY"
        | "FEEDBACK_SATISFACTION"
        | "EXPLORATORY_GENERAL"
      SurveyStatus: "ACTIVE" | "PAUSED" | "COMPLETED"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      Plan: ["FREE", "STARTER", "PRO", "BUSINESS"],
      Sentiment: ["POSITIVE", "NEUTRAL", "NEGATIVE"],
      SessionStatus: ["ACTIVE", "PAUSED", "COMPLETED", "ABANDONED"],
      SubscriptionStatus: ["ACTIVE", "CANCELED", "PAST_DUE"],
      SurveyMode: [
        "PRODUCT_DISCOVERY",
        "FEEDBACK_SATISFACTION",
        "EXPLORATORY_GENERAL",
      ],
      SurveyStatus: ["ACTIVE", "PAUSED", "COMPLETED"],
    },
  },
} as const
