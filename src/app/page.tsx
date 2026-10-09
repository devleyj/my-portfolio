"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const sections = [
  "Home",
  "About",
  "Skills",
  "Projects",
  "Experience",
  "Play",
  "Contact",
];

const skills = [
  "HTML5 & CSS3",
  "JavaScript",
  "React.js",
  "Python",
  "C / C++",
  "Git & GitHub",
  "Responsive Web Design",
  "UI/UX Design",
  "SQL & Databases",
  "REST APIs",
  "AI & GenAI",
];

export default function Home() {
  const [menu, setMenu] = useState(false);
  const [active, setActive] = useState("Home");
  const [loading, setLoading] = useState(true);

  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [contactStatus, setContactStatus] = useState("");
  const [contactLoading, setContactLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1600);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const response = await fetch("/api/projects");

        if (!response.ok) {
          throw new Error("Failed to load projects");
        }

        const data = await response.json();
        setProjects(data);
      } catch (error) {
        console.error("Failed to load projects:", error);
      }
    };

    loadProjects();
  }, []);

  const [cursorHover, setCursorHover] = useState(false);

  const [gameRunning, setGameRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [gameScore, setGameScore] = useState(0);
  const [gameLevel, setGameLevel] = useState(1);
  const [gameBest, setGameBest] = useState(0);
  const [gameCombo, setGameCombo] = useState(0);

  const [projects, setProjects] = useState<
    {
      id: number;
      title: string;
      category: string;
      status: string;
      description: string;
      tags: string;
      featured: boolean;
    }[]
  >([]);

  const playerPosition = useRef(50);
  const gameFrame = useRef<number | null>(null);
  const gameLevelRef = useRef(1);
  const comboRef = useRef(0);

  useEffect(() => {
    const savedBest = Number(localStorage.getItem("code-runner-best") || "0");

    setGameBest(savedBest);
  }, []);

  useEffect(() => {
    if (!gameRunning) return;

    const screen = document.getElementById("game-screen");
    const player = document.getElementById("game-player");

    if (!screen || !player) return;

    let lastTime = 0;
    let spawnTimer = 0;
    let animationFrame: number | null = null;

    const movePlayer = (direction: number) => {
      playerPosition.current = Math.max(
        8,
        Math.min(92, playerPosition.current + direction * 6),
      );

      player.style.left = `${playerPosition.current}%`;
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") {
        movePlayer(-1);
      }

      if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") {
        movePlayer(1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    const createEnergyParticles = (x: number, y: number) => {
      for (let i = 0; i < 8; i++) {
        const particle = document.createElement("div");

        particle.className = "energy-particle";

        particle.style.left = `${x}%`;
        particle.style.top = `${y}%`;

        const angle = (Math.PI * 2 * i) / 8;

        const distance = 30 + Math.random() * 25;

        particle.style.setProperty(
          "--particle-x",
          `${Math.cos(angle) * distance}px`,
        );

        particle.style.setProperty(
          "--particle-y",
          `${Math.sin(angle) * distance}px`,
        );

        screen.appendChild(particle);

        setTimeout(() => {
          particle.remove();
        }, 600);
      }
    };

    const spawnObject = () => {
      const object = document.createElement("div");

      const isBug = Math.random() < 0.28;

      object.className = isBug
        ? "game-token game-bug"
        : "game-token game-energy";

      object.textContent = isBug ? "×" : "◆";

      const leftPosition = 10 + Math.random() * 80;

      object.style.left = `${leftPosition}%`;
      object.style.top = "-10%";

      screen.appendChild(object);

      let position = -10;

      const fall = () => {
        if (!gameRunning || !object.isConnected) return;

        const level = gameLevelRef.current;

        const baseSpeed = isBug ? 0.72 : 0.58;
        const speed = baseSpeed + level * 0.07;

        position += speed;

        object.style.top = `${position}%`;

        const objectLeft = parseFloat(object.style.left);

        /*
         * Collision zone near the player
         */
        if (
          position > 76 &&
          position < 91 &&
          Math.abs(objectLeft - playerPosition.current) < 9
        ) {
          object.remove();

          if (isBug) {
            comboRef.current = 0;
            setGameCombo(0);

            screen.classList.add("game-hit");

            setTimeout(() => {
              screen.classList.remove("game-hit");
            }, 400);

            setGameRunning(false);
            setGameOver(true);

            return;
          }

          createEnergyParticles(objectLeft, position);

          screen.classList.add("game-combo");

          setTimeout(() => {
            screen.classList.remove("game-combo");
          }, 300);

          comboRef.current += 1;

          const combo = comboRef.current;

          setGameCombo(combo);

          setGameScore((score) => {
            const points = 10 * Math.min(combo, 5);
            const nextScore = score + points;

            if (nextScore > 0 && nextScore % 100 === 0) {
              const nextLevel = gameLevelRef.current + 1;

              gameLevelRef.current = nextLevel;
              setGameLevel(nextLevel);
            }

            setGameBest((best) => {
              if (nextScore > best) {
                localStorage.setItem("code-runner-best", String(nextScore));

                return nextScore;
              }

              return best;
            });

            return nextScore;
          });

          return;
        }

        if (position > 105) {
          object.remove();
          return;
        }

        requestAnimationFrame(fall);
      };

      requestAnimationFrame(fall);
    };

    const loop = (time: number) => {
      if (!lastTime) {
        lastTime = time;
      }

      const delta = time - lastTime;
      lastTime = time;

      spawnTimer += delta;

      const level = gameLevelRef.current;

      const spawnDelay = Math.max(360, 900 - level * 55);

      if (spawnTimer >= spawnDelay) {
        spawnTimer = 0;
        spawnObject();
      }

      animationFrame = requestAnimationFrame(loop);
      gameFrame.current = animationFrame;
    };

    animationFrame = requestAnimationFrame(loop);
    gameFrame.current = animationFrame;

    return () => {
      window.removeEventListener("keydown", handleKeyDown);

      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }

      if (gameFrame.current) {
        cancelAnimationFrame(gameFrame.current);
      }

      screen
        .querySelectorAll(".game-token")
        .forEach((object) => object.remove());
    };
  }, [gameRunning]);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY + 180;
      let current = "Home";
      for (const item of sections) {
        const el = document.getElementById(item.toLowerCase());
        if (el && y >= el.offsetTop) current = item;
      }
      setActive(current);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const revealElements = document.querySelectorAll(".section");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("section-visible");
          }
        });
      },
      {
        threshold: 0.12,
      },
    );

    revealElements.forEach((element) => {
      element.classList.add("section-hidden");
      observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;

    if (isTouchDevice) return;

    const hero = document.querySelector(".hero") as HTMLElement | null;

    const heroArt = document.querySelector(".hero-art") as HTMLElement | null;

    if (!hero || !heroArt) return;

    const handleMouseMove = (event: MouseEvent) => {
      const x = (event.clientX / window.innerWidth - 0.5) * 2;

      const y = (event.clientY / window.innerHeight - 0.5) * 2;

      heroArt.style.transform = `
        translate3d(
          ${x * 10}px,
          ${y * 8}px,
          0
        )
      `;
    };

    const resetPosition = () => {
      heroArt.style.transform = "translate3d(0, 0, 0)";
    };

    hero.addEventListener("mousemove", handleMouseMove);
    hero.addEventListener("mouseleave", resetPosition);

    return () => {
      hero.removeEventListener("mousemove", handleMouseMove);
      hero.removeEventListener("mouseleave", resetPosition);
    };
  }, []);

  useEffect(() => {
    const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;

    if (isTouchDevice) return;

    const cursor = document.querySelector(
      ".custom-cursor",
    ) as HTMLElement | null;

    const cursorRing = document.querySelector(
      ".custom-cursor-ring",
    ) as HTMLElement | null;

    if (!cursor || !cursorRing) return;

    const moveCursor = (event: MouseEvent) => {
      cursor.style.left = `${event.clientX}px`;
      cursor.style.top = `${event.clientY}px`;

      cursorRing.style.left = `${event.clientX}px`;
      cursorRing.style.top = `${event.clientY}px`;
    };

    const handleEnter = () => setCursorHover(true);
    const handleLeave = () => setCursorHover(false);

    const interactiveElements = document.querySelectorAll(
      "button, a, .skill, .project-card, .game-chip",
    );

    window.addEventListener("mousemove", moveCursor);

    interactiveElements.forEach((element) => {
      element.addEventListener("mouseenter", handleEnter);
      element.addEventListener("mouseleave", handleLeave);
    });

    return () => {
      window.removeEventListener("mousemove", moveCursor);

      interactiveElements.forEach((element) => {
        element.removeEventListener("mouseenter", handleEnter);
        element.removeEventListener("mouseleave", handleLeave);
      });
    };
  }, []);

  const go = (name: string) => {
    document
      .getElementById(name.toLowerCase())
      ?.scrollIntoView({ behavior: "smooth" });
    setMenu(false);
  };

  const handleContactSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setContactLoading(true);
    setContactStatus("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: contactName,
          email: contactEmail,
          message: contactMessage,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setContactStatus(data.message || "Something went wrong.");
      }

      setContactStatus("Message sent successfully.");

      setContactName("");
      setContactEmail("");
      setContactMessage("");
    } catch {
      setContactStatus("Unable to send your message. Please try again.");
    } finally {
      setContactLoading(false);
    }
  };

  const featuredProject = projects.find((project) => project.featured);

  return (
    <main>
      {loading && (
        <div className="loading-screen">
          <div className="loading-inner">
            <div className="loading-top">
              <span>JAYESH.DEV</span>
              <span>2026</span>
            </div>

            <div className="loading-center">
              <div className="loading-mark">JD</div>

              <span className="loading-label">INITIALIZING PORTFOLIO</span>

              <strong>
                Building <em>ideas.</em>
              </strong>
            </div>

            <div className="loading-bottom">
              <span>SYSTEM ONLINE</span>
              <span>
                LOADING <b>100%</b>
              </span>
            </div>

            <div className="loading-line">
              <i />
            </div>
          </div>
        </div>
      )}

      <div className={`custom-cursor ${cursorHover ? "cursor-hover" : ""}`} />

      <div
        className={`custom-cursor-ring ${
          cursorHover ? "cursor-ring-hover" : ""
        }`}
      />

      <header className="header">
        <button className="logo" onClick={() => go("Home")}>
          <span className="logo-box">JD</span>
          <span>Jayesh Devley</span>
        </button>

        <nav className={menu ? "nav nav-open" : "nav"}>
          {sections.map((item) => (
            <button
              className={active === item ? "active" : ""}
              key={item}
              onClick={() => go(item)}
            >
              {item}
            </button>
          ))}
        </nav>

        <button className="connect" onClick={() => go("Contact")}>
          Let&apos;s Connect <b>↗</b>
        </button>
        <button
          className="hamburger"
          onClick={() => setMenu(!menu)}
          aria-label="Menu"
        >
          <i />
          <i />
          <i />
        </button>
      </header>

      <section id="home" className="hero">
        <div className="hero-copy">
          <div className="kicker">JAYESH DEVLEY / 2026</div>

          <div className="hi">Hello, I&apos;m</div>

          <h1>
            Jayesh <span>Devley</span>
          </h1>

          <h2>
            Building <span>Ideas</span>
            <br />
            into Reality.
          </h2>

          <p>
            Exploring ideas, building skills, and creating things that matter.
          </p>

          <div className="actions">
            <button className="primary" onClick={() => go("Skills")}>
              Explore My Skills <b>↓</b>
            </button>

            <button className="secondary" onClick={() => go("Contact")}>
              Get In Touch <b>↗</b>
            </button>
          </div>

          <div className="socials">
            <a
              href="https://github.com/devleyj"
              target="_blank"
              rel="noreferrer"
            >
              GitHub
            </a>

            <i />

            <a
              href="https://www.linkedin.com/in/jayesh-devley-6b028a37a/"
              target="_blank"
              rel="noreferrer"
            >
              LinkedIn
            </a>

            <i />

            <a href="mailto:devleyj@gmail.com">Email</a>
          </div>

          <button className="game-chip" onClick={() => go("Play")}>
            <span className="game-icon">✦</span>

            <span>
              <strong>CODE RUNNER</strong>
              <small>A small game I built for fun.</small>
            </span>

            <b>↗</b>
          </button>

          <div className="signature">J.D.</div>
        </div>

        <div className="hero-art">
          <div className="photo">
            <Image
              src="/jayesh-hero.jpg"
              alt="Jayesh Devley"
              width={500}
              height={625}
              priority
              sizes="(max-width: 760px) 82vw, 500px"
            />

            <div className="photo-overlay" />
          </div>

          <div className="photo-caption">
            <span>01</span>
            <span>PORTRAIT / BUILDER</span>
          </div>

          <div className="hero-stamp">
            <span>WORK</span>
            <strong>
              IN
              <br />
              PROGRESS
            </strong>
            <small>EST. 2026</small>
          </div>

          <div className="hero-note">
            Learning.
            <br />
            Building.
            <br />
            Repeating.
          </div>
        </div>

        <div className="side-nav">
          {sections.map((item, i) => (
            <button
              key={item}
              className={active === item ? "side-active" : ""}
              onClick={() => go(item)}
            >
              <span>{String(i + 1).padStart(2, "0")}</span>
              {item}
            </button>
          ))}
        </div>

        <div className="hero-bottom">
          <span>SCROLL TO EXPLORE</span>
          <span>↓</span>
          <span>INDIA / 2026</span>
        </div>
      </section>

      <section id="about" className="about-section">
        <div className="section-heading">
          <span className="section-index">02 / ABOUT</span>
          <span className="section-rule" />
          <span className="section-note">A LITTLE CONTEXT</span>
        </div>

        <div className="about-layout">
          <div className="about-intro">
            <p className="about-eyebrow">WHO I AM</p>

            <h2>
              Still learning.
              <br />
              Still <em>building.</em>
            </h2>

            <p className="about-lead">
              I&apos;m Jayesh Devley, a developer who enjoys turning ideas into
              things that can actually be used.
            </p>

            <p className="about-text">
              I&apos;m currently exploring web development, programming, UI/UX,
              APIs, databases, and AI. I like understanding how things work,
              experimenting with different approaches, and slowly turning what I
              learn into real projects.
            </p>

            <p className="about-text">
              I&apos;m not trying to have everything figured out yet. I&apos;m
              focused on building a strong foundation, working on meaningful
              ideas, and learning through the process.
            </p>
          </div>

          <div className="about-side">
            <div className="about-card">
              <span className="about-card-label">CURRENTLY</span>

              <h3>Building the foundation.</h3>

              <p>Learning by making, breaking, fixing, and trying again.</p>

              <div className="about-card-line" />

              <span className="about-card-year">2026 →</span>
            </div>

            <div className="about-note">
              <span>NOTE / 01</span>
              <strong>
                Good work
                <br />
                takes time.
              </strong>
            </div>
          </div>
        </div>

        <div className="about-timeline">
          <div className="timeline-item">
            <span className="timeline-year">NOW</span>

            <div>
              <h3>Learning &amp; Experimenting</h3>
              <p>
                Web development · Programming · UI/UX · APIs · Databases · AI
                &amp; GenAI
              </p>
            </div>
          </div>

          <div className="timeline-item">
            <span className="timeline-year">2026</span>

            <div>
              <h3>CampusFlow</h3>
              <p>
                Exploring an education technology product designed around
                real-world problems.
              </p>
            </div>
          </div>

          <div className="timeline-item">
            <span className="timeline-year">NEXT</span>

            <div>
              <h3>First Production Projects</h3>
              <p>
                Taking what I&apos;ve learned and turning it into products
                people can actually use.
              </p>
            </div>
          </div>
        </div>

        <div className="about-footer">
          <span>02</span>
          <span>LEARNING / BUILDING / REPEATING</span>
          <span>JAYESH DEVLEY</span>
        </div>
      </section>

      <section id="skills" className="skills-section">
        <div className="section-heading">
          <span className="section-index">03 / SKILLS</span>
          <span className="section-rule" />
          <span className="section-note">TOOLS / CRAFT / CURIOSITY</span>
        </div>

        <div className="skills-intro">
          <div>
            <p className="skills-eyebrow">WHAT I&apos;M LEARNING</p>

            <h2>
              A growing
              <br />
              <em>toolbox.</em>
            </h2>
          </div>

          <p className="skills-description">
            I&apos;m building a practical foundation across development, design,
            data, and AI. Some skills are familiar, others are still being
            explored — the goal is to keep learning by actually making things.
          </p>
        </div>

        <div className="skills-index">
          <div className="skill-group">
            <div className="skill-group-head">
              <span>01</span>
              <h3>WEB / FRONTEND</h3>
            </div>

            <div className="skill-list">
              <div className="skill-row">
                <span>01</span>
                <strong>HTML5 &amp; CSS3</strong>
                <small>Structure / Styling / Responsive Design</small>
              </div>

              <div className="skill-row">
                <span>02</span>
                <strong>JavaScript</strong>
                <small>Logic / Interaction / Web APIs</small>
              </div>

              <div className="skill-row">
                <span>03</span>
                <strong>React.js</strong>
                <small>Components / Interfaces / State</small>
              </div>

              <div className="skill-row">
                <span>04</span>
                <strong>Responsive Web Design</strong>
                <small>Layouts / Mobile / Accessibility</small>
              </div>
            </div>
          </div>

          <div className="skill-group">
            <div className="skill-group-head">
              <span>02</span>
              <h3>PROGRAMMING</h3>
            </div>

            <div className="skill-list">
              <div className="skill-row">
                <span>01</span>
                <strong>Python</strong>
                <small>Programming / Automation / Exploration</small>
              </div>

              <div className="skill-row">
                <span>02</span>
                <strong>C / C++</strong>
                <small>Programming Fundamentals / Problem Solving</small>
              </div>

              <div className="skill-row">
                <span>03</span>
                <strong>Git &amp; GitHub</strong>
                <small>Version Control / Collaboration</small>
              </div>
            </div>
          </div>

          <div className="skill-group">
            <div className="skill-group-head">
              <span>03</span>
              <h3>DATA / BACKEND</h3>
            </div>

            <div className="skill-list">
              <div className="skill-row">
                <span>01</span>
                <strong>SQL &amp; Databases</strong>
                <small>Data / Queries / Persistence</small>
              </div>

              <div className="skill-row">
                <span>02</span>
                <strong>REST APIs</strong>
                <small>Requests / Integration / Services</small>
              </div>
            </div>
          </div>

          <div className="skill-group">
            <div className="skill-group-head">
              <span>04</span>
              <h3>DESIGN / AI</h3>
            </div>

            <div className="skill-list">
              <div className="skill-row">
                <span>01</span>
                <strong>UI / UX Design</strong>
                <small>Interfaces / User Experience / Visual Systems</small>
              </div>

              <div className="skill-row">
                <span>02</span>
                <strong>AI &amp; GenAI</strong>
                <small>Exploration / Tools / Product Ideas</small>
              </div>
            </div>
          </div>
        </div>

        <div className="skills-quote">
          <span>FIELD NOTE / 03</span>

          <p>
            &ldquo;The best way to understand something is to build with
            it.&rdquo;
          </p>

          <small>— PERSONAL PRINCIPLE</small>
        </div>

        <div className="skills-footer">
          <span>03</span>
          <span>TOOLS CHANGE. CURIOSITY STAYS.</span>
          <span>JAYESH DEVLEY</span>
        </div>
      </section>

      <section id="projects" className="projects-section">
        <div className="section-heading">
          <span className="section-index">04 / PROJECTS</span>
          <span className="section-rule" />
          <span className="section-note">SELECTED WORK / IN PROGRESS</span>
        </div>

        <div className="projects-intro">
          <div>
            <p className="projects-eyebrow">THINGS I&apos;M BUILDING</p>

            <h2>
              Ideas made
              <br />
              <em>real.</em>
            </h2>
          </div>

          <p className="projects-description">
            A small collection of ideas, experiments, and products I&apos;m
            working on. Some are still taking shape — that&apos;s part of the
            process.
          </p>
        </div>

        {featuredProject && (
          <article className="featured-project">
            <div className="featured-project-top">
              <span>01 / FEATURED PROJECT</span>

              <span>{featuredProject.status}</span>
            </div>

            <div className="featured-project-body">
              <div className="featured-project-main">
                <span className="project-label">
                  {featuredProject.category}
                </span>

                <h3>{featuredProject.title}</h3>

                <p>{featuredProject.description}</p>

                <div className="project-tags">
                  {featuredProject.tags.split(",").map((tag) => (
                    <span key={tag.trim()}>{tag.trim()}</span>
                  ))}
                </div>
              </div>

              <div className="featured-project-side">
                <div className="project-fact">
                  <span>PROJECT</span>
                  <strong>{featuredProject.title}</strong>
                </div>

                <div className="project-fact">
                  <span>STATUS</span>
                  <strong>{featuredProject.status}</strong>
                </div>

                <div className="project-fact">
                  <span>STARTED</span>
                  <strong>2026</strong>
                </div>

                <div className="project-mark">
                  <span>CF</span>
                </div>
              </div>
            </div>

            <div className="featured-project-footer">
              <span>EDUCATION / TECHNOLOGY / PRODUCT</span>

              <span>IN THE MAKING →</span>
            </div>
          </article>
        )}

        <div className="projects-list">
          <div className="projects-list-heading">
            <span>OTHER WORK</span>
            <span>02 —</span>
          </div>

          {projects
            .filter((project) => !project.featured)
            .map((project, index) => (
              <article className="project-row" key={project.id}>
                <span className="project-row-number">
                  {String(index + 2).padStart(2, "0")}
                </span>

                <div className="project-row-main">
                  <span>{project.category}</span>

                  <h3>{project.title}</h3>

                  <p>{project.description}</p>
                </div>

                <div className="project-row-meta">
                  <span>{project.status}</span>

                  <div className="project-tags">
                    {project.tags.split(",").map((tag) => (
                      <span key={tag.trim()}>{tag.trim()}</span>
                    ))}
                  </div>
                </div>

                <span className="project-row-arrow">↗</span>
              </article>
            ))}
        </div>

        <div className="projects-note">
          <span>FIELD NOTE / 04</span>

          <p>
            Not everything needs to be finished before it becomes worth
            building.
          </p>
        </div>

        <div className="projects-footer">
          <span>04</span>
          <span>SELECTED WORK / 2026</span>
          <span>JAYESH DEVLEY</span>
        </div>
      </section>

      <section id="experience" className="experience-section">
        <div className="section-heading">
          <span className="section-index">05 / EXPERIENCE</span>
          <span className="section-rule" />
          <span className="section-note">THE JOURNEY SO FAR</span>
        </div>

        <div className="experience-intro">
          <div>
            <p className="experience-eyebrow">NO SHORTCUTS</p>

            <h2>
              Learning
              <br />
              by <em>doing.</em>
            </h2>
          </div>

          <p className="experience-description">
            I&apos;m still at the beginning of the journey. Instead of filling
            this space with titles I haven&apos;t earned, I&apos;d rather show
            what I&apos;m actually learning, building, and working towards.
          </p>
        </div>

        <div className="experience-timeline">
          <article className="experience-item experience-current">
            <div className="experience-marker">
              <span>01</span>
              <b />
            </div>

            <div className="experience-date">
              <span>NOW</span>
              <small>2026</small>
            </div>

            <div className="experience-content">
              <span className="experience-label">CURRENT PHASE</span>

              <h3>Developer in the Making</h3>

              <p>
                Building a strong foundation through hands-on work with web
                development, programming, UI/UX, APIs, databases, and AI.
              </p>

              <div className="experience-tags">
                <span>LEARNING</span>
                <span>EXPERIMENTING</span>
                <span>BUILDING</span>
              </div>
            </div>
          </article>

          <article className="experience-item">
            <div className="experience-marker">
              <span>02</span>
              <b />
            </div>

            <div className="experience-date">
              <span>2026</span>
              <small>PROJECT</small>
            </div>

            <div className="experience-content">
              <span className="experience-label">IN DEVELOPMENT</span>

              <h3>CampusFlow</h3>

              <p>
                Exploring an education technology platform designed to bring
                administration, learning, communication, and everyday
                educational workflows into one connected experience.
              </p>

              <div className="experience-tags">
                <span>PRODUCT</span>
                <span>EDUCATION</span>
                <span>SAAS</span>
              </div>
            </div>
          </article>

          <article className="experience-item experience-next">
            <div className="experience-marker">
              <span>03</span>
              <b />
            </div>

            <div className="experience-date">
              <span>NEXT</span>
              <small>UP AHEAD</small>
            </div>

            <div className="experience-content">
              <span className="experience-label">WHAT COMES NEXT</span>

              <h3>First Production Projects</h3>

              <p>
                Turning experiments and learning into polished products,
                shipping real work, and continuing to learn from every project
                along the way.
              </p>

              <div className="experience-tags">
                <span>SHIP</span>
                <span>LEARN</span>
                <span>REPEAT</span>
              </div>
            </div>
          </article>
        </div>

        <div className="experience-note">
          <span>PERSONAL NOTE / 05</span>

          <p>
            I&apos;m not in a rush to look experienced.
            <br />
            I&apos;m focused on becoming experienced.
          </p>
        </div>

        <div className="experience-footer">
          <span>05</span>
          <span>THE JOURNEY IS STILL BEING WRITTEN</span>
          <span>JAYESH DEVLEY</span>
        </div>
      </section>

      <section id="play" className="play-section">
        <div className="section-heading">
          <span className="section-index">06 / PLAY</span>
          <span className="section-rule" />
          <span className="section-note">A SMALL EXPERIMENT</span>
        </div>

        <div className="play-intro">
          <div>
            <p className="play-eyebrow">TAKE A BREAK</p>

            <h2>
              A little
              <br />
              <em>something to play.</em>
            </h2>
          </div>

          <p className="play-description">
            I built this small game as an experiment in interaction, movement,
            and timing. Collect energy, avoid errors, and see how long you can
            keep going.
          </p>
        </div>

        <div className="game-paper">
          <div className="game-header">
            <div>
              <span className="game-label">JAYESH DEVLEY / EXPERIMENT 01</span>
              <h3>CODE RUNNER</h3>
            </div>

            <div className="game-status">
              <span>STATUS</span>
              <strong>
                {gameRunning ? "RUNNING" : gameOver ? "FINISHED" : "READY"}
              </strong>
            </div>
          </div>

          <div className="game-stats">
            <div>
              <span>SCORE</span>
              <strong>{gameScore}</strong>
            </div>

            <div>
              <span>LEVEL</span>
              <strong>{gameLevel}</strong>
            </div>

            <div>
              <span>COMBO</span>
              <strong>{gameCombo}</strong>
            </div>

            <div>
              <span>BEST</span>
              <strong>{gameBest}</strong>
            </div>
          </div>

          <div className="game-board-wrap">
            <div className="game-board">
              <div className="game-screen" id="game-screen">
                <div className="game-grid" />

                {!gameRunning && (
                  <div className="game-message">
                    <span>{gameOver ? "SYSTEM FAILURE" : "CODE RUNNER"}</span>

                    <strong>
                      {gameOver ? (
                        <>
                          Game <em>Over.</em>
                        </>
                      ) : (
                        <>
                          Ready to <em>run?</em>
                        </>
                      )}
                    </strong>

                    {gameOver && (
                      <small>
                        Final score: {String(gameScore).padStart(4, "0")}
                      </small>
                    )}

                    <button
                      className="game-start-button"
                      onClick={() => {
                        setGameScore(0);
                        setGameLevel(1);
                        setGameCombo(0);

                        gameLevelRef.current = 1;
                        comboRef.current = 0;

                        playerPosition.current = 50;

                        setGameOver(false);
                        setGameRunning(true);

                        const player = document.getElementById("game-player");

                        if (player) {
                          player.style.left = "50%";
                        }
                      }}
                    >
                      {gameOver ? "PLAY AGAIN ↗" : "START GAME ↗"}
                    </button>

                    {!gameOver && <small>Use ← → or A / D to move</small>}
                  </div>
                )}

                <div className="player" id="game-player">
                  &lt;/&gt;
                </div>
              </div>
            </div>

            <div className="game-controls">
              <div>
                <button
                  type="button"
                  className="control-key"
                  aria-label="Move left"
                  onClick={() => {
                    playerPosition.current = Math.max(
                      8,
                      playerPosition.current - 6,
                    );

                    const player = document.getElementById("game-player");

                    if (player) {
                      player.style.left = `${playerPosition.current}%`;
                    }
                  }}
                >
                  ←
                </button>

                <button
                  type="button"
                  className="control-key"
                  aria-label="Move right"
                  onClick={() => {
                    playerPosition.current = Math.min(
                      92,
                      playerPosition.current + 6,
                    );

                    const player = document.getElementById("game-player");

                    if (player) {
                      player.style.left = `${playerPosition.current}%`;
                    }
                  }}
                >
                  →
                </button>

                <small>MOVE</small>
              </div>

              <p>
                Desktop: use your arrow keys
                <br />
                Mobile: use the controls below
              </p>

              <div className="mobile-controls">
                <button
                  type="button"
                  aria-label="Move left"
                  onClick={() => {
                    playerPosition.current = Math.max(
                      8,
                      playerPosition.current - 6,
                    );

                    const player = document.getElementById("game-player");

                    if (player) {
                      player.style.left = `${playerPosition.current}%`;
                    }
                  }}
                >
                  ←
                </button>

                <button
                  type="button"
                  aria-label="Move right"
                  onClick={() => {
                    playerPosition.current = Math.min(
                      92,
                      playerPosition.current + 6,
                    );

                    const player = document.getElementById("game-player");

                    if (player) {
                      player.style.left = `${playerPosition.current}%`;
                    }
                  }}
                >
                  →
                </button>
              </div>
            </div>

            <div className="game-footer">
              <span>CODE / MOTION / TIMING</span>
              <span>BUILT FOR FUN</span>
            </div>
          </div>

          <div className="game-controls">
            <div>
              <span className="control-key">←</span>
              <span className="control-key">→</span>
              <small>MOVE</small>
            </div>

            <p>
              Desktop: use your arrow keys
              <br />
              Mobile: use the controls below
            </p>

            <div className="mobile-controls">
              <button
                type="button"
                aria-label="Move left"
                onPointerDown={() => {
                  window.dispatchEvent(
                    new KeyboardEvent("keydown", {
                      key: "ArrowLeft",
                    }),
                  );
                }}
              >
                ←
              </button>

              <button
                type="button"
                aria-label="Move right"
                onPointerDown={() => {
                  window.dispatchEvent(
                    new KeyboardEvent("keydown", {
                      key: "ArrowRight",
                    }),
                  );
                }}
              >
                →
              </button>
            </div>
          </div>

          <div className="game-footer">
            <span>CODE / MOTION / TIMING</span>
            <span>BUILT FOR FUN</span>
          </div>
        </div>

        <div className="play-note">
          <span>FIELD NOTE / 06</span>

          <p>
            Sometimes the best way to learn
            <br />
            is to make something playful.
          </p>
        </div>

        <div className="play-footer">
          <span>06</span>
          <span>PLAY / EXPERIMENT / REPEAT</span>
          <span>JAYESH DEVLEY</span>
        </div>
      </section>

      <section id="contact" className="section contact">
        <div className="label">06 / CONTACT</div>

        <div className="contact-layout">
          <div className="contact-main">
            <span className="kicker">OPEN CHANNEL</span>

            <h3>
              Have an idea?
              <br />
              <span>Let&apos;s build it.</span>
            </h3>

            <p className="contact-intro">
              I&apos;m exploring ideas, building skills, and creating things
              that matter. If you&apos;d like to connect, collaborate, or simply
              talk about an idea, reach out.
            </p>

            <form className="contact-form" onSubmit={handleContactSubmit}>
              <div className="contact-field">
                <label htmlFor="contact-name">NAME</label>

                <input
                  id="contact-name"
                  type="text"
                  placeholder="Your name"
                  value={contactName}
                  onChange={(event) => setContactName(event.target.value)}
                  required
                  minLength={2}
                />
              </div>

              <div className="contact-field">
                <label htmlFor="contact-email">EMAIL</label>

                <input
                  id="contact-email"
                  type="email"
                  placeholder="you@example.com"
                  value={contactEmail}
                  onChange={(event) => setContactEmail(event.target.value)}
                  required
                />
              </div>

              <div className="contact-field">
                <label htmlFor="contact-message">MESSAGE</label>

                <textarea
                  id="contact-message"
                  placeholder="Tell me about your idea..."
                  value={contactMessage}
                  onChange={(event) => setContactMessage(event.target.value)}
                  required
                  minLength={10}
                  rows={5}
                />
              </div>

              <button
                className="contact-submit"
                type="submit"
                disabled={contactLoading}
              >
                {contactLoading ? "SENDING..." : "SEND MESSAGE ↗"}
              </button>

              {contactStatus && (
                <p className="contact-status" role="status">
                  {contactStatus}
                </p>
              )}
            </form>
          </div>

          <div className="contact-terminal">
            <div className="terminal-top">
              <span>
                <i></i>
                CONTACT.exe
              </span>

              <span>ONLINE</span>
            </div>

            <div className="terminal-body">
              <p>
                <span>$</span> whoami
              </p>

              <strong>Jayesh Devley</strong>

              <p>
                <span>$</span> status
              </p>

              <strong className="terminal-status">AVAILABLE FOR IDEAS</strong>

              <p>
                <span>$</span> connect
              </p>

              <div className="contact-links">
                <a
                  href="https://github.com/devleyj"
                  target="_blank"
                  rel="noreferrer"
                >
                  <span>01</span>
                  GitHub
                  <b>↗</b>
                </a>

                <a
                  href="https://www.linkedin.com/in/jayesh-devley-6b028a37a/"
                  target="_blank"
                  rel="noreferrer"
                >
                  <span>02</span>
                  LinkedIn
                  <b>↗</b>
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="contact-bottom">
          <span>BASED IN INDIA</span>
          <span>BUILDING THE FUTURE</span>
          <span>06 / 06</span>
        </div>
      </section>

      <footer className="site-footer">
        <div className="footer-main">
          <div className="footer-brand">
            <button
              className="footer-logo"
              onClick={() => go("Home")}
              aria-label="Back to home"
            >
              JD<span>.</span>
            </button>

            <h3>Jayesh Devley</h3>

            <p>
              Exploring ideas, building skills, and creating things that matter.
            </p>

            <span className="footer-location">BASED IN INDIA · 2026</span>
          </div>

          <div className="footer-nav">
            <h4>EXPLORE</h4>
            <button onClick={() => go("Home")}>Home</button>
            <button onClick={() => go("About")}>About</button>
            <button onClick={() => go("Skills")}>Skills</button>
            <button onClick={() => go("Projects")}>Projects</button>
            <button onClick={() => go("Experience")}>Experience</button>
            <button onClick={() => go("Play")}>Play</button>
          </div>

          <div className="footer-connect">
            <h4>LET&apos;S CONNECT</h4>
            <p>Have an idea or want to collaborate?</p>

            <a href="mailto:devleyj@gmail.com">
              Email me <span>↗</span>
            </a>

            <a
              href="https://github.com/devleyj"
              target="_blank"
              rel="noreferrer"
            >
              GitHub <span>↗</span>
            </a>

            <a
              href="https://www.linkedin.com/in/jayesh-devley-6b028a37a/"
              target="_blank"
              rel="noreferrer"
            >
              LinkedIn <span>↗</span>
            </a>
          </div>
        </div>

        <div className="footer-bottom">
          <span>JD / JAYESH DEVLEY</span>
          <span>BUILDING IDEAS INTO REALITY</span>
          <span>© 2026</span>
          <button onClick={() => go("Home")}>BACK TO TOP ↑</button>
        </div>
      </footer>
    </main>
  );
}
