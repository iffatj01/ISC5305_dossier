const menuButton = document.querySelector(".menu-button");
const mainNav = document.querySelector(".main-nav");

menuButton.addEventListener("click", () => {
  const open = mainNav.classList.toggle("open");
  menuButton.setAttribute("aria-expanded", String(open));
});

mainNav.addEventListener("click", () => {
  mainNav.classList.remove("open");
  menuButton.setAttribute("aria-expanded", "false");
});

const courseBase = "course";

const assessments = [
  ["AI transcripts", "transcripts"],
  ["Homework rubric", "rubric"],
  ["Quiz score calculator", "quiz-calculator"],
  ["HW1 — The AI contract, practiced once", "hw1"],
  ["Quiz 1", "quiz-1"],
  ["Quiz 2", "quiz-2"],
  ["Quiz 3", "quiz-3"],
  ["Quiz 4", "quiz-4"],
  ["AI-Disclosure Dossier", "dossier", true],
];

const agenticDemos = [
  ["ag_context", "The model answers the context, not the prompt; the context inventory.", "ag_context"],
  ["ag_diff", "Review the change not the file: regression/feature halves, edge table.", "ag_diff"],
  ["ag_evidence", "The four-gate evidence ladder (compiles/runs/battery/ASan).", "ag_evidence"],
  ["ag_explain", "Explanations are unverified commitments; check them against the run.", "ag_explain"],
  ["ag_grounding", "Ungrounded vs grounded (real header pasted in).", "ag_grounding"],
  ["ag_hallucination", "The compiler as first honesty gate: invented refs, stale APIs.", "ag_hallucination"],
  ["ag_models", "Same prompt x six local tiers x three frameworks; which gate stops each.", "ag_models"],
  ["ag_numverify", "Numerically-wrong-but-green; cancellation; the oracle is part of the test.", "ag_numverify"],
  ["ag_pipeline", "The first agentic pipeline as a recorded replay: build/test/feedback loop.", "ag_pipeline"],
  ["ag_repair", "Directing a repair: vague vs directed, what-must-not-change clauses.", "ag_repair"],
  ["ag_testgate", "Same code, weak vs strong battery; green is a property of the tests.", "ag_testgate"],
  ["agentic_spec", "Vague prompt vs spec-grade prompt; a prompt is a specification.", "agentic_spec"],
];

const foundationDemos = [
  ["array_pointer", "Array-to-pointer decay, std::array/span, off-the-end pointer.", "array_pointer"],
  ["benchmarking", "Timing done right; the optimizer deletes your benchmark; cache effects.", "benchmarking"],
  ["compile_time", "if constexpr, SFINAE/enable_if, concepts, static_assert.", "compile_time"],
  ["debugging", "Reading a sanitizer report; assert vs exception vs silent; UB.", "debugging"],
  ["function_args", "Pass by value/pointer/reference, const&, move, RVO.", "function_args"],
  ["list_ops", "Linked-list pointer mechanics: insert/erase/splice, iterator validity.", "list_ops"],
  ["numerics", "Floating-point behavior: tolerances, cancellation, abs vs rel error.", "numerics"],
  ["ownership", "The four ownership relationships; RAII enforces ownership.", "ownership"],
  ["pointers_basic", "References vs pointers, nullptr, dangling/null gotchas.", "pointers_basic"],
  ["smart_pointers", "unique/shared/weak_ptr, make_*, ownership and double-free.", "smart_pointers"],
  ["stackframes", "Stack vs heap vs static lifetime; recursion frames.", "stackframes"],
  ["strings", "std::string value semantics, SSO, string_view borrowing and dangle.", "strings"],
  ["type_deduction", "auto drops ref/const, range-for copy mistake, decltype(auto).", "type_deduction"],
];

const oopDemos = [
  ["class_structure", "Buffer anchor: ctors, deep vs shallow copy (ASan), move ops, dtor.", "class_structure"],
  ["custom_iterators", "A minimal forward iterator that works with STL algorithms.", "custom_iterators"],
  ["custom_types", "Hashable/comparable/movable/streamable value types; explicit ctors.", "custom_types"],
  ["exceptions", "throw/try/catch, catch-by-ref, RAII unwinding, noexcept.", "exceptions"],
  ["functional", "Four callables under one signature; std::function type erasure.", "functional"],
  ["inheritance", "is-a, virtual dispatch, slicing, override, non-virtual-dtor gotcha.", "inheritance"],
  ["lambdas", "Capture by value/ref, mutable, predicates, dangling-capture gotcha.", "lambdas"],
  ["nested_containers", "Matrix as vector-of-vectors / flat / sparse (map vs CSR).", "nested_containers"],
  ["op_overload", "Vec2 anchor: arithmetic, comparison, iostream, const-correctness.", "op_overload"],
  ["stl", "Containers, iterators, algorithms-over-loops, iterator invalidation.", "stl"],
  ["templates", "Type params, deduction, specialization, header-visibility gotcha, CTAD.", "templates"],
  ["testing", "Writing a C++ test: boundary/value tests, tolerances, regression.", "testing"],
];

