import { Link } from "react-router-dom";
import posts from "../data/posts";

export default function Blog() {
  return (
    <main>
      <div className="hero animate-in">
        <h1>Thoughts</h1>
      </div>

      <section className="section animate-in">
        {posts.length === 0 ? (
          <p className="empty-state">No posts yet.</p>
        ) : (
          <div className="blog-list">
            {posts.map((post) => (
              <Link
                key={post.slug}
                to={`/thoughts/${post.slug}`}
                className="blog-item"
              >
                <span className="blog-item-title">{post.title}</span>
                <span className="blog-item-date">{post.date}</span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
