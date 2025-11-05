/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.
See LICENSE file for details.

MOCK GRAPHQL DATA FOR EDUCATION PLATFORM
Realistic data for development and testing until backend is connected
*/

/**
 * Mock user data
 */
export const mockUser = {
  id: 'user_1',
  username: 'learning_champion',
  profile: {
    firstName: 'John',
    lastName: 'Doe',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
    pivcScore: 2847,
    constitutionalAlignment: 0.95,
    tagline: 'Passionate Learner | Full-Stack Developer',
    bio: 'Building the future through education and technology.',
  },
};

/**
 * Mock courses data
 */
export const mockCourses = [
  {
    id: 'course_1',
    title: 'Introduction to Python Programming',
    description: 'Learn Python from scratch with hands-on projects and real-world applications.',
    instructor: {
      id: 'instructor_1',
      profile: {
        firstName: 'Sarah',
        lastName: 'Johnson',
      },
    },
    modules: [
      { id: 'mod_1', title: 'Python Basics' },
      { id: 'mod_2', title: 'Data Structures' },
      { id: 'mod_3', title: 'Object-Oriented Programming' },
    ],
    enrollments: 1247,
    pivcTarget: 500,
    constitutionalScore: 0.98,
    progress: 67,
  },
  {
    id: 'course_2',
    title: 'Web Development with React & Next.js',
    description: 'Master modern web development with React 18 and Next.js 14.',
    instructor: {
      id: 'instructor_2',
      profile: {
        firstName: 'Michael',
        lastName: 'Chen',
      },
    },
    modules: [
      { id: 'mod_4', title: 'React Fundamentals' },
      { id: 'mod_5', title: 'Next.js App Router' },
      { id: 'mod_6', title: 'Server Components' },
    ],
    enrollments: 934,
    pivcTarget: 750,
    constitutionalScore: 0.96,
    progress: 42,
  },
  {
    id: 'course_3',
    title: 'Data Science & Machine Learning',
    description: 'Dive into data science with Python, pandas, and scikit-learn.',
    instructor: {
      id: 'instructor_3',
      profile: {
        firstName: 'Emily',
        lastName: 'Rodriguez',
      },
    },
    modules: [
      { id: 'mod_7', title: 'Data Analysis with Pandas' },
      { id: 'mod_8', title: 'Machine Learning Basics' },
      { id: 'mod_9', title: 'Deep Learning Intro' },
    ],
    enrollments: 2103,
    pivcTarget: 1000,
    constitutionalScore: 0.97,
    progress: 15,
  },
];

/**
 * Mock projects/portfolio data
 */
export const mockPortfolio = [
  {
    id: 'project_1',
    title: 'E-Commerce Platform',
    description: 'Full-stack e-commerce application built with Next.js, TypeScript, and Stripe payments.',
    status: 'completed',
    pivcReward: 850,
    requiredSkills: ['React', 'Next.js', 'TypeScript', 'Stripe', 'PostgreSQL'],
    deadline: new Date('2024-12-15').toISOString(),
  },
  {
    id: 'project_2',
    title: 'Social Media Dashboard',
    description: 'Analytics dashboard with real-time data visualization and user engagement metrics.',
    status: 'completed',
    pivcReward: 650,
    requiredSkills: ['React', 'Chart.js', 'Firebase', 'TailwindCSS'],
    deadline: new Date('2024-11-20').toISOString(),
  },
  {
    id: 'project_3',
    title: 'Task Management App',
    description: 'Collaborative task manager with real-time updates and team collaboration features.',
    status: 'in-progress',
    pivcReward: 500,
    requiredSkills: ['React', 'WebSockets', 'Node.js', 'MongoDB'],
    deadline: new Date('2025-01-10').toISOString(),
  },
];

/**
 * Mock leaderboard data
 */
export const mockLeaderboard = [
  {
    rank: 1,
    user: {
      id: 'user_lead_1',
      username: 'alex_learning',
      profile: {
        firstName: 'Alex',
        lastName: 'Kim',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
        pivcScore: 15847,
      },
    },
    score: 15847,
    stars: 5,
  },
  {
    rank: 2,
    user: {
      id: 'user_lead_2',
      username: 'sarah_codes',
      profile: {
        firstName: 'Sarah',
        lastName: 'Martinez',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
        pivcScore: 12403,
      },
    },
    score: 12403,
    stars: 5,
  },
  {
    rank: 3,
    user: {
      id: 'user_lead_3',
      username: 'david_builder',
      profile: {
        firstName: 'David',
        lastName: 'Lee',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
        pivcScore: 10982,
      },
    },
    score: 10982,
    stars: 4,
  },
  {
    rank: 4,
    user: {
      id: 'user_lead_4',
      username: 'emma_dev',
      profile: {
        firstName: 'Emma',
        lastName: 'Thompson',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma',
        pivcScore: 9234,
      },
    },
    score: 9234,
    stars: 4,
  },
  {
    rank: 5,
    user: {
      id: 'user_lead_5',
      username: 'mike_learn',
      profile: {
        firstName: 'Michael',
        lastName: 'Brown',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael',
        pivcScore: 7891,
      },
    },
    score: 7891,
    stars: 4,
  },
];