const modules = [
  ["Orientation", "orientation"],
  ["Module 1 — Basic Concepts + AI as Co-programmer", "module-01", "AI-assisted"],
  ["Module 2 — OOP Basics + Critiquing AI-Generated Classes", "module-02"],
  ["Module 3 — Memory Management + Ownership", "module-03"],
  ["Module 4 — Advanced OOP + Value Semantics as Policy", "module-04"],
  ["Module 5 — STL I: Containers", "module-05"],
  ["Module 6 — Templates & Generic Programming", "module-06"],
  ["Module 7 — STL II: Algorithms", "module-07"],
  ["Module 8 — Algorithms & Data Structures + Agent-Aware Design", "module-08"],
  ["Module 9 — First Agentic Pipeline", "module-09", "Agentic pipelines"],
  ["Module 10 — Modern C++ I + the Modernization Agent", "module-10"],
  ["Module 11 — Modern C++ II + Coding-Agent Architecture", "module-11"],
  ["Module 12 — Testing, CI Mindset, Agent-Driven Refactoring", "module-12"],
  ["Module 13 — Debugging, Guardrails, Failure-Aware Agents", "module-13"],
  ["Module 14 — Synthesis and Review", "module-14"],
];

function standardLinks(items, root) {
  return items
    .map(
      ([title, slug, active]) =>
        `<a class="${active ? "active" : ""}" href="${courseBase}/${root}/${slug}/">${title}</a>`,
    )
    .join("");
}

function demoLinks(items) {
  return items
    .map(
      ([title, description, slug]) =>
        `<a href="${courseBase}/demos/${slug}/"><strong>${title}</strong><span>${description}</span></a>`,
    )
    .join("");
}

function moduleLinks(items) {
  let currentSection = "";
  return items
    .map(([title, slug, section]) => {
      const heading = section && section !== currentSection
        ? `<div class="course-subheading">${section}</div>`
        : "";
      if (section) currentSection = section;
      return `${heading}<a href="${courseBase}/modules/${slug}/">${title}</a>`;
    })
    .join("");
}

document.querySelector("#course-navigation").innerHTML = `
  <section class="sidebar-section">
    <h2>Assessments</h2>
    <div class="sidebar-links">${standardLinks(assessments, "assessments")}</div>
  </section>

  <section class="sidebar-section">
    <h2>Demo Library</h2>
    <details class="demo-group">
      <summary>Agentic demos (12)</summary>
      <div class="demo-links">${demoLinks(agenticDemos)}</div>
    </details>
    <details class="demo-group">
      <summary>Foundations (13)</summary>
      <div class="demo-links">${demoLinks(foundationDemos)}</div>
    </details>
    <details class="demo-group">
      <summary>OOP (12)</summary>
      <div class="demo-links">${demoLinks(oopDemos)}</div>
    </details>
  </section>

  <section class="sidebar-section">
    <h2>Modules</h2>
    <div class="sidebar-links">${moduleLinks(modules)}</div>
  </section>

  <section class="sidebar-section">
    <h2>Resources</h2>
    <div class="sidebar-links">
      <a href="${courseBase}/resources/git-workflow/">The minimal-git workflow</a>
    </div>
  </section>
`;

const courseSidebar = document.querySelector(".course-sidebar");
const sidebarOpen = document.querySelector(".sidebar-open");
const sidebarClose = document.querySelector(".sidebar-close");

function setSidebar(open) {
  courseSidebar.classList.toggle("open", open);
  sidebarOpen.setAttribute("aria-expanded", String(open));
}

sidebarOpen.addEventListener("click", () => setSidebar(true));
sidebarClose.addEventListener("click", () => setSidebar(false));
courseSidebar.addEventListener("click", (event) => {
  if (event.target.closest("a") && window.innerWidth <= 950) setSidebar(false);
});
