import { CloseOutlined } from "@ant-design/icons";
import { Button, Typography } from "antd";
import { useFirebase } from "../../hooks/useFirebase";
import { auth } from "../../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { List } from "../lists";

interface Props {
  selectedList: string;
  setSelectedList: React.Dispatch<React.SetStateAction<string | null>>;
}

export function ListDetail({ selectedList, setSelectedList }: Props) {
  const [user] = useAuthState(auth);
  const list = useFirebase<List>(`users/${user?.uid}/lists/${selectedList}`);

  if (!user) {
    // TODO: deal with this
    return null;
  }

  if (!list.value) {
    // TODO: deal with this
    return null;
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
      }}
    >
      <Typography.Title level={2}>{list.value.name}</Typography.Title>
      <Button type="text" icon={<CloseOutlined />} onClick={() => setSelectedList(null)} />
    </div>
  );
}
