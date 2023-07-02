import { PlusOutlined } from "@ant-design/icons";
import { Card, Space } from "antd";

import "./styles.css";
import { auth, database } from "../../firebase";
import { child, push, ref, update } from "firebase/database";
import { useAuthState } from "react-firebase-hooks/auth";
import { useCallback } from "react";
import { uniqueNamesGenerator, Config, adjectives, colors, animals } from "unique-names-generator";
import { useFirebase } from "../../hooks/useFirebase";

const customConfig: Config = {
  dictionaries: [adjectives, colors, animals],
  separator: "-",
  length: 3,
};

interface List {
  name: string;
}

export function Lists() {
  const [user] = useAuthState(auth);
  const stuff = useFirebase(`users/${user?.uid}/lists`);

  console.log(stuff.value);

  const addList = useCallback(() => {
    if (!user) {
      return;
    }

    console.log("adding");
    const name = uniqueNamesGenerator(customConfig);
    const userID = user.uid;
    writeNewList(userID, name);
  }, [user]);

  if (!user) {
    // TODO: deal with this
    return null;
  }

  if (!stuff.value) {
    // TODO: deal with this
    return null;
  }

  return (
    <div>
      <Space wrap>
        {Object.values(stuff.value).map((list) => (
          <Card className="Lists-card" hoverable key={list.name}>
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

  return update(ref(database), updates);
}