/**
 * Mock mentors data
 */
export const mockMentors = [
  {
    id: 'mentor_1',
    username: 'prof_johnson',
    profile: {
      firstName: 'Robert',
      lastName: 'Johnson',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Robert',
      bio: 'Full-stack developer with 10+ years experience. Passionate about teaching.',
      tagline: 'Senior Software Engineer at Google',
    },
  },
  {
    id: 'mentor_2',
    username: 'dr_smith',
    profile: {
      firstName: 'Jennifer',
      lastName: 'Smith',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jennifer',
      bio: 'Data scientist specializing in machine learning and AI.',
      tagline: 'ML Research Scientist',
    },
  },
  {
    id: 'mentor_3',
    username: 'architect_lee',
    profile: {
      firstName: 'James',
      lastName: 'Lee',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James',
      bio: 'System architect building scalable applications.',
      tagline: 'Principal Engineer at Meta',
    },
  },
];

/**
 * Mock study groups data
 */
export const mockStudyGroups = [
  {
    id: 'group_1',
    name: 'Python Study Circle',
    description: 'Weekly Python coding sessions and project collaboration',
    members: [
      {
        id: 'mem_1',
        username: 'alice_codes',
        profile: { avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice' },
      },
      {
        id: 'mem_2',
        username: 'bob_learns',
        profile: { avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob' },
      },
    ],
    course: {
      id: 'course_1',
      title: 'Introduction to Python Programming',
    },
  },
  {
    id: 'group_2',
    name: 'Web Dev Masters',
    description: 'Building real-world web applications together',
    members: [
      {
        id: 'mem_3',
        username: 'carol_builds',
        profile: { avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carol' },
      },
      {
        id: 'mem_4',
        username: 'dave_ships',
        profile: { avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dave' },
      },
    ],
    course: {
      id: 'course_2',
      title: 'Web Development with React & Next.js',
    },
  },
];

/**
 * Mock earning projects/opportunities
 */
export const mockProjects = [
  {
    id: 'project_opp_1',
    title: 'Build Landing Page for Startup',
    description: 'Create a modern, responsive landing page with animations and contact form',
    status: 'available',
    pivcReward: 350,
    requiredSkills: ['HTML', 'CSS', 'JavaScript', 'Tailwind'],
    deadline: new Date('2025-01-15').toISOString(),
  },
  {
    id: 'project_opp_2',
    title: 'E-Commerce Dashboard Development',
    description: 'Build admin dashboard with charts, analytics, and product management',
    status: 'available',
    pivcReward: 750,
    requiredSkills: ['React', 'Next.js', 'Chart.js', 'PostgreSQL'],
    deadline: new Date('2025-01-30').toISOString(),
  },
  {
    id: 'project_opp_3',
    title: 'Mobile App UI/UX Design',
    description: 'Design complete mobile app interface with prototypes',
    status: 'available',
    pivcReward: 500,
    requiredSkills: ['Figma', 'UI/UX Design', 'Prototyping'],
    deadline: new Date('2025-01-20').toISOString(),
  },
];

/**
 * Mock progress data
 */
export const mockProgress = {
  completionRate: 67,
  pivcEarned: 847,
  currentModule: {
    id: 'mod_2',
    title: 'Data Structures',
  },
  nextModule: {
    id: 'mod_3',
    title: 'Object-Oriented Programming',
  },
};

/**
 * Generate additional leaderboard entries for pagination
 */
export function generateLeaderboardEntries(offset: number = 0, limit: number = 10): any[] {
  const entries = [];
  for (let i = 0; i < limit; i++) {
    const rank = offset + i + 1;
    entries.push({
      rank,
      user: {
        id: `user_${rank}`,
        username: `user_${rank}`,
        profile: {
          firstName: `User`,
          lastName: `${rank}`,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=User${rank}`,
          pivcScore: Math.max(1000, 16000 - (rank * 150)),
        },
      },
      score: Math.max(1000, 16000 - (rank * 150)),
    });
  }
  return entries;
}

/**
 * Get all mock data
 */
export const mockData = {
  user: mockUser,
  courses: mockCourses,
  portfolio: mockPortfolio,
  leaderboard: mockLeaderboard,
  mentors: mockMentors,
  studyGroups: mockStudyGroups,
  projects: mockProjects,
  progress: mockProgress,
};
