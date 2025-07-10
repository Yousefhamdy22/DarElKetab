export interface ExamResultDto {
    id: number;
    examId: number;
    examName: string;
    studentId: number;
    studentName: string;
    score: number;
    submittedDate?: Date;
    comments: string;
  }
  
  export interface ExamResultStatsDto {
    examId: number;
    examName: string;
    averageScore: number;
    highestScore: number;
    lowestScore: number;
    totalResults: number;
  }