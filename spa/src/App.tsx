import { PathProvider } from "./contexts/Path";
import Breadcrumbs from "./components/Breadcrumbs";
import Header from "./components/Header";
import Viewer from "./components/Viewer";

export default function App() {
  return (
    <PathProvider>
      <Header />

      <Breadcrumbs />

      <Viewer rootNodeUrl="/api/rootNode" />
    </PathProvider>
  );
}
