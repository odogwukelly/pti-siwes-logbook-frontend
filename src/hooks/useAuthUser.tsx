import { useQuery } from "@tanstack/react-query";

export interface UserData {
  id: number;
  student_id: number;
  email: string;
  full_name: string;
  role: string;
  matric_number?: string;
  department?: string;
  industrial_organization?: string;
  industry_supervisor_id: number
  institution_supervisor_id: number
}

const fetchUser = async (): Promise<UserData> => {
  const token = localStorage.getItem("access_token");

  if (!token) {
    throw new Error("No access token found");
  }

  const response = await fetch("http://localhost:8000/api/user/me", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("user_data");
    }
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to fetch user profile");
  }

  const data = await response.json();

  // Flatten the nested backend response to match the UserData interface
  const flattenedUser: UserData = {
    id: data.user_data.id,
    student_id: data.profile_data? data.profile_data.id : 0,
    email: data.user_data.email,
    full_name: data.user_data.full_name,
    role: data.user_data.role,
    matric_number: data.profile_data? data.profile_data?.matric_number : "",
    department: data.profile_data? data.profile_data?.department : "",
    industrial_organization: data.profile_data? data.profile_data?.industrial_organization : "",
    industry_supervisor_id: data.profile_data? data.profile_data?.industry_supervisor_id : 0,
    institution_supervisor_id: data.profile_data? data.profile_data?.institution_supervisor_id : 0,
  };

  // Keep local storage synced with fresh flat data
  localStorage.setItem("user_data", JSON.stringify(flattenedUser));
  return flattenedUser;
};

export function useAuthUser() {
  return useQuery({
    queryKey: ["authUser"],
    queryFn: fetchUser,
    initialData: () => {
      try {
        const cached = localStorage.getItem("user_data");
        return cached ? JSON.parse(cached) : undefined;
      } catch {
        return undefined;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnMount: "always",
    retry: false,
  });
}