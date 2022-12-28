import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "./firebase";

import { Footer } from "./components/footer";
import { Header } from "./components/header";
import { Main } from "./components/main";

import "./App.css";

function App() {
  const [user] = useAuthState(auth);
  console.log(user);

  return (
    <div className="App">
      {user && <Header />}
      <Main />
      <Footer />
    </div>
  );
}

export default App;
