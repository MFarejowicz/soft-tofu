import { onValue, ref } from "firebase/database";
import { useEffect, useMemo, useState } from "react";
import { database } from "../firebase";

/**
 * useFirebase realtime value at a path. Returns value and loaded
 */
export function useFirebase<T extends Object>(
  path?: string,
  { defaultValue, fallbackValue }: { defaultValue?: T; fallbackValue?: T } = {}
) {
  const dbRef = useMemo(() => ref(database, path), [path]);
  const [value, setReadValue] = useState<T | undefined>(defaultValue);
  const [loaded, setLoaded] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = onValue(dbRef, (snapshot) => {
      const rawValue = snapshot.val() || fallbackValue;
      setReadValue(rawValue);
      setLoaded(true);
    });
    return () => {
      unsubscribe();
    };
  }, [dbRef, fallbackValue]);

  return { data: value, loaded };
}
