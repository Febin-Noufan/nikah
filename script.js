(function () {
  var root = document.documentElement;
  root.classList.add("js");
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
 
  /* ---------- Names: split into words and letters ---------- */
  document.querySelectorAll("[data-split]").forEach(function (el) {
    var text = el.textContent.trim();
    var sr = document.createElement("span");
    sr.className = "sr";
    sr.textContent = text;
    el.textContent = "";
    el.appendChild(sr);
    var i = 0;
    text.split(" ").forEach(function (word, w) {
      if (w > 0) el.appendChild(document.createTextNode(" "));
      var wrap = document.createElement("span");
      wrap.className = "word";
      wrap.setAttribute("aria-hidden", "true");
      word.split("").forEach(function (ch) {
        var s = document.createElement("span");
        s.className = "char";
        s.textContent = ch;
        s.style.setProperty("--i", i++);
        wrap.appendChild(s);
      });
      el.appendChild(wrap);
    });
  });
 
  /* ---------- Scroll reveal ---------- */
  var items = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -5% 0px" });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add("in"); });
  }
 
  /* ---------- Calendar: November 2026 starts on a Sunday ---------- */
  var cal = document.getElementById("cal");
  if (cal) {
    var now = new Date();
    var isNov2026 = now.getFullYear() === 2026 && now.getMonth() === 10;
    var beforeNov = now.getFullYear() < 2026 || (now.getFullYear() === 2026 && now.getMonth() < 10);
    var afterNov = now.getFullYear() > 2026 || (now.getFullYear() === 2026 && now.getMonth() > 10);
    "SMTWTFS".split("").forEach(function (d) {
      var h = document.createElement("span");
      h.className = "h";
      h.textContent = d;
      cal.appendChild(h);
    });
    for (var d = 1; d <= 30; d++) {
      var c = document.createElement("span");
      c.textContent = d;
      if (d === 27) c.className = "on";
      else if (afterNov || (isNov2026 && d < now.getDate())) c.className = "past";
      else if (isNov2026 && d === now.getDate()) c.className = "today";
      cal.appendChild(c);
    }
    if (beforeNov) { /* nothing is past yet */ }
  }
 
  /* ---------- Countdown ---------- */
  var target = new Date("2026-11-27T09:00:00+05:30").getTime();
  var dayEnd = target + 15 * 60 * 60 * 1000;
  var CIRC = 276.46;
  var grid = document.getElementById("countdown");
  var done = document.getElementById("cd-done");
  var parts = ["d", "h", "m", "s"].map(function (k) {
    return { n: document.getElementById("cd-" + k), r: document.getElementById("r-" + k), v: null, f: 1 };
  });
 
  function setPart(p, value, frac) {
    var text = p === parts[0] ? String(value) : (value < 10 ? "0" + value : String(value));
    if (p.v !== text) {
      p.n.textContent = text;
      if (!reduce && p.v !== null && p.n.animate) {
        p.n.animate(
          [{ transform: "translateY(-8px)", opacity: 0.3 }, { transform: "none", opacity: 1 }],
          { duration: 320, easing: "cubic-bezier(.2,.7,.2,1)" }
        );
      }
      p.v = text;
    }
    if (frac > p.f + 0.001) {
      p.r.style.transition = "none";
      p.r.style.strokeDashoffset = CIRC * (1 - frac);
      void p.r.getBoundingClientRect();
      p.r.style.transition = "";
    } else {
      p.r.style.strokeDashoffset = CIRC * (1 - frac);
    }
    p.f = frac;
  }
 
  function tick() {
    var now = Date.now();
    var diff = target - now;
    if (diff <= 0) {
      grid.hidden = true;
      done.hidden = false;
      done.textContent = now < dayEnd ? "Today is the day. Alhamdulillah." : "Alhamdulillah. Thank you for your duas.";
      return false;
    }
    var total = Math.floor(diff / 1000);
    var days = Math.floor(total / 86400);
    var hrs = Math.floor((total % 86400) / 3600);
    var min = Math.floor((total % 3600) / 60);
    var sec = total % 60;
    setPart(parts[0], days, Math.min(days, 30) / 30);
    setPart(parts[1], hrs, hrs / 24);
    setPart(parts[2], min, min / 60);
    setPart(parts[3], sec, sec / 60);
    return true;
  }
  if (tick()) {
    var timer = setInterval(function () { if (!tick()) clearInterval(timer); }, 1000);
  }
 
  /* ---------- Share ---------- */
  var shareText = "Save the date! Nikah of Febin Noufan & Fathima Shihana, Friday 27 November 2026, 9:00 AM at Kozhunjil Jumah Masjid, in shaa Allah. ";
  var wa = document.getElementById("wa");
  if (wa && /^https?:/.test(location.href)) {
    wa.href = "https://wa.me/?text=" + encodeURIComponent(shareText + location.href);
  }
  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, 2400);
  }
  var copy = document.getElementById("copy");
  if (copy) {
    copy.addEventListener("click", function () {
      var url = location.href;
      function ok() { toast("Link copied"); }
      function fallback() {
        var ta = document.createElement("textarea");
        ta.value = url;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        var good = false;
        try { good = document.execCommand("copy"); } catch (e) { good = false; }
        document.body.removeChild(ta);
        if (good) ok(); else toast("Copy the link from the address bar");
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(ok, fallback);
      } else {
        fallback();
      }
    });
  }
 
  /* ---------- Gold sparkles ---------- */
  var canvas = document.getElementById("sparkles");
  if (canvas && canvas.getContext) {
    var ctx = canvas.getContext("2d");
    var W = 0, H = 0, dpr = 1, dots = [];
 
    function size() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.round(Math.min(80, (W * H) / 15000));
      dots = [];
      for (var i = 0; i < n; i++) {
        dots.push({
          x: Math.random() * W,
          y: Math.random() * H,
          r: 0.7 + Math.random() * 1.7,
          vy: 0.1 + Math.random() * 0.34,
          vx: (Math.random() - 0.5) * 0.14,
          ph: Math.random() * 6.28,
          sp: 0.6 + Math.random() * 1.6,
          star: Math.random() < 0.25
        });
      }
    }
 
    function fourStar(x, y, r) {
      ctx.beginPath();
      ctx.moveTo(x, y - r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.quadraticCurveTo(x, y, x, y + r);
      ctx.quadraticCurveTo(x, y, x - r, y);
      ctx.quadraticCurveTo(x, y, x, y - r);
      ctx.fill();
    }
 
    function draw(t) {
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#f0d58a";
      for (var i = 0; i < dots.length; i++) {
        var p = dots[i];
        if (!reduce) {
          p.y -= p.vy;
          p.x += p.vx + Math.sin(t / 2200 + p.ph) * 0.1;
          if (p.y < -12) { p.y = H + 12; p.x = Math.random() * W; }
        }
        ctx.globalAlpha = 0.22 + 0.6 * (0.5 + 0.5 * Math.sin((t / 1000) * p.sp + p.ph));
        if (p.star) {
          fourStar(p.x, p.y, p.r * 3.4);
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, 6.2832);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
    }
 
    size();
    var rt;
    window.addEventListener("resize", function () {
      clearTimeout(rt);
      rt = setTimeout(size, 150);
    });
    if (reduce) {
      draw(0);
    } else {
      (function loop(t) { draw(t); requestAnimationFrame(loop); })(0);
    }
  }
})();
 
