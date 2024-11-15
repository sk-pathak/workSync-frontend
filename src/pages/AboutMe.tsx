import React from "react";
import Navbar from "../components/Common/Navbar";
import { useAuthStore } from "../stores";

const AboutMe: React.FC = () => {
  const isLoggedIn = useAuthStore().status==='authorized';
  return (
    <>
      <Navbar isLoggedIn={isLoggedIn} />
      <div className='min-h-screen bg-gradient-to-br from-gray-800 via-gray-900 to-black flex flex-col items-center p-6'>
        <div className='w-full max-w-6xl bg-gray-800 shadow-lg rounded-lg flex flex-row p-8 space-x-8'>
          {/* Profile Picture */}
          <div className='flex-shrink-0'>
            <div className='avatar'>
              <div className='w-48 rounded-full ring ring-purple-600 ring-offset-base-100 ring-offset-2 overflow-hidden'>
                <img
                  src='uploads/nge.jpg'
                  alt='Sumit Kumar Pathak'
                />
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className='flex-grow space-y-6 text-gray-200'>
            {/* Introduction */}
            <section>
              <h1 className='text-4xl font-bold text-purple-600'>
                Sumit Pathak
              </h1>
              <p className='text-lg text-gray-400 mt-2'>
                Welcome! I'm Sumit, a passionate Computer Science student from
                IIT Bhilai with a love for full-stack development,
                problem-solving, and open-source contributions. Whether building
                new applications or collaborating in cross-functional teams, I
                enjoy leveraging technology to create impactful solutions.
              </p>
            </section>

            {/* Key Highlights */}
            <section className='grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4'>
              {/* Education */}
              <div className='p-4 bg-gray-700 rounded-lg shadow-sm space-y-2'>
                <h2 className='text-xl font-semibold text-secondary'>
                  Education
                </h2>
                <p>
                  <strong>IIT Bhilai, Chhattisgarh</strong>
                </p>
                <p>B.Tech in Computer Science, CGPA: 8.46</p>
                <p>Graduating in June 2026</p>
              </div>

              {/* Positions of Responsibility */}
              <div className='p-4 bg-gray-700 rounded-lg shadow-sm space-y-2'>
                <h2 className='text-xl font-semibold text-secondary'>
                  Responsibilities
                </h2>
                <p>
                  <strong>Student Mentor</strong> - Guided over 200+ freshers,
                  enhancing onboarding experiences at IIT Bhilai.
                </p>
                <p>
                  <strong>Coordinator - Openlake</strong> - Leading open-source
                  initiatives and managing 40+ projects at Openlake.
                </p>
              </div>

              {/* Achievements */}
              <div className='p-4 bg-gray-700 rounded-lg shadow-sm space-y-2'>
                <h2 className='text-xl font-semibold text-secondary'>
                  Achievements
                </h2>
                <p>Placed 4th in Intra College Capture the Flag (CTF) 2023</p>
                <p>
                  Solved 600+ coding problems across GeeksForGeeks, Leetcode,
                  and CodeForces
                </p>
              </div>
            </section>

            {/* Projects Section */}
            <section className='space-y-2 mt-6'>
              <h2 className='text-2xl font-semibold text-secondary'>
                Projects
              </h2>
              <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                <div className='p-4 bg-gray-700 rounded-lg shadow'>
                  <h3 className='text-lg font-semibold'>WorkSync</h3>
                  <p>
                    A full-stack application for project management, designed
                    with Spring Boot and React. Implements secure JWT-based user
                    authentication and allows collaborative project
                    participation.
                  </p>
                </div>
                <div className='p-4 bg-gray-700 rounded-lg shadow'>
                  <h3 className='text-lg font-semibold'>Student Leaderboard</h3>
                  <p>
                    Python Flask-based app for visualizing student achievements
                    in real time, increasing academic engagement by 50%.
                  </p>
                </div>
              </div>
            </section>

            {/* Skills Section */}
            <section className='space-y-2 mt-6'>
              <h2 className='text-2xl font-semibold text-secondary'>Skills</h2>
              <p>
                <strong>Languages:</strong> Java, C/C++, Python, SQL,
                JavaScript, TypeScript
              </p>
              <p>
                <strong>Frameworks:</strong> React, Node.js, Spring Boot, Flask,
                TailwindCSS, Next.js
              </p>
              <p>
                <strong>Tools:</strong> Git, Docker, Kubernetes, AWS
              </p>
            </section>

            {/* Social Links */}
            <section className='mt-6'>
              <h2 className='text-2xl font-semibold text-secondary'>
                Connect with Me
              </h2>
              <div className='flex space-x-4 mt-2'>
                <a
                  href='https://linkedin.com/in/sumit-pathak-bb0a5314b'
                  className='btn btn-primary btn-sm'
                >
                  LinkedIn
                </a>
                <a
                  href='https://github.com/sk-pathak'
                  className='btn btn-accent btn-sm'
                >
                  GitHub
                </a>
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
};

export default AboutMe;
