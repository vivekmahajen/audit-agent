export interface Profile {
  id: string;
  email: string;
  name: string;
  plan: 'free' | 'pro';
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  plaid_access_token?: string;
  onboarding_complete: boolean;
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  date: string;
  merchant: string;
  amount: number;
  category?: string;
  is_recurring: boolean;
  recurrence_cadence?: 'monthly' | 'annual' | 'weekly' | 'one-time';
  raw_description: string;
  created_at: string;
}

export interface RawTransaction {
  id: string;
  date: string;
  merchant: string;
  amount: number;
  raw_description: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  merchant: string;
  amount: number;
  cadence: 'monthly' | 'annual' | 'weekly';
  last_charged?: string;
  next_charge?: string;
  status: 'active' | 'cancelled' | 'flagged';
  ai_verdict: 'keep' | 'cancel' | 'negotiate' | 'review';
  ai_reason: string;
  annual_cost: number;
  category?: string;
  created_at: string;
}

export interface Action {
  id: string;
  user_id: string;
  subscription_id: string;
  action_type: 'cancelled' | 'negotiated' | 'kept' | 'email_drafted';
  amount_saved_monthly?: number;
  email_draft?: string;
  completed_at: string;
}

export interface Message {
  id: string;
  user_id?: string;
  role: 'user' | 'assistant';
  content: string;
  metadata?: Record<string, unknown>;
  created_at?: string;
}

export interface AnalysisSummary {
  totalSubscriptions: number;
  totalMonthly: number;
  potentialSavings: number;
  cancelCount: number;
  subscriptions: Subscription[];
}

export interface ClassifiedTransaction extends RawTransaction {
  is_recurring: boolean;
  recurrence_cadence: 'monthly' | 'annual' | 'weekly' | 'one-time';
  category: string;
  merchant_clean: string;
  ai_verdict: 'keep' | 'cancel' | 'negotiate' | 'review';
  ai_reason: string;
}
