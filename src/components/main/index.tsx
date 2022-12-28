import { useCallback } from "react";
import { useAuthState, useSignInWithGoogle } from "react-firebase-hooks/auth";
import { auth } from "../../firebase";
import "./styles.css";

export function Main() {
  const [user] = useAuthState(auth);

  const renderContent = useCallback(() => {
    return user ? <MainLoggedIn /> : <MainLoggedOut />;
  }, [user]);

  return <main className="Main">{renderContent()}</main>;
}

function MainLoggedIn() {
  return <div>here are your things</div>;
}

function MainLoggedOut() {
  const [signInWithGoogle, _user, loading, error] = useSignInWithGoogle(auth);

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

  return (
    <div>
      <h1>soft tofu</h1>
      <button onClick={() => signInWithGoogle()}>Log in</button>
    </div>
  );
}
