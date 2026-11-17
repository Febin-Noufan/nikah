(function () {
  // Counts down to 9:00 AM on 27 November 2026, India Standard Time.
  var target = new Date("2026-11-27T09:00:00+05:30").getTime();
  var d = document.getElementById("cd-d");
  var h = document.getElementById("cd-h");
  var m = document.getElementById("cd-m");
  var s = document.getElementById("cd-s");
  var grid = document.getElementById("countdown");
  var done = document.getElementById("cd-done");
  var dayEnd = target + 15 * 60 * 60 * 1000;

  function pad(n) { return n < 10 ? "0" + n : String(n); }

  function tick() {
    var now = Date.now();
    var diff = target - now;
    if (diff <= 0) {
      grid.hidden = true;
      done.hidden = false;
      done.textContent = now < dayEnd
        ? "Today is the day. Alhamdulillah."
        : "Alhamdulillah. Thank you for your duas.";
      return;
    }
    var total = Math.floor(diff / 1000);
    d.textContent = Math.floor(total / 86400);
    h.textContent = pad(Math.floor((total % 86400) / 3600));
    m.textContent = pad(Math.floor((total % 3600) / 60));
    s.textContent = pad(total % 60);
  }

  tick();
  setInterval(tick, 1000);
})();
