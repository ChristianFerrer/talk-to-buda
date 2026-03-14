export interface User {
  user_phone: string;
  first_seen: string;
  last_seen: string;
  total_messages: number;
  is_premium: boolean;
  is_vip: boolean;
  message_count_today: number;
  last_message_date: string;
}

export interface Message {
  id: string;
  timestamp: string;
  user_phone: string;
  user_message: string;
  buda_response: string;
  conversation_id: string;
}

export interface UserSummary {
  id: string;
  user_phone: string;
  summary_text: string;
  updated_at: string;
}

export interface PremiumUser {
  id: string;
  user_phone: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  status: string;
  started_at: string;
  updated_at: string;
}

export interface PremiumToken {
  id: string;
  user_phone: string;
  token: string;
  expires_at: string;
  used: boolean;
}

export interface WhatsAppMessage {
  from: string;
  id: string;
  timestamp: string;
  text: {
    body: string;
  };
  type: string;
}

export interface WhatsAppWebhookBody {
  object: string;
  entry: Array<{
    id: string;
    changes: Array<{
      value: {
        messaging_product: string;
        metadata: {
          display_phone_number: string;
          phone_number_id: string;
        };
        contacts?: Array<{
          profile: { name: string };
          wa_id: string;
        }>;
        messages?: WhatsAppMessage[];
        statuses?: Array<{
          id: string;
          status: string;
          timestamp: string;
          recipient_id: string;
        }>;
      };
      field: string;
    }>;
  }>;
}

export interface DashboardMetrics {
  overview: {
    totalUsers: number;
    newUsersToday: number;
    activeUsersToday: number;
    totalMessagesToday: number;
    totalConversationsToday: number;
  };
  engagement: {
    avgMessagesPerUser: number;
    avgConversationLength: number;
  };
  retention: {
    d1: number;
    d7: number;
  };
  activityChart: Array<{
    date: string;
    count: number;
  }>;
  topTopics: Array<{
    word: string;
    count: number;
  }>;
  premium: {
    premiumUsers: number;
    conversionRate: number;
  };
}
