// Lightweight unique id generator (no native crypto dependency required).
export function generateId(): string {
  const random = Math.random().toString(36).slice(2, 10);
  const timestamp = Date.now().toString(36);
  return `${timestamp}-${random}`;
}
