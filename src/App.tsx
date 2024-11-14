import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import AboutMe from "./pages/AboutMe";

const App = () => {
  return (
    <>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/aboutme' element={<AboutMe />} />
      </Routes>
      <ToastContainer closeOnClick={true} theme="dark" stacked={true}/>
    </>
  );
};

export default App;
