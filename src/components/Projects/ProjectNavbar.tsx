import React, { useEffect } from "react";
import { useProjectNavStore } from "../../stores";

const ProjectNavbar: React.FC = () => {
  const setActiveSection = useProjectNavStore(
    (state) => state.setActiveSection
  );

  const activeSection = useProjectNavStore((state) => state.activeSection);

  useEffect(() => {
    if (!activeSection) {
      setActiveSection("overview");
    }
  }, [activeSection, setActiveSection]);

  return (
    <div className='navbar bg-base-300 text-primary-content p-4 h-10'>
      <div className='flex space-x-12'>
        <button
          className={`${activeSection=="overview"?"text-purple-500":"text-white"} btn bg-transparent border-0 hover:text-purple-500`}
          onClick={() => setActiveSection("overview")}
        >
          Overview
        </button>
        <button
          className={`${activeSection=="team"?"text-purple-500":"text-white"} btn bg-transparent border-0 hover:text-purple-500`}
          onClick={() => setActiveSection("team")}
        >
          Team
        </button>
        <button
          className={`${activeSection=="tasks"?"text-purple-500":"text-white"} btn bg-transparent border-0 hover:text-purple-500`}
          onClick={() => setActiveSection("tasks")}
        >
          Tasks
        </button>
        <button
          className={`${activeSection=="activity"?"text-purple-500":"text-white"} btn bg-transparent border-0 hover:text-purple-500`}
          onClick={() => setActiveSection("activity")}
        >
          Activity Logs
        </button>
        <button
          className={`${activeSection=="contact"?"text-purple-500":"text-white"} btn bg-transparent border-0 hover:text-purple-500`}
          onClick={() => setActiveSection("contact")}
        >
          Contact
        </button>
      </div>
    </div>
  );
};

export default ProjectNavbar;
