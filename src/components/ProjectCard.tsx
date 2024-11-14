import { Link } from "react-router-dom";
import { CardType } from "../types/cardType";
import { tagColors } from "../utils/tagColors";

const ProjectCard = ({
  projectId,
  projectName,
  projectDescription,
  projectImageLink,
  stars,
  tags,
}: CardType) => {
  

  return (
    <div className='card w-96 bg-base-100 shadow-xl transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-2xl border border-gray-600 rounded-lg overflow-hidden'>
      <Link to={'/api/projects/all/'+projectId} className='relative'>
        <img
          src={projectImageLink}
          alt={projectName}
          className='w-full h-48 object-cover rounded-t-lg transition-transform duration-300 ease-in-out hover:scale-110 hover:brightness-75'
        />
        <div className='absolute bottom-0 left-0 bg-gradient-to-t from-black to-transparent p-4 w-full'>
          <h3 className='text-white text-xl font-semibold'>{projectName}</h3>
        </div>
      </Link>
      <div className='card-body p-4 space-y-4'>
        <p className='text-gray-700 text-base leading-relaxed'>
          {projectDescription}
        </p>

        <div className='flex justify-between items-center mt-4'>
          <span className='text-sm text-gray-500'>Stars: {stars}</span>

          <div className='flex space-x-2'>
            {tags.map((tag, index) => (
              <span
                key={index}
                className={`badge badge-sm badge-outline transition-colors duration-200 ease-in-out text-white ${tagColors[tag] || 'bg-gray-500'}`}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
