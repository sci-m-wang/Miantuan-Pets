# Miantuan Pets / 面团宠物馆

Miantuan Pets is a public gallery for remembered companions, dream friends, their friendly guardians, and soft little spirits that can be installed as Codex pets. It is designed as a curated archive: each pet should have clear provenance, a public-facing introduction, installable assets, and enough context for others to understand what is being shared.

面团宠物馆是一个幻想朋友与守护者宠物 gallery。这里欢迎大家分享自己的幻想朋友、梦中伙伴、守护幻想朋友的友好妖怪和小灵体，并把它们整理成可安装的 Codex pet。每个条目都应有清楚的来源、公开介绍、可安装资源和必要的授权说明。

If you want to remember or shape your own imaginary friend first, start from Miantuan Pod:

https://sci-m-wang.github.io/Miantuan-Pod/

如果你想先回忆、整理或创建自己的幻想朋友，可以从面团 Pod 开始：

https://sci-m-wang.github.io/Miantuan-Pod/

## Current Pet / 当前宠物

- **Luma / 曦宁**: [@sci-m-wang](https://github.com/sci-m-wang)'s imaginary companion, a luminous three-form pegasus-spirit with a floating halo above her horn.
- **曦宁（Luma）**：[@sci-m-wang](https://github.com/sci-m-wang) 的幻想朋友，是一位发光的三形态天马灵体伙伴，独角上方悬着光环。
- **Dough King**: a friendly guardian youkai who watches over imaginary friends.
- **面团大王**：守护幻想朋友的友好妖怪；桌宠条目基于公开角色参考制作。

## Install A Pet / 安装宠物

After this package is published to npm:

```bash
npx miantuan-pets install luma
```

You can also run the CLI straight from GitHub:

```bash
npm exec github:sci-m-wang/Miantuan-Pets -- install luma
```

The default install location is:

```text
~/.codex/pets/<pet-id>
```

安装后，重启或刷新 Codex 的 pet 列表，就可以选择对应宠物。

## Website / 网站

This repository is designed for GitHub Pages. The static site is intentionally dependency-free:

```bash
npm run preview
```

Then open the local URL shown in the terminal.

站点本身不需要账号系统。投稿、审核和发布都通过 GitHub issue 或 pull request 完成。

## Submit Your Pet / 提交你的宠物

You can share a pet in either of these ways:

1. Open a GitHub issue with your story, images, and pet files.
2. Open a pull request that adds a new JSON entry and assets.

你可以通过两种方式分享：

1. 提交 GitHub issue，附上介绍、图片和宠物文件。
2. 提交 pull request，新增数据文件和资源文件。

For pull requests, add:

```text
data/pets/<pet-id>.json
assets/pets/<pet-id>/pet.json
assets/pets/<pet-id>/spritesheet.webp
assets/pets/<pet-id>/preview.png
```

Then update:

```text
data/pets/index.json
```

Please share only what you are comfortable making public. The gallery should contain the final public introduction and pet package, not the private interview transcript or uncertain memory notes.

请只提交你愿意公开的内容。gallery 只需要最终公开介绍和宠物包，不需要回忆过程、访谈记录或未确认的推断。

Every entry should distinguish ownership from submission logistics:

- `owner` is required and names the companion owner, character owner, or original rights holder.
- `credit` can describe who shared the entry, what public reference was used, or where the adaptation came from.

每个条目都应区分“归属”和“提交过程”：

- `owner` 是必填字段，用来标明幻想朋友的主人、角色归属方或原始权利方。
- `credit` 可用于说明分享者、公开参考来源或改编来源。

## Data Shape / 数据结构

Each pet entry follows `schemas/pet-entry.schema.json` and includes:

- bilingual name, tagline, introduction, and form descriptions
- required owner or rights-holder information
- optional source or sharing credit
- asset paths
- install metadata
- content and license notes

每个宠物条目都要包含中英双语介绍、必要的归属信息、可选的来源或分享说明、资源路径、安装信息以及授权说明。

## CLI / 命令行

```bash
miantuan-pets list
miantuan-pets show luma
miantuan-pets install luma
miantuan-pets install luma --dest ~/Library/Application\ Support/Codex/pets
```

## License / 许可证

Code is MIT licensed. Pet art, descriptions, and submitted assets may use their own licenses, recorded per pet entry.

代码使用 MIT 许可证。宠物图像、描述和投稿资源可以使用各自的授权，并在每个宠物条目中记录。
