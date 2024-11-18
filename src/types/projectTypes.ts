import { UserRes } from "./userTypes";

export type Project = {
  projectId: number;
  projectName: string;
  projectDescription: string;
  projectImageLink: string;
  tags: string[];
  sourceCodeLink: string;
  projectStatus: string;
  createdBy: string;
  date: string;
  stars: number;
  users: UserRes[];
};

export type Res = {
  message: string;
  statusCode: number;
  hasMore: boolean;
  totalCount: number;
  currentPage: number;
  totalPages: number;
};

export type ProjectsResponse = Res & {
  projectList: Project[];
};

export type ProjectResponse = Res & {
  project: Project;
};