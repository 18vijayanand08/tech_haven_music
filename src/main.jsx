
import { createRoot } from "react-dom/client";

import UserContext from "./context/UserContext";
import AuthContext from "./context/AuthContext";
import AlbumContext from "./context/AlbumContext";
import App from "./App";
import AudioPlayerContext from "./context/AudioPlayerContext";

import { registerSW } from 'virtual:pwa-register'

registerSW({
  onNeedRefresh() {},
  onOfflineReady() {},
})

createRoot(document.getElementById("root")).render(
  <AuthContext>
    <UserContext>
      <AlbumContext>
        <AudioPlayerContext>
          <App />
        </AudioPlayerContext>
      </AlbumContext>
    </UserContext>
  </AuthContext>
);
