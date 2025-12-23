(function () {
  "use strict";

  var WEBHOOK_URL = "https://hooks.zapier.com/hooks/catch/5365219/ualt8zx/";

  function htmlEscape(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function sendWebhook(payload) {
    // Zapier webhooks frequently require no-cors from browsers.
    return fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      mode: "no-cors",
      body: JSON.stringify(payload),
    });
  }

  var STYLE = "\
:host{all:initial;contain:content;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,'Apple Color Emoji','Segoe UI Emoji';}\
.vbh-root{position:fixed;right:20px;bottom:20px;z-index:2147483647;}\
.vbh-launcher{all:unset;cursor:pointer;display:inline-flex;align-items:center;gap:10px;padding:12px 14px;border-radius:999px;background:#111827;color:#fff;box-shadow:0 10px 30px rgba(0,0,0,.25);}\
.vbh-launcher:focus{outline:2px solid rgba(59,130,246,.7);outline-offset:2px;}\
.vbh-panel{position:absolute;right:0;bottom:54px;width:360px;max-width:calc(100vw - 40px);border-radius:16px;background:#ffffff;color:#0f172a;box-shadow:0 18px 60px rgba(0,0,0,.28);overflow:hidden;display:none;border:1px solid rgba(15,23,42,.08);}\
.vbh-panel[data-open='true']{display:block;}\
.vbh-header{display:flex;align-items:center;justify-content:space-between;padding:14px 14px 12px;background:linear-gradient(135deg,#0b1220,#111827);color:#fff;}\
.vbh-title{font-weight:700;font-size:14px;letter-spacing:.2px;}\
.vbh-close{all:unset;cursor:pointer;width:34px;height:34px;border-radius:10px;display:grid;place-items:center;opacity:.9;}\
.vbh-close:hover{background:rgba(255,255,255,.08);} \
.vbh-body{padding:14px;}\
.vbh-desc{margin:0 0 12px;color:rgba(15,23,42,.7);font-size:13px;line-height:1.35;}\
.vbh-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;}\
.vbh-field{display:flex;flex-direction:column;gap:6px;}\
.vbh-field label{font-size:12px;color:rgba(15,23,42,.75);} \
.vbh-field input{all:unset;background:#f8fafc;border:1px solid rgba(15,23,42,.12);border-radius:10px;padding:10px 10px;font-size:14px;}\
.vbh-field input:focus{border-color:rgba(59,130,246,.55);box-shadow:0 0 0 3px rgba(59,130,246,.15);} \
.vbh-actions{margin-top:12px;display:flex;gap:10px;align-items:center;justify-content:flex-end;}\
.vbh-submit{all:unset;cursor:pointer;padding:10px 12px;border-radius:10px;background:#111827;color:#fff;font-weight:650;font-size:13px;}\
.vbh-submit[disabled]{opacity:.55;cursor:not-allowed;}\
.vbh-error{margin-top:10px;color:#b91c1c;font-size:12px;display:none;}\
.vbh-error[data-show='true']{display:block;}\
.vbh-success{margin-top:10px;color:#065f46;font-size:12px;display:none;}\
.vbh-success[data-show='true']{display:block;}\
@media (max-width:420px){.vbh-panel{width:320px}}\
";

  function createTemplate() {
    var tpl = document.createElement("template");
    tpl.innerHTML =
      "<style>" +
      STYLE +
      "</style>" +
      "<div class='vbh-root' part='root'>" +
      "  <button class='vbh-launcher' type='button' aria-haspopup='dialog' aria-expanded='false'>" +
      "    <span aria-hidden='true'>💬</span>" +
      "    <span>Chat</span>" +
      "  </button>" +
      "  <section class='vbh-panel' role='dialog' aria-label='Value Build Homes Assistant' aria-modal='false' data-open='false'>" +
      "    <header class='vbh-header'>" +
      "      <div class='vbh-title'>Value Build Homes</div>" +
      "      <button class='vbh-close' type='button' aria-label='Close'>✕</button>" +
      "    </header>" +
      "    <main class='vbh-body'>" +
      "      <p class='vbh-desc'>Request a callback and we’ll reach out shortly.</p>" +
      "      <form class='vbh-form' novalidate>" +
      "        <div class='vbh-grid'>" +
      "          <div class='vbh-field'>" +
      "            <label>First name</label>" +
      "            <input name='firstName' autocomplete='given-name' required />" +
      "          </div>" +
      "          <div class='vbh-field'>" +
      "            <label>Last name</label>" +
      "            <input name='lastName' autocomplete='family-name' required />" +
      "          </div>" +
      "          <div class='vbh-field' style='grid-column:1 / -1'>" +
      "            <label>Phone</label>" +
      "            <input name='phone' inputmode='tel' autocomplete='tel' required />" +
      "          </div>" +
      "          <div class='vbh-field' style='grid-column:1 / -1'>" +
      "            <label>Email</label>" +
      "            <input name='email' type='email' autocomplete='email' required />" +
      "          </div>" +
      "        </div>" +
      "        <div class='vbh-actions'>" +
      "          <button class='vbh-submit' type='submit'>Request callback</button>" +
      "        </div>" +
      "        <div class='vbh-error' role='status'></div>" +
      "        <div class='vbh-success' role='status'></div>" +
      "      </form>" +
      "    </main>" +
      "  </section>" +
      "</div>";
    return tpl;
  }

  function VBHChatbot() {
    return Reflect.construct(HTMLElement, [], VBHChatbot);
  }
  VBHChatbot.prototype = Object.create(HTMLElement.prototype);
  VBHChatbot.prototype.constructor = VBHChatbot;

  VBHChatbot.prototype.connectedCallback = function () {
    if (this._mounted) return;
    this._mounted = true;

    var root = this.attachShadow({ mode: "open" });
    root.appendChild(createTemplate().content.cloneNode(true));

    var launcher = root.querySelector(".vbh-launcher");
    var panel = root.querySelector(".vbh-panel");
    var closeBtn = root.querySelector(".vbh-close");
    var form = root.querySelector(".vbh-form");
    var submit = root.querySelector(".vbh-submit");
    var err = root.querySelector(".vbh-error");
    var ok = root.querySelector(".vbh-success");

    function setOpen(open) {
      panel.dataset.open = open ? "true" : "false";
      launcher.setAttribute("aria-expanded", open ? "true" : "false");
    }

    launcher.addEventListener("click", function () {
      setOpen(panel.dataset.open !== "true");
    });

    closeBtn.addEventListener("click", function () {
      setOpen(false);
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      err.dataset.show = "false";
      ok.dataset.show = "false";
      err.textContent = "";
      ok.textContent = "";

      var data = new FormData(form);
      var firstName = String(data.get("firstName") || "").trim();
      var lastName = String(data.get("lastName") || "").trim();
      var phone = String(data.get("phone") || "").trim();
      var email = String(data.get("email") || "").trim();

      if (!firstName || !lastName || !phone || !email) {
        err.textContent = "Please fill out all fields.";
        err.dataset.show = "true";
        return;
      }

      submit.setAttribute("disabled", "true");
      submit.textContent = "Sending…";

      var payload = {
        timestamp: new Date().toISOString(),
        source: "vbh-widget",
        first_name: firstName,
        last_name: lastName,
        phone: phone,
        email: email,
        page_url: window.location.href,
        page_title: document.title,
      };

      sendWebhook(payload)
        .then(function () {
          ok.textContent = "Request sent. Please check Zapier history to confirm.";
          ok.dataset.show = "true";
          form.reset();
        })
        .catch(function (e2) {
          err.textContent = "Failed to send. Please try again.";
          err.dataset.show = "true";
          // eslint-disable-next-line no-console
          console.error("VBH webhook error:", e2);
        })
        .finally(function () {
          submit.removeAttribute("disabled");
          submit.textContent = "Request callback";
        });
    });

    // Close on Escape
    root.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setOpen(false);
    });

    // Default open state
    setOpen(false);
  };

  try {
    if (!customElements.get("vbh-chatbot")) {
      customElements.define("vbh-chatbot", VBHChatbot);
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn("VBH widget: customElements define failed", e);
  }

  // Auto-inject unless disabled
  (function autoInject() {
    function inject() {
      if (document.querySelector("vbh-chatbot")) return;
      var el = document.createElement("vbh-chatbot");
      document.body.appendChild(el);
    }

    var currentScript = document.currentScript;
    var disable = currentScript && currentScript.getAttribute("data-auto-inject") === "false";
    if (disable) return;

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", inject);
    } else {
      inject();
    }
  })();
})();
