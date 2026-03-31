
  import { createRoot } from "react-dom/client";
  import App from "./app/App.tsx";
  import "./styles/index.css";
  import { validateEnv } from "./app/lib/env";

  // Fail fast if required environment variables are missing
  validateEnv();

  createRoot(document.getElementById("root")!).render(<App />);