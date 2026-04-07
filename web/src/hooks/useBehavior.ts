import { useState, useEffect } from "react";
import type { BehaviorSubject } from "rxjs";

export function useBehavior<T>(subject: BehaviorSubject<T>): T {
  const [value, setValue] = useState<T>(subject.value);

  useEffect(() => {
    const sub = subject.subscribe(setValue);
    return () => sub.unsubscribe();
  }, [subject]);

  return value;
}
