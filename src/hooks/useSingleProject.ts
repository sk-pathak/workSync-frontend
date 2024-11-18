import { useEffect } from "react";
import { useSingleProjectStore } from "../stores";
import { getProject } from "../services/projectService";

export const useSingleProject = (id: number) => {
  const { setProject, setFetchStatus } = useSingleProjectStore();

  useEffect(() => {
    if (!id) return;

    setProject(null);
    setFetchStatus("loading");

    const fetchProject = async () => {
      try {
        const projectData = await getProject(id);
        setProject(projectData.project);
        setFetchStatus("success");
      } catch (err) {
        setFetchStatus("error");
        console.error("Error fetching project:", err);
      }
    };

    fetchProject();

    return () => {
      setFetchStatus("idle");
    };
  }, [id, setProject, setFetchStatus]);
};
