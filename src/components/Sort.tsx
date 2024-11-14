import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react';
import { MdKeyboardArrowDown } from 'react-icons/md';
import { FaCheck, FaStar, FaCalendarAlt, FaUsers } from 'react-icons/fa';
import { useEffect, useState } from 'react';
import { getSortedProjects } from '../services/projectService';
import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query';

const options = [
  { id: 0, name: "None", icon: null },
  { id: 1, name: "Name", icon: <FaUsers className="h-5 w-5" /> },
  { id: 2, name: "Stars", icon: <FaStar className="h-5 w-5" /> },
  { id: 3, name: "Date Created", icon: <FaCalendarAlt className="h-5 w-5" /> },
];

const Sort = () => {
  const [selected, setSelected] = useState({
    id: -1,
    name: "Sort By...",
    icon: null,
  });
  const [page, setPage] = useState(0);
  
  let sortBy="";
  switch (selected.id) {
    case 1:
      sortBy = "projectName";
      break;
    case 2:
      sortBy = "stars";
      break;
    case 3:
      sortBy = "date";
      break;
    default:
      sortBy = "";
  }

  const queryClient = useQueryClient();
  const { status, data, error, isPlaceholderData } = useQuery({
    queryKey: ["projectsSort", sortBy, page],
    queryFn: () => getSortedProjects(sortBy, page),
    enabled: sortBy.length > 0,
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!isPlaceholderData && data?.hasMore) {
      queryClient.prefetchQuery({
        queryKey: ["projectsSort", sortBy, page + 1],
        queryFn: () => getSortedProjects(sortBy, page + 1),
      });
    }
  }, [data, isPlaceholderData, page, queryClient]);

  return (
    <Listbox value={selected} onChange={setSelected}>
      <div className="relative ml-10">
        <ListboxButton className="relative w-64 cursor-default rounded-md bg-base-100 py-3 pl-3 pr-10 text-left text-white shadow-sm focus:outline-none sm:text-sm border-2 border-gray-700">
          <span className="flex items-center">
            {selected.icon}
            <span className="ml-3 block truncate">{selected.name}</span>
          </span>
          <span className="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2">
            <MdKeyboardArrowDown aria-hidden="true" className="h-5 w-5 text-gray-400" />
          </span>
        </ListboxButton>

        <ListboxOptions
          transition
          className="absolute z-10 mt-1 max-h-72 w-64 overflow-auto rounded-md bg-base-100 py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm"
        >
          {options.map((option) => (
            <ListboxOption
              key={option.id}
              value={option}
              className="group relative cursor-default select-none py-2 pl-3 pr-9 text-gray-300 hover:bg-purple-800 hover:text-white"
            >
              <div className="flex items-center">
                {option.icon}
                <span className="ml-3 block truncate font-normal group-data-[selected]:font-semibold">
                  {option.name}
                </span>
              </div>
              {option.id === selected.id && (
              <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-purple-400 group-data-[focus]:text-white">
                <FaCheck aria-hidden="true" className="h-5 w-5" />
              </span>
              )}
            </ListboxOption>
          ))}
        </ListboxOptions>
      </div>
    </Listbox>
  );
}

export default Sort;
