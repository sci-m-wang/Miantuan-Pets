#!/usr/bin/env node
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const rawBase = "https://raw.githubusercontent.com/sci-m-wang/Miantuan-Pets/main";

const args = process.argv.slice(2);
const command = args[0] || "help";

function option(name, fallback) {
  const index = args.indexOf(name);
  if (index === -1) return fallback;
  return args[index + 1] || fallback;
}

function expandHome(value) {
  if (!value) return value;
  return value.replace(/^~(?=$|\/)/, os.homedir());
}

async function readJson(relativePath) {
  const local = path.join(root, relativePath);
  if (existsSync(local)) {
    return JSON.parse(await readFile(local, "utf8"));
  }
  const response = await fetch(`${rawBase}/${relativePath}`);
  if (!response.ok) {
    throw new Error(`Unable to fetch ${relativePath}`);
  }
  return response.json();
}

async function readAsset(relativePath) {
  const local = path.join(root, relativePath);
  if (existsSync(local)) {
    return readFile(local);
  }
  const response = await fetch(`${rawBase}/${relativePath}`);
  if (!response.ok) {
    throw new Error(`Unable to fetch ${relativePath}`);
  }
  return Buffer.from(await response.arrayBuffer());
}

function localize(value, lang) {
  return value?.[lang] || value?.en || value?.["zh-CN"] || "";
}

async function listPets() {
  const lang = option("--lang", "en");
  const index = await readJson("data/pets/index.json");
  for (const item of index.pets) {
    const pet = await readJson(item.entry);
    console.log(`${pet.id}\t${localize(pet.name, lang)}\t${localize(pet.tagline, lang)}`);
  }
}

async function showPet(id) {
  const lang = option("--lang", "en");
  const pet = await readJson(`data/pets/${id}.json`);
  console.log(`${localize(pet.name, lang)} (${pet.id})`);
  console.log(localize(pet.introduction, lang));
  console.log("");
  for (const form of pet.forms) {
    console.log(`- ${localize(form.name, lang)}: ${localize(form.description, lang)}`);
  }
}

async function installPet(id) {
  const pet = await readJson(`data/pets/${id}.json`);
  const destRoot = expandHome(option("--dest", path.join(os.homedir(), ".codex", "pets")));
  const dest = path.join(destRoot, pet.id);
  await mkdir(dest, { recursive: true });

  const manifest = await readAsset(pet.assets.petManifest);
  const spritesheet = await readAsset(pet.assets.spritesheet);
  await writeFile(path.join(dest, "pet.json"), manifest);
  await writeFile(path.join(dest, "spritesheet.webp"), spritesheet);

  console.log(`Installed ${pet.id} to ${dest}`);
}

function help() {
  console.log(`Miantuan Pets

Usage:
  miantuan-pets list [--lang en|zh-CN]
  miantuan-pets show <pet-id> [--lang en|zh-CN]
  miantuan-pets install <pet-id> [--dest ~/.codex/pets]
`);
}

try {
  if (command === "list") {
    await listPets();
  } else if (command === "show") {
    await showPet(args[1]);
  } else if (command === "install") {
    await installPet(args[1]);
  } else {
    help();
  }
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
