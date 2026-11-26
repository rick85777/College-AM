/*
 * College-AM · 关键词检索（浏览器端，零依赖，约 4KB）
 *
 * 设计取舍：索引（search-index.json）由构建期生成，页面加载后只请求一次。
 * 归一化规则必须与 lib/search.mjs 的 norm() 完全一致 —— 那边建索引，这边归一化查询词，
 * 任何一边改了都会让检索静默失效，所以 scripts/test.mjs 里有一致性用例。
 *
 * 注意：这里故意不用 :has()、不用 optional chaining 之外的现代语法糖，
 * 目标是在国内壳浏览器（QQ / 百度 / UC）里也能跑。
 */
(function () {
  "use strict";

  var PUNCT = /[\s\u3000·•・\/\\|、,，.。:：;；()（）\[\]【】「」『』<>《》"'“”‘’!！?？_\-—–~～]/g;

  function norm(s) {
    return String(s == null ? "" : s)
      .replace(/[\uFF01-\uFF5E]/g, function (c) { return String.fromCharCode(c.charCodeAt(0) - 0xfee0); })
      .toLowerCase()
      .replace(PUNCT, "");
  }

  var input = document.getElementById("q");
  var out = document.getElementById("qresults");
  var hint = document.getElementById("qhint");
  if (!input || !out) return;

  var TYPE_LABEL = { program: "条目", province: "省级窗口", ai: "AI 入口" };
  var docs = null;
  var type = "all";
  var timer = 0;

  // 只渲染命中的前 N 条，避免一次插入上千个节点
  var LIMIT = 30;

  function score(doc, toks) {
    var s = 0;
    for (var i = 0; i < toks.length; i++) {
      var t = toks[i];
      if (doc.n.indexOf(t) === -1) return -1;
      s += 1;
      if (doc.nt.indexOf(t) !== -1) s += 8;
      else if (doc.k.indexOf(t) !== -1) s += 4;
    }
    return s;
  }

  function tokens(q) {
    var parts = String(q || "").split(/[\s\u3000]+/);
    var out = [];
    for (var i = 0; i < parts.length; i++) {
      var t = norm(parts[i]);
      if (t) out.push(t);
    }
    return out;
  }

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function render() {
    var raw = input.value.trim();
    var toks = tokens(raw);

    if (!toks.length) {
      out.innerHTML = "";
      hint.textContent = "输入任意字即可过滤；支持空格分隔多个词（同时满足）。";
      return;
    }

    var hits = [];
    for (var i = 0; i < docs.length; i++) {
      var d = docs[i];
      if (type !== "all" && d.t !== type) continue;
      var sc = score(d, toks);
      if (sc >= 0) hits.push({ d: d, s: sc });
    }
    hits.sort(function (a, b) {
      if (b.s !== a.s) return b.s - a.s;
      return a.d.ti.localeCompare(b.d.ti, "zh");
    });

    var shown = hits.slice(0, LIMIT);
    var html = "";
    for (var j = 0; j < shown.length; j++) {
      var h = shown[j].d;
      html +=
        '<li class="qhit"><a href="' + esc(h.u) + '">' +
        '<span class="qhit-type tag">' + esc(TYPE_LABEL[h.t] || h.t) + "</span>" +
        '<span class="qhit-t">' + esc(h.ti) + "</span>" +
        '<span class="qhit-s">' + esc(h.s) + "</span>" +
        "</a></li>";
    }
    out.innerHTML = html;

    if (!hits.length) {
      hint.textContent = "没有匹配「" + raw + "」的条目。试试更短的关键词，或换个说法（如「四级」而不是「大学英语四级考试」）。";
    } else if (hits.length > shown.length) {
      hint.textContent = "命中 " + hits.length + " 条，显示前 " + shown.length + " 条。加个词缩小范围。";
    } else {
      hint.textContent = "命中 " + hits.length + " 条。";
    }
  }

  function load() {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "search-index.json", true);
    xhr.onload = function () {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          docs = JSON.parse(xhr.responseText);
        } catch (e) {
          hint.textContent = "索引解析失败。";
          return;
        }
        if (docs.length) render();
      } else {
        hint.textContent = "索引加载失败（" + xhr.status + "）。";
      }
    };
    xhr.onerror = function () {
      hint.textContent = "索引加载失败，检查网络后刷新。";
    };
    xhr.send();
  }

  // 输入防抖：中文字符输入法组词期间会连续触发 input，60ms 足够合并
  input.addEventListener("input", function () {
    if (!docs) return;
    clearTimeout(timer);
    timer = setTimeout(render, 60);
  });

  var btns = document.querySelectorAll(".qtype");
  for (var i = 0; i < btns.length; i++) {
    btns[i].addEventListener("click", function (e) {
      var b = e.currentTarget;
      type = b.getAttribute("data-type");
      for (var k = 0; k < btns.length; k++) btns[k].className = "qtype" + (btns[k] === b ? " is-on" : "");
      if (docs) render();
    });
  }

  load();
})();
