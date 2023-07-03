import { Card, Space } from "antd";
import { child, push, ref, update } from "firebase/database";
import { useCallback } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { adjectives, animals, colors, Config, uniqueNamesGenerator } from "unique-names-generator";
import { PlusOutlined } from "@ant-design/icons";
import { auth, database } from "../../firebase";
import { useFirebase } from "../../hooks/useFirebase";
import "./styles.css";

const nameConfig: Config = {
  dictionaries: [adjectives, colors, animals],
  separator: "-",
  length: 3,
};

export interface List {
  name: string;
}

interface Props {
  setSelectedList: React.Dispatch<React.SetStateAction<string | null>>;
}

export function Lists({ setSelectedList }: Props) {
  const [user] = useAuthState(auth);
  const lists = useFirebase<Record<string, List>>(`users/${user?.uid}/lists`);

  const addList = useCallback(() => {
    if (!user) {
      return;
    }

    const name = uniqueNamesGenerator(nameConfig);
    const userID = user.uid;
    const key = writeNewList(userID, name);

    if (!key) {
      // TODO: handle this
      return;
    }

    setSelectedList(key);
  }, [setSelectedList, user]);

  if (!user) {
    // TODO: deal with this
    return null;
  }

  if (!lists.value) {
    // TODO: deal with this
    return null;
  }

  return (
    <div>
      <Space wrap>
        {Object.entries(lists.value).map(([key, list]) => (
          <Card key={key} className="Lists-card" hoverable onClick={() => setSelectedList(key)}>
            {list.name}
          </Card>
        ))}
        <Card className="Lists-card" hoverable onClick={addList}>
          <PlusOutlined />
        </Card>
      </Space>
    </div>
  );
}

function writeNewList(userID: string, name: string) {
  const path = `users/${userID}/lists`;
  const newListKey = push(child(ref(database), path)).key;

  if (!newListKey) {
    // TODO: something went wrong
    return;
  }

  const updates: Record<string, List> = {};
  updates[`${path}/${newListKey}`] = { name };

  update(ref(database), updates);

  return newListKey;
}
