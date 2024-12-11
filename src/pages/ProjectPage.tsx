import { useParams } from "react-router-dom";
import Navbar from "../components/Common/Navbar";
import Footer from "../components/Common/Footer";
import { useAuthStore, useSingleProjectStore } from "../stores";
import { tagColors } from "../utils/tagColors";
import ProjectNavbar from "../components/Projects/ProjectNavbar";
import ProjectNavContents from "../components/Projects/ProjectNavContents";
import { useSingleProject } from "../hooks/useSingleProject";
import FloatingButton from "../components/Projects/FloatingButton";
import { FaStar, FaRegStar } from "react-icons/fa";
import { useState, useEffect } from "react";
import { starProject } from "../services/projectService";

const ProjectPage = () => {
  const store = useAuthStore();
  const user = store.user;
  const isLoggedIn = store.status === "authorized";
  const { id } = useParams();
  if (!id || isNaN(Number(id))) return <div>Invalid project ID</div>;

  useSingleProject(parseInt(id));

  const { project, fetchStatus } = useSingleProjectStore();
  const imageUrl = project?.projectImageLink?.replace(/\\/g, "/");
  const fullImageUrl =
    imageUrl && imageUrl.startsWith("/") ? imageUrl : `/${imageUrl}`;
  const [starred, setStarred] = useState(() => {
    return user &&
      project?.starredBy?.some(
        (u) => JSON.stringify(u) === JSON.stringify(user)
      )
      ? true
      : false;
  });

  const getStatusClass = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "text-green-500";
      case "INACTIVE":
        return "text-red-500";
      case "COMPLETED":
        return "text-blue-500";
      default:
        return "text-gray-500";
    }
  };

  useEffect(() => {
    if (
      user &&
      project?.starredBy?.some(
        (u) => JSON.stringify(u) === JSON.stringify(user)
      )
    ) {
      setStarred(true);
    } else {
      setStarred(false);
    }
  }, [user, project]);

  if (fetchStatus === "loading") {
    return <div>Loading project...</div>;
  }

  if (fetchStatus === "error") {
    return <div className='text-red-500'>Error fetching project...</div>;
  }

  if (!project) {
    return <div>Project not found</div>;
  }

  const handleClick = () => {
    starProject(project.projectId);
    if (starred) {
      setStarred(false);
    } else {
      setStarred(true);
    }
  };

  return (
    <>
      <Navbar isLoggedIn={isLoggedIn} />

      <div
        style={
          {
            "--image-url": `url(${fullImageUrl || "/default-image.jpg"})`,
          } as React.CSSProperties
        }
        className='flex flex-col sm:flex-row items-center justify-between p-8 bg-cover bg-fixed bg-center bg-[image:var(--image-url)]'
      >
        <div className='w-full sm:w-3/4 md:w-2/3 lg:w-1/2 xl:w-1/3 p-6 bg-base-300 bg-opacity-90 rounded-lg shadow-xl mt-80'>
          <div className='flex items-center justify-between mb-4'>
            <h1 className='text-2xl font-bold text-purple-600'>
              {project.projectName}
            </h1>
            <h4
              className={`text-sm ${getStatusClass(
                project.projectStatus
              )} font-semibold`}
            >
              {project.projectStatus}
            </h4>
          </div>

          <h3 className='text-md text-gray-400 mb-2'>
            by {project.createdBy || "Unknown"}
          </h3>

          <div className='flex flex-wrap items-center gap-2'>
            {project.tags && project.tags.length > 0 && (
              <div className='flex items-center gap-2'>
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
            {isLoggedIn && user?.name !== project?.users[0].name && (
              <div className='ml-auto'>
                {starred ? (
                  <FaStar
                    onClick={handleClick}
                    className='text-yellow-300 cursor-pointer'
                  />
                ) : (
                  <FaRegStar
                    onClick={handleClick}
                    className='text-gray-400 cursor-pointer'
                  />
                )}
              </div>
            )}
          </div>
        </div>
        {user?.name !== project?.users[0].name && <FloatingButton />}
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
