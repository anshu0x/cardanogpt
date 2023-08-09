import {
  Route,
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
  Outlet,
} from "react-router-dom";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import SocialLink from "./components/SocialLink";
const Root = () => {
  return (
    <>
      <Navbar />
      <Outlet />
      <SocialLink />
    </>
  );
};
const Home = () => {
  return (
    <>
      <Hero />
    </>
  );
};
const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Root />}>
      <Route element={<Home />} index />
    </Route>
  )
);

const App = () => <RouterProvider router={router} />;

export default App;
