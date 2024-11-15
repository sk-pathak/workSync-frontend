import { useEffect } from "react";
import { useSingleProjectStore } from "../stores";
import { getProject } from "../services/projectService";

export const useSingleProject = (id: number) => {
  const { setProject, setFetchStatus } = useSingleProjectStore();
  useEffect(() => {
    if (!id) return;

    const fetchProject = async () => {
      setFetchStatus("loading");
      try {
        const projectData = await getProject(id);
        setProject(projectData.project);
        setFetchStatus("success");
      } catch (err) {
        setFetchStatus("error");
      }
    };

    fetchProject();
  }, [id]);

  return;
}