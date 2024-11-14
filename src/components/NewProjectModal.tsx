import { useState } from "react";
import { useModalStore } from "../stores";
import { toast } from "react-toastify";
import { createProject } from "../services/projectService";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const NewProjectModal: React.FC = () => {
  const { modals, closeModal } = useModalStore();

  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [sourceCodeLink, setSourceCodeLink] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTagInput(e.target.value);
  };

  const handleAddTag = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (tagInput && !tags.includes(tagInput)) {
      setTags((prevTags) => [...prevTags, tagInput]);
      setTagInput("");
    } else {
      toast.error("Tag cannot be empty or duplicate.");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        toast.error(
          "File is too large. Please select an image smaller than 5MB."
        );
        return;
      }
      setSelectedImage(file);
      const fileUrl = URL.createObjectURL(file);
      setPreviewUrl(fileUrl);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setPreviewUrl("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !projectName ||
      !projectDescription ||
      !sourceCodeLink ||
      tags.length === 0
    ) {
      toast.error("Please fill in all fields and add at least one tag.");
      return;
    }

    const formData = new FormData();
    formData.append(
      "project",
      new Blob(
        [
          JSON.stringify({
            projectName,
            projectDescription,
            sourceCodeLink,
            tags,
          }),
        ],
        { type: "application/json" }
      )
    );
    if (selectedImage) {
      formData.append("image", selectedImage as Blob);
    }

    const response = await createProject(formData);
    if (response.statusCode === 201) {
      toast.success("Project created successfully!");
      closeModal("newProject");

      setProjectName("");
      setProjectDescription("");
      setSourceCodeLink("");
      setTags([]);
      setTagInput("");
      setSelectedImage(null);
      setPreviewUrl("");
    } else {
      toast.error("Failed to create project. Please try again.");
    }
  };

  return (
    <>
      {modals.newProject && (
        <div
          role='dialog'
          aria-labelledby='login-modal-title'
          aria-hidden={!modals.newProject}
          aria-modal={true}
          className='fixed inset-0 z-50 flex items-center justify-center bg-black/85'
          onClick={() => closeModal("newProject")}
        >
          <div
            className='w-full max-w-md p-6 bg-gray-800 rounded-lg shadow-lg'
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className='text-2xl font-semibold text-center mb-6'>
              Make a new project
            </h2>
            <form onSubmit={handleSubmit} className='space-y-4'>
              <input
                type='text'
                placeholder='Project Name'
                className='input input-bordered w-full'
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                required
              />
              <input
                type='text'
                placeholder='Project Description'
                className='input input-bordered w-full'
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                required
              />
              <input
                type='text'
                placeholder='Source Code Link'
                className='input input-bordered w-full'
                value={sourceCodeLink}
                onChange={(e) => setSourceCodeLink(e.target.value)}
                required
              />

              <div className='form-control'>
                <div className='flex space-x-4'>
                  <input
                    type='text'
                    id='tagInput'
                    value={tagInput}
                    onChange={handleTagInputChange}
                    placeholder='Enter a tag'
                    className='input input-bordered w-full'
                  />
                  
                  <button
                    type='button'
                    onClick={handleAddTag}
                    className='btn btn-secondary'
                  >
                    Add
                  </button>
                </div>
              </div>

              <div>
                {tags.length > 0 && (
                  <div>
                    <strong className='block mt-2'>Tags:</strong>
                    <ul className='flex flex-wrap gap-2 mt-2'>
                      {tags.map((tag, index) => (
                        <li
                          key={index}
                          className='flex items-center space-x-2 bg-gray-800 text-white px-3 py-1 rounded-lg'
                        >
                          <span>{tag}</span>
                          <button
                            type='button'
                            onClick={() => handleRemoveTag(tag)}
                            className='text-red-500'
                          >
                            &times;
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Image upload section */}
              <div className='space-y-4'>
                <div className='form-control'>
                  <label className='label'>
                    <span className='label-text text-lg'>Upload Image</span>
                  </label>
                  <input
                    type='file'
                    accept='image/*'
                    onChange={handleImageChange}
                    className='file-input file-input-bordered w-full file-input-primary'
                  />
                </div>
                {previewUrl && (
                  <div className='mt-4'>
                    <div className='flex flex-col items-center'>
                      <img
                        src={previewUrl}
                        alt='Image Preview'
                        width={200}
                        className='rounded-lg shadow-lg border-2 border-gray-200'
                      />
                      <button
                        type='button'
                        onClick={handleRemoveImage}
                        className='btn btn-error mt-2'
                      >
                        Remove Image
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className='flex justify-between items-center mt-6'>
                <button type='submit' className='btn btn-success w-full mt-4'>
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default NewProjectModal;
