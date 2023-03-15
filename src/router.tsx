import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import DirectMessaging from "./features/DirectMessaging/DirectMessaging";
import Feed from "./features/Feed/Feed";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "feed",
        element: <Feed />,
      },
      {
        path: "dm",
        element: <DirectMessaging />,
      },
    ],
  },
]);
