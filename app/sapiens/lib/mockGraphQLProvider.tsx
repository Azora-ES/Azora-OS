/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.
See LICENSE file for details.

MOCK GRAPHQL PROVIDER FOR EDUCATION PLATFORM
In-memory GraphQL implementation for development/testing
*/

'use client';

import React from 'react';
import { ApolloClient, InMemoryCache, ApolloProvider, gql } from '@apollo/client';
import { SchemaLink } from '@apollo/client/link/schema';
import { makeExecutableSchema } from '@graphql-tools/schema';
import {
  mockUser,
  mockCourses,
  mockPortfolio,
  mockLeaderboard,
  mockMentors,
  mockStudyGroups,
  mockProjects,
  mockProgress,
  generateLeaderboardEntries,
} from './mockGraphQLData';

/**
 * GraphQL Schema Definition
 */
const typeDefs = gql`
  type Profile {
    firstName: String!
    lastName: String!
    avatar: String
    pivcScore: Int
    constitutionalAlignment: Float
    tagline: String
    bio: String
  }

  type User {
    id: ID!
    username: String!
    profile: Profile!
  }

  type Module {
    id: ID!
    title: String!
  }

  type Instructor {
    id: ID!
    profile: Profile!
  }

  type Course {
    id: ID!
    title: String!
    description: String!
    instructor: Instructor!
    modules: [Module!]!
    enrollments: Int!
    pivcTarget: Int!
    constitutionalScore: Float!
    progress: Int
  }

  type Project {
    id: ID!
    title: String!
    description: String!
    status: String!
    pivcReward: Int!
    requiredSkills: [String!]!
    deadline: String!
  }

  type LeaderboardEntry {
    rank: Int!
    user: User!
    score: Int!
    stars: Int
  }

  type Mentor {
    id: ID!
    username: String!
    profile: Profile!
  }

  type StudyGroupMember {
    id: ID!
    username: String!
    profile: Profile!
  }

  type StudyGroupCourse {
    id: ID!
    title: String!
  }

  type StudyGroup {
    id: ID!
    name: String!
    description: String!
    members: [StudyGroupMember!]!
    course: StudyGroupCourse!
  }

  type Progress {
    completionRate: Int!
    pivcEarned: Int!
    currentModule: Module
    nextModule: Module
  }

  type Query {
    me: User
    myCourses: [Course!]!
    myProgress(courseId: ID!): Progress
    myPortfolio: [Project!]!
    courses(limit: Int, offset: Int): [Course!]!
    projects(limit: Int, offset: Int): [Project!]!
    leaderboard(limit: Int, offset: Int): [LeaderboardEntry!]!
    pivcLeaderboard(timeframe: String!): [LeaderboardEntry!]!
    mentors(limit: Int, offset: Int): [Mentor!]!
    studyGroups(limit: Int, offset: Int): [StudyGroup!]!
  }

  type Mutation {
    enrollCourse(courseId: ID!): Course
    completeModule(moduleId: ID!, courseId: ID!): Progress
  }
`;

/**
 * GraphQL Resolvers
 */
const resolvers = {
  Query: {
    me: () => mockUser,
    
    myCourses: () => mockCourses.slice(0, 3),
    
    myProgress: (_: any, { courseId }: { courseId: string }) => mockProgress,
    
    myPortfolio: () => mockPortfolio,
    
    courses: (_: any, { limit = 10, offset = 0 }: { limit?: number; offset?: number }) => {
      return mockCourses.slice(offset, offset + limit);
    },
    
    projects: (_: any, { limit = 10, offset = 0 }: { limit?: number; offset?: number }) => {
      return mockProjects.slice(offset, offset + limit);
    },
    
    leaderboard: (_: any, { limit = 10, offset = 0 }: { limit?: number; offset?: number }) => {
      if (offset < mockLeaderboard.length) {
        const realEntries = mockLeaderboard.slice(offset, offset + limit);
        const needed = limit - realEntries.length;
        if (needed > 0) {
          const generated = generateLeaderboardEntries(mockLeaderboard.length, needed);
          return [...realEntries, ...generated];
        }
        return realEntries;
      }
      return generateLeaderboardEntries(offset, limit);
    },
    
    pivcLeaderboard: (_: any, { timeframe }: { timeframe: string }) => {
      // Return different data based on timeframe if needed
      return mockLeaderboard;
    },
    
    mentors: (_: any, { limit = 10, offset = 0 }: { limit?: number; offset?: number }) => {
      return mockMentors.slice(offset, offset + limit);
    },
    
    studyGroups: (_: any, { limit = 10, offset = 0 }: { limit?: number; offset?: number }) => {
      return mockStudyGroups.slice(offset, offset + limit);
    },
  },
  
  Mutation: {
    enrollCourse: (_: any, { courseId }: { courseId: string }) => {
      const course = mockCourses.find(c => c.id === courseId);
      if (course) {
        console.log(`✅ Enrolled in course: ${course.title}`);
        return { ...course, progress: 0 };
      }
      return null;
    },
    
    completeModule: (_: any, { moduleId, courseId }: { moduleId: string; courseId: string }) => {
      console.log(`✅ Completed module: ${moduleId} in course: ${courseId}`);
      return {
        ...mockProgress,
        completionRate: Math.min(100, mockProgress.completionRate + 10),
        pivcEarned: mockProgress.pivcEarned + 50,
      };
    },
  },
};

/**
 * Create executable schema
 */
const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

/**
 * Create Apollo Client with mock schema
 */
const createMockApolloClient = () => {
  return new ApolloClient({
    link: new SchemaLink({ schema }),
    cache: new InMemoryCache(),
    defaultOptions: {
      watchQuery: {
        fetchPolicy: 'cache-and-network',
        errorPolicy: 'all',
      },
      query: {
        fetchPolicy: 'cache-first',
        errorPolicy: 'all',
      },
      mutate: {
        errorPolicy: 'all',
      },
    },
  });
};

/**
 * Mock GraphQL Provider Component
 * Wraps the app with Apollo Provider using mock schema
 * 
 * @example
 * ```tsx
 * <MockGraphQLProvider>
 *   <YourApp />
 * </MockGraphQLProvider>
 * ```
 */
export function MockGraphQLProvider({ children }: { children: React.ReactNode }) {
  const client = React.useMemo(() => createMockApolloClient(), []);

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}

/**
 * Hook to check if we're using mock data
 */
export function useIsMockData() {
  return process.env.NEXT_PUBLIC_USE_MOCK_DATA !== 'false';
}

export default MockGraphQLProvider;
