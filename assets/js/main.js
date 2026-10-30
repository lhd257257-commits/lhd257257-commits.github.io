/* 作品集交互：滚动出现 + 图片灯箱（无依赖） */
(function () {
  "use strict";

  /* ---------- 滚动出现 ---------- */
  var items = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && items.length) {
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

  /* ---------- 图片灯箱 ---------- */
  var lb = document.getElementById("lightbox");
  if (!lb) return;
  var lbImg = lb.querySelector("img");
  var btn = lb.querySelector(".lb-close");

  function open(src, alt) {
    lbImg.src = src;
    lbImg.alt = alt || "";
    lb.classList.add("on");
    lb.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function close() {
    lb.classList.remove("on");
    lb.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    lbImg.removeAttribute("src");
  }

  document.querySelectorAll("[data-full]").forEach(function (img) {
    img.addEventListener("click", function () {
      open(img.getAttribute("data-full"), img.getAttribute("alt"));
    });
    img.style.cursor = "zoom-in";
  });

  btn.addEventListener("click", close);
  lb.addEventListener("click", function (e) {
    if (e.target === lb) close();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && lb.classList.contains("on")) close();
  });
})();
