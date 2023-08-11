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
// @ts-ignore
import { UserProvider } from "./context/UserContext";
const Root = () => {
  return (
    <UserProvider>
      <Navbar />
      <Outlet />
      <SocialLink />
    </UserProvider>
  );
};
const Home = () => {
  return <Hero />;
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
