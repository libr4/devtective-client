export type TaskRow = {
  id: number;                // maps to taskNumber for DataGrid
  taskNumber: number;
  title: string;
  description: string;
  priority?: string;
  status?: string;
  type?: string;
  technology?: string;
  deadline?: string;         // ISO
  assignedToFullName?: string[];     // names
};

export type FiltersDTO = {
  types: string[];
  priorities: string[];
  statuses: string[];
  technologies: string[];
  members: string[]; // display names
};