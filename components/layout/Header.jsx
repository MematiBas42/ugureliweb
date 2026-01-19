import Links from "../Links";
import Image from "next/image";

export default function Header() {
  return (
    <>
      <header className="header">
        <div className="background">
          <Image
            src="/main.webp"
            alt="Background"
            fill
            priority
            style={{ objectFit: "cover", objectPosition: "top center" }}
          />
        </div>
        <h1>Uğur Uğureli</h1>

        <p className="tag-line">{process.env.NEXT_PUBLIC_ARTIST_TAGLINE}</p>

        <Links />
      </header>
    </>
  );
}
