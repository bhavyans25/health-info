export interface HealthDiseaseStoreItem {
  id: string;
  title: string;
  description: string;
  mediaUrls: string[];
  authorId: string;
  authorName: string;
  createdAt: string;
  expiresAt: string;
  comments: Array<{
    id: string;
    diseaseId: string;
    userId: string;
    authorName: string;
    text: string;
    createdAt: string;
    replies: Array<{
      id: string;
      commentId: string;
      userId: string;
      authorName: string;
      text: string;
      createdAt: string;
    }>;
  }>;
}

export const inMemoryDiseases: HealthDiseaseStoreItem[] = [
  {
    id: 'disease_seed_1',
    title: 'Acute Viral Fever & Respiratory Symptoms',
    description: 'High grade fever (102°F) accompanied by dry cough, sore throat, severe fatigue, and body muscle aches. Onset started 3 days ago. Looking for advice on symptom management and warning signs for medical consultation.',
    mediaUrls: [
      'https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?auto=format&fit=crop&w=800&q=80'
    ],
    authorId: 'user_dr_sam',
    authorName: 'Dr. Sam (Public Health Officer)',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + (2 * 365 * 24 * 60 * 60 * 1000)).toISOString(),
    comments: [
      {
        id: 'comment_seed_1',
        diseaseId: 'disease_seed_1',
        userId: 'user_alex',
        authorName: 'Alex River',
        text: 'Are there any skin rashes or difficulty breathing observed?',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        replies: [
          {
            id: 'reply_seed_1',
            commentId: 'comment_seed_1',
            userId: 'user_dr_sam',
            authorName: 'Dr. Sam (Public Health Officer)',
            text: 'No skin rash reported yet. If shortness of breath occurs, seek immediate emergency care.',
            createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          }
        ]
      }
    ]
  },
  {
    id: 'disease_seed_2',
    title: 'Seasonal Allergy / Allergic Rhinitis Signs',
    description: 'Sneezing fits, itchy watery eyes, nasal congestion, and mild pressure around the sinus area. Triggered during spring pollen season.',
    mediaUrls: [
      'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80'
    ],
    authorId: 'user_maria',
    authorName: 'Maria C.',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + (2 * 365 * 24 * 60 * 60 * 1000)).toISOString(),
    comments: []
  }
];
