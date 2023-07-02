import { onValue, ref, set, update } from "firebase/database";
import { useEffect, useMemo, useState } from "react";
import { database } from "../firebase";

/**
 * useFirebase realtime value at a path. Returns ref, value, set, and
 * update methods.
 */
export function useFirebase<T extends Object>(
  path?: string,
  { defaultValue, fallbackValue }: { defaultValue?: T; fallbackValue?: T } = {}
) {
  const dbRef = useMemo(() => ref(database, path), [path]);
  const [value, setReadValue] = useState<T | undefined>(defaultValue);

  useEffect(() => {
    const unsubscribe = onValue(dbRef, (snapshot) => {
      const rawValue = snapshot.val() || fallbackValue;
      setReadValue(rawValue);
    });
    return () => {
      unsubscribe();
    };
  }, [dbRef, fallbackValue]);

  function updateValue(newValue: Partial<T>) {
    return update(dbRef, newValue);
  }

  function setValue(newValue: T | null) {
    return set(dbRef, newValue);
  }

  return { value, update: updateValue, set: setValue, ref: dbRef };
}
