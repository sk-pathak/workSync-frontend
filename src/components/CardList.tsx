import ProjectCard from "./ProjectCard";
import { useEffect, useState } from "react";
import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { getProjects } from "../services/projectService";

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
    <>
      <button
        className='inline-block cursor-pointer rounded-md bg-gray-800 px-4 py-3 text-center text-sm font-semibold uppercase text-white transition duration-200 ease-in-out hover:bg-gray-900'
        onClick={() => setPage((old) => Math.max(old - 1, 0))}
        disabled={page === 0}
      >
        Prev
      </button>{" "}
      <span>Page {page + 1}</span>{" "}
      <button
        className='inline-block cursor-pointer rounded-md bg-gray-800 px-4 py-3 text-center text-sm font-semibold uppercase text-white transition duration-200 ease-in-out hover:bg-gray-900'
        onClick={() => {
          setPage((old) => (data?.hasMore ? old + 1 : old));
        }}
        disabled={isPlaceholderData || !data?.hasMore}
      >
        Next
      </button>
      <div className='space-y-4'>
        {status === "pending" ? (
          <div>Loading...</div>
        ) : status === "error" ? (
          <div>Error: {error.message}</div>
        ) : (
          <div>
            {data.projectList.map((project) => (
              <>
                <ProjectCard key={project.projectId} {...project} />
                <br />
              </>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default CardList;
