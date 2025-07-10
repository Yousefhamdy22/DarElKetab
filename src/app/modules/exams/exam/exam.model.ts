export interface exam{

    examID: number;
    Name: string;
    Description: string;
    title: string;
    GroupId: number;
    ExamDate: Date;
    totaldegree: number;
    isActive: boolean;
    groupName?: string; 
    studentCount?: number; 
    PassDegree: number;
    //
    averageScore?: number;
    status?: string;
    participants: []; // Array of student IDs
}

export interface ExamPayload {
    examID?: number;
    Name: string;
    Description: string;
    totaldegree: number;
    ExamDate: string;
    GroupId: number;
    PassDegree?: number;
  }
  
export interface ExamStats {
    total: number;
    average: number;
    nextExamDate: string;
    participationRate: number;
  }