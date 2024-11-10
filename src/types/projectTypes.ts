export type Project = {
  projectId: number;
  projectName: string;
  projectDescription: string;
  projectImageLink: string;
  tags: string[];
  sourceCodeLink: string;
  createdBy: string;
  date: string;
  stars: number;
};

export type Res = {
  message: string;
  statusCode: number;
  hasMore: boolean;
  totalCount: number;
  currentPage: number;
  totalPages: number;
};

export type ProjectResponse = Res & {
  projectList: Project[];
};
