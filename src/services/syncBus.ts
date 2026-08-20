type Listener = () => void;

const listeners = new Set<Listener>();

function notifyChanged(): void {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export const syncBus = { notifyChanged, subscribe };
