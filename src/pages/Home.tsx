import React from "react";
import SignupModal from "../components/SignupModal";
import LoginModal from "../components/LoginModal";
import NewProjectModal from "../components/NewProjectModal";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuthStore, useModalStore } from "../stores";
import CardList from "../components/CardList";
import Spinner from "../components/Spinner";
import SearchBar from "../components/SearchBar";

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

      <div className='hero bg-base-100'>
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
          <div
            className='text-2xl text-center font-semibold mt-10 cursor-pointer hover:text-purple-500 transition-all duration-200'
            onClick={scroll}
          >
            Get Started & find over 1000 projects!!!, or
          </div>
          <div className='mt-10 flex justify-center'>
            <button
              className='btn btn-primary w-full sm:w-auto'
              onClick={handleClick}
            >
              Create a new project
            </button>
          </div>
        </div>
      </div>

      <SearchBar />
      <div className='flex mt-10 mb-10'>
        <div className="w-2/5 flex justify-center">Filter box here</div>
        <CardList />
      </div>

      <Footer />
    </>
  );
};

export default Home;
