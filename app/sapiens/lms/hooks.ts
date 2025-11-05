/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.
See LICENSE file for details.
*/
import { useState, useEffect } from 'react';
import { gql, useQuery, useMutation } from '@apollo/client';

// =======================================================================
// GraphQL Queries & Mutations
// =======================================================================

const GET_MY_COURSES = gql`
  query GetMyCourses {
    myCourses {
      id
      title
      description
      instructor {
        profile {
          firstName
          lastName
        }
      }
      modules {
        id
        title
      }
      pivcTarget
      constitutionalScore
    }
  }
`;

const GET_MY_PROGRESS = gql`
  query GetMyProgress($courseId: ID!) {
    myProgress(courseId: $courseId) {
      completionRate
      pivcEarned
      currentModule {
        id
        title
      }
      nextModule {
        id
        title
      }
    }
  }
`;

const GET_PIVC_LEADERBOARD = gql`
  query GetPIVCLeaderboard($timeframe: String!) {
    pivcLeaderboard(timeframe: $timeframe) {
      rank
      user {
        username
        profile {
          avatar
        }
      }
      score
      stars
    }
  }
`;

export const GET_PROJECTS = gql`
  query GetProjects($limit: Int, $offset: Int) {
    projects(limit: $limit, offset: $offset) {
      id
      title
      description
      status
      pivcReward
      requiredSkills
      deadline
    }
  }
`;

export const GET_COURSES = gql`
  query GetCourses($limit: Int, $offset: Int) {
    courses(limit: $limit, offset: $offset) {
      id
      title
      description
      instructor {
        id
        profile {
          firstName
          lastName
        }
      }
      enrollments
      pivcTarget
    }
  }
`;

/**
 * Hook to fetch projects with pagination
 * @param limit - Maximum number of projects to fetch (default: 10)
 * @param offset - Number of projects to skip (default: 0)
 * @returns Project data, loading state, and error
 */
export function useProjects(limit: number = 10, offset: number = 0) {
  const { data, loading, error, fetchMore } = useQuery(GET_PROJECTS, {
    variables: { limit, offset },
  });
  
  return { 
    projects: data?.projects, 
    loading, 
    error,
    fetchMore
  };
}

/**
 * Hook to fetch courses with pagination
 * @param limit - Maximum number of courses to fetch (default: 10)
 * @param offset - Number of courses to skip (default: 0)
 * @returns Course data, loading state, and error
 */
export function useCourses(limit: number = 10, offset: number = 0) {
  const { data, loading, error, fetchMore } = useQuery(GET_COURSES, {
    variables: { limit, offset },
  });
  
  return { 
    courses: data?.courses, 
    loading, 
    error,
    fetchMore
  };
}

export const GET_MY_PORTFOLIO = gql`
  query GetMyPortfolio {
    myPortfolio {
      id
      title
      description
      status
      pivcReward
      requiredSkills
      deadline
    }
  }
`;

export const GET_ME = gql`
  query GetMe {
    me {
      username
      profile {
        firstName
        lastName
        avatar
        pivcScore
        constitutionalAlignment
      }
    }
  }
`;

const ENROLL_COURSE = gql`
  mutation EnrollCourse($courseId: ID!) {
    enrollCourse(courseId: $courseId) {
      id
    }
  }
`;

const COMPLETE_MODULE = gql`
  mutation CompleteModule($moduleId: ID!, $courseId: ID!) {
    completeModule(moduleId: $moduleId, courseId: $courseId) {
      completionRate
    }
  }
`;

// =======================================================================
// Data-Fetching Hooks
// =======================================================================

export function useMyCourses() {
  const { data, loading, error } = useQuery(GET_MY_COURSES);
  return {
    courses: data?.myCourses,
    loading,
    error,
  };
}

export function useMyProgress(courseId: string) {
  const { data, loading, error } = useQuery(GET_MY_PROGRESS, {
    variables: { courseId },
    skip: !courseId,
  });
  return {
    progress: data?.myProgress,
    loading,
    error,
  };
}

