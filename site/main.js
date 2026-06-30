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

function petCredit(pet) {
  if (pet.credit) {
    return {
      label: text(pet.credit.label),
      name: text(pet.credit.name),
      url: pet.credit.url || "",
    };
  }

  if (pet.owner?.display) {
    return {
      label: state.messages.sharedBy,
      name: pet.owner.display,
      url: "",
    };
  }

  return {
    label: state.messages.galleryEntry,
    name: "",
    url: "",
  };
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
    $(".pet-preview", card).src = pet.assets.preview;
    $(".pet-preview", card).alt = text(pet.name);
    const credit = petCredit(pet);
    const creditNode = $(".credit", card);
    creditNode.textContent = credit.name ? `${credit.label}: ${credit.name}` : credit.label;
    if (credit.url) {
      creditNode.href = credit.url;
    } else {
      creditNode.removeAttribute("href");
      creditNode.removeAttribute("target");
      creditNode.removeAttribute("rel");
    }
    $("h2", card).textContent = text(pet.name);
    $(".badge", card).textContent = text(pet.statusLabel);
    $(".tagline", card).textContent = text(pet.tagline);
    $(".description", card).textContent = text(pet.introduction);
    $("code", card).textContent = `npx miantuan-pets install ${pet.id}`;
    $(".copy-button", card).textContent = state.messages.copy;
    $(".copy-button", card).addEventListener("click", async (event) => {
      await navigator.clipboard.writeText(`npx miantuan-pets install ${pet.id}`);
      event.currentTarget.textContent = state.messages.copied;
      setTimeout(() => {
        event.currentTarget.textContent = state.messages.copy;
      }, 1300);
    });

    const forms = $(".forms", card);
    pet.forms.forEach((form) => {
      const item = document.createElement("section");
      item.className = "form";
      const title = document.createElement("h3");
      title.textContent = text(form.name);
      const description = document.createElement("p");
      description.textContent = text(form.description);
      item.append(title, description);
      forms.append(item);
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
