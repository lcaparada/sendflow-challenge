import { useEffect, useState } from "react";
import type { Observable } from "rxjs";

export function useObservable<T>(observable: Observable<T[]>) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const subscription = observable.subscribe((value) => {
      setData(value);
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, [observable]);

  return [data, loading] as const;
}
