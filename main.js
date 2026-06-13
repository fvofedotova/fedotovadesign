(function () {
  var path = window.location.pathname.split("/").pop() || "index.html";
  var hash = window.location.hash;
  var isHome = path === "" || path === "index.html";

  document.querySelectorAll(".nav-links a").forEach(function (link) {
    var href = link.getAttribute("href") || "";
    var linkHash = href.indexOf("#") !== -1 ? href.slice(href.indexOf("#")) : "";

    if (isHome) {
      if (href === "index.html" && !hash) {
        link.classList.add("active");
      } else if (href === "#experience" && hash === "#experience") {
        link.classList.add("active");
      } else if (href === "#contact" && hash === "#contact") {
        link.classList.add("active");
      }
      return;
    }

    if (linkHash) return;

    if (href === path || (path === "" && href === "index.html")) {
      link.classList.add("active");
    }
  });

})();

(function () {
  if (!window.matchMedia("(pointer: fine)").matches) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var root = document.createElement("div");
  root.className = "site-cursor";
  root.setAttribute("aria-hidden", "true");
  root.innerHTML = '<span class="site-cursor-ring"></span>';
  document.body.appendChild(root);
  document.body.classList.add("has-custom-cursor");

  var ring = root.querySelector(".site-cursor-ring");
  var visible = false;

  var interactiveSelector =
    "a, button, .btn, .btn-round, .nav-cv, .case-accordion-trigger, input, textarea, select, label[for], .project-card, .contact-link";

  function setVisible(state) {
    visible = state;
    root.classList.toggle("is-visible", state);
  }

  function setHover(state) {
    root.classList.toggle("is-hover", state);
  }

  function movePointer(x, y) {
    ring.style.transform = "translate3d(" + x + "px, " + y + "px, 0) translate(-50%, -50%)";
  }

  document.addEventListener(
    "mousemove",
    function (e) {
      if (!visible) setVisible(true);
      movePointer(e.clientX, e.clientY);
      setHover(!!e.target.closest(interactiveSelector));
    },
    { passive: true }
  );

  document.addEventListener("mouseleave", function () { setVisible(false); }, { passive: true });

  movePointer(window.innerWidth / 2, window.innerHeight / 2);
})();

(function () {
  var PRETTY_SELECTOR =
    ".hero-lead, .section-lead, .case-hero .section-lead, .case-hero-note, .case-block p, .case-block-subtitle, .case-block-lead, .about-item p, .about-entry-text, .project-card-text, .stat-label, .discover-box-body p, .discover-bar-label, .discover-chart-note, .develop-text, .develop-ab-caption, .case-meta dd";
  var SHORT_WORDS =
    /^(a|an|and|as|at|be|by|for|if|in|is|it|my|no|of|on|or|so|to|up|us|we|the|via|per|out|off|but|yet|nor|how|who|why|all|any|its|she|he|am|do|with|from|into|that|this|also|both|each|not|can|may|our|your|was|were|has|have|had|than|then|them|they|their|there|over|under|about|after|before|between|through|during|without|within|along|across|among|against|toward|towards|like|such|once|while|where|when|what|which|whose|whom|because|although|though|until|unless|since|upon|onto|into|despite|except|plus|minus|near|past|plus|e\.g|i\.e|vs)$/i;
  var resizeTimer;

  function wordCore(word) {
    return word.replace(/^[^\w]+|[^\w]+$/g, "");
  }

  function shouldBind(word) {
    var core = wordCore(word);
    if (!core) return false;
    if (core.length <= 2) return true;
    if (core.length <= 4 && SHORT_WORDS.test(core)) return true;
    return SHORT_WORDS.test(core);
  }

  function polishText(original) {
    var words = original.split(/\s+/);
    if (!words.length) return original;

    var result = [];
    var i = 0;

    while (i < words.length) {
      var word = words[i];
      var next = words[i + 1];
      var next2 = words[i + 2];

      if (next && shouldBind(word)) {
        if (next2 && shouldBind(next)) {
          result.push(word + "\u00A0" + next + "\u00A0" + next2);
          i += 3;
          continue;
        }

        result.push(word + "\u00A0" + next);
        i += 2;
        continue;
      }

      if (next && shouldBind(next)) {
        result.push(word + "\u00A0" + next);
        i += 2;
        continue;
      }

      result.push(word);
      i += 1;
    }

    if (result.length >= 2) {
      var last = result.pop();
      var prev = result.pop();
      result.push(prev + "\u00A0" + last);
    }

    return result.join(" ");
  }

  function polishMixedElement(el) {
    var cacheKey = "data-pretty-mixed";
    var sources;

    if (!el.hasAttribute(cacheKey)) {
      sources = [];
      Array.prototype.forEach.call(el.childNodes, function (node) {
        if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
          sources.push(node.textContent.replace(/\s+/g, " ").trim());
        }
      });
      el.setAttribute(cacheKey, JSON.stringify(sources));
    } else {
      sources = JSON.parse(el.getAttribute(cacheKey));
    }

    var index = 0;
    Array.prototype.forEach.call(el.childNodes, function (node) {
      if (node.nodeType !== Node.TEXT_NODE || !node.textContent.trim()) return;

      var leading = node.textContent.match(/^\s*/)[0];
      var original = sources[index];
      index += 1;
      node.textContent = leading + polishText(original);
    });
  }

  function polishParagraph(el) {
    if (!el) return;

    if (el.children.length) {
      polishMixedElement(el);
      return;
    }

    var original = el.getAttribute("data-pretty-source");
    if (!original) {
      original = el.textContent.replace(/\s+/g, " ").trim();
      el.setAttribute("data-pretty-source", original);
    }

    el.textContent = polishText(original);
  }

  function polishAll() {
    document.querySelectorAll(PRETTY_SELECTOR).forEach(polishParagraph);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", polishAll);
  } else {
    polishAll();
  }

  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(polishAll, 150);
  });
})();

(function () {
  var accordion = document.querySelector(".case-accordion");
  if (!accordion) return;

  var items = Array.prototype.slice.call(
    accordion.querySelectorAll(".case-accordion-item")
  );

  function setItemState(item, open) {
    var trigger = item.querySelector(".case-accordion-trigger");
    var panel = item.querySelector(".case-accordion-panel");
    if (!trigger || !panel) return;

    item.classList.toggle("is-open", open);
    trigger.setAttribute("aria-expanded", open ? "true" : "false");
    panel.hidden = !open;
  }

  items.forEach(function (item) {
    var trigger = item.querySelector(".case-accordion-trigger");
    if (!trigger) return;

    trigger.addEventListener("click", function () {
      var isOpen = item.classList.contains("is-open");
      items.forEach(function (entry) {
        setItemState(entry, false);
      });
      if (!isOpen) {
        setItemState(item, true);
      }
    });
  });
})();
