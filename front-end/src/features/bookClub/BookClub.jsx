import BookClubPage from './BookClubPage.jsx';
import { BookClubProvider } from './context/BookClubContext.jsx';

export default function BookClub(props) {
  return (
    <BookClubProvider>
      <BookClubPage {...props} />
    </BookClubProvider>
  );
}