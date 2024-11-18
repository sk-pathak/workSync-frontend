import { useSingleProjectStore } from "../../stores";
import { FaUser, FaEnvelope } from "react-icons/fa";

const ProjectTeam = () => {
  const { project } = useSingleProjectStore();
  return (
    <div className='space-y-4'>
      {project?.users.map((user) => (
        <div
          key={user.userId}
          className='card bg-base-200 shadow-lg p-4 rounded-xl hover:shadow-2xl transition-all'
        >
          <div className='flex items-center space-x-4'>
            <div className='avatar w-12 h-12 rounded-full overflow-hidden'>
              <img
                src={user?.userProfile}
                alt={user.name}
                className='object-cover w-full h-full'
              />
            </div>
            <div>
              <h2 className='text-2xl font-semibold text-primary'>
                {user.name}
              </h2>
            </div>
          </div>

          <div className='mt-4 flex items-center space-x-4 text-gray-600'>
            <span className='flex items-center space-x-1'>
              <FaUser />
              <span>{user.projectRole || "User"}</span>
            </span>
            <span className='flex items-center space-x-1'>
              <FaEnvelope />
              <span>{user.email}</span>
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProjectTeam;
