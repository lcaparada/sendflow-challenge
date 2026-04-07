import { useEffect, useState } from "react";
import type { Observable } from "rxjs";
import { getFirebaseErrorMessage } from "../utils";

export function useObservable<T>(observable: Observable<T[]>) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const subscription = observable.subscribe({
      next: (value) => {
        setData(value);
        setLoading(false);
        setError(null);
      },
      error: (err) => {
        setError(getFirebaseErrorMessage(err));
        setLoading(false);
      },
    });
    return () => subscription.unsubscribe();
  }, [observable]);

  return [data, loading, error] as const;
}
