import { createClient } from '@/lib/supabase';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const { public_token } = await req.json();
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { Configuration, PlaidApi, PlaidEnvironments } = await import('plaid');

    const config = new Configuration({
      basePath:
        PlaidEnvironments[
          (process.env.PLAID_ENV as keyof typeof PlaidEnvironments) ?? 'sandbox'
        ],
      baseOptions: {
        headers: {
          'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
          'PLAID-SECRET': process.env.PLAID_SECRET,
        },
      },
    });

    const plaidClient = new PlaidApi(config);
    const exchangeResponse = await plaidClient.itemPublicTokenExchange({ public_token });
    const accessToken = exchangeResponse.data.access_token;

    // Store base64-encoded token (use proper encryption in production)
    const encoded = Buffer.from(accessToken).toString('base64');
    await supabase
      .from('profiles')
      .update({ plaid_access_token: encoded })
      .eq('id', user.id);

    return Response.json({ success: true });
  } catch (error) {
    console.error('Plaid exchange-token error:', error);
    return Response.json({ error: 'Failed to exchange Plaid token' }, { status: 500 });
  }
}
