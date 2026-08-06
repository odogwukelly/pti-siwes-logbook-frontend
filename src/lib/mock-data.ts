export type LogStatus = "approved" | "pending" | "rejected" | "draft";

export interface LogEntry {
  id: string;
  date: string;
  unit: string;
  activity: string;
  hours: number;
  status: LogStatus;
  skills: string[];
}

export const currentStudent = {
  name: "Efe Okoro",
  matric: "PTI/PE/2021/0742",
  initials: "EO",
  department: "Petroleum Engineering",
  level: "ND II",
  company: "NNPC E&P, Port Harcourt",
  supervisor: "Engr. Samuel Adebayo",
  supervisorRole: "NNPC Upstream Division",
  institutionSupervisor: "Dr. Ngozi Eze",
  weekCurrent: 14,
  weekTotal: 24,
  hoursLogged: 560.5,
  entriesFiled: 72,
  approvals: 68,
  compliance: 94,
};

export const recentLogs: LogEntry[] = [
  {
    id: "L-0072",
    date: "2024-10-24",
    unit: "Rig Maintenance",
    activity:
      "Calibration of pressure sensors on Well-4; replaced faulty transmitter and verified flow against gauge readings.",
    hours: 8,
    status: "approved",
    skills: ["Instrumentation", "Calibration"],
  },
  {
    id: "L-0071",
    date: "2024-10-23",
    unit: "HSE Briefing",
    activity:
      "Assisted as evacuation drill coordinator; documented muster point response times for safety report.",
    hours: 7,
    status: "pending",
    skills: ["HSE", "Reporting"],
  },
  {
    id: "L-0070",
    date: "2024-10-22",
    unit: "Process Control",
    activity:
      "Monitored flow rates and crude viscosity at Station 2; logged hourly readings to SCADA.",
    hours: 8,
    status: "approved",
    skills: ["SCADA", "Process"],
  },
  {
    id: "L-0069",
    date: "2024-10-21",
    unit: "Drilling Lab",
    activity: "Mud weight & rheology tests on water-based drilling fluid samples.",
    hours: 6.5,
    status: "approved",
    skills: ["Lab", "Drilling Fluids"],
  },
  {
    id: "L-0068",
    date: "2024-10-18",
    unit: "Geophysics",
    activity: "Data entry for 2D seismic survey logs across the Bonny field.",
    hours: 7,
    status: "rejected",
    skills: ["Seismic", "Data"],
  },
  {
    id: "L-0067",
    date: "2024-10-17",
    unit: "Pipeline",
    activity: "Pressure tests on pipeline segment 4B; documented anomalies for review.",
    hours: 8,
    status: "approved",
    skills: ["Pipeline", "Testing"],
  },
];

export const weeklyHours = [
  { week: "W08", hours: 38 },
  { week: "W09", hours: 42 },
  { week: "W10", hours: 40 },
  { week: "W11", hours: 44 },
  { week: "W12", hours: 39 },
  { week: "W13", hours: 45 },
  { week: "W14", hours: 32 },
];

export const skillBreakdown = [
  { name: "Drilling", value: 28 },
  { name: "HSE", value: 18 },
  { name: "Process Ctrl", value: 22 },
  { name: "Lab Work", value: 14 },
  { name: "Reporting", value: 18 },
];

// 12 weeks × 7 days activity intensity (0–4)
export const activityHeatmap: number[][] = Array.from({ length: 12 }, (_, w) =>
  Array.from({ length: 7 }, (_, d) => {
    const seed = (w * 7 + d) % 11;
    if (d === 6) return 0;
    if (d === 5 && seed < 6) return 1;
    return [2, 3, 4, 3, 2, 4, 3, 2, 3, 4, 1][seed];
  }),
);

export const notifications = [
  {
    id: 1,
    type: "approval",
    title: "Log L-0072 approved",
    body: "Engr. Adebayo signed your log for Oct 24.",
    time: "10 min ago",
    unread: true,
  },
  {
    id: 2,
    type: "warning",
    title: "Weekly summary overdue",
    body: "Submit Week 13 summary before Friday 5pm.",
    time: "2 hrs ago",
    unread: true,
  },
  {
    id: 3,
    type: "info",
    title: "ITF Form 8 reminder",
    body: "Mid-term evaluation form due end of month.",
    time: "Yesterday",
    unread: false,
  },
  {
    id: 4,
    type: "info",
    title: "New comment from supervisor",
    body: "Engr. Adebayo added a note to L-0070.",
    time: "Yesterday",
    unread: false,
  },
];

export const supervisorStudents = [
  { id: "s1", name: "Efe Okoro", matric: "PTI/PE/2021/0742", dept: "Petroleum Engineering", week: 14, compliance: 94, pending: 2, status: "active" },
  { id: "s2", name: "Aisha Bello", matric: "PTI/ME/2021/0518", dept: "Mechanical Engineering", week: 14, compliance: 88, pending: 0, status: "active" },
  { id: "s3", name: "Tunde Okafor", matric: "PTI/WF/2021/0331", dept: "Welding & Fabrication", week: 12, compliance: 76, pending: 4, status: "attention" },
  { id: "s4", name: "Chiamaka Eze", matric: "PTI/PE/2021/0699", dept: "Petroleum Engineering", week: 14, compliance: 99, pending: 0, status: "active" },
  { id: "s5", name: "Yusuf Ibrahim", matric: "PTI/CH/2021/0410", dept: "Chemical Engineering", week: 11, compliance: 62, pending: 7, status: "attention" },
  { id: "s6", name: "Grace Adeyemi", matric: "PTI/ME/2021/0612", dept: "Mechanical Engineering", week: 14, compliance: 91, pending: 1, status: "active" },
];

export const departmentStats = [
  { dept: "Petroleum", students: 142, active: 138, compliance: 92 },
  { dept: "Mechanical", students: 96, active: 91, compliance: 88 },
  { dept: "Welding", students: 64, active: 58, compliance: 81 },
  { dept: "Chemical", students: 78, active: 72, compliance: 86 },
  { dept: "Electrical", students: 88, active: 84, compliance: 90 },
  { dept: "Marine", students: 54, active: 49, compliance: 84 },
];

export const monthlyApprovals = [
  { month: "May", submitted: 1240, approved: 1180 },
  { month: "Jun", submitted: 1410, approved: 1322 },
  { month: "Jul", submitted: 1520, approved: 1450 },
  { month: "Aug", submitted: 1480, approved: 1402 },
  { month: "Sep", submitted: 1620, approved: 1551 },
  { month: "Oct", submitted: 1740, approved: 1612 },
];

export const auditLogs = [
  { id: "A-9183", actor: "Dr. Ngozi Eze", action: "Approved batch of 12 weekly summaries", target: "Petroleum / 2021", time: "08:42" },
  { id: "A-9182", actor: "ITF Officer (J. Bala)", action: "Flagged compliance under 70%", target: "Yusuf Ibrahim", time: "08:31" },
  { id: "A-9181", actor: "System", action: "Auto-locked 3 overdue logbooks", target: "Mechanical / 2021", time: "07:55" },
  { id: "A-9180", actor: "Engr. Adebayo", action: "Rejected log entry", target: "L-0068 — Efe Okoro", time: "Yesterday" },
  { id: "A-9179", actor: "Admin", action: "Created new department", target: "Marine Engineering", time: "Yesterday" },
];