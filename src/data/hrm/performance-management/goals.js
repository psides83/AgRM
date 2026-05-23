import { users } from 'data/users';

export const getTagChipColor = (tag) => {
  switch (tag) {
    case 'High':
      return 'success';
    case 'In Progress':
      return 'primary';
    case 'Hold':
      return 'neutral';
    case 'Medium':
    case 'Delayed':
      return 'warning';
    case 'At Risk':
    case 'Low':
      return 'error';
  }
};

export const goals = [
  {
    id: 1,
    title: 'Prepare and Launch the Next Version of the AgRM Platform',
    description:
      'I applied to this company because of its strong reputation for innovation and quality in content creation. The company’s values align with my passion for storytelling and delivering engaging content. I am excited about the opportunity to contribute my writing expertise to a team that values creativity.',
    createdBy: users[0],
    progress: 20,
    createdDate: '2022-07-10',
    dueDate: '2022-08-15',
    tags: ['High', 'In Progress'],
    subGoals: [
      'Release AgRM within 7 days',
      'Release Phoenix within 5 days',
      'Release Falcon within 3 days',
    ],
  },
  {
    id: 2,
    title: 'Launch Beta Testing Program for the New Mobile Application',
    description:
      'I applied to this company because of its strong reputation for innovation and quality in content creation. The company’s values align with my passion for storytelling and delivering engaging content. I am excited about the opportunity to contribute my writing expertise to a team that values creativity.',
    createdBy: users[1],
    progress: 30,
    createdDate: '2025-04-01',
    dueDate: '2025-04-20',
    tags: ['High', 'Delayed'],
    subGoals: [
      'Release AgRM within 7 days',
      'Release Phoenix within 5 days',
      'Release Falcon within 3 days',
    ],
  },
  {
    id: 3,
    title: 'Integrate Third-Party Payroll System with Internal HRM Platform',
    description:
      'I applied to this company because of its strong reputation for innovation and quality in content creation. The company’s values align with my passion for storytelling and delivering engaging content. I am excited about the opportunity to contribute my writing expertise to a team that values creativity.',
    createdBy: users[2],
    progress: 30,
    createdDate: '2021-12-15',
    dueDate: '2022-01-10',
    tags: ['Medium', 'Hold'],
    subGoals: [
      'Release AgRM within 7 days',
      'Release Phoenix within 5 days',
      'Release Falcon within 3 days',
    ],
  },
  {
    id: 4,
    title: 'Roll Out Marketing Campaign to Support Upcoming Feature Releases',
    description:
      'I applied to this company because of its strong reputation for innovation and quality in content creation. The company’s values align with my passion for storytelling and delivering engaging content. I am excited about the opportunity to contribute my writing expertise to a team that values creativity.',
    createdBy: users[3],
    progress: 30,
    createdDate: '2023-06-01',
    dueDate: '2023-07-04',
    tags: ['High', 'In Progress'],
    subGoals: [
      'Release AgRM within 7 days',
      'Release Phoenix within 5 days',
      'Release Falcon within 3 days',
    ],
  },
  {
    id: 5,
    title: 'Redesign the User Dashboard to Improve Engagement and Usability',
    description:
      'I applied to this company because of its strong reputation for innovation and quality in content creation. The company’s values align with my passion for storytelling and delivering engaging content. I am excited about the opportunity to contribute my writing expertise to a team that values creativity.',
    createdBy: users[4],
    progress: 50,
    createdDate: '2023-09-21',
    dueDate: '2023-10-14',
    tags: ['Low', 'In Progress'],
    subGoals: [
      'Release AgRM within 7 days',
      'Release Phoenix within 5 days',
      'Release Falcon within 3 days',
    ],
  },
  {
    id: 6,
    title: 'Develop and Deploy the New Time Tracking Module for Employees',
    description:
      'I applied to this company because of its strong reputation for innovation and quality in content creation. The company’s values align with my passion for storytelling and delivering engaging content. I am excited about the opportunity to contribute my writing expertise to a team that values creativity.',
    createdBy: users[5],
    progress: 30,
    createdDate: '2024-12-28',
    dueDate: '2025-02-28',
    tags: ['High', 'At Risk'],
    subGoals: [
      'Release AgRM within 7 days',
      'Release Phoenix within 5 days',
      'Release Falcon within 3 days',
    ],
  },
  {
    id: 7,
    title: 'Streamline the Onboarding Workflow Across All Departments',
    description:
      'I applied to this company because of its strong reputation for innovation and quality in content creation. The company’s values align with my passion for storytelling and delivering engaging content. I am excited about the opportunity to contribute my writing expertise to a team that values creativity.',
    createdBy: users[6],
    progress: 90,
    createdDate: '2023-05-15',
    dueDate: '2023-06-05',
    tags: ['High', 'In Progress'],
    subGoals: [
      'Release AgRM within 7 days',
      'Release Phoenix within 5 days',
      'Release Falcon within 3 days',
    ],
  },
  {
    id: 8,
    title: 'Conduct a Full Security Audit and Implement Recommended Fixes',
    description:
      'I applied to this company because of its strong reputation for innovation and quality in content creation. The company’s values align with my passion for storytelling and delivering engaging content. I am excited about the opportunity to contribute my writing expertise to a team that values creativity.',
    createdBy: users[7],
    progress: 30,
    createdDate: '2024-02-25',
    dueDate: '2024-03-15',
    tags: ['High', 'In Progress'],
    subGoals: [
      'Release AgRM within 7 days',
      'Release Phoenix within 5 days',
      'Release Falcon within 3 days',
    ],
  },
  {
    id: 9,
    title: 'Prepare and Launch the Next Version of the AgRM Platform',
    description:
      'I applied to this company because of its strong reputation for innovation and quality in content creation. The company’s values align with my passion for storytelling and delivering engaging content. I am excited about the opportunity to contribute my writing expertise to a team that values creativity.',
    createdBy: users[8],
    progress: 25,
    createdDate: '2022-10-10',
    dueDate: '2022-11-11',
    tags: ['High', 'In Progress'],
    subGoals: [
      'Release AgRM within 7 days',
      'Release Phoenix within 5 days',
      'Release Falcon within 3 days',
    ],
  },
  {
    id: 10,
    title: 'Prepare and Launch the Next Version of the AgRM Platform',
    description:
      'I applied to this company because of its strong reputation for innovation and quality in content creation. The company’s values align with my passion for storytelling and delivering engaging content. I am excited about the opportunity to contribute my writing expertise to a team that values creativity.',
    createdBy: users[9],
    progress: 40,
    createdDate: '2022-08-15',
    dueDate: '2022-09-30',
    tags: ['High', 'In Progress'],
    subGoals: [
      'Release AgRM within 7 days',
      'Release Phoenix within 5 days',
      'Release Falcon within 3 days',
    ],
  },
  {
    id: 11,
    title: 'Prepare and Launch the Next Version of the AgRM Platform',
    description:
      'I applied to this company because of its strong reputation for innovation and quality in content creation. The company’s values align with my passion for storytelling and delivering engaging content. I am excited about the opportunity to contribute my writing expertise to a team that values creativity.',
    createdBy: users[10],
    progress: 70,
    createdDate: '2022-04-15',
    dueDate: '2022-05-22',
    tags: ['High', 'In Progress'],
    subGoals: [
      'Release AgRM within 7 days',
      'Release Phoenix within 5 days',
      'Release Falcon within 3 days',
    ],
  },
  {
    id: 12,
    title: 'Prepare and Launch the Next Version of the AgRM Platform',
    description:
      'I applied to this company because of its strong reputation for innovation and quality in content creation. The company’s values align with my passion for storytelling and delivering engaging content. I am excited about the opportunity to contribute my writing expertise to a team that values creativity.',
    createdBy: users[11],
    progress: 30,
    createdDate: '2021-11-13',
    dueDate: '2021-12-01',
    tags: ['High', 'In Progress'],
    subGoals: [
      'Release AgRM within 7 days',
      'Release Phoenix within 5 days',
      'Release Falcon within 3 days',
    ],
  },
];

