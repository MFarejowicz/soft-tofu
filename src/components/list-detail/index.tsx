import { Button, Input, InputNumber, Typography } from "antd";
import { child, push, ref, set, update } from "firebase/database";
import { useCallback, useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { pickManyDistinct } from "wrand/lib";
import { ArrowLeftOutlined, PlusOutlined } from "@ant-design/icons";

import { auth, database } from "../../firebase";
import { useFirebase } from "../../hooks/useFirebase";
import { usePrevious } from "../../hooks/usePrevious";
import { List, ListItem } from "../lists";

interface Props {
  selectedList: string;
  setSelectedList: React.Dispatch<React.SetStateAction<string | null>>;
}

export function ListDetail({ selectedList, setSelectedList }: Props) {
  const [user] = useAuthState(auth);
  const { data, loaded } = useFirebase<List>(`users/${user?.uid}/lists/${selectedList}`);
  const prevLoaded = usePrevious(loaded);
  const [name, setName] = useState<string>("");
  const [newItem, setNewItem] = useState<string>("");
  const [count, setCount] = useState<number>(1);
  const [results, setResults] = useState<string[]>([]);

  // load name from firebase
  useEffect(() => {
    if (!prevLoaded && loaded && data?.name) {
      setName(data.name);
    }
  }, [data?.name, prevLoaded, loaded]);

  const handleNewName = useCallback(
    (value: string) => {
      if (!user || !value) {
        return;
      }

      const userID = user.uid;

      setName(value);
      writeNewName(userID, selectedList, value);
    },
    [selectedList, user]
  );

  const handleNewItemChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setNewItem(event.currentTarget.value);
  }, []);

  const handleAddItem = useCallback(() => {
    if (!user || !newItem) {
      return;
    }

    const userID = user.uid;

    const key = writeNewItem(userID, selectedList, newItem);

    if (!key) {
      // TODO: handle this
      return;
    }

    setNewItem("");
  }, [newItem, selectedList, user]);

  const handleCountChange = useCallback((value: number | null) => {
    if (!value) {
      return;
    }

    setCount(value);
  }, []);

  const handleGetResults = useCallback(() => {
    if (!data) {
      return;
    }

    const { items = {} } = data;

    const test = Object.entries(items).map(([key, item]) => ({
      original: { name: item.name, id: key },
      weight: item.weight,
    }));

    const e = pickManyDistinct(test, count);

    setResults(e.map((item) => item.name));
  }, [count, data]);

  if (!user) {
    // TODO: deal with this
    return null;
  }

  if (!data) {
    // TODO: deal with this
    return null;
  }

  const { items = {} } = data;

  return (
    <div style={{ width: "100%" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
        }}
      >
        <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => setSelectedList(null)} />
        <Typography.Title level={2} editable={{ onChange: handleNewName }}>
          {name}
        </Typography.Title>
      </div>
      <div>
        {items &&
          Object.entries(items).map(([key, listItem]) => <div key={key}>{listItem.name}</div>)}
      </div>
      <div style={{ display: "flex", alignItems: "center", width: "300px" }}>
        <Input
          placeholder="Add new item"
          bordered={false}
          value={newItem}
          onChange={handleNewItemChange}
        />
        <Button type="text" icon={<PlusOutlined />} onClick={handleAddItem} />
      </div>
      {Object.keys(items).length > 0 && (
        <div>
          <Typography.Paragraph>
            Give me{" "}
            <InputNumber
              size="small"
              min={1}
              max={Object.keys(items).length}
              value={count}
              onChange={handleCountChange}
            />{" "}
            items
          </Typography.Paragraph>
          <Button onClick={handleGetResults}>GO!</Button>
          {results.length > 0 && <div>{results.toString()}</div>}
        </div>
      )}
    </div>
  );
}

function writeNewItem(userID: string, listID: string, name: string) {
  const path = `users/${userID}/lists/${listID}/items`;
  const newItemKey = push(child(ref(database), path)).key;

  if (!newItemKey) {
    // TODO: something went wrong
    return;
  }

  const updates: Record<string, ListItem> = {};
  updates[`${path}/${newItemKey}`] = { name, weight: 1 };

  update(ref(database), updates);

  return newItemKey;
}

function writeNewName(userID: string, listID: string, newName: string) {
  const path = `users/${userID}/lists/${listID}/name`;

  set(ref(database, path), newName);
}
