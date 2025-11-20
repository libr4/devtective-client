export type ProjectMember = {
  userPublicId: string;
  displayName: string;
  username?: string;
  email?: string;
  avatarUrl?: string;
  position?: string; // "Developer" | "QA" | "Product Owner" | ...
  invitationStatus: "INVITED" | "PENDING" | "ACCEPTED" | "DECLINED" | "REMOVED";
};

export type Project = {
  id?: string; // numeric/uuid
  projectId?: string; // some backends return this
  publicId?: string;
  name: string;
  description?: string;
  startDate?: string | null;
  endDate?: string | null;
  workspace?: { id?: string; publicId?: string; name?: string } | null;
  leaders?: Array<{ publicId: string; displayName: string; username?: string; avatarUrl?: string }>; // optional
  members?: ProjectMember[]; // optional (fallback if separate endpoint not available)
  linkCode?: string;
};
