import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/thoughts" element={<Blog />} />
        <Route path="/thoughts/:slug" element={<BlogPost />} />
      </Route>
    </Routes>
  );
}
