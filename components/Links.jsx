import {
  FaInstagram,
  FaSpotify,
  FaYoutube,
  FaApple,
} from "react-icons/fa";
import { SiYoutubemusic } from "react-icons/si";

export default function Links() {
  const trackClick = (platform) => {
    if (typeof window !== 'undefined' && window.umami) {
      window.umami.track(`Genel: ${platform} İkonuna Tıklandı`);
    }
  };

  return (
    <div className="icons">
      <a
        href="https://open.spotify.com/artist/73t1X7rpXydywb5okRLWFJ?si=qBabsCEBQsS2sp4hm9rfRw"
        target="_blank"
        rel="noreferrer"
        aria-label="Spotify"
        onClick={() => trackClick('Spotify')}
      >
        <FaSpotify title="Spotify" />
      </a>
      <a
        href="https://music.apple.com/tr/artist/u%C4%9Fur-u%C4%9Fureli/1814830622?l=tr"
        target="_blank"
        rel="noreferrer"
        aria-label="Apple Music"
        onClick={() => trackClick('Apple Music')}
      >
        <FaApple title="Apple Music" />
      </a>
      <a
        href="https://music.youtube.com/channel/UC1XkRabRwj5H1wf4W-X6tuQ?si=I29PglG1mZ0azF7b"
        target="_blank"
        rel="noreferrer"
        aria-label="YouTube Music"
        onClick={() => trackClick('YouTube Music')}
      >
        <SiYoutubemusic title="YouTube Music" />
      </a>
      <a
        href="https://youtube.com/@ugreli?si=mYfgH0EJE0XngKpy"
        target="_blank"
        rel="noreferrer"
        aria-label="YouTube"
        onClick={() => trackClick('YouTube')}
      >
        <FaYoutube title="YouTube" />
      </a>
      <a
        href="https://www.instagram.com/ugreli?igsh=MXN5dG90NzBocm16Zw=="
        target="_blank"
        rel="noreferrer"
        aria-label="Instagram"
        onClick={() => trackClick('Instagram')}
      >
        <FaInstagram title="Instagram" />
      </a>
    </div>
  );
}