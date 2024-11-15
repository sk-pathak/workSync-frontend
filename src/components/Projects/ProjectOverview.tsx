import { useSingleProjectStore } from "../../stores";

const ProjectOverview = () => {
  const { project } = useSingleProjectStore();
  const link = "https://"+project?.sourceCodeLink;
  return (
    <div className='overview-section h-96 card bg-base-200 shadow-lg p-1 mb-4'>
      <h2 className='text-2xl font-bold'>{project?.projectName}</h2>
      <p>{project?.projectDescription}</p>
      <a href={link} target="_blank" rel="noopener noreferrer">{project?.sourceCodeLink}</a>
    </div>
  );
};

export default ProjectOverview;
