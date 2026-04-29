export interface SubscribeState {
  error?: string;
  success?: boolean;
  email?: string;
}

// Simulated already-subscribed list
const EXISTING_EMAILS = new Set(['taken@example.com', 'used@test.com']);

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Simulates a Server Action. In a real Next.js app this function would live in
 * a file marked with 'use server' and run on the server. Here it's a plain
 * async function so it works in the client-only challenge sandbox.
 *
 * The signature matches what useFormState expects:
 *   (previousState, formData) => Promise<newState>
 */
export async function subscribeAction(
  _prevState: SubscribeState,
  formData: FormData,
): Promise<SubscribeState> {
  await delay(1200); // simulate network round-trip

  const email = formData.get('email');
  if (!email || typeof email !== 'string' || email.trim() === '') {
    return { error: 'Email is required.' };
  }

  const trimmed = email.trim().toLowerCase();
  if (!trimmed.includes('@') || !trimmed.includes('.')) {
    return { error: 'Please enter a valid email address.' };
  }

  if (EXISTING_EMAILS.has(trimmed)) {
    return { error: 'That email is already subscribed.' };
  }

  EXISTING_EMAILS.add(trimmed);
  return { success: true, email: trimmed };
}
