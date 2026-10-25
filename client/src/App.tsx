import { Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { PostDetail } from "./pages/PostDetail";
import { PostForm } from "./pages/PostForm";
import { PostsList } from "./pages/PostsList";
import { UserDetail } from "./pages/UserDetail";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<PostsList />} />
        <Route path="posts/new" element={<PostForm />} />
        <Route path="posts/:id" element={<PostDetail />} />
        <Route path="posts/:id/edit" element={<PostForm />} />
        <Route path="users/:id" element={<UserDetail />} />
        <Route path="*" element={<p>Page not found.</p>} />
      </Route>
    </Routes>
  );
}
