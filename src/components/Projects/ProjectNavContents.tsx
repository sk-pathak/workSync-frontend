import React from "react";
import { useProjectNavStore } from "../../stores";
import ProjectOverview from "./ProjectOverview";

const ProjectNavContents: React.FC = () => {
  const activeSection = useProjectNavStore((state) => state.activeSection);

  return (
    <div className='content p-6'>
      {activeSection === "overview" && (
        <ProjectOverview />
      )}
      {activeSection === "team" && (
        <div className='team-section card bg-green-100 shadow-lg p-6 mb-4'>
          <h2 className='text-2xl font-bold'>Team Content</h2>
          <p>Here are some cool projects. You can showcase your work here.</p>
        </div>
      )}
      {activeSection === "relevant links" && (
        <div className='links-section card bg-red-100 shadow-lg p-6 mb-4'>
          <h2 className='text-2xl font-bold'>Links Content</h2>
          <p>Learn more about us. This section can describe who you are.</p>
        </div>
      )}
      {activeSection === "contact" && (
        <div className='contact-section card bg-yellow-100 shadow-lg p-6 mb-4'>
          <h2 className='text-2xl font-bold'>Contact Content</h2>
          <p>
            If you want to get in touch, this is where you add contact info.
          </p>
        </div>
      )}
    </div>
  );
};

export default ProjectNavContents;
