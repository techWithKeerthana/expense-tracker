export interface PasswordRequirement {
  key: string;
  label: string;
  test: (password: string) => boolean;
}

export const PASSWORD_REQUIREMENTS: PasswordRequirement[] = [
  { key: 'length', label: 'At least 8 characters', test: (p) => p.length >= 8 },
  { key: 'uppercase', label: 'One uppercase letter (A-Z)', test: (p) => /[A-Z]/.test(p) },
  { key: 'lowercase', label: 'One lowercase letter (a-z)', test: (p) => /[a-z]/.test(p) },
  { key: 'number', label: 'One number (0-9)', test: (p) => /[0-9]/.test(p) },
  { key: 'special', label: 'One special character (e.g. ! @ # $)', test: (p) => /[^A-Za-z0-9]/.test(p) },
];

export function isPasswordStrong(password: string): boolean {
  return PASSWORD_REQUIREMENTS.every((r) => r.test(password));
}

export const PASSWORD_REQUIREMENTS_MESSAGE =
  'Password must be at least 8 characters and include an uppercase letter, a lowercase letter, a number, and a special character.';
