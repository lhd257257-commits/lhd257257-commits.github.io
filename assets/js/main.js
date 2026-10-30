/* 作品集交互：进度条 / 导航高亮 / 滚动出现 / 图片灯箱 / 视频播放 / 首屏视差 */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 阅读进度条 ---------- */
  var bar = document.getElementById("progressBar");
  function onScroll() {
    if (!bar) return;
    var h = document.documentElement.scrollHeight - window.innerHeight;
    var p = h > 0 ? window.scrollY / h : 0;
    bar.style.transform = "scaleX(" + Math.min(1, Math.max(0, p)) + ")";
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();

  /* ---------- 导航高亮 ---------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll("#nav a"));
  var sections = navLinks
    .map(function (a) { return document.querySelector(a.getAttribute("href")); })
    .filter(Boolean);

  if ("IntersectionObserver" in window && sections.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var id = "#" + e.target.id;
        navLinks.forEach(function (a) {
          a.classList.toggle("active", a.getAttribute("href") === id);
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---------- 滚动出现 ---------- */
  var items = document.querySelectorAll(".reveal");
  if (!reduceMotion && "IntersectionObserver" in window && items.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- 首屏视差 ---------- */
  var parallax = document.querySelector("[data-parallax]");
  if (parallax && !reduceMotion && window.matchMedia("(pointer:fine)").matches) {
    var hero = document.querySelector(".hero");
    hero.addEventListener("mousemove", function (e) {
      var r = hero.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5;
      var y = (e.clientY - r.top) / r.height - 0.5;
      parallax.style.transform = "translate(" + (x * 10).toFixed(1) + "px," +
        (y * 8).toFixed(1) + "px)";
    });
    hero.addEventListener("mouseleave", function () {
      parallax.style.transform = "";
    });
  }

  /* ---------- 图片灯箱（可左右切换） ---------- */
  var lb = document.getElementById("lightbox");
  var lbImg = lb && lb.querySelector("img");
  var lbCap = lb && lb.querySelector("figcaption");
  var lbCount = lb && lb.querySelector(".lb-count");

  var groups = {};
  document.querySelectorAll("[data-gallery]").forEach(function (fig) {
    var g = fig.getAttribute("data-gallery");
    (groups[g] = groups[g] || []).push(fig);
  });

  var currentGroup = null, currentIndex = 0;

  function render() {
    var list = groups[currentGroup] || [];
    var fig = list[currentIndex];
    if (!fig) return;
    lbImg.src = fig.getAttribute("data-full");
    lbImg.alt = fig.getAttribute("data-caption") || "";
    lbCap.textContent = fig.getAttribute("data-caption") || "";
    lbCount.textContent = (currentIndex + 1) + " / " + list.length;
  }

  function open(group, index) {
    currentGroup = group;
    currentIndex = index;
    render();
    lb.classList.add("on");
    lb.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function close() {
    lb.classList.remove("on");
    lb.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  function step(delta) {
    var list = groups[currentGroup] || [];
    if (!list.length) return;
    currentIndex = (currentIndex + delta + list.length) % list.length;
    render();
  }

  if (lb) {
    Object.keys(groups).forEach(function (g) {
      groups[g].forEach(function (fig, i) {
        fig.addEventListener("click", function () { open(g, i); });
      });
    });

    lb.querySelector(".lb-prev").addEventListener("click", function (e) { e.stopPropagation(); step(-1); });
    lb.querySelector(".lb-next").addEventListener("click", function (e) { e.stopPropagation(); step(1); });
    lb.querySelector(".lb-close").addEventListener("click", close);
    lb.addEventListener("click", function (e) { if (e.target === lb) close(); });

    document.addEventListener("keydown", function (e) {
      if (!lb.classList.contains("on")) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") step(-1);
      if (e.key === "ArrowRight") step(1);
    });
  }

  /* ---------- 影像：点击封面播放 ---------- */
  var wrap = document.getElementById("filmWrap");
  var video = document.getElementById("filmVideo");
  var playBtn = document.getElementById("filmPlay");
  if (wrap && video && playBtn) {
    playBtn.addEventListener("click", function () {
      wrap.classList.add("playing");
      video.controls = true;
      video.play();
    });
    video.addEventListener("play", function () { wrap.classList.add("playing"); });
    video.addEventListener("pause", function () {
      if (video.currentTime === 0) wrap.classList.remove("playing");
    });
    video.addEventListener("ended", function () {
      wrap.classList.remove("playing");
      video.controls = false;
      video.currentTime = 0;
    });
  }
})();

