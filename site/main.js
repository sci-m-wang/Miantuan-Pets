const state = {
  lang: localStorage.getItem("miantuan-pets-lang") || "en",
  messages: {},
  index: [],
};

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

async function readJson(path) {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Unable to load ${path}`);
  }
  return response.json();
}

function text(value) {
  if (typeof value === "string") return value;
  return value?.[state.lang] || value?.en || value?.["zh-CN"] || "";
}

function setOptionalLink(node, label, url) {
  node.textContent = label;
  if (url) {
    node.href = url;
    node.target = "_blank";
    node.rel = "noreferrer";
  } else {
    node.removeAttribute("href");
    node.removeAttribute("target");
    node.removeAttribute("rel");
  }
}

function githubUrlFromHandle(value) {
  const match = String(value || "").trim().match(/^@([A-Za-z0-9-]+)$/);
  return match ? `https://github.com/${match[1]}` : "";
}

function ownerUrl(owner) {
  if (owner.url) return owner.url;
  return githubUrlFromHandle(owner.display);
}

function creditInfo(pet) {
  if (!pet.credit) return null;
  const name = text(pet.credit.name);
  return {
    label: text(pet.credit.label) || state.messages.creditLabel,
    name,
    url: pet.credit.url || githubUrlFromHandle(name),
  };
}

function shouldShowCredit(pet, credit) {
  if (!credit?.name) return false;
  const sameName = credit.name.trim().toLowerCase() === pet.owner.display.trim().toLowerCase();
  const sameUrl = !credit.url || credit.url === ownerUrl(pet.owner);
  return !(sameName && sameUrl);
}

function petPageUrl(pet) {
  return `./pets/${pet.id}/`;
}

function applyMessages() {
  $$("[data-i18n]").forEach((node) => {
    const key = node.dataset.i18n;
    node.textContent = state.messages[key] || node.textContent;
  });
  $$(".lang-button").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.lang === state.lang);
  });
  document.documentElement.lang = state.lang;
}

function renderPets(pets) {
  const gallery = $("#gallery");
  const template = $("#pet-card-template");
  gallery.replaceChildren();

  pets.forEach((pet) => {
    const card = template.content.cloneNode(true);
    const pageUrl = petPageUrl(pet);
    const cardRoot = $(".pet-card", card);
    cardRoot.dataset.href = pageUrl;
    cardRoot.setAttribute("role", "link");
    cardRoot.setAttribute("aria-label", `${state.messages.detailsCta}: ${text(pet.name)}`);
    $(".pet-preview", card).src = pet.assets.animatedPreview || pet.assets.preview;
    $(".pet-preview", card).alt = text(pet.name);
    $("h2", card).textContent = text(pet.name);
    $(".badge", card).textContent = text(pet.statusLabel);
    $(".tagline", card).textContent = text(pet.tagline);
    $(".description", card).textContent = text(pet.introduction);

    $(".owner-label", card).textContent = state.messages.ownerLabel;
    setOptionalLink($(".owner-link", card), pet.owner.display, ownerUrl(pet.owner));

    const credit = creditInfo(pet);
    const creditMeta = $(".credit-meta", card);
    if (shouldShowCredit(pet, credit)) {
      $(".credit-label", card).textContent = credit.label;
      setOptionalLink($(".credit-link", card), credit.name, credit.url);
    } else {
      creditMeta.remove();
    }

    const detailsLink = $(".details-link", card);
    detailsLink.href = pageUrl;
    detailsLink.textContent = state.messages.detailsCta;

    cardRoot.addEventListener("click", (event) => {
      if (event.target.closest("a, button")) return;
      window.location.href = pageUrl;
    });
    cardRoot.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      if (event.target.closest("a, button")) return;
      event.preventDefault();
      window.location.href = pageUrl;
    });

    gallery.append(card);
  });
}

async function load() {
  const [messages, index] = await Promise.all([
    readJson(`./data/i18n/${state.lang}.json`),
    readJson("./data/pets/index.json"),
  ]);
  state.messages = messages;
  state.index = index.pets;
  const pets = await Promise.all(
    state.index.map((entry) => readJson(`./data/pets/${entry.id}.json`)),
  );
  applyMessages();
  renderPets(pets);
}

$$(".lang-button").forEach((button) => {
  button.addEventListener("click", async () => {
    state.lang = button.dataset.lang;
    localStorage.setItem("miantuan-pets-lang", state.lang);
    await load();
  });
});

load().catch((error) => {
  $("#gallery").textContent = error.message;
});
