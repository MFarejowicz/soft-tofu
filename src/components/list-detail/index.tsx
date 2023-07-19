import { ArrowLeftOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Input, InputNumber, Typography } from "antd";
import { useAuthState } from "react-firebase-hooks/auth";
import { useFirebase } from "../../hooks/useFirebase";
import { auth, database } from "../../firebase";
import { List, ListItem } from "../lists";
import { useCallback, useState } from "react";
import { push, child, ref, update } from "firebase/database";
import weighted from "weighted";

interface Props {
  selectedList: string;
  setSelectedList: React.Dispatch<React.SetStateAction<string | null>>;
}

export function ListDetail({ selectedList, setSelectedList }: Props) {
  const [user] = useAuthState(auth);
  const list = useFirebase<List>(`users/${user?.uid}/lists/${selectedList}`);
  const [newItem, setNewItem] = useState<string>("");
  const [count, setCount] = useState<number>(1);
  const [results, setResults] = useState<string[]>([]);

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
    if (!list.value) {
      return;
    }

    const { items = {} } = list.value;

    const options = Object.entries(items).map(([key, item]) => ({
      id: key,
      name: item.name,
      weight: item.weight,
    }));

    const res = select(options, count);

    setResults(res);
  }, [count, list.value]);

  if (!user) {
    // TODO: deal with this
    return null;
  }

  if (!list.value) {
    // TODO: deal with this
    return null;
  }

  const { name, items = {} } = list.value;

  return (
    <div style={{ width: "100%" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
        }}
      >
        <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => setSelectedList(null)} />
        <Typography.Title level={2}>{name}</Typography.Title>
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

function select(
  items: {
    id: string;
    name: string;
    weight: number;
  }[],
  count: number
) {
  const output = [];
  const things = items.map((el) => ({ name: el.name, id: el.id }));
  const weights = items.map((el) => el.weight);

  for (let i = 0; i < count; i++) {
    const res = weighted(things, weights);
    output.push(res.name);
    const index = things.findIndex((el) => el.id === res.id);
    things.splice(index, 1);
    weights.splice(index, 1);
  }

  return output;
}
