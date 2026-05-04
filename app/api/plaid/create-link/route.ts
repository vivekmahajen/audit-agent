import { createClient } from '@/lib/supabase';

export const runtime = 'nodejs';

export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('plan')
      .eq('id', user.id)
      .single();

    if (profile?.plan !== 'pro') {
      return Response.json(
        { error: 'Plaid bank connection requires a Pro plan' },
        { status: 403 }
      );
    }

    const { Configuration, PlaidApi, PlaidEnvironments, Products, CountryCode } =
      await import('plaid');

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

    const response = await plaidClient.linkTokenCreate({
      user: { client_user_id: user.id },
      client_name: 'Arlo',
      products: [Products.Transactions],
      country_codes: [CountryCode.Us],
      language: 'en',
    });

    return Response.json({ link_token: response.data.link_token });
  } catch (error) {
    console.error('Plaid create-link error:', error);
    return Response.json({ error: 'Failed to create Plaid link token' }, { status: 500 });
  }
}
