import { FaEdit, FaGithub, FaUsers } from "react-icons/fa";
import { useAuthStore, useSingleProjectStore } from "../../stores";
import { useState, useEffect, useRef } from "react";
import { updateProject } from "../../services/projectService";
import { toast } from "react-toastify";

const ProjectOverview = () => {
  const authStore = useAuthStore();
  const user = authStore.user;
  const { project, fetchStatus, setProject } = useSingleProjectStore();
  let link = project?.sourceCodeLink;
  if(project?.sourceCodeLink.startsWith("https://")) {
    link = project?.sourceCodeLink;
  } else {
    link = "https://" + project?.sourceCodeLink;
  }

  const [description, setDescription] = useState(project?.projectDescription);
  const [isEditing, setIsEditing] = useState(false);
  const editRef = useRef<HTMLDivElement>(null);
  const editButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsEditing(false);
        setDescription(project?.projectDescription || "");
      }
    };
    window.addEventListener("keydown", handleEscKey);
    return () => {
      window.removeEventListener("keydown", handleEscKey);
    };
  }, [project?.projectDescription]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        editRef.current &&
        !editRef.current.contains(e.target as Node) &&
        !editButtonRef.current?.contains(e.target as Node)
      ) {
        setIsEditing(false);
        setDescription(project?.projectDescription || "");
      }
    };
    window.addEventListener("click", handleClickOutside);
    return () => {
      window.removeEventListener("click", handleClickOutside);
    };
  }, [project?.projectDescription]);

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setDescription(e.target.value);
  };

  if (fetchStatus === "loading") {
    return <p>Loading...</p>;
  }
  if (fetchStatus === "error" || !project) {
    return <p>Failed to load project</p>;
  }

  const handleSaveClick = async () => {
    const updatedProject = {
      ...project,
      projectDescription: description ?? project.projectDescription,
    };

    try {
      await updateProject(project?.projectId, updatedProject);
      toast.success("Description updated successfully");
      setProject(updatedProject);
      setIsEditing(false);
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("An unexpected error occurred");
      }
    }
  };

  return (
    <div className='overview-section h-[45rem] flex flex-row gap-4 card bg-base-200 shadow-xl p-6 mb-4 rounded-lg'>
      <div className='w-2/5 text-center space-y-4'>
        <div className='flex items-center justify-center space-x-2'>
          <p className='text-xl font-semibold text-gray-200'>Description</p>
          {user?.name === project?.users[0].name && !isEditing && (
            <button
              ref={editButtonRef}
              className='text-purple-500 hover:text-purple-700 text-sm p-1 rounded-full transition-colors duration-300'
              onClick={handleEditClick}
            >
              <FaEdit className='text-lg' />
            </button>
          )}
        </div>

        {isEditing ? (
          <div ref={editRef} className='space-y-2'>
            <textarea
              value={description}
              onChange={handleDescriptionChange}
              className='w-full p-2 border rounded-md text-gray-400'
              rows={4}
            />
            <button
              onClick={handleSaveClick}
              className='bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-md'
            >
              Save Description
            </button>
          </div>
        ) : (
          <p className='text-gray-600'>{description}</p>
        )}

        <a
          href={link}
          target='_blank'
          rel='noopener noreferrer'
          className='flex items-center gap-2 text-purple-600 hover:text-purple-800'
        >
          <FaGithub className='text-xl' />
          Source Code Link
        </a>

        <div className='flex items-center justify-center gap-2'>
          <FaUsers className='text-xl text-gray-300' />
          <p className='text-gray-400'>Team Size: {project?.users.length}</p>
        </div>
      </div>

      <div className='w-3/5 flex items-center justify-center bg-base-100 rounded-lg shadow-md p-6'>
        <p className='text-2xl font-semibold text-gray-400'>Analytics</p>
      </div>
    </div>
  );
};

export default ProjectOverview;
