import { useParams, Link } from "react-router-dom";
import posts from "../data/posts";

export default function BlogPost() {
  const { slug } = useParams();
  const post = posts.find((p) => p.slug === slug);

  if (!post) {
    return (
      <main className="blog-post animate-in">
        <Link to="/thoughts" className="back-link">&larr; back to thoughts</Link>
        <h1>Post not found</h1>
        <p className="subtitle">This post doesn't exist.</p>
      </main>
    );
  }

  return (
    <main className="blog-post animate-in">
      <Link to="/thoughts" className="back-link">&larr; back to thoughts</Link>
      <h1>{post.title}</h1>
      <p className="post-meta">{post.date}</p>
      <div className="post-content">
        {post.content.split("\n\n").map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
      </div>
    </main>
  );
}
