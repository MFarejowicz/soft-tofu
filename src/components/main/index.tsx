import { Button, Typography } from "antd";
import { User } from "firebase/auth";
import { ref, update } from "firebase/database";
import { useCallback } from "react";
import { useAuthState, useSignInWithGoogle } from "react-firebase-hooks/auth";

import { auth, database } from "../../firebase";
import { Lists } from "../lists";

import "./styles.css";

export function Main() {
  const [user] = useAuthState(auth);

  const renderContent = useCallback(() => {
    return user ? <MainLoggedIn /> : <MainLoggedOut />;
  }, [user]);

  return <main className="Main">{renderContent()}</main>;
}

function MainLoggedIn() {
  return <Lists />;
}

function MainLoggedOut() {
  const [signInWithGoogle, _user, loading, error] = useSignInWithGoogle(auth);

  const signIn = useCallback(async () => {
    const userCred = await signInWithGoogle();

    if (!userCred) {
      // TODO: something went wrong!
      return;
    }

    const { user } = userCred;
    writeNewUser(user);
  }, [signInWithGoogle]);

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
    <div className="Main-content">
      <div className="Main-login">
        <Typography.Title level={1}>soft tofu</Typography.Title>
        <Button type="primary" onClick={signIn}>
          Log in
        </Button>
      </div>
    </div>
  );
}

function writeNewUser(user: User) {
  // TODO: check if user already exists?

  const updates: Record<string, unknown> = {};
  updates[`users/${user.uid}/info`] = {
    name: user.displayName,
    photo: user.photoURL,
    uid: user.uid,
  };

  return update(ref(database), updates);
}