export const comments = [
  {
    id: 1,
    author: {
      ...users[13],
      name: 'Uncle Owen',
    },
    createdAt: '2025-09-14T15:14:00',
    message: {
      text: 'Modern architecture is truly redefining our world! The blend of aesthetics and functionality is mind-blowing.',
    },
    engagement: {
      likes: 2000,
      comments: 34,
    },
    replies: [],
  },
  {
    id: 2,
    author: users[3],
    createdAt: '2025-09-14T14:28:00',
    message: {
      text: "Loved the futuristic designs in this video! It's amazing to see how innovation is shaping our cities.",
    },
    engagement: {
      likes: 14200,
      comments: 134,
    },
    replies: [
      {
        id: 3,
        author: users[8],
        createdAt: '2025-09-14T14:50:00',
        message: {
          text: 'The focus on sustainability in architecture is inspiring! Hope to see more eco-friendly designs in the future.',
        },
        engagement: {
          likes: 11,
          comments: 3,
        },
        replies: [],
      },
      {
        id: 4,
        author: {
          ...users[13],
          name: 'Uncle Owen',
        },
        createdAt: '2025-09-14T15:15:00',
        message: {
          text: "These structures are truly ahead of their time! Can't wait to see what the next decade brings for modern architecture.",
        },
        engagement: {
          likes: 32,
          comments: 19,
        },
        replies: [],
      },
      {
        id: 5,
        author: users[5],
        createdAt: '2025-09-14T15:20:00',
        message: {
          text: 'Incredible how modern architecture blends technology and creativity! AI and 3D printing are changing everything.',
        },
        engagement: {
          likes: 22,
          comments: 13,
        },
        replies: [],
      },
    ],
  },
];
