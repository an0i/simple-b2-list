import Breadcrumbs from "./components/Breadcrumbs";
import Header from "./components/Header";
import Viewer from "./components/Viewer";
import { usePath } from "./contexts/Path";

export default function App() {
  const path = usePath();

  return (
    <>
      <Header />

      <Breadcrumbs path={path()} />

      <Viewer path={path()} rootNodeUrl="/api/rootNode" />
    </>
  );
}
