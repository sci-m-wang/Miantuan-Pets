const state = {
  lang: localStorage.getItem("miantuan-pets-lang") || "en",
  messages: {},
};

const root = document.body.dataset.root || ".";
const petId = document.body.dataset.petId;
const $ = (selector, base = document) => base.querySelector(selector);
const $$ = (selector, base = document) => Array.from(base.querySelectorAll(selector));

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

function assetPath(relativePath) {
  return `${root}/${relativePath}`;
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

function renderMeta(pet, base) {
  $(".owner-label", base).textContent = state.messages.ownerLabel;
  setOptionalLink($(".owner-link", base), pet.owner.display, ownerUrl(pet.owner));

  const credit = creditInfo(pet);
  const creditMeta = $(".credit-meta", base);
  if (shouldShowCredit(pet, credit)) {
    $(".credit-label", base).textContent = credit.label;
    setOptionalLink($(".credit-link", base), credit.name, credit.url);
  } else {
    creditMeta.remove();
  }
}

function renderForms(pet, base) {
  $(".forms-title", base).textContent = state.messages.formsLabel;
  const forms = $(".form-list", base);
  pet.forms.forEach((form) => {
    const item = document.createElement("li");
    const title = document.createElement("strong");
    const description = document.createElement("span");
    title.textContent = text(form.name);
    description.textContent = text(form.description);
    item.append(title, description);
    forms.append(item);
  });
}

function renderStates(pet, base) {
  $(".states-title", base).textContent = state.messages.statesLabel;
  const states = $(".state-list", base);
  pet.codexPet.states.forEach((stateName) => {
    const item = document.createElement("li");
    item.textContent = stateName;
    states.append(item);
  });
}

function renderInstall(pet, base) {
  const command = pet.install?.npm || `npx miantuan-pets install ${pet.id}`;
  $(".install-label", base).textContent = state.messages.installLabel;
  $("code", base).textContent = command;
  $(".copy-button", base).textContent = state.messages.copy;
  $(".copy-button", base).addEventListener("click", async (event) => {
    await navigator.clipboard.writeText(command);
    event.currentTarget.textContent = state.messages.copied;
    setTimeout(() => {
      event.currentTarget.textContent = state.messages.copy;
    }, 1300);
  });
}

function renderDetail(pet) {
  const template = $("#pet-detail-template");
  const detail = template.content.cloneNode(true);
  const name = text(pet.name);

  document.title = `${name} | Miantuan Pets`;
  $(".detail-banner img", detail).src = assetPath(pet.assets.preview);
  $(".detail-banner img", detail).alt = `${name} ${state.messages.bannerLabel}`;
  $(".motion-panel img", detail).src = assetPath(pet.assets.animatedPreview || pet.assets.preview);
  $(".motion-panel img", detail).alt = `${name} ${state.messages.motionLabel}`;
  $(".badge", detail).textContent = text(pet.statusLabel);
  $("h1", detail).textContent = name;
  $(".tagline", detail).textContent = text(pet.tagline);
  $(".description", detail).textContent = text(pet.introduction);

  renderMeta(pet, detail);
  renderForms(pet, detail);
  renderStates(pet, detail);
  renderInstall(pet, detail);

  $("#pet-detail").replaceChildren(detail);
}

async function load() {
  const [messages, pet] = await Promise.all([
    readJson(`${root}/data/i18n/${state.lang}.json`),
    readJson(`${root}/data/pets/${petId}.json`),
  ]);
  state.messages = messages;
  applyMessages();
  renderDetail(pet);
}

$$(".lang-button").forEach((button) => {
  button.addEventListener("click", async () => {
    state.lang = button.dataset.lang;
    localStorage.setItem("miantuan-pets-lang", state.lang);
    await load();
  });
});

load().catch((error) => {
  $("#pet-detail").textContent = error.message;
});
