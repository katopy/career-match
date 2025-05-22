import { Question } from '@prisma/client';

export const questions: Omit<Question, 'id'>[] = [
  { text: 'Do you enjoy solving logic puzzles or coding challenges?' },
  { text: 'Are you interested in understanding human behavior?' },
  { text: 'Do you like working with visuals and creativity?' },
  { text: 'Do you see yourself managing or leading a team?' },
];
