import React from "react";
import SignupModal from "../components/SignupModal";
import LoginModal from "../components/LoginModal";
import NewProjectModal from "../components/NewProjectModal";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuthStore, useModalStore } from "../stores";
import CardList from "../components/CardList";

const Home: React.FC = () => {
  
  const scroll = () => {
    const element = document.querySelector('.projects');
    element?.scrollIntoView({
      behavior: 'smooth'
    });
  }

  const handleClick = () => {
    isLoggedIn ? openModal('newProject') : openModal('login');
  }

  const { openModal } = useModalStore();
  const store = useAuthStore();
  const isLoggedIn = store.status==='authorized';
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
      <div className='text-2xl font-semibold mt-4 cursor-pointer inline-block' onClick={scroll}>Get Started & find over 1000 projects!!!</div>
      <button className="btn btn-primary" onClick={handleClick}>Create a new project</button>
      <CardList />
      <Footer />
    </>
  );
};

export default Home;
