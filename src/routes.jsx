import { createBrowserRouter } from "react-router-dom";
import AppLayout from "./layouts/AppLayout";
import HomeScreen from "./screens/HomeScreen";
import DocumentEditor from "./screens/DocumentEditor";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <HomeScreen /> },
      { path: "doc/:docId", element: <DocumentEditor /> },
    ],
  },
]);
