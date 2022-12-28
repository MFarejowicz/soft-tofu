import { useAuthState, useSignInWithGoogle, useSignOut } from "react-firebase-hooks/auth";
import { auth } from "./firebase";

import "./App.css";

function App() {
  const [signInWithGoogle, _, loading, error] = useSignInWithGoogle(auth);
  const [signOut] = useSignOut(auth);
  const [user] = useAuthState(auth);
  console.log(user);

  if (loading) {
    return (
      <div>
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <p>Error: {error.message}</p>
      </div>
    );
  }

  if (user) {
    return (
      <div>
        <p>Current User: {user.email}</p>
        <button onClick={signOut}>Log out</button>
      </div>
    );
  }

  return <button onClick={() => signInWithGoogle()}>Log in</button>;
}

export default App;
