import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { joinProject } from "../../services/projectService";
import { useAuthStore, useSingleProjectStore } from "../../stores";

const FloatingButton = () => {
  const authStore = useAuthStore();
  const user = authStore.user;
  const isLoggedIn = authStore.status === "authorized";
  const [position, setPosition] = useState("sticky top-[32rem] right-8");

  const { project } = useSingleProjectStore();

  const isJoined = project?.users.some(
    (member) => member.userId === user?.userId
  );

  const handleClick = async () => {
    if (!isLoggedIn) {
      toast.error("Please login to join the project");
      return;
    }
    if (!project) return;
    if (isJoined) {
      return;
    }
    const res = await joinProject(project?.projectId);
    if (res.statusCode === 201) {
      toast.success("Joined Successfully");
    }
  };
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 450) {
        setPosition("fixed bottom-8 right-8");
      } else {
        setPosition("sticky top-[32rem] right-8");
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={`transition-all duration-500 ${position} sm:w-auto flex justify-center z-10 items-center`}
    >
      <button
        className={`bg-purple-600 text-white font-semibold py-3 px-6 rounded-full flex items-center justify-center gap-2 shadow-lg transition duration-300 hover:bg-purple-700 ${isJoined ? 'bg-opacity-60 cursor-not-allowed disabled' : ''}`}
        onClick={handleClick}
      >
        {!isJoined ? (
          <>
            <span className='text-xl pb-1'>+</span>
            <span>Join Project</span>
          </>
        ) : (
          <span>Already Joined</span>
        )}
      </button>
    </div>
  );
};

export default FloatingButton;
