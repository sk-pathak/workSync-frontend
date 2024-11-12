import ProjectCard from "./ProjectCard";
import { useEffect, useState } from "react";
import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { getProjects } from "../services/projectService";
import { IoIosArrowDropright, IoIosArrowDropleft } from "react-icons/io";

const CardList = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);

  const { status, data, error, isPlaceholderData } = useQuery({
    queryKey: ["projects", page],
    queryFn: () => getProjects(page),
    placeholderData: keepPreviousData,
    staleTime: 10000,
  });

  useEffect(() => {
    if (!isPlaceholderData && data?.hasMore) {
      queryClient.prefetchQuery({
        queryKey: ["projects", page + 1],
        queryFn: () => getProjects(page + 1),
      });
    }
  }, [data, isPlaceholderData, page, queryClient]);

  return (
    <div className='space-y-4 projects'>
      {status === "pending" ? (
        <div>Loading...</div>
      ) : status === "error" ? (
        <div className='text-red-500'>Error: {error.message}</div>
      ) : (
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
          {data.projectList.map((project) => (
            <ProjectCard key={project.projectId} {...project} />
          ))}
        </div>
      )}
      <div className='flex pt-10 items-center justify-center'>
        <div className='flex space-x-4'>
          <button
            className='inline-block cursor-pointer rounded-mdp-3 text-center text-sm font-semibold uppercase text-white transition duration-200 ease-in-out disabled:text-gray-400 disabled:cursor-not-allowed disabled:opacity-50'
            onClick={() => setPage((old) => Math.max(old - 1, 0))}
            disabled={page === 0}
          >
            <IoIosArrowDropleft
              className='text-purple-600 hover:text-purple-600 transform hover:scale-110 transition-transform duration-200 ease-in-out'
              size={24}
            />{" "}
          </button>
          <span>Page {page + 1}</span>
          <button
            className='inline-block cursor-pointer rounded-mdp-3 text-center text-sm font-semibold uppercase text-white transition duration-200 ease-in-out disabled:text-gray-400 disabled:cursor-not-allowed disabled:opacity-50'
            onClick={() => {
              setPage((old) => (data?.hasMore ? old + 1 : old));
            }}
            disabled={isPlaceholderData || !data?.hasMore}
          >
            <IoIosArrowDropright
              className='text-purple-600 hover:text-purple-600 transform hover:scale-110 transition-transform duration-200 ease-in-out'
              size={24}
            />{" "}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CardList;
