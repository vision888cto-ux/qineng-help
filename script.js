(() => {
  "use strict";

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  const toast = $("#toast");
  let toastTimer;

  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2800);
  }

  /* ── Mobile menu ── */
  const menuToggle = $("#menuToggle");
  const mainNav = $("#mainNav");

  menuToggle?.addEventListener("click", () => {
    const open = mainNav.classList.toggle("open");
    menuToggle.classList.toggle("open", open);
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "关闭菜单" : "打开菜单");
  });

  $$(".nav a, .quick-nav-inner a").forEach((link) => {
    link.addEventListener("click", () => {
      mainNav?.classList.remove("open");
      menuToggle?.classList.remove("open");
      menuToggle?.setAttribute("aria-expanded", "false");
    });
  });

  /* ── Scroll spy for nav ── */
  const sections = $$("section[id], .section-alt[id]");
  const navLinks = $$(".nav a");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;
        navLinks.forEach((link) => {
          link.classList.toggle("active", link.getAttribute("href") === `#${id}`);
        });
      });
    },
    { rootMargin: "-30% 0px -60% 0px" }
  );

  sections.forEach((s) => observer.observe(s));

  /* ── Product filter ── */
  const filterBtns = $$(".filter-btn");
  const productItems = $$(".product-item");

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const filter = btn.dataset.filter;
      filterBtns.forEach((b) => b.classList.toggle("active", b === btn));
      productItems.forEach((item) => {
        const match = filter === "all" || item.dataset.category === filter;
        item.classList.toggle("hidden", !match);
      });
    });
  });

  /* ── Service tabs ── */
  const serviceTabs = $$(".service-tab");
  const servicePanels = $$("[data-service-panel]");

  serviceTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const name = tab.dataset.service;
      serviceTabs.forEach((t) => {
        t.classList.toggle("active", t === tab);
        t.setAttribute("aria-selected", String(t === tab));
      });
      servicePanels.forEach((panel) => {
        panel.classList.toggle("active", panel.dataset.servicePanel === name);
      });
    });
  });

  /* ── Guide tabs & search ── */
  const guideNavItems = $$(".guide-nav-item");
  const guidePanels = $$("[data-guide-panel]");
  const searchInput = $("#guideSearch");
  const searchBtn = $("#searchBtn");

  const guideMap = {
    facebook: "facebook", fb: "facebook", meta: "facebook",
    openai: "openai", token: "openai", api: "openai", gpt: "openai", chatgpt: "openai",
    claude: "claude",
    google: "google", gmail: "google",
    telegram: "telegram", tg: "telegram", discord: "telegram",
    binance: "binance", okx: "binance", bybit: "binance", bitget: "binance",
    返佣: "binance", 交易所: "binance",
  };

  function showGuide(name) {
    guideNavItems.forEach((item) => {
      item.classList.toggle("active", item.dataset.guide === name);
    });
    guidePanels.forEach((panel) => {
      panel.classList.toggle("active", panel.dataset.guidePanel === name);
    });
    $("#guides")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  guideNavItems.forEach((item) => {
    item.addEventListener("click", () => showGuide(item.dataset.guide));
  });

  function searchGuide() {
    const raw = searchInput?.value.trim().toLowerCase();
    if (!raw) {
      searchInput?.focus();
      return;
    }
    const key = Object.keys(guideMap).find((k) => raw.includes(k));
    if (key) {
      showGuide(guideMap[key]);
      showToast(`已跳转到 ${guideMap[key]} 教程`);
      return;
    }
    showToast("未找到匹配教程，建议联系客服");
    $("#guides")?.scrollIntoView({ behavior: "smooth" });
  }

  searchBtn?.addEventListener("click", searchGuide);
  searchInput?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      searchGuide();
    }
  });

  /* ── Payment tabs ── */
  const payTabs = $$(".token-tab");
  const tokenPanels = $$("[data-token-panel]");

  payTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const token = tab.dataset.payToken;
      payTabs.forEach((t) => t.classList.toggle("active", t === tab));
      tokenPanels.forEach((panel) => {
        panel.classList.toggle("hidden", panel.dataset.tokenPanel !== token);
      });
    });
  });

  /* ── Copy address ── */
  $$(".copy-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const value = btn.dataset.copy;
      try {
        await navigator.clipboard.writeText(value);
        btn.textContent = "已复制";
        showToast("地址已复制，付款后请提交 TXID");
        updatePayStatus("地址已复制，请完成转账后联系客服", true);
      } catch {
        showToast("复制失败，请手动复制地址");
      }
      setTimeout(() => { btn.textContent = "复制地址"; }, 2000);
    });
  });

  /* ── Buy button → checkout modal ── */
  const payStatus = $("#payStatus");
  const checkoutModal = $("#checkoutModal");
  const checkoutBackdrop = $("#checkoutBackdrop");
  const checkoutClose = $("#checkoutClose");
  const confirmPayBtn = $("#confirmPayBtn");
  const checkoutProductName = $("#checkoutProductName");
  const checkoutProductPrice = $("#checkoutProductPrice");
  const payMethodBtns = $$(".pay-method");

  let selectedProduct = null;
  let selectedPayType = "alipay";

  function updatePayStatus(text, ready = false) {
    if (!payStatus) return;
    payStatus.classList.toggle("ready", ready);
    payStatus.querySelector("p").textContent = text;
  }

  function openCheckout(productId, order, cny) {
    selectedProduct = { productId, order, cny };
    selectedPayType = "alipay";
    payMethodBtns.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.payType === "alipay");
    });
    checkoutProductName.textContent = order;
    checkoutProductPrice.textContent = `¥${cny}`;
    checkoutModal.hidden = false;
    checkoutModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeCheckout() {
    checkoutModal.hidden = true;
    checkoutModal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    selectedProduct = null;
  }

  $$(".buy-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const { productId, order, cny } = btn.dataset;
      if (!productId) return;
      openCheckout(productId, order, cny);
    });
  });

  payMethodBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      selectedPayType = btn.dataset.payType;
      payMethodBtns.forEach((b) => b.classList.toggle("active", b === btn));
    });
  });

  checkoutClose?.addEventListener("click", closeCheckout);
  checkoutBackdrop?.addEventListener("click", closeCheckout);

  confirmPayBtn?.addEventListener("click", async () => {
    if (!selectedProduct) return;

    confirmPayBtn.disabled = true;
    confirmPayBtn.textContent = "正在跳转…";

    try {
      const res = await fetch("/api/pay/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: selectedProduct.productId,
          payType: selectedPayType,
        }),
      });

      const data = await res.json();

      if (!data.ok) {
        throw new Error(data.msg || "创建订单失败");
      }

      updatePayStatus(
        `${selectedProduct.order} · ¥${selectedProduct.cny} · 等待支付`,
        false
      );
      closeCheckout();
      showToast("正在跳转收银台…");

      if (data.payurl) {
        window.location.href = data.payurl;
        return;
      }

      if (data.qrcode) {
        window.location.href = data.qrcode;
        return;
      }

      throw new Error("未获取到付款链接");
    } catch (err) {
      showToast(err.message || "支付失败，请稍后重试");
      confirmPayBtn.disabled = false;
      confirmPayBtn.textContent = "去支付";
    }
  });

  /* ── Payment result from return URL ── */
  const urlParams = new URLSearchParams(window.location.search);
  const payResult = urlParams.get("pay");
  const payOrder = urlParams.get("order");

  if (payResult === "success") {
    showToast("支付成功，客服将尽快发货");
    updatePayStatus(
      payOrder ? `订单 ${payOrder} 支付成功，等待发货` : "支付成功，等待发货",
      true
    );
    history.replaceState({}, "", window.location.pathname + window.location.hash);
  } else if (payResult === "fail") {
    showToast("支付未完成或已取消");
    updatePayStatus("支付未完成，可重新购买", false);
    history.replaceState({}, "", window.location.pathname + window.location.hash);
  }

  /* ── Contact form ── */
  $("#contactForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const btn = e.target.querySelector("button[type=submit]");
    btn.textContent = "已提交，等待客服回复";
    btn.disabled = true;
    showToast("咨询已记录，客服将尽快回复");
    setTimeout(() => {
      btn.textContent = "提交咨询";
      btn.disabled = false;
      e.target.reset();
    }, 3000);
  });

  /* ── Header shadow on scroll ── */
  const header = $("#header");
  window.addEventListener(
    "scroll",
    () => header?.classList.toggle("scrolled", window.scrollY > 10),
    { passive: true }
  );
})();
