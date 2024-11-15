import { useParams } from "react-router-dom";
import Navbar from "../components/Common/Navbar";
import Footer from "../components/Common/Footer";
import { useAuthStore, useSingleProjectStore } from "../stores";
import { joinProject } from "../services/projectService";
import { tagColors } from "../utils/tagColors";
import { toast } from "react-toastify";
import ProjectNavbar from "../components/Projects/ProjectNavbar";
import ProjectNavContents from "../components/Projects/ProjectNavContents";
import { useSingleProject } from "../hooks/useSingleProject";

const ProjectPage = () => {
  const isLoggedIn = useAuthStore().status === "authorized";
  const { id } = useParams();
  if (!id) return <div>Invalid project id</div>;

  useSingleProject(parseInt(id));
  const { project, fetchStatus } = useSingleProjectStore();
  const imageUrl = project?.projectImageLink?.replace(/\\/g, "/");
  const fullImageUrl = imageUrl?.startsWith("/") ? imageUrl : `/${imageUrl}`;

  let status = "";
  switch (project?.projectStatus) {
    case "ACTIVE":
      status = "text-green-500";
      break;
    case "INACTIVE":
      status = "text-red-500";
      break;
    case "COMPLETED":
      status = "text-blue-500";
      break;
  }

  const handleClick = async () => {
    if (!isLoggedIn) {
      toast.error("Please login to join the project");
      return;
    }
    if (!project) return;
    const res = await joinProject(project?.projectId);
    if (res.statusCode === 201) {
      toast.success("Joined Successfully");
    }
  };

  return (
    <>
      <Navbar isLoggedIn={isLoggedIn} />
      <div
        style={{ "--image-url": `url(${fullImageUrl})` } as React.CSSProperties}
        className={`flex flex-col sm:flex-row items-center justify-between p-8 bg-cover bg-fixed bg-center bg-[image:var(--image-url)]`}
      >
        {fetchStatus==="loading" && <div>Loading project...</div>}
        {fetchStatus==="error" && <div className='text-red-500'>Error fetching project...</div>}
        {project && (
          <div className='w-full sm:w-3/4 md:w-2/3 lg:w-1/2 xl:w-1/3 p-6 bg-base-300 bg-opacity-90 rounded-lg shadow-xl  mt-80'>
            <div className='flex items-center justify-between mb-4'>
              <h1 className='text-2xl font-bold text-purple-600'>
                {project.projectName}
              </h1>
              <h4 className={`text-sm ${status} font-semibold`}>
                {project.projectStatus}
              </h4>
            </div>
            <h3 className='text-md text-gray-400 mb-2'>
              by {project.createdBy}
            </h3>
            <p className='text-gray-600 mb-4 line-clamp-3'>
              {project.projectDescription}
            </p>

            {project.tags.length > 0 && (
              <div className='flex flex-wrap gap-2'>
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className={`badge badge-sm badge-outline text-white ${
                      tagColors[tag] || "bg-gray-700"
                    }`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
        <div className='sm:w-1/4 flex justify-center items-center mt-20 sm:mt-96'>
          <button
            className='bg-purple-600 text-white font-semibold py-3 px-6 rounded-full flex items-center justify-center gap-2 shadow-lg transition duration-300 hover:bg-purple-700'
            onClick={handleClick}
          >
            <span className='text-xl pb-1'>+</span>
            <span>Join Project</span>
          </button>
        </div>
      </div>
      <div className='projects-page'>
        <ProjectNavbar />
        <ProjectNavContents />
      </div>
      <Footer />
    </>
  );
};

export default ProjectPage;
