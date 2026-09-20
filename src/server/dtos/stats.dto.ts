export interface SystemStatsResponseDto {
  users: {
    total: number;
    students: number;
    teachers: number;
    admins: number;
    active: number;
    inactive: number;
  };
  examinations: {
    total: number;
    published: number;
    draft: number;
  };
  submissions: {
    total: number;
    graded: number;
    underReview: number;
    pending: number;
  };
  evaluations: {
    averageScore: number;
    passRate: number;
    aiConfidenceAvg: number;
    totalEvaluated: number;
  };
  system: {
    serverStatus: string;
    uptime: string;
    avgLatencyMs: number;
    activeSessions: number;
    memoryUsageMb: number;
  };
}
