import React from "react";
import { useProjectNavStore } from "../../stores";

const ProjectNavbar: React.FC = () => {
  const setActiveSection = useProjectNavStore(
    (state) => state.setActiveSection
  );

  return (
    <div className='navbar bg-base-300 text-primary-content p-4 h-10'>
      <div className='flex space-x-12'>
        <button
          className='btn bg-transparent border-0 text-white hover:text-purple-500'
          onClick={() => setActiveSection("overview")}
        >
          Overview
        </button>
        <button
          className='btn bg-transparent border-0 text-white hover:text-purple-500'
          onClick={() => setActiveSection("team")}
        >
          Team
        </button>
        <button
          className='btn bg-transparent border-0 text-white hover:text-purple-500'
          onClick={() => setActiveSection("tasks")}
        >
          Tasks
        </button>
        <button
          className='btn bg-transparent border-0 text-white hover:text-purple-500'
          onClick={() => setActiveSection("activity")}
        >
          Activity Logs
        </button>
        <button
          className='btn bg-transparent border-0 text-white hover:text-purple-500'
          onClick={() => setActiveSection("contact")}
        >
          Contact
        </button>
      </div>
    </div>
  );
};

export default ProjectNavbar;
