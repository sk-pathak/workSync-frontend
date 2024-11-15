import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import AboutMe from "./pages/AboutMe";
import ProjectPage from "./pages/ProjectPage";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const App = () => {
  return (
    <>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/projects/:id' element={<ProjectPage />} />
        <Route path='/aboutme' element={<AboutMe />} />
      </Routes>
      <ToastContainer closeOnClick={true} theme="dark" stacked={true}/>
    </>
  );
};

export default App;
