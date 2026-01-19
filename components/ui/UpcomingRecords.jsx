import UpcomingCards from "./UpcomingCards";
import Wrapper from "./Wrapper";

export default function UpcomingRecords({ releases }) {
  if (!releases || releases.length === 0) return null;

  return (
    <Wrapper title="Upcoming" line>
      {releases.map((record) => (
        <UpcomingCards key={record.id} record={record} />
      ))}
    </Wrapper>
  );
}
