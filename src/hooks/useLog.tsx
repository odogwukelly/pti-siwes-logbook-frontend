import { useQuery } from "@tanstack/react-query";

export interface LogEntry {
  id: number;
  student_id: number;
  hours_worked: number;
  log_date: string;
  title: string;
  activity_description: string;
  skills_acquired?: string;
  challenges_faced?: string;
  evidence_file_url?: string;
  status: "approved" | "pending" | "rejected" | "draft";
  created_at: string;
}

export function useLogs(studentId: number) {
  return useQuery<LogEntry[]>({
    queryKey: ["daily_logs", studentId],
    queryFn: async () => {
      const token = localStorage.getItem("access_token");
      if (!token) throw new Error("No access token found");

      const response = await fetch(`http://localhost:8000/api/log/all/${studentId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch log entries");
      }

      return response.json();
    },
  });
}