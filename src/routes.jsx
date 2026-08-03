import { createBrowserRouter } from "react-router-dom";
import AppLayout from "./layouts/AppLayout";
import HomeScreen from "./DocumentsHomePage/HomeScreen";
import DocumentEditor from "./screens/DocumentEditor";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <HomeScreen /> },
      { path: "/document/:documentId", element: <DocumentEditor /> },
    ],
  },
]);
