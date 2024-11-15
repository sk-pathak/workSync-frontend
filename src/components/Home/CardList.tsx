import ProjectCard from "./ProjectCard";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getProjects } from "../../services/projectService";
import { IoIosArrowDropright, IoIosArrowDropleft } from "react-icons/io";
import { useProjects } from "../../hooks/useProjects";
import { useProjectStore } from "../../stores";

const CardList = () => {
  const queryClient = useQueryClient();
  const { data, isLoading, isError, isPlaceholderData } = useProjects();
  const {
    searchTerm,
    sortBy,
    order,
    page,
    setPage,
  } = useProjectStore();

  useEffect(() => {
    if (!isPlaceholderData && data?.hasMore) {
      queryClient.prefetchQuery({
        queryKey: ["projects", searchTerm, sortBy, order, page + 1],
        queryFn: () => getProjects(searchTerm, sortBy, order, page + 1),
      });
    }
  }, [data, isPlaceholderData, page, queryClient]);

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error fetching projects</div>;

  return (
    <div className='space-y-4 projects w-[60%] pl-4'>
      <div className='grid place-items-center grid-cols-1 sm:grid-cols-2 gap-6'>
        {data?.projectList.map((project) => (
          <ProjectCard key={project.projectId} {...project} />
        ))}
      </div>
      <div className='flex pt-10 items-center justify-center'>
        <div className='flex space-x-4'>
          <button
            className='inline-block cursor-pointer rounded-md p-3 text-center text-sm font-semibold uppercase text-white transition duration-200 ease-in-out disabled:text-gray-400 disabled:cursor-not-allowed disabled:opacity-50'
            onClick={() => setPage((old) => Math.max(old - 1, 0))}
            disabled={page === 0}
          >
            <IoIosArrowDropleft
              className='text-purple-600 hover:text-purple-600 transform hover:scale-125 transition-transform duration-200 ease-in-out'
              size={24}
            />{" "}
          </button>
          <span className='pt-2'>Page {page + 1}</span>
          <button
            className='inline-block cursor-pointer rounded-md p-3 text-center text-sm font-semibold uppercase text-white transition duration-200 ease-in-out disabled:text-gray-400 disabled:cursor-not-allowed disabled:opacity-50'
            onClick={() => {
              setPage((old) => (data?.hasMore ? old + 1 : old));
            }}
            disabled={isPlaceholderData || !data?.hasMore}
          >
            <IoIosArrowDropright
              className='text-purple-600 hover:text-purple-600 transform hover:scale-125 transition-transform duration-200 ease-in-out'
              size={24}
            />{" "}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CardList;
