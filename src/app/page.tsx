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

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1600);

    return () => clearTimeout(timer);
  }, []);

  const [cursorHover, setCursorHover] = useState(false);

  const [gameRunning, setGameRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [gameScore, setGameScore] = useState(0);
  const [gameLevel, setGameLevel] = useState(1);
  const [gameBest, setGameBest] = useState(0);
  const [gameCombo, setGameCombo] = useState(0);

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
        <div className="hero-noise" />
        <div className="hero-copy">
          <div className="kicker">PORTFOLIO / 2026</div>
          <div className="hi">Hi, I&apos;m</div>
          <h1>
            Jayesh <span>Devley</span>
          </h1>
          <h2>
            Building <span>Ideas</span> into Reality
          </h2>
          <p>
            Exploring ideas, building skills, and creating things that matter.
          </p>

          <div className="actions">
            <button className="primary" onClick={() => go("Skills")}>
              ✦ &nbsp; Explore My Skills <b>↘</b>
            </button>
            <button className="secondary" onClick={() => go("Contact")}>
              ✉ &nbsp; Get In Touch <b>↗</b>
            </button>
          </div>

          <div className="socials">
            <a
              href="https://github.com/devleyj"
              target="_blank"
              rel="noreferrer"
            >
              <span>◉</span> GitHub
            </a>
            <i />
            <a
              href="https://www.linkedin.com/in/jayesh-devley-6b028a37a/"
              target="_blank"
              rel="noreferrer"
            >
              <span>in</span> LinkedIn
            </a>
            <i />
            <a href="mailto:devleyj@gmail.com">
              <span>✉</span> Email
            </a>
          </div>

          <button className="game-chip" onClick={() => go("Play")}>
            <span className="game-icon">⌁</span>
            <span>
              <strong>CODE COLLECTOR</strong>
              <small>Small game. Big fun.</small>
            </span>
            <b>›</b>
          </button>

          <div className="signature">Jayesh Devley</div>
        </div>

        <div className="hero-art">
          <div className="glow glow-a" />
          <div className="glow glow-b" />
          <div className="orbit orbit-a" />
          <div className="orbit orbit-b" />
          <div className="ghost" />
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
          <div className="future">
            Future
            <br />
            Developer
          </div>
          <div className="code-hud">
            <span>
              const <em>dream</em> = {"{"}
            </span>
            <span>learn: true, build: true,</span>
            <span>grow: true, impact: true {"}"}</span>
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
      </section>

      <section id="about" className="section about-section">
        <div className="label">01 / ABOUT</div>

        <div className="about-layout">
          <div className="about-heading">
            <span className="kicker">THE PERSON BEHIND THE CODE</span>

            <h3>
              Learning by
              <br />
              <span>building.</span>
            </h3>

            <div className="about-status">
              <span className="status-dot" />
              <span>CURIOUS · BUILDING · EVOLVING</span>
            </div>
          </div>

          <div className="about-content">
            <p className="about-lead">
              I&apos;m Jayesh Devley — a developer in the making, turning
              curiosity into practical skills and ideas into digital
              experiences.
            </p>

            <p>
              This portfolio is my evolving workspace: a place to show what
              I&apos;m learning, what I&apos;m experimenting with, and what
              I&apos;ll build next.
            </p>

            <div className="about-terminal">
              <div className="terminal-top">
                <span />
                <span />
                <span />
                <b>jayesh.dev</b>
              </div>

              <div className="terminal-body">
                <div>
                  <em>const</em> developer = {"{"}
                </div>
                <div className="terminal-indent">
                  mindset: <strong>&quot;keep learning&quot;</strong>,
                </div>
                <div className="terminal-indent">
                  focus: <strong>&quot;build useful things&quot;</strong>,
                </div>
                <div className="terminal-indent">
                  future: <strong>&quot;still loading...&quot;</strong>
                </div>
                <div>{"}"};</div>
              </div>
            </div>

            <div className="about-stats">
              <div>
                <strong>10+</strong>
                <span>TECH SKILLS</span>
              </div>

              <div>
                <strong>01</strong>
                <span>BIG DIRECTION</span>
              </div>

              <div>
                <strong>∞</strong>
                <span>THINGS TO BUILD</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="skills" className="section skills-section">
        <div className="label">02 / SKILLS</div>
        <div className="content">
          <span className="kicker">TECH STACK</span>
          <h3>
            Technologies I <span>Work With</span>
          </h3>
          <p className="intro">
            A growing mix of programming, design, web, API, and database skills.
          </p>
          <div className="skills-grid">
            {skills.map((name, index) => (
              <div className="skill" key={`${name}-${index}`}>
                <small>{String(index + 1).padStart(2, "0")}</small>
                <strong>{name}</strong>
                <b>↗</b>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="projects" className="section">
        <div className="label">03 / PROJECTS</div>

        <div className="content">
          <span className="kicker">SELECTED WORK</span>

          <h3>
            Building <span>ideas.</span>
          </h3>

          <p className="intro">
            A look at the ideas I’m turning into real products, experiments, and
            experiences.
          </p>

          <div className="projects-grid">
            <article className="project-card featured-project">
              <div className="project-top">
                <span className="project-number">01</span>
                <span className="project-status">IN DEVELOPMENT</span>
              </div>

              <div className="project-content">
                <span className="project-label">EDUCATION • SAAS • AI</span>

                <h4>CampusFlow</h4>

                <p>
                  A modern education management platform concept designed to
                  connect schools, coaching centers, teachers, students,
                  parents, and administrators in one intelligent ecosystem.
                </p>

                <div className="project-tags">
                  <span>Next.js</span>
                  <span>React</span>
                  <span>AI & GenAI</span>
                  <span>Database</span>
                </div>
              </div>

              <div className="project-footer">
                <span>Building the idea →</span>
                <b>↗</b>
              </div>
            </article>

            <article className="project-card">
              <div className="project-top">
                <span className="project-number">02</span>
                <span className="project-status">EXPLORING</span>
              </div>

              <div className="project-content">
                <span className="project-label">FUTURE PROJECT</span>

                <h4>Coming Soon.</h4>

                <p>
                  The next project will appear here as I turn another idea into
                  a real-world product.
                </p>

                <div className="project-tags">
                  <span>Ideas</span>
                  <span>Experiments</span>
                  <span>Building</span>
                </div>
              </div>

              <div className="project-footer">
                <span>Something new is loading...</span>
                <b>↗</b>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section id="experience" className="section">
        <div className="label">04 / EXPERIENCE</div>

        <div className="section-grid">
          <div>
            <span className="kicker">THE JOURNEY</span>

            <h3>
              Building the <span>foundation.</span>
            </h3>

            <p className="intro">
              A journey of learning, experimenting, and turning ideas into
              practical digital products.
            </p>
          </div>

          <div className="timeline">
            <article>
              <small>01 / CURRENT</small>

              <div>
                <strong>Developer in the Making</strong>

                <p>
                  Building strong foundations in web development, programming,
                  UI/UX, APIs, databases, and modern software development.
                </p>

                <div className="tags">
                  <span>Web Development</span>
                  <span>Programming</span>
                  <span>UI/UX</span>
                </div>
              </div>
            </article>

            <article>
              <small>02 / BUILDING</small>

              <div>
                <strong>CampusFlow</strong>

                <p>
                  Designing and documenting an ambitious education technology
                  platform connecting schools, coaching centers, teachers,
                  students, parents, and administrators.
                </p>

                <div className="tags">
                  <span>Education</span>
                  <span>SaaS</span>
                  <span>AI</span>
                </div>
              </div>
            </article>

            <article>
              <small>03 / NEXT</small>

              <div>
                <strong>Real-World Products</strong>

                <p>
                  Turning concepts into production-ready applications, learning
                  from real users, and continuously improving through
                  experimentation and feedback.
                </p>

                <div className="tags">
                  <span>Products</span>
                  <span>Experiments</span>
                  <span>Innovation</span>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section id="play" className="section play-section">
        <div className="label">05 / PLAY</div>

        <div className="play-header">
          <div>
            <span className="kicker">INTERACTIVE LAB</span>

            <h3>
              Code <span>Runner.</span>
            </h3>

            <p className="intro">
              A small game built into my portfolio. Collect the energy, avoid
              the bugs, and see how high you can score.
            </p>
          </div>

          <div className="game-status">
            <div>
              <span>SCORE</span>

              <strong id="game-score">
                {String(gameScore).padStart(4, "0")}
              </strong>
            </div>

            <div>
              <span>BEST</span>

              <strong id="game-best">
                {String(gameBest).padStart(4, "0")}
              </strong>
            </div>

            <div>
              <span>COMBO</span>

              <strong id="game-combo">×{gameCombo}</strong>
            </div>
          </div>

          <div className="game-container">
            <div className="game-topbar">
              <span>
                <i className="status-dot"></i>
                SYSTEM ONLINE
              </span>

              <span>
                LEVEL{" "}
                <strong id="game-level">
                  {String(gameLevel).padStart(2, "0")}
                </strong>
              </span>
            </div>

            <div className="game-screen" id="game-screen">
              <div className="game-grid"></div>

              {!gameRunning && (
                <div className="game-message" id="game-message">
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
                    id="start-game"
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

            <div className="game-controls">
              <button
                id="move-left"
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
                id="move-right"
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

              <span>
                COLLECT <b>◆</b> ENERGY
              </span>
            </div>
          </div>
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

            <a className="contact-email" href="mailto:devleyj@gmail.com">
              <span>EMAIL</span>
              devleyj@gmail.com
              <b>↗</b>
            </a>
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

      <footer>
        <span>JD / JAYESH DEVLEY</span>
        <span>BUILDING IDEAS INTO REALITY</span>
        <span>© 2026</span>
      </footer>
    </main>
  );
}
