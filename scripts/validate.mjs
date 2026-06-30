#!/usr/bin/env node
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const requiredLocalized = ["en", "zh-CN"];

function fail(message) {
  console.error(message);
  process.exitCode = 1;
}

async function readJson(relativePath) {
  return JSON.parse(await readFile(path.join(root, relativePath), "utf8"));
}

function hasLocalized(value, label) {
  for (const lang of requiredLocalized) {
    if (!value || typeof value[lang] !== "string" || value[lang].trim() === "") {
      fail(`${label} is missing ${lang}`);
    }
  }
}

const index = await readJson("data/pets/index.json");
const ids = new Set();

for (const item of index.pets) {
  if (ids.has(item.id)) fail(`Duplicate pet id: ${item.id}`);
  ids.add(item.id);

  const entryPath = item.entry || `data/pets/${item.id}.json`;
  const pet = await readJson(entryPath);
  if (pet.id !== item.id) fail(`${entryPath} id does not match index`);

  hasLocalized(pet.name, `${pet.id}.name`);
  hasLocalized(pet.tagline, `${pet.id}.tagline`);
  hasLocalized(pet.introduction, `${pet.id}.introduction`);

  if (!pet.owner || typeof pet.owner.display !== "string" || pet.owner.display.trim() === "") {
    fail(`${pet.id}.owner.display is required`);
  }

  if (pet.credit) {
    hasLocalized(pet.credit.label, `${pet.id}.credit.label`);
    hasLocalized(pet.credit.name, `${pet.id}.credit.name`);
  }

  if (!Array.isArray(pet.forms) || pet.forms.length === 0) {
    fail(`${pet.id} must define at least one form`);
  } else {
    pet.forms.forEach((form) => {
      hasLocalized(form.name, `${pet.id}.forms.${form.id}.name`);
      hasLocalized(form.description, `${pet.id}.forms.${form.id}.description`);
    });
  }

  for (const [key, relativePath] of Object.entries(pet.assets)) {
    if (!existsSync(path.join(root, relativePath))) {
      fail(`${pet.id}.assets.${key} does not exist: ${relativePath}`);
    }
  }
}

if (!process.exitCode) {
  console.log(`Validated ${index.pets.length} pet entry.`);
}
