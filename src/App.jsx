import { AppProvider } from "./context/AppContext";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import "./index.css";

export default function App() {
  return (
    <AppProvider>
      <RouterProvider router={router} />
    </AppProvider>
  );
}