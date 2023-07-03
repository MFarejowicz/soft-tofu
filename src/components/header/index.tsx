import { useAuthState, useSignOut } from "react-firebase-hooks/auth";
import { Button, Typography } from "antd";
import { auth } from "../../firebase";

import "./styles.css";

export function Header() {
  const [user] = useAuthState(auth);
  const [signOut] = useSignOut(auth);

  if (!user) {
    return null;
  }

  return (
    <header className="Header">
      <div className="Header-content">
        <Typography.Title className="Header-title" level={1}>
          soft tofu
        </Typography.Title>
        <div className="Header-user">
          <Typography.Text>{user.displayName}</Typography.Text>
          <Button type="default" onClick={signOut}>
            Sign Out
          </Button>
        </div>
      </div>
    </header>
  );
}
