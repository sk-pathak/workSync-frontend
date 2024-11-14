import { useEffect, useState } from "react";
import { useSearchStore } from "../stores";
import { getSearchedProjects } from "../services/projectService";
import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import ProjectCard from "./ProjectCard";
import { IoIosArrowDropleft, IoIosArrowDropright } from "react-icons/io";

const SearchedList = () => {
  const { searchTerm } = useSearchStore();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);

  const { status, data, error, isPlaceholderData } = useQuery({
    queryKey: ["projectsSearch", searchTerm, page],
    queryFn: () => getSearchedProjects(searchTerm, page),
    enabled: searchTerm.length > 0,
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!isPlaceholderData && data?.hasMore) {
      queryClient.prefetchQuery({
        queryKey: ["projectsSearch", searchTerm, page + 1],
        queryFn: () => getSearchedProjects(searchTerm, page + 1),
      });
    }
  }, [data, isPlaceholderData, page, queryClient]);

  return (
    <div className='space-y-4 projects'>
      <div>
        {status === "pending" ? (
          <div></div>
        ) : status === "error" ? (
          <div className='text-red-500'>Error: {error.message}</div>
        ) : data?.projectList.length === 0 ? (
          <div>No results found for "{searchTerm}"</div>
        ) : (
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            {data?.projectList.map((project) => (
              <ProjectCard key={project.projectId} {...project} />
            ))}
          </div>
        )}
      </div>
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
          <span className="pb-1">Page {page + 1}</span>
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

export default SearchedList;
