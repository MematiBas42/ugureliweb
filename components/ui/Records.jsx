import Cards from "./Cards";
import UpcomingCards from "./UpcomingCards";
import Wrapper from "./Wrapper";

export default function Records({ releases, upcoming = [] }) {
  // Split releases into first (newest) and the rest
  const firstRelease = releases.length > 0 ? releases[0] : null;
  const otherReleases = releases.length > 0 ? releases.slice(1) : [];

  return (
    <Wrapper title="Releases" line>
      {/* 1. The Newest Release (Always First) - PRIORITY: TRUE */}
      {firstRelease && <Cards key={firstRelease.id} record={firstRelease} priority={true} />}

      {/* 2. Upcoming Releases (Inserted After Newest) - PRIORITY: First 2 items TRUE */}
      {upcoming.length > 0 && upcoming.map((record, index) => (
        <UpcomingCards key={record.id} record={record} priority={index < 2} />
      ))}
      
      {/* 3. The Rest of the Releases - PRIORITY: FALSE (Lazy Load) */}
      {otherReleases.map((record) => (
        <Cards key={record.id} record={record} priority={false} />
      ))}
    </Wrapper>
  );
}
