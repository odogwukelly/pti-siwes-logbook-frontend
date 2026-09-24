import { useQuery } from "@tanstack/react-query";

export interface UserProfileItem {
  id: number;
  email?: string;
  full_name?: string;
  role?: string;
  matric_number?: string;
  department?: string;
  industry_supervisor_id?: number;
  institution_supervisor_id?: number;
  // Add any other attributes returned by your Student or User models
}

const fetchUsersByRole = async (role: string): Promise<UserProfileItem[]> => {
  const token = localStorage.getItem("access_token");

  if (!token) {
    throw new Error("No access token found");
  }

  // Calls your FastAPI endpoint: /api/user/all-user/{role}
  const response = await fetch(`http://localhost:8000/api/user/all-user/${role}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to fetch users list");
  }

  // Your FastAPI endpoint returns a list directly ([...])
  const data: UserProfileItem[] = await response.json();
  return data;
};

const fetchUsersById = async (userId: number) => {
  const token = localStorage.getItem("access_token");

  if (!token) {
    throw new Error("No access token found");
  }
  const response = await fetch(`http://localhost:8000/api/user/${userId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to fetch users list");
  }

  // Your FastAPI endpoint returns a list directly ([...])
  const data = await response.json();
  return data;
};


export function useUsersByRole(role: string) {
  return useQuery({
    queryKey: ["users_by_role", role],
    queryFn: () => fetchUsersByRole(role),
    enabled: !!role,
    staleTime: 0, // Data is immediately stale, ensuring fresh fetches on navigation
    refetchOnMount: "always", // Always refetch when the component mounts
    retry: false,
  });
}

export function getUserById(userId: number) {
  return useQuery({
    queryKey: ["users_by_id", userId],
    queryFn: () => fetchUsersById(userId),
    enabled: !!userId,
    staleTime: 0, // Data is immediately stale, ensuring fresh fetches on navigation
    refetchOnMount: "always", // Always refetch when the component mounts
    retry: false,
  });
}