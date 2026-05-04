import type { Subscription } from '@/types';

export const buildNegotiatePrompt = (subscription: Subscription, userName: string) => `
Draft a polite but firm email to ${subscription.merchant} requesting a rate reduction or retention offer.

CONTEXT:
- Customer name: ${userName}
- Service: ${subscription.merchant}
- Current monthly cost: $${subscription.amount}
- User is a loyal customer considering cancellation

REQUIREMENTS:
- Subject line: clear and professional
- Tone: polite, direct, not aggressive
- Mention loyalty and willingness to cancel if no offer is made
- Ask specifically for: a promotional rate, loyalty discount, or better plan
- Keep it under 150 words
- End with a clear call to action

Return in this exact format:
Subject: [subject line here]

[email body here]
`;

export const buildCancelPrompt = (subscription: Subscription, userName: string) => `
Draft a brief, polite cancellation request email for ${subscription.merchant}.

CONTEXT:
- Customer name: ${userName}
- Service: ${subscription.merchant}
- Monthly cost: $${subscription.amount}

REQUIREMENTS:
- Subject line: clear and direct
- Tone: polite but firm
- Request immediate cancellation and confirmation
- Ask for any pro-rated refund if applicable
- Keep it under 100 words

Return in this exact format:
Subject: [subject line here]

[email body here]
`;
