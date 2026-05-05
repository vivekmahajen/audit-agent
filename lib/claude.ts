import Anthropic from '@anthropic-ai/sdk';

// SDK auto-reads ANTHROPIC_API_KEY and ANTHROPIC_AUTH_TOKEN from the environment
export const anthropic = new Anthropic();

export const HAIKU_MODEL = 'claude-haiku-4-5-20251001';
export const SONNET_MODEL = 'claude-sonnet-4-6';
