import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import { ToastContainer } from "react-toastify";

const App = () => {
  return (
    <>
      <Routes>
        <Route path='/' element={<Home />} />
      </Routes>
      <ToastContainer closeOnClick={true} theme="dark" stacked={true}/>
    </>
  );
};

export default App;