/**
 * Hook to fetch PIVC leaderboard for a specific timeframe
 * @param timeframe - Time period for leaderboard ('daily' | 'weekly' | 'monthly' | 'all-time')
 * @returns Leaderboard data with properly structured return values
 */
export function usePIVCLeaderboard(timeframe: string = 'monthly') {
  const { data, loading, error, refetch } = useQuery(GET_PIVC_LEADERBOARD, { 
    variables: { timeframe } 
  });
  
  return { 
    leaderboard: data?.pivcLeaderboard,
    loading, 
    error,
    refetch
  };
}

/**
 * Hook to fetch current user's portfolio
 * @returns Portfolio items with loading and error states
 */
export function useMyPortfolio() {
  const { data, loading, error, refetch } = useQuery(GET_MY_PORTFOLIO);
  
  return { 
    portfolio: data?.myPortfolio,
    loading, 
    error,
    refetch
  };
}

/**
 * Hook to fetch current user's profile data
 * @returns User data with profile information
 */
export function useMe() {
  const { data, loading, error, refetch } = useQuery(GET_ME);
  
  return { 
    user: data?.me,
    loading, 
    error,
    refetch
  };
}

export function useEnrollCourse() {
  const [enroll, { data, loading, error }] = useMutation(ENROLL_COURSE, {
    refetchQueries: [{ query: GET_MY_COURSES }],
  });
  return {
    enroll,
    data,
    loading,
    error,
  };
}

export function useCompleteModule() {
  const [complete, { data, loading, error }] = useMutation(COMPLETE_MODULE);
  return {
    complete,
    data,
    loading,
    error,
  };
}

export const GET_LEADERBOARD = gql`
  query GetLeaderboard($limit: Int, $offset: Int) {
    leaderboard(limit: $limit, offset: $offset) {
      rank
      user {
        id
        username
        profile {
          avatar
          pivcScore
        }
      }
      score
    }
  }
`;

export const GET_MENTORS = gql`
  query GetMentors($limit: Int, $offset: Int) {
    mentors(limit: $limit, offset: $offset) {
      id
      username
      profile {
        firstName
        lastName
        avatar
        bio
      }
    }
  }
`;

export const GET_STUDY_GROUPS = gql`
  query GetStudyGroups($limit: Int, $offset: Int) {
    studyGroups(limit: $limit, offset: $offset) {
      id
      name
      description
      members {
        id
        username
        profile {
          avatar
        }
      }
      course {
        id
        title
      }
    }
  }
`;

/**
 * Hook to fetch leaderboard with pagination
 * @param limit - Maximum number of entries to fetch (default: 10)
 * @param offset - Number of entries to skip (default: 0)
 * @returns Leaderboard data with fetchMore for pagination
 */
export function useLeaderboard(limit: number = 10, offset: number = 0) {
  const { data, loading, error, fetchMore } = useQuery(GET_LEADERBOARD, {
    variables: { limit, offset },
  });
  
  return { 
    leaderboard: data?.leaderboard,
    loading, 
    error, 
    fetchMore 
  };
}

/**
 * Hook to fetch mentors with pagination
 * @param limit - Maximum number of mentors to fetch (default: 10)
 * @param offset - Number of mentors to skip (default: 0)
 * @returns Mentor data with fetchMore for pagination
 */
export function useMentors(limit: number = 10, offset: number = 0) {
  const { data, loading, error, fetchMore } = useQuery(GET_MENTORS, {
    variables: { limit, offset },
  });
  
  return { 
    mentors: data?.mentors,
    loading, 
    error, 
    fetchMore 
  };
}

/**
 * Hook to fetch study groups with pagination
 * @param limit - Maximum number of groups to fetch (default: 10)
 * @param offset - Number of groups to skip (default: 0)
 * @returns Study group data with fetchMore for pagination
 */
export function useStudyGroups(limit: number = 10, offset: number = 0) {
  const { data, loading, error, fetchMore } = useQuery(GET_STUDY_GROUPS, {
    variables: { limit, offset },
  });
  
  return { 
    studyGroups: data?.studyGroups,
    loading, 
    error, 
    fetchMore 
  };
}

