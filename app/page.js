import Records from "../components/ui/Records";
import Videos from "../components/ui/Videos";
import Loading from "./loading";
import { Suspense } from "react";
import { getRecords } from "../lib/getRecords";
import { getUpcoming } from "../lib/getUpcoming";
import { getVideos } from "../lib/getVideos";

async function RecordsSection() {
  // Fetch both in parallel for performance
  const [records, rawUpcoming] = await Promise.all([
    getRecords(),
    getUpcoming()
  ]);

  // Normalize string for comparison (remove case, special chars, spaces)
  const normalize = (str) => 
    str?.toLowerCase()
       .replace(/['".,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
       .replace(/\s/g, "") || "";

  // Filter out upcoming releases that are already in the records list
  const upcoming = rawUpcoming.filter(upItem => {
    const upTitle = normalize(upItem.title);
    // Check if ANY record has a similar title
    const isPublished = records.some(rec => normalize(rec.title).includes(upTitle) || upTitle.includes(normalize(rec.title)));
    return !isPublished;
  });
  
  return <Records releases={records} upcoming={upcoming} />;
}

async function VideosSection() {
  const youtubeIds = await getVideos();
  return <Videos ids={youtubeIds} />;
}

export default function Home() {
  return (
    <>
      <Suspense fallback={<Loading />}>
        <RecordsSection />
      </Suspense>
      <Suspense fallback={<Loading />}>
        <VideosSection />
      </Suspense>
    </>
  );
}