import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../firebase";
import "./styles.css";

export function Header() {
  const [user] = useAuthState(auth);

  return (
    <header className="Header">
      <h2>soft tofu</h2>
      <div>{user?.displayName}</div>
    </header>
  );
}
