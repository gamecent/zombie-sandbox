# 丧尸沙盒

俯视像素沙盒的浏览器版本，用 Phaser 3 和 Vite 写成。当前是里程碑 M1：能在确定种子的地图里走动、砍树捡石头、造木墙，并在墙或树后面看到角色剪影。

在线地址：<https://gamecent.github.io/zombie-sandbox/>

如果 Actions 没能自动打开 GitHub Pages，请到仓库 **Settings → Pages → Build and deployment → Source** 选择 **GitHub Actions**。

## 如何运行

需要 Node.js 22。

```bash
npm install
npm run dev
```

开发地址是 <http://localhost:5173/zombie-sandbox/> 。`vite.config.js` 的 `base` 是 `/zombie-sandbox/`，资源也从这条路径加载。

指定地图种子：

```text
http://localhost:5173/zombie-sandbox/?seed=12345
```

没有 `?seed=` 时会随机选一个种子，并写回地址栏。世界生成只用这个种子，不用 `Math.random`。

```bash
npm run build
npm run preview
```

`npm run build` 产物在 `dist/`，资源路径带 `/zombie-sandbox/` 前缀。`npm run check` 用同一套生成代码核对种子、哈希、碰撞、掉落和存档往返。

## 操作

| 按键 | 作用 |
|---|---|
| WASD 或方向键 | 移动。斜向速度已归一。 |
| 鼠标左键（可按住） | 砍树、石头，或在建造模式外敲木墙。间隔见 `player.swingCooldown`。 |
| B | 开关建造模式。 |
| 建造模式中按住左键 | 约 `building.buildTime` 秒后放下木墙。 |
| 建造模式中右键 | 拆掉光标下的木墙，按数据表返还木头。 |
| 1–9 | 选择快捷栏。 |
| F3 | 调试信息：帧率、种子、人物格子、区块、昼夜时钟、世界哈希。 |

木墙造价和掉落以 `src/data/tiles.json` 为准（放置 4 木头，拆除 2 木头）。树掉 3–5 木头，石头掉 2–3 石头。徒手用 `hand.harvestPower`；若快捷栏选中的工具 id 等于方块的 `tool`，伤害再乘 `player.bestToolMultiplier`。M1 还没有斧和镐。

站在木墙或树的北侧、身体被挡住时，被挡住的那一块会画成剪影。

## 项目结构

```text
src/main.js              游戏入口
src/config.js            TILE、ZOOM、CHUNK、WORLD_CHUNKS，并读 config.json
src/scenes/              Boot、Preload、Game、UI
src/world/               World、Chunk、WorldGen、TileRegistry、ChunkRenderer
src/entities/            Player、WallSprite、碰撞盒
src/systems/             Input、Inventory、Harvest、Build、Silhouette、Save
src/util/                种子随机数、FNV-1a、时钟
src/data/                tiles.json、items.json、config.json
public/assets/           图集与音效
.github/workflows/       推到 main 时构建并发布 Pages，PR 上只做构建检查
```

`tiles.json` 的顺序就是世界里的数字 id，只能在末尾追加。地面用四邻接位掩码自动拼接（N=1、E=2、S=4、W=8，地图外视为同类）。木墙数据里虽然写了 `autotile: true`，M1 仍只用单帧 `wall_wood`。

昼夜长度 `dayNight.cycle`（300 秒）只驱动调试时钟，M1 没有光照。`Save.js` 定义了带版本号的存档（种子、改过的区块差值、人物、背包），可以序列化和还原，但还不会写入 IndexedDB。

## 素材

图集是 1024×1024、343 帧。M1 只用原来的 93 个帧名。新的丧尸、废墟和物品帧留给后面的里程碑。音效会全部预加载，M1 只播放 `sfx_chop` 和 `sfx_place`。授权见 `ASSETS.md` 和 `CREDITS.md`，均为 CC0。
