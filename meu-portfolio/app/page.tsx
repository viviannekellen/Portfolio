"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

export default function Home() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const followerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const musicRef = useRef<HTMLAudioElement>(null);
  const mouseX = useRef(0);
  const mouseY = useRef(0);
  const followerX = useRef(0);
  const followerY = useRef(0);

  const [playing, setPlaying] = useState(false);
  const [role, setRole] = useState("");

  // ── CURSOR ──
  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      mouseX.current = e.clientX;
      mouseY.current = e.clientY;
      if (cursorRef.current) {
        cursorRef.current.style.left = e.clientX + "px";
        cursorRef.current.style.top = e.clientY + "px";
      }
    };
    window.addEventListener("mousemove", moveCursor);
    return () => window.removeEventListener("mousemove", moveCursor);
  }, []);

  useEffect(() => {
    let animId: number;
    const animate = () => {
      followerX.current += (mouseX.current - followerX.current) * 0.12;
      followerY.current += (mouseY.current - followerY.current) * 0.12;
      if (followerRef.current) {
        followerRef.current.style.left = followerX.current + "px";
        followerRef.current.style.top = followerY.current + "px";
      }
      animId = requestAnimationFrame(animate);
    };
    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Cursor hover em interativos
  useEffect(() => {
    const addHover = () => {
      document.querySelectorAll("a, button, .skill-card, .project-card, .stat-card, .contact-card").forEach((el) => {
        el.addEventListener("mouseenter", () => {
          cursorRef.current?.classList.add("hovered");
          followerRef.current?.classList.add("hovered");
        });
        el.addEventListener("mouseleave", () => {
          cursorRef.current?.classList.remove("hovered");
          followerRef.current?.classList.remove("hovered");
        });
      });
    };
    addHover();
  }, []);

  // ── PROGRESS BAR ──
  useEffect(() => {
    const handleScroll = () => {
      const progress = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
      const bar = document.getElementById("progressBar");
      if (bar) bar.style.width = progress + "%";
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ── PARTÍCULAS ──
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    interface ParticleData {
      x: number; y: number; size: number;
      speedX: number; speedY: number; opacity: number;
      color: string; life: number; age: number;
    }

    const colors = ["192,132,252", "129,140,248", "244,114,182"];

    const createParticle = (): ParticleData => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2 + 0.5,
      speedX: (Math.random() - 0.5) * 0.4,
      speedY: (Math.random() - 0.5) * 0.4,
      opacity: Math.random() * 0.4 + 0.1,
      color: colors[Math.floor(Math.random() * colors.length)],
      life: Math.random() * 200 + 100,
      age: 0,
    });

    let particles: ParticleData[] = Array.from({ length: 80 }, createParticle);
    let animId: number;

    const drawConnections = () => {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(192,132,252,${0.06 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawConnections();
      particles = particles.map((p) => {
        p.x += p.speedX;
        p.y += p.speedY;
        p.age++;
        if (p.x < 0 || p.x > canvas.width || p.y < 0 || p.y > canvas.height || p.age > p.life) {
          return createParticle();
        }
        const fade = p.age < 30 ? p.age / 30 : p.age > p.life - 30 ? (p.life - p.age) / 30 : 1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color}, ${p.opacity * fade})`;
        ctx.fill();
        return p;
      });
      animId = requestAnimationFrame(animate);
    };
    animId = requestAnimationFrame(animate);

    const onMouseMove = (e: MouseEvent) => {
      if (Math.random() > 0.85) {
        particles.push({
          x: e.clientX, y: e.clientY,
          speedX: (Math.random() - 0.5) * 2,
          speedY: (Math.random() - 0.5) * 2,
          size: Math.random() * 3 + 1,
          opacity: 0.5,
          color: colors[Math.floor(Math.random() * colors.length)],
          life: 60, age: 0,
        });
        if (particles.length > 120) particles.shift();
      }
    };
    window.addEventListener("mousemove", onMouseMove);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, []);

  // ── REVEAL ON SCROLL ──
  useEffect(() => {
    const reveals = document.querySelectorAll(".reveal");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    reveals.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // ── TYPING EFFECT ──
  useEffect(() => {
    const roles = ["Desenvolvedora Front-End", "UI/UX Designer", "Criadora de Experiências", "Full Stack Dev"];
    let roleIndex = 0;
    let charIndex = 0;
    let deleting = false;
    let timeout: ReturnType<typeof setTimeout>;

    const type = () => {
      const current = roles[roleIndex];
      if (!deleting) {
        setRole(current.slice(0, charIndex + 1));
        charIndex++;
        if (charIndex === current.length) {
          deleting = true;
          timeout = setTimeout(type, 2000);
          return;
        }
      } else {
        setRole(current.slice(0, charIndex - 1));
        charIndex--;
        if (charIndex === 0) {
          deleting = false;
          roleIndex = (roleIndex + 1) % roles.length;
        }
      }
      timeout = setTimeout(type, deleting ? 60 : 90);
    };
    timeout = setTimeout(type, 500);
    return () => clearTimeout(timeout);
  }, []);

  // ── TILT NOS CARDS ──
  useEffect(() => {
    const cards = document.querySelectorAll<HTMLElement>(".project-card, .skill-card");
    const onMove = (e: MouseEvent) => {
      const card = e.currentTarget as HTMLElement;
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const rotX = ((y - cy) / cy) * -8;
      const rotY = ((x - cx) / cx) * 8;
      card.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-10px)`;
    };
    const onLeave = (e: MouseEvent) => {
      (e.currentTarget as HTMLElement).style.transform = "";
    };
    cards.forEach((c) => {
      c.addEventListener("mousemove", onMove);
      c.addEventListener("mouseleave", onLeave);
    });
    return () => {
      cards.forEach((c) => {
        c.removeEventListener("mousemove", onMove);
        c.removeEventListener("mouseleave", onLeave);
      });
    };
  }, []);

  // ── MÚSICA ──
  const toggleMusic = () => {
    if (!musicRef.current) return;
    if (!playing) {
      musicRef.current.volume = 0.3;
      musicRef.current.play().catch(() => {});
    } else {
      musicRef.current.pause();
    }
    setPlaying(!playing);
  };

  // ── FORMULÁRIO ──
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const toast = document.getElementById("toast");
    if (toast) {
      toast.classList.add("show");
      setTimeout(() => toast.classList.remove("show"), 3500);
    }
    e.currentTarget.reset();
  };

  return (
    <>
      {/* Cursor */}
      <div className="cursor" ref={cursorRef} />
      <div className="cursor-follower" ref={followerRef} />

      {/* Progress Bar */}
      <div className="progress-bar" id="progressBar" />

      {/* Canvas */}
      <canvas id="particles-canvas" ref={canvasRef} />

      {/* Toast */}
      <div className="toast" id="toast">✨ Mensagem enviada com sucesso!</div>

      {/* Música */}
      <button className={`music-btn ${playing ? "playing" : ""}`} onClick={toggleMusic} title="Música ambiente">
        <i className={`fas ${playing ? "fa-pause" : "fa-music"}`} />
      </button>
      <audio ref={musicRef} loop>
        <source src="https://cdn.pixabay.com/audio/2022/03/10/audio_1a53f31de9.mp3" type="audio/mp3" />
      </audio>

      {/* Nav */}
      <nav>
        <div className="nav-logo">VK</div>
        <ul className="nav-links">
          <li><a href="#about">Sobre</a></li>
          <li><a href="#skills">Skills</a></li>
          <li><a href="#projects">Projetos</a></li>
          <li><a href="#contact">Contato</a></li>
        </ul>
      </nav>

      {/* ── HERO ── */}
      <section className="hero" id="home">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />

        <div className="hero-inner">
          <div className="hero-text reveal">
            <p className="role">{role}<span style={{ opacity: 0.7 }}>|</span></p>
            <h1>
              Olá, eu sou<br />
              <span>Vivianne Kellen</span>
            </h1>
            <p className="bio">
              Apaixonada por criar experiências digitais que unem código elegante
              e design intuitivo. Transformo ideias em produtos bonitos e funcionais.
            </p>
            <div className="hero-btns">
              <a href="#projects" className="btn btn-primary">Ver Projetos</a>
              <a href="#contact" className="btn btn-outline">Falar Comigo</a>
            </div>
          </div>

          <div className="hero-photo-wrap reveal">
            <div className="photo-ring">
              <div className="photo-inner">
                {/* Troque o src pela sua foto. Coloque a imagem em /public/foto.jpg */}
                <Image
                  src="/img1.jpeg"
                  alt="Vivianne Kellen"
                  width={280}
                  height={280}
                  style={{ objectFit: "cover", borderRadius: "50%" }}
                  priority
                />
              </div>
            </div>
          </div>
        </div>

        <div className="scroll-indicator">
          <span>Scroll</span>
          <i className="fas fa-chevron-down" />
        </div>
      </section>

      <div className="divider" />

      {/* ── SOBRE ── */}
      <section id="about">
        <div className="container">
          <div className="section-title reveal">
            <span className="section-label">Quem sou eu</span>
            <h2>Sobre Mim</h2>
            <div className="section-line" />
          </div>
          <div className="about-grid">
            <div className="about-text reveal">
              <p>Sou uma desenvolvedora criativa apaixonada por tecnologia e design. Trabalho com front-end e back-end, sempre buscando criar soluções que aliam performance, acessibilidade e experiências memoráveis.</p>
              <p>Acredito que o código mais bonito é aquele que resolve problemas reais de forma elegante. Quando não estou programando, estou explorando novas ferramentas, estudando design ou ouvindo boa música.</p>
              <p>Aberta a novas oportunidades, colaborações e projetos desafiadores que me permitam crescer e criar coisas incríveis.</p>
            </div>
            <div className="about-stats reveal">
              {[
                { number: "3+", label: "Anos de Exp." },
                { number: "20+", label: "Projetos" },
                { number: "10+", label: "Tecnologias" },
                { number: "100%", label: "Dedicação" },
              ].map((s) => (
                <div className="stat-card" key={s.label}>
                  <div className="number">{s.number}</div>
                  <div className="label">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="divider" />

      {/* ── SKILLS ── */}
      <section id="skills">
        <div className="container">
          <div className="section-title reveal">
            <span className="section-label">Tecnologias</span>
            <h2>Skills & Ferramentas</h2>
            <div className="section-line" />
          </div>
          <div className="skills-grid">
            {[
              { icon: "fab fa-html5", color: "#e34f26", label: "HTML5" },
              { icon: "fab fa-css3-alt", color: "#1572b6", label: "CSS3" },
              { icon: "fab fa-js", color: "#f7df1e", label: "JavaScript" },
              { icon: "fab fa-react", color: "#61dafb", label: "React" },
              { icon: "fab fa-node-js", color: "#68a063", label: "Node.js" },
              { icon: "fab fa-python", color: "#3776ab", label: "Python" },
              { icon: "fab fa-git-alt", color: "#f05032", label: "Git" },
              { icon: "fab fa-figma", color: "#a259ff", label: "Figma" },
            ].map((sk) => (
              <div className="skill-card reveal" key={sk.label}>
                <i className={sk.icon} style={{ color: sk.color }} />
                <span>{sk.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="divider" />

      {/* ── PROJETOS ── */}
      <section id="projects">
        <div className="container">
          <div className="section-title reveal">
            <span className="section-label">Trabalhos</span>
            <h2>Projetos em Destaque</h2>
            <div className="section-line" />
          </div>
          <div className="projects-grid">
            {[
              {
                emoji: "🌐",
                gradient: "linear-gradient(135deg, #1a1a2e, #c084fc22)",
                title: "Projeto Web App",
                desc: "Aplicação web responsiva com autenticação, dashboard interativo e integração com APIs externas.",
                tags: ["React", "Node.js", "MongoDB"],
                github: "#",
                demo: "#",
              },
              {
                emoji: "📱",
                gradient: "linear-gradient(135deg, #1a1a2e, #818cf822)",
                title: "App Mobile UI",
                desc: "Design system completo e protótipo interativo de aplicativo mobile com foco em UX/UI moderno.",
                tags: ["Figma", "React Native", "Expo"],
                github: "#",
                demo: "#",
              },
              {
                emoji: "🤖",
                gradient: "linear-gradient(135deg, #1a1a2e, #f472b622)",
                title: "AI Dashboard",
                desc: "Dashboard de visualização de dados com integração de modelos de ML e gráficos em tempo real.",
                tags: ["Python", "FastAPI", "D3.js"],
                github: "#",
                demo: "#",
              },
            ].map((p) => (
              <div className="project-card reveal" key={p.title}>
                <div className="project-thumb">
                  <div className="project-thumb-bg" style={{ background: p.gradient }} />
                  <span className="project-thumb-icon">{p.emoji}</span>
                </div>
                <div className="project-info">
                  <h3>{p.title}</h3>
                  <p>{p.desc}</p>
                  <div className="project-tags">
                    {p.tags.map((t) => <span className="tag" key={t}>{t}</span>)}
                  </div>
                  <div className="project-links">
                    <a href={p.github} className="project-link" target="_blank" rel="noopener noreferrer">
                      <i className="fab fa-github" /> Código
                    </a>
                    <a href={p.demo} className="project-link" target="_blank" rel="noopener noreferrer">
                      <i className="fas fa-external-link-alt" /> Demo
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="divider" />

      {/* ── CONTATO ── */}
      <section id="contact">
        <div className="container">
          <div className="section-title reveal">
            <span className="section-label">Vamos conversar</span>
            <h2>Entre em Contato</h2>
            <div className="section-line" />
          </div>
          <div className="contact-grid">
            <div className="contact-cards reveal">
              {[
                { href: "mailto:viviannekellen@email.com", iconBg: "rgba(192,132,252,0.15)", iconColor: "#c084fc", icon: "fas fa-envelope", type: "Email", value: "viviannekellen@email.com" },
                { href: "https://github.com/viviannekellen", iconBg: "rgba(255,255,255,0.08)", iconColor: "#fff", icon: "fab fa-github", type: "GitHub", value: "github.com/viviannekellen" },
                { href: "https://linkedin.com/in/viviannekellen", iconBg: "rgba(10,102,194,0.2)", iconColor: "#0a66c2", icon: "fab fa-linkedin", type: "LinkedIn", value: "linkedin.com/in/viviannekellen" },
                { href: "https://instagram.com/viviannekellen", iconBg: "rgba(244,114,182,0.15)", iconColor: "#f472b6", icon: "fab fa-instagram", type: "Instagram", value: "@viviannekellen" },
              ].map((c) => (
                <a href={c.href} className="contact-card" key={c.type} target="_blank" rel="noopener noreferrer">
                  <div className="contact-icon" style={{ background: c.iconBg, color: c.iconColor }}>
                    <i className={c.icon} />
                  </div>
                  <div className="contact-card-info">
                    <div className="contact-type">{c.type}</div>
                    <div className="contact-value">{c.value}</div>
                  </div>
                </a>
              ))}
            </div>

            <div className="reveal">
              <form className="contact-form" onSubmit={handleSubmit}>
                <div className="form-group"><input type="text" placeholder="Seu nome" required /></div>
                <div className="form-group"><input type="email" placeholder="Seu email" required /></div>
                <div className="form-group"><input type="text" placeholder="Assunto" /></div>
                <div className="form-group"><textarea placeholder="Sua mensagem..." /></div>
                <button type="submit" className="btn-send">
                  <i className="fas fa-paper-plane" /> Enviar Mensagem
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer>
        <div className="footer-logo">Vivianne Kellen</div>
        <div className="footer-text">© 2026 · Feito com ♥ e muito café</div>
        <div className="social-links">
          {[
            { href: "https://github.com/viviannekellen", icon: "fab fa-github" },
            { href: "https://linkedin.com/in/viviannekellen", icon: "fab fa-linkedin-in" },
            { href: "mailto:viviannekellen@email.com", icon: "fas fa-envelope" },
            { href: "https://instagram.com/viviannekellen", icon: "fab fa-instagram" },
          ].map((s) => (
            <a href={s.href} className="social-link" key={s.icon} target="_blank" rel="noopener noreferrer">
              <i className={s.icon} />
            </a>
          ))}
        </div>
      </footer>
    </>
  );
}