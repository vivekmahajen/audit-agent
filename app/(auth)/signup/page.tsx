import { redirect } from 'next/navigation';

// Redirect signup to login — we use magic links / OAuth, no separate signup form needed
export default function SignupPage() {
  redirect('/login');
}
