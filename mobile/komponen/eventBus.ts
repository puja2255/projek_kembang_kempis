type Callback = (payload?: any) => void;

const listeners: Map<string, Set<Callback>> = new Map();

export function on(event: string, cb: Callback) {
  if (!listeners.has(event)) listeners.set(event, new Set());
  listeners.get(event)!.add(cb);
  return () => off(event, cb);
}

export function off(event: string, cb: Callback) {
  const set = listeners.get(event);
  if (!set) return;
  set.delete(cb);
  if (set.size === 0) listeners.delete(event);
}

export function emit(event: string, payload?: any) {
  const set = listeners.get(event);
  if (!set) return;
  // call listeners in next tick to avoid sync re-entrancy issues
  set.forEach((cb) => {
    try {
      cb(payload);
    } catch (e) {
      // swallow listener errors
      // eslint-disable-next-line no-console
      console.error(`eventBus listener for ${event} failed`, e);
    }
  });
}

export default { on, off, emit };
