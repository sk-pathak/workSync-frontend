import { useState, useEffect } from "react";
import { useAuthStore, useSingleProjectStore } from "../../stores";
import { updateProject } from "../../services/projectService";
import { toast } from "react-toastify";
import { FaTrash } from "react-icons/fa"; // For the "Remove" button icon

const ProjectContact = () => {
  const authStore = useAuthStore();
  const user = authStore.user;
  const { project, fetchStatus, setProject } = useSingleProjectStore();

  const [newLink, setNewLink] = useState<{
    linkName: string;
    linkUrl: string;
    linkDesc: string;
  }>({
    linkName: "",
    linkUrl: "",
    linkDesc: "",
  });

  const handleAddLink = async () => {
    if (project?.projectId === undefined || !newLink.linkUrl || !newLink.linkDesc || !newLink.linkName) return;

    const updatedProject = {
      ...project,
      projectLinks: [
        ...project.projectLinks,
        {
          linkId: Date.now(),
          linkUrl: newLink.linkUrl,
          linkName: newLink.linkName,
          linkDesc: newLink.linkDesc,
        },
      ],
    };

    try {
      await updateProject(project.projectId, updatedProject);
      toast.success("Link added successfully");
      setProject(updatedProject);
      setNewLink({ linkName: "", linkUrl: "", linkDesc: "" });
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("An unexpected error occurred");
      }
    }
  };

  const handleRemoveLink = async (linkId: number) => {
    if (project?.projectId === undefined) return;

    const updatedProject = {
      ...project,
      projectLinks: project.projectLinks.filter(link => link.linkId !== linkId),
    };

    try {
      await updateProject(project.projectId, updatedProject);
      toast.success("Link removed successfully");
      setProject(updatedProject);
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("An unexpected error occurred");
      }
    }
  };

  useEffect(() => {
    if (fetchStatus === "success" && project) {
      setNewLink({ linkName: "", linkUrl: "", linkDesc: "" });
    }
  }, [fetchStatus, project]);

  if (fetchStatus === "loading") return <div className="text-center text-lg">Loading...</div>;
  if (fetchStatus === "error") return <div className="text-center text-lg text-red-500">Error loading project...</div>;

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-semibold text-center">Project Contacts</h2>

      {user?.name == project?.users[0].name && (<div className="space-y-4 max-w-md mx-auto">
        <div>
          <input
            type="text"
            placeholder="Link Name"
            className="input input-bordered w-full"
            value={newLink.linkName}
            onChange={(e) => setNewLink({ ...newLink, linkName: e.target.value })}
          />
        </div>

        <div>
          <input
            type="text"
            placeholder="URL"
            className="input input-bordered w-full"
            value={newLink.linkUrl}
            onChange={(e) => setNewLink({ ...newLink, linkUrl: e.target.value })}
          />
        </div>

        <div>
          <input
            type="text"
            placeholder="Description"
            className="input input-bordered w-full"
            value={newLink.linkDesc}
            onChange={(e) => setNewLink({ ...newLink, linkDesc: e.target.value })}
          />
        </div>

        <button onClick={handleAddLink} className="btn btn-primary w-full">
          Add Link
        </button>
      </div>)}

      <div className="space-y-4 max-w-3xl mx-auto">
        {project?.projectLinks.map((link) => (
          <div
            key={link.linkId}
            className="flex items-center justify-between p-4 border rounded-lg shadow-sm bg-base-200 hover:bg-base-300"
          >
            <div className="flex flex-col">
              <a
                href={link.linkUrl}
                className="text-blue-500 text-lg font-semibold hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {link.linkName}
              </a>
              <p className="text-sm text-gray-500">{link.linkDesc}</p>
            </div>

            {user?.name === project?.users[0].name && (
              <button
                onClick={() => handleRemoveLink(link.linkId)}
                className="btn btn-sm btn-danger flex items-center space-x-1"
              >
                <FaTrash /> <span>Remove</span>
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectContact;
