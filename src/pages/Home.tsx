import React from "react";
import SignupModal from "../components/Common/SignupModal";
import LoginModal from "../components/Common/LoginModal";
import NewProjectModal from "../components/Home/NewProjectModal";
import Navbar from "../components/Common/Navbar";
import Footer from "../components/Common/Footer";
import { useAuthStore, useModalStore } from "../stores";
import CardList from "../components/Home/CardList";
import Spinner from "../components/Home/Spinner";
import SearchBar from "../components/Home/SearchBar";
import FilterBox from "../components/Home/FilterBox";
import Sort from "../components/Home/Sort";

const Home: React.FC = () => {
  const scroll = () => {
    const element = document.querySelector(".projects");
    element?.scrollIntoView({
      behavior: "smooth",
    });
  };

  const handleClick = () => {
    isLoggedIn ? openModal("newProject") : openModal("login");
  };

  const { openModal } = useModalStore();
  const store = useAuthStore();
  const isLoggedIn = store.status === "authorized";
  const name = store.user?.name;

  return (
    <>
      <Navbar isLoggedIn={isLoggedIn} />
      <div className={`hero bg-base-100`}>
        <div className='hero-content flex-col lg:flex-row'>
          <h1 className='text-5xl font-bold'>Welcome to WorkSync</h1>
          <p className='py-6 text-lg'>
            A simple platform to create, manage, and collaborate on projects.
            Whether you're an individual or a team, we've got you covered!{" "}
            {isLoggedIn ? name : ""}
          </p>
          <img
            src='../src/assets/team.svg'
            alt='Team Image'
            className='w-full lg:w-1/2'
          />
        </div>
        <LoginModal />
        <SignupModal />
        <NewProjectModal />
      </div>

      <div className='flex pb-5'>
        <Spinner />
        <div className='w-full sm:w-3/5 ml-4'>
          <div className='text-2xl text-center font-semibold mt-10'>
            <span
              onClick={scroll}
              className='inline cursor-pointer hover:text-purple-500 transition-all duration-200'
            >
              Get Started & find over 1000 projects!!!, or
            </span>
          </div>
          <div className='mt-10 flex justify-center'>
            <button
              className='btn btn-primary bg-purple-500 hover:bg-purple-600 w-full sm:w-auto'
              onClick={handleClick}
            >
              Create a new project
            </button>
          </div>
        </div>
      </div>
      <div className='flex mt-10 pl-20'>
        <SearchBar />
        <Sort />
      </div>

      <div className='flex justify-center mt-10 mb-10'>
        <FilterBox />
        <CardList />
      </div>
      <Footer />
    </>
  );
};

export default Home;
