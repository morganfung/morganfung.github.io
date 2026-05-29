export default function Home() {
  return (
    <main>
      <div className="hero animate-in">
        <h1>Morgan Fung</h1>
        <p className="subtitle">
          B.A. Computer Science, Applied Mathematics @{" "}
          <a href="https://cdss.berkeley.edu/">UC Berkeley</a> (Fall 2025).
        </p>
      </div>

      <section className="section animate-in">
        <h2 className="section-title">Experience</h2>
        <div className="exp-list">
          <div className="exp-item">
            <div>
              <span className="exp-role">Software Engineer</span>
              <span className="exp-company">
                {" "}at <a href="https://runpulse.com/">Pulse</a>
              </span>
            </div>
            <span className="exp-date">Jun 2026–Now</span>
          </div>
          <div className="exp-item">
            <div>
              <span className="exp-role">Full Stack Engineer</span>
              <span className="exp-company">
                {" "}at <a href="https://www.uncountable.com/">Uncountable</a>
              </span>
            </div>
            <span className="exp-date">Jan–Jun 2026</span>
          </div>
          <div className="exp-item">
            <div>
              <span className="exp-role">Software Engineer Intern</span>
              <span className="exp-company">
                {" "}at{" "}
                <a href="https://www.niagarawater.com/">Niagara Bottling</a>
              </span>
            </div>
            <span className="exp-date">May–Aug 2025</span>
          </div>
          <div className="exp-item">
            <div>
              <span className="exp-role">Machine Learning Intern</span>
              <span className="exp-company">
                {" "}at{" "}
                <a href="https://www.sce.com/">Southern California Edison</a>
              </span>
            </div>
            <span className="exp-date">May–Aug 2024</span>
          </div>
        </div>
      </section>

      <section className="section animate-in">
        <h2 className="section-title">Contact</h2>
        <div className="contact-list">
          <div className="contact-item">
            Email: <span>morganfung [AT] berkeley.edu</span>
          </div>
          <div className="contact-item">
            GitHub:{" "}
            <a href="https://github.com/morganfung">@morganfung</a>
          </div>
          <div className="contact-item">
            Instagram:{" "}
            <a href="https://www.instagram.com/morgan.fung/">@morgan.fung</a>
          </div>
          <div className="contact-item">
            LinkedIn:{" "}
            <a href="https://linkedin.com/in/morgan-fung">@morgan-fung</a>
          </div>
        </div>
      </section>
    </main>
  );
}
