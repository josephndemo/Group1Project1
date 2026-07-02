import { useContext } from 'react';
import { BookClubContext } from './bookClubContext.js';

export function useBookClub() {
  const context = useContext(BookClubContext);

  if (!context) {
    throw new Error('useBookClub must be used inside BookClubProvider');
  }

  return context;
}