import React from "react";
import { useProjectNavStore } from "../../stores";
import ProjectOverview from "./ProjectOverview";
import ProjectTeam from "./ProjectTeam";
import ProjectTasks from "./ProjectTasks";
import ProjectContact from "./ProjectContact";
import ProjectActivity from "./ProjectActivity";

const ProjectNavContents: React.FC = () => {
  const activeSection = useProjectNavStore((state) => state.activeSection);

  return (
    <div className='content p-6'>
      {activeSection === "overview" && (
        <ProjectOverview />
      )}
      {activeSection === "team" && (
        <ProjectTeam />
      )}
      {activeSection === "tasks" && (
        <ProjectTasks />
      )}
      {activeSection === "activity" && (
        <ProjectActivity />
      )}
      {activeSection === "contact" && (
        <ProjectContact />
      )}
    </div>
  );
};

export default ProjectNavContents;
