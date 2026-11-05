/* 作品集交互：进度条 / 导航高亮 / 滚动出现 / 图册灯箱 / 视频弹窗 / 首屏视差 */
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
      parallax.style.transform = "translate(" + (x * 10).toFixed(1) + "px," + (y * 8).toFixed(1) + "px)";
    });
    hero.addEventListener("mouseleave", function () { parallax.style.transform = ""; });
  }

  /* ---------- 灯箱（图片图册 + 视频） ---------- */
  var lb = document.getElementById("lightbox");
  if (!lb) return;

  var lbImg = lb.querySelector("img");
  var lbVideo = lb.querySelector("video");
  var lbCap = lb.querySelector("figcaption");
  var lbCount = lb.querySelector(".lb-count");
  var prevBtn = lb.querySelector(".lb-prev");
  var nextBtn = lb.querySelector(".lb-next");

  var groups = {};
  document.querySelectorAll("[data-gallery]").forEach(function (fig) {
    var g = fig.getAttribute("data-gallery");
    (groups[g] = groups[g] || []).push(fig);
  });

  var mode = "image";
  var currentGroup = null, currentIndex = 0;

  function showImage(group, index) {
    var list = groups[group] || [];
    var fig = list[index];
    if (!fig) return;
    mode = "image";
    currentGroup = group;
    currentIndex = index;
    lbVideo.pause();
    lbVideo.hidden = true;
    lbVideo.removeAttribute("src");
    lbImg.hidden = false;
    lbImg.src = fig.getAttribute("data-full");
    lbImg.alt = fig.getAttribute("data-caption") || "";
    lbCap.textContent = fig.getAttribute("data-caption") || "";
    lbCount.textContent = (index + 1) + " / " + list.length;
    var multi = list.length > 1;
    prevBtn.hidden = !multi;
    nextBtn.hidden = !multi;
    lbCount.hidden = !multi;
  }

  function showVideo(src, title) {
    mode = "video";
    lbImg.hidden = true;
    lbImg.removeAttribute("src");
    lbVideo.hidden = false;
    lbVideo.src = src;
    lbVideo.play().catch(function () {});
    lbCap.textContent = title || "";
    lbCount.textContent = "";
    lbCount.hidden = true;
    prevBtn.hidden = true;
    nextBtn.hidden = true;
  }

  function open() {
    lb.classList.add("on");
    lb.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function close() {
    lb.classList.remove("on");
    lb.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    lbVideo.pause();
    lbVideo.removeAttribute("src");
  }

  function step(delta) {
    if (mode !== "image") return;
    var list = groups[currentGroup] || [];
    if (!list.length) return;
    showImage(currentGroup, (currentIndex + delta + list.length) % list.length);
  }

  Object.keys(groups).forEach(function (g) {
    groups[g].forEach(function (fig, i) {
      fig.addEventListener("click", function () { showImage(g, i); open(); });
    });
  });

  document.querySelectorAll("[data-video]").forEach(function (card) {
    card.addEventListener("click", function () {
      showVideo(card.getAttribute("data-video"), card.getAttribute("data-title"));
      open();
    });
  });

  prevBtn.addEventListener("click", function (e) { e.stopPropagation(); step(-1); });
  nextBtn.addEventListener("click", function (e) { e.stopPropagation(); step(1); });
  lb.querySelector(".lb-close").addEventListener("click", close);
  lb.addEventListener("click", function (e) { if (e.target === lb) close(); });

  document.addEventListener("keydown", function (e) {
    if (!lb.classList.contains("on")) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") step(-1);
    if (e.key === "ArrowRight") step(1);
  });

  /* ---------- 主影片封面播放 ---------- */
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
