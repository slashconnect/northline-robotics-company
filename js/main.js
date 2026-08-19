(function () {
  "use strict";

  const page = document.documentElement.dataset.page || "home";

  function qs(selector, scope = document) {
    return scope.querySelector(selector);
  }

  function qsa(selector, scope = document) {
    return Array.from(scope.querySelectorAll(selector));
  }

  function initHeader() {
    const header = qs("[data-header]");
    const toggle = qs(".menu-toggle");
    const panel = qs(".mobile-panel");
    if (!header || !toggle || !panel) return;

    const close = () => {
      header.classList.remove("menu-open");
      toggle.setAttribute("aria-expanded", "false");
      panel.setAttribute("aria-hidden", "true");
      const label = qs("[data-menu-label]", toggle);
      if (label) label.textContent = "Open navigation";
    };

    toggle.addEventListener("click", () => {
      const open = !header.classList.contains("menu-open");
      header.classList.toggle("menu-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      panel.setAttribute("aria-hidden", String(!open));
      const label = qs("[data-menu-label]", toggle);
      if (label) label.textContent = open ? "Close navigation" : "Open navigation";
    });

    qsa("a", panel).forEach(link => link.addEventListener("click", close));
    document.addEventListener("keydown", event => {
      if (event.key === "Escape") close();
    });
  }

  function initReveals() {
    const items = qsa("[data-anim]");
    if (!items.length || !("IntersectionObserver" in window)) {
      items.forEach(item => item.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    items.forEach(item => observer.observe(item));
  }

  function initScan() {
    const button = qs("[data-scan-toggle]");
    if (!button) return;
    const label = qs("[data-scan-label]", button);
    const state = qs("[data-scan-state]");
    let active = false;

    button.addEventListener("click", () => {
      active = !active;
      button.setAttribute("aria-pressed", String(active));
      if (label) label.textContent = active ? "Pause scan sweep" : "Run scan sweep";
      if (state) state.textContent = active
        ? "Sweep active · operator authority retained"
        : "Path ready · operator authority retained";
      document.body.classList.toggle("scan-active", active);
    });
  }

  function initStorySteps() {
    const steps = qsa("[data-story-step]");
    const frames = qsa("[data-story-frame]");
    const progress = qs("[data-story-progress]");
    if (!steps.length || !frames.length) return;

    const labels = ["Mission geometry", "Capture intent", "Engineering record"];

    const activate = index => {
      steps.forEach(step => step.classList.toggle("is-active", Number(step.dataset.storyStep) === index));
      frames.forEach(frame => frame.classList.toggle("is-active", Number(frame.dataset.storyFrame) === index));
      if (progress) progress.textContent = String(index + 1).padStart(2, "0") + " — " + labels[index];
    };

    steps.forEach(step => {
      step.addEventListener("click", () => activate(Number(step.dataset.storyStep)));
      step.setAttribute("tabindex", "0");
      step.addEventListener("keydown", event => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          activate(Number(step.dataset.storyStep));
        }
      });
    });
  }

  function initPlatformTabs() {
    const root = qs("[data-platform-tabs]");
    if (!root) return;
    const tabs = qsa("[data-platform-tab]", root);
    const panels = qsa("[data-platform-panel]", root);

    const activate = name => {
      tabs.forEach(tab => {
        const selected = tab.dataset.platformTab === name;
        tab.setAttribute("aria-selected", String(selected));
        tab.tabIndex = selected ? 0 : -1;
      });
      panels.forEach(panel => {
        panel.hidden = panel.dataset.platformPanel !== name;
      });
    };

    tabs.forEach((tab, index) => {
      tab.addEventListener("click", () => activate(tab.dataset.platformTab));
      tab.addEventListener("keydown", event => {
        if (!["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)) return;
        event.preventDefault();
        let next = index;
        if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
        if (event.key === "ArrowLeft") next = (index - 1 + tabs.length) % tabs.length;
        if (event.key === "Home") next = 0;
        if (event.key === "End") next = tabs.length - 1;
        tabs[next].focus();
        activate(tabs[next].dataset.platformTab);
      });
    });
  }

  function initFindings() {
    const root = qs("[data-finding-explorer]");
    if (!root) return;
    const buttons = qsa("[data-finding]", root);
    const fields = {
      id: qs("[data-finding-id]", root),
      title: qs("[data-finding-title]", root),
      location: qs("[data-finding-location]", root),
      source: qs("[data-finding-source]", root),
      note: qs("[data-finding-note]", root)
    };

    buttons.forEach(button => {
      button.addEventListener("click", () => {
        buttons.forEach(item => {
          const selected = item === button;
          item.classList.toggle("is-active", selected);
          item.setAttribute("aria-pressed", String(selected));
        });
        fields.id.textContent = "Evidence " + button.dataset.finding;
        fields.title.textContent = button.dataset.title;
        fields.location.textContent = button.dataset.location;
        fields.source.textContent = button.dataset.source;
        fields.note.textContent = button.dataset.note;
      });
    });
  }

  function renderSimplePages() {
    const root = qs("#root");
    if (!root) return;

    const data = {
      "case-studies": {
        eyebrow: "Northline / Case files",
        title: "Evidence is the<br><em>deliverable.</em>",
        intro: "Workflow studies showing how autonomous inspection becomes a clearer operating record for difficult infrastructure.",
        sections: [
          ["Bridge inspection", "A repeatable view beneath the deck.", "Mission geometry, source frames, and component-level review remain connected from first pass to handoff."],
          ["Transmission corridors", "Span-by-span context at corridor scale.", "Structure identity, conductor, insulator, and right-of-way observations are organized in utility language."],
          ["Wind assets", "Blade coverage indexed by surface.", "Root-to-tip passes preserve blade identity, face, and radial position for review and comparison."]
        ]
      },
      "service-bridges": {
        eyebrow: "Application / 01",
        title: "Under the deck,<br><em>on the record.</em>",
        intro: "Autonomous bridge inspection for girders, bearings, piers, connections, and the difficult-access geometry between them.",
        sections: [
          ["Mission design", "Plan around the bridge, not a generic flight box.", "Northline builds asset-relative routes with stand-off, viewpoints, clearance, and operator checkpoints in view."],
          ["Field capture", "A consistent relationship to the structure.", "The aircraft holds the intended camera angle and surface relationship while the field operator retains authority."],
          ["Engineering handoff", "Every frame knows where it belongs.", "Source media, location, notes, and review states return as one traceable field record."]
        ]
      },
      "service-power": {
        eyebrow: "Application / 02",
        title: "Follow the line<br><em>through the evidence.</em>",
        intro: "Autonomous inspection for transmission corridors where structure, span, and component context matter at every distance.",
        sections: [
          ["Corridor planning", "Turn long right-of-ways into inspectable segments.", "Mission plans are organized by tower, span, component, and site controls before the aircraft leaves the ground."],
          ["Repeatable capture", "Consistent passes across the corridor.", "Capture intent stays stable across towers and spans, creating a more useful basis for review."],
          ["Utility-ready records", "Return evidence in the owner’s language.", "Frame references and location context remain attached to observations and exports."]
        ]
      },
      "service-wind": {
        eyebrow: "Application / 03",
        title: "Root to tip,<br><em>surface by surface.</em>",
        intro: "Autonomous wind turbine inspection designed around blade identity, radial position, face, and repeatable coverage.",
        sections: [
          ["Blade geometry", "Design the pass around the surface.", "Each mission accounts for blade identity, face, radial station, stand-off, and the review question."],
          ["Capture discipline", "Repeatability is the advantage.", "The aircraft follows a deliberate path so future records can be compared without losing context."],
          ["Review record", "Findings stay attached to the blade.", "Original frames, observations, and reviewer states remain connected through delivery."]
        ]
      }
    }[page];

    if (!data) return;

    root.innerHTML = `
      <a class="skip-link" href="#main">Skip to main content</a>
      <header class="site-header" data-header>
        <div class="header-inner">
          <a class="brand" href="/" aria-label="Northline Robotics home">
            <svg class="brand-mark" viewBox="0 0 36 36" aria-hidden="true"><path d="M4 28V8h6l16 17V8h6v20h-6L10 11v17z"/><path class="brand-mark-accent" d="M4 31h28v2H4z"/></svg>
            <span class="brand-type"><span>Northline</span><span>Robotics</span></span>
          </a>
          <nav class="desktop-nav" aria-label="Primary navigation"><a href="/#applications">Applications</a><a href="/pages/platform.html">Field Record</a><a href="/pages/case-studies.html">Case files</a></nav>
          <a class="header-cta" href="/pages/demo.html">Request field demo</a>
          <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="mobile-navigation"><span class="sr-only" data-menu-label>Open navigation</span><span class="menu-lines" aria-hidden="true"><i></i><i></i></span></button>
        </div>
        <div class="mobile-panel" id="mobile-navigation" aria-hidden="true"><nav aria-label="Mobile navigation"><a href="/#applications"><span>01</span>Applications</a><a href="/pages/platform.html"><span>02</span>Field Record</a><a href="/pages/case-studies.html"><span>03</span>Case files</a></nav><a class="button button--orange mobile-panel-cta" href="/pages/demo.html">Request field demo</a></div>
      </header>
      <main id="main">
        <section class="page-hero"><div class="section-shell page-hero-grid"><div class="page-hero-copy"><p class="hero-kicker"><span>${data.eyebrow}</span><span>Northline Robotics</span></p><h1 class="page-display">${data.title}</h1><p class="page-hero-summary">${data.intro}</p><div class="hero-actions"><a class="button button--orange" href="/pages/demo.html">Discuss an asset</a></div></div><div class="platform-hero-object"><div class="platform-window"><div class="platform-window-bar"><span>NL / FIELD RECORD</span><span>MISSION READY</span><span class="record-live">● Live context</span></div><div class="platform-image" style="min-height:430px"><img src="https://images.unsplash.com/photo-1473968512647-3e447244af8f?auto=format&fit=crop&w=1200&q=80" alt="Inspection drone flying above a structured industrial landscape"><div class="platform-image-data"><span>ASSET-RELATIVE MISSION</span><span>OPERATOR AUTHORITY RETAINED</span></div></div><div class="platform-window-footer"><span>Geometry attached</span><span>Source preserved</span><span>Review open</span></div></div></div></div></section>
        <section class="section-paper statement-section"><div class="section-shell"><div class="section-marker"><span>01</span><span>Application logic</span></div><div class="statement-layout"><h2>Hard access should not produce soft evidence.</h2><p class="statement-display">Inspect the geometry.<br><em>Keep the context.</em></p><p class="statement-note">${data.intro}</p></div></div></section>
        <section class="operation-section"><div class="section-shell"><header class="section-heading"><div><span class="eyebrow">The operating model</span><span class="section-count">02 / 04</span></div><h2>One asset.<br>Three passes.</h2><p>From planning to handoff, each stage protects the meaning of the evidence.</p></header><div class="application-list">${data.sections.map((section, i) => `<article class="application-row" style="color:#f7f7f3;border-color:#414746"><span class="application-index">0${i + 1}</span><div class="application-copy"><span class="application-label" style="color:#ff5a1f">${section[0]}</span><h3>${section[1]}</h3><p>${section[2]}</p></div><div></div></article>`).join("")}</div></div></section>
        <section class="closing-section"><div class="closing-grid" aria-hidden="true"></div><div class="section-shell closing-inner"><span class="eyebrow">Field demonstration / 04</span><h2>Bring us the asset<br>that resists shortcuts.</h2><div class="closing-lower"><p>We’ll shape a focused demonstration around your access constraints, evidence standard, and next decision.</p><a class="button button--light" href="/pages/demo.html">Request a field demo</a></div></div></section>
      </main>
      <footer class="site-footer"><div class="footer-top"><a class="brand brand--footer" href="/"><svg class="brand-mark" viewBox="0 0 36 36" aria-hidden="true"><path d="M4 28V8h6l16 17V8h6v20h-6L10 11v17z"/><path class="brand-mark-accent" d="M4 31h28v2H4z"/></svg><span class="brand-type"><span>Northline</span><span>Robotics</span></span></a><p>Autonomous inspection systems for infrastructure that cannot afford incomplete evidence.</p><a class="footer-demo-link" href="/pages/demo.html">Request field demo →</a></div><div class="footer-bottom"><span>Northline Robotics Company</span><span>Critical infrastructure / autonomous systems</span><a href="#main">Back to top ↑</a></div></footer>`;
  }

  function initForm() {
    const form = qs("[data-demo-form], form");
    if (!form || page !== "demo") return;
    form.addEventListener("submit", async event => {
      event.preventDefault();
      const status = qs("[data-form-status]", form) || document.createElement("p");
      status.setAttribute("data-form-status", "");
      status.setAttribute("role", "status");
      if (!status.parentNode) form.appendChild(status);
      const button = qs("button[type=submit]", form);
      if (button) { button.disabled = true; button.textContent = "Sending…"; }
      try {
        const data = Object.fromEntries(new FormData(form).entries());
        if (typeof connectForms !== "undefined") await connectForms.submit("northline-demo-request", data);
        form.innerHTML = '<p class="form-success"><strong>Request received.</strong><br>We’ll review the asset and evidence question you shared, then follow up with a practical next step.</p>';
      } catch (error) {
        status.textContent = "We couldn’t send that request. Please check the fields and try again.";
        if (button) { button.disabled = false; button.textContent = "Send request"; }
      }
    });
  }

  renderSimplePages();
  initHeader();
  initReveals();
  initScan();
  initStorySteps();
  initPlatformTabs();
  initFindings();
  initForm();
})();
