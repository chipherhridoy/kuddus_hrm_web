export interface UserDto {
  id: number;
  name: string;
  email: string;
  role: "Admin" | "Employee" | string;
  department: string;
  designation: string;
  faceEnrolled: boolean;
}

export interface AttendanceRecord {
  id: number;
  userId: number;
  userName: string;
  userRole: string;
  userDepartment: string;
  date: string;
  checkInTime: string;
  checkOutTime: string | null;
  status: "Present" | "Late" | string;
  notes: string;
  latitude?: number;
  longitude?: number;
}

export interface AttendanceStats {
  totalEmployees: number;
  presentToday: number;
  lateToday: number;
  onLeaveToday: number;
  wfhToday?: number;
}

export interface LeaveRequest {
  id: number;
  userId: number;
  userName: string;
  userRole: string;
  userDepartment: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: "Pending" | "Approved" | "Rejected";
  createdAt: string;
}

export interface WfhRequest {
  id: number;
  userId: number;
  userName: string;
  userRole: string;
  userDepartment: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: "Pending" | "Approved" | "Rejected";
  createdAt: string;
  reviewedAt?: string | null;
}

export interface CreateWfhDto {
  startDate: string;
  endDate: string;
  reason: string;
}

export interface AuthResponse {
  token: string;
  expiresAt: string;
  user: UserDto;
}
