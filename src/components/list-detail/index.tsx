import { Button, Input, InputNumber, Typography } from "antd";
import { child, push, ref, remove, update } from "firebase/database";
import { useCallback, useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { pickManyDistinct } from "wrand/lib";
import { ArrowLeftOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";

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

  const listPath = `users/${user?.uid}/lists/${selectedList}`;
  const { data, loaded } = useFirebase<List>(listPath);
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
      if (!value) {
        return;
      }

      setName(value);
      updateListName(listPath, value);
    },
    [listPath]
  );

  const handleNewItemChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setNewItem(event.currentTarget.value);
  }, []);

  const handleAddItem = useCallback(() => {
    if (!newItem) {
      return;
    }

    const key = writeNewItem(listPath, newItem);

    if (!key) {
      // TODO: handle this
      return;
    }

    setNewItem("");
  }, [listPath, newItem]);

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
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr" }}>
        <Typography.Text strong style={{ fontSize: "18px" }}>
          Item
        </Typography.Text>
        <Typography.Text strong style={{ fontSize: "18px" }}>
          Weight
        </Typography.Text>
        <Typography.Text strong style={{ fontSize: "18px" }}>
          Delete
        </Typography.Text>
        {items &&
          Object.entries(items).map(([key, listItem]) => (
            <ListItemRow key={key} listPath={listPath} item={listItem} itemID={key} />
          ))}
      </div>
      <div style={{ display: "flex", alignItems: "center", width: "300px" }}>
        <Input
          placeholder="Add new item"
          bordered={false}
          value={newItem}
          onChange={handleNewItemChange}
          onPressEnter={handleAddItem}
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

interface ListItemRowProps {
  item: ListItem;
  itemID: string;
  listPath: string;
}

function ListItemRow({ item, itemID, listPath }: ListItemRowProps) {
  const [name, setName] = useState<string>(item.name);
  const [weight, setWeight] = useState<number>(item.weight);

  const handleSetName = useCallback(
    (newName: string) => {
      updateItemName(listPath, itemID, newName);
      setName(newName);
    },
    [itemID, listPath]
  );

  const handleSetWeight = useCallback(
    (newWeight: number | null) => {
      if (!newWeight) {
        newWeight = 1;
      }

      updateItemWeight(listPath, itemID, newWeight);

      setWeight(newWeight);
    },
    [itemID, listPath]
  );

  const handleDeleteItem = useCallback(() => {
    deleteItem(listPath, itemID);
  }, [itemID, listPath]);

  return (
    <>
      <Typography.Text
        style={{ cursor: "pointer" }}
        editable={{ triggerType: ["text"], onChange: handleSetName }}
      >
        {name}
      </Typography.Text>
      <InputNumber min={1} max={100} value={weight} onChange={handleSetWeight} bordered={false} />
      <Button type="text" icon={<DeleteOutlined />} onClick={handleDeleteItem} />
    </>
  );
}

/**
 * DATABASE OPERATIONS
 */

function writeNewItem(listPath: string, name: string) {
  const path = `${listPath}/items`;
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

function updateListName(listPath: string, newName: string) {
  const path = `${listPath}`;

  const updates = { name: newName };

  update(ref(database, path), updates);
}

function updateItemName(listPath: string, itemID: string, newName: string) {
  const path = `${listPath}/items/${itemID}`;

  const updates = { name: newName };

  update(ref(database, path), updates);
}

function updateItemWeight(listPath: string, itemID: string, newWeight: number) {
  const path = `${listPath}/items/${itemID}`;

  const updates = { weight: newWeight };

  update(ref(database, path), updates);
}

function deleteItem(listPath: string, itemID: string) {
  const path = `${listPath}/items/${itemID}`;

  remove(ref(database, path));
}
