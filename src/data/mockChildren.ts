
import { Child } from '@/types';

export const mockChildren: Child[] = [
  {
    id: 1,
    name: 'Leo',
    avatarUrl: '/placeholder.svg',
    aiSummary: "Leo is showing signs of anxiety, especially around transitions and new social situations. He may benefit from a predictable routine and extra verbal preparation before changes in activity. Monitor for shirt-chewing and offer gentle redirections.",
    dob: '2019-05-20',
    allergies: ['Peanuts', 'Dairy'],
    medications: ['Albuterol Inhaler (as needed for asthma)'],
  },
  {
    id: 2,
    name: 'Mia',
    avatarUrl: '/placeholder.svg',
    aiSummary: "Mia has been very energetic and is excelling in creative activities. She sometimes has trouble sharing during group play. Encourage her to use her words to express her needs and praise her for sharing.",
    dob: '2020-02-10',
    allergies: ['None'],
    medications: [],
  }
];
