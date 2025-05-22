import { Career } from '@prisma/client';

export const careers: Omit<Career, 'id'>[] = [
  {
    name: 'Software Engineering',
    description: 'Design and develop software systems.',
  },
  {
    name: 'Psychology',
    description: 'Study mental processes and human behavior.',
  },
  {
    name: 'Graphic Design',
    description: 'Create visual concepts using computer software.',
  },
  {
    name: 'Business Administration',
    description: 'Manage and lead business operations.',
  },
];
