# ASSETS.md · 美术素材接口说明（M1 + M1b 扩展）

> 本文件由 `src/ASSETS.head.md`（手写）+ 自动生成的帧表拼成，请改 head 文件。重新生成：在 `art/` 下运行 `./build.sh`。

## 1. 交付位置（两处内容一致，Wind 用 build/）

| 内容 | build/（技术使用） | 游戏仓库结构 |
|---|---|---|
| 图集 | `build/atlas.png` + `atlas.json` | `public/assets/atlas/main.png` + `main.json`（key `main`） |
| 音效 | `build/audio/*.wav` | `public/assets/audio/*.wav` |
| 废墟预制件 | `build/prefabs/*.json` | `public/assets/prefabs/*.json` |
| 丧尸眼睛坐标 | `build/meta/zombie_eyes.json` | `public/assets/meta/zombie_eyes.json` |
| 授权 | `build/CREDITS.md` | `CREDITS.md` |

两份图集 JSON 只有 `meta.image` 不同（`atlas.png` / `main.png`）。源文件：`src/`（生成脚本、单帧 PNG、来源记录 `provenance.json` / `audio_provenance.json`），`tools/pack.js`，`packs/`（Kenney 原包），`preview/`（预览图）。

## 2. 图集格式
- 单张 **1024×1024** PNG，Phaser 3 **JSON Hash**，free-tex-packer-core 打包；不裁剪、不旋转、padding 2、extrude 1。打包脚本在溢出成多页时会直接报错。
- 显示：整数 3 倍缩放，`pixelArt: true`、`roundPixels: true`。
- JSON 里的 `pivot` 都是打包器默认 0.5/0.5，**以代码 setOrigin 为准**。

## 3. 命名规则
- 帧名 = 数据表 id（`src/data/tiles.json` 里的 `grass`、`dirt`、`water`、`tree`、`rock`、`wall_wood` 原样使用）；物品图标 = `icon_` + 物品 id（`icon_wood`、`icon_stone`…）。
- 其余按 `类别_名称[_变体][_帧]`，小写 snake_case；动画帧从 0 开始；自动拼接后缀为两位数位掩码。
- 角色动画：`<角色>_<动作>_<方向>_<帧>`，方向 `down` / `up` / `side`（side 朝右，朝左代码 `flipX`）；死亡动画不分方向：`<角色>_death_<帧>`。
- 剪影：`<角色>_silhouette_<同后缀>`，与每一帧一一对应。
- M1 已有的 93 个帧名与像素都没有改动。

## 4. 自动拼接（grass / dirt / water / road）
后缀 = 4 邻接位掩码，邻居同类型时该位为 1：N=1、E=2、S=4、W=8；地图边界外视为同类型。
- `road_00..15` 来自 Kenney Tiny Battle 的柏油路（带车道线）。原图四角是透明圆角，已垫了一层 Tiny Town 草地（tile_0000），所以路放在泥土上时圆角会露出草色。

## 5. 锚点 / 尺寸 / 深度（统一规则）
**所有站在地上的东西**：origin **(0.5, 1)**，放在所在格子底边中点 `x = col*16+8, y = (row+1)*16`，**depth = 底边 y**；同一 y 时叠加层加 0.1–0.2。地面图块（地面、道路、地板、装饰贴花）按普通 16×16 tile 画在最底层。

| 物体 | 尺寸 | 占格 / 说明 |
|---|---|---|
| 玩家、`zombie`、`zombie_runner` | 16×24 | 脚底贴图片底边，身体在下方 16px |
| `zombie_brute` | **24×32** | 身体约 22×22，底边对齐；左右各超出格子 4px；建议碰撞仍 1 格（或 1.25） |
| `tree` | 16×32 | 树干底在下方 16×16 内 |
| `wall_wood`、`door_wood(_open)`、`wall_ruin*` | 16×24 | 上 16×16 顶面 + 下 8px 前立面；碰撞 1 格 |
| `campfire_0..3`、`campfire_out` | 16×24 | 石圈在下方 16×16，火苗向上伸；光源中心约在底边上方 10px |
| `bed` | **16×32** | 占 1×2 格（锚点格 + 北面一格），床头朝北 |
| `car_wreck` | **32×24** | 占 2×1 格；origin (0.5,1) 放在两格交界：`x = 左格col*16+16`；上 32×16 顶面 + 下 8px 侧面 |
| `ui_hotbar_slot/select` | 20×20 | 图标 16px 居中 |
| 其余（物件、图标、地面、装饰） | 16×16 | |
| `wall_wood_front` | 16×8 | 单独图层 |

## 6. 丧尸
三种类型，均由 Kenney Tiny Dungeon tile_0086 改色/改形得到（占位）：

| 类型 | 尺寸 | 配色 | 眼睛颜色 |
|---|---|---|---|
| `zombie` 普通 | 16×24 | 灰绿皮肤、灰色破衣 | #eaff5a 黄绿 |
| `zombie_runner` 奔跑者 | 16×24 | 偏红、身体窄 2px | #ffe85a 黄 |
| `zombie_brute` 砸墙者 | 24×32 | 更暗、约 1.4 倍体型 | #ff8a2a 橙 |

每种类型的帧：

| 动作 | 帧名 | 帧数 | 建议 fps | 说明 |
|---|---|---|---|---|
| 走 | `<t>_walk_{down,up,side}_0..3` | 4×3 方向 | 普通 6、奔跑者 10、砸墙者 5 | 循环；1/3 帧身体上抬并左右晃 1px |
| 攻击 | `<t>_attack_{down,up,side}_0..2` | 3×3 方向 | 10 | 一次性；0 后仰蓄力，**1 为出手帧（在此帧结算伤害/砸墙）**，2 收招 |
| 受击 | `<t>_hit_{down,up,side}_0..1` | 2×3 方向 | 12 | 一次性；0 帧已提亮并后退 1px，可再叠代码白闪 `setTintFill(0xffffff)` 1 帧 |
| 死亡 | `<t>_death_0..3` | 4（**只有一个方向**） | 6 | 一次性，停在第 3 帧（倒地+血泊）后淡出；可随机 `flipX` 增加变化 |

- **剪影**：每一帧都有 `<t>_silhouette_<后缀>`，填充 #ff7c7c 约 63% 不透明，1px 外缘 #ffe0e0 约 92%（与玩家的浅蓝剪影区分）。
- **发光眼睛**：眼睛是普通像素，夜间遮罩会把它一起压暗。为了让眼睛在黑暗中可见，`meta/zombie_eyes.json` 给出每帧眼睛像素坐标（相对帧左上角、未翻转；受击 0 帧和死亡帧为空），代码可在遮罩之上画 1–2 个发光点或小光源。

## 7. 地面、装饰、废墟
- 地板：`floor_ruin`（Tiny Town 石砖）、`floor_ruin_1`（裂缝）、`floor_ruin_2`（裂缝+杂草）。
- 装饰贴花（透明底、可走、画在地面层之上）：`decor_flower_0..2`、`decor_tallgrass_0..1`、`decor_pebbles`、`decor_rubble`、`decor_mushroom`；`decor_bush`（灌木，建议设为实心物件）。
- 废墟墙（16×24 顶面+前立面，与木墙同规则）：`wall_ruin`、`wall_ruin_broken_1`、`wall_ruin_broken_2`、`wall_ruin_corner`（四边都描边的墙角/柱）、`wall_ruin_window`（破窗，仍为实心）、`wall_ruin_door`（门框，**中间可通行**）。
- `rubble_pile`：16×16 实心瓦砾堆；`car_wreck`：见第 5 节。
- M1b 墙仍不做自动拼接，相邻墙之间有 1px 竖缝。

### 预制件 JSON（`prefabs/*.json`）
```json
{"id":"ruin_house_a","w":6,"h":5,"anchor":"top_left","cell":16,
 "layers":{"floor":[[帧名...]...],"walls":[[帧名或null...]...],"objects":[[帧名或null...]...]}}
```
- 数组按行 `[y][x]`，`anchor: top_left` 表示 `(0,0)` 对应放置点左上角格子。
- `floor` 画成地面层；`walls` 和 `objects` 都按第 5 节规则（origin (0.5,1)、depth = 底边 y）。
- 共 4 个：`ruin_house_a`（6×5）、`ruin_house_b`（7×6）、`ruin_house_c`（5×5，北墙塌了）、`ruin_shop_d`（8×5，三扇窗）。

## 8. 可交互物与建筑
| 帧名 | 说明 |
|---|---|
| `berry_bush` / `berry_bush_empty` | 有果 / 无果两态 |
| `can` | 地上可拾取的罐头（小物件） |
| `crate_ruin` / `crate_ruin_open` | 废墟箱：关 / 开（已搜刮） |
| `campfire_0..3` | 燃烧循环，建议 8 fps |
| `campfire_out` | 熄灭 |
| `workbench` | 工作台 16×16 |
| `door_wood` / `door_wood_open` | 关（实心）/ 开（可通行），16×24 |
| `bed` | 16×32，占 1×2 格 |
| `chest` / `chest_open` | 储物箱（尸体箱可复用 + 代码换色） |

## 9. 图标与手持物
- 图标 16×16：`icon_wood`、`icon_stone`、`icon_axe`、`icon_pickaxe`、`icon_stick`、`icon_spear`、`icon_slingshot`、`icon_pebble`、`icon_berry`、`icon_can`。
- 手持物 `held_axe`、`held_pickaxe`、`held_spear`、`held_stick`：目前是图标的拷贝，柄在下方。建议 origin (0.5, 0.9)，挂在角色手部位置，挥动时代码旋转约 −60°→+60°。弹弓没有手持图。

## 10. 墙后剪影（沿用 M1）
玩家剪影填充 #7cc8ff、外缘 #e8f7ff；丧尸剪影填充 #ff7c7c、外缘 #ffe0e0。推荐只在被墙遮挡的像素显示（见 `preview/silhouette_mockup_3x.png`）。

## 11. 音效（`audio/*.wav`，44.1kHz 单声道）
| 文件 | 用途 | 来源 |
|---|---|---|
| `sfx_chop` | 砍树 | 自制合成 |
| `sfx_place` | 放置方块 | 自制合成 |
| `sfx_step_grass_1/2` | 草地脚步（随机二选一） | Kenney Impact Sounds |
| `sfx_step_dirt_1/2` | 泥土/路面脚步 | Kenney RPG Audio |
| `sfx_swing` | 挥动 | 自制合成 |
| `sfx_hit` | 击中 | Kenney Impact Sounds |
| `sfx_zombie_groan_1..3` | 丧尸低吼（随机，限同时最近 8 个） | 自制合成 |
| `sfx_zombie_hit` | 丧尸受击 | Kenney Impact Sounds |
| `sfx_zombie_death` | 丧尸死亡 | 自制合成 |
| `sfx_pickup` | 拾取 | Kenney Interface Sounds |
| `sfx_door` | 开门 | Kenney RPG Audio |

## 12. 预览图
- `preview/preview_m1_3x.png`、`preview/silhouette_mockup_3x.png`（M1）
- `preview/preview_m1b_3x.png`：废墟小镇 + 森林场景（用预制件 JSON 实际拼出来）
- `preview/zombies_3x.png`：全部丧尸动画 + 剪影示例
- `preview/items_3x.png`：图标、建筑、可交互物、废墟件、装饰、道路

## 13. 仍是占位的内容
- 玩家和三种丧尸都是 Tiny Dungeon 单帧角色改出来的：侧面不是真正侧脸，攻击/受击/死亡是位移、提亮、旋转加简单刀光，M2 前需要重画。
- 墙（木墙/废墟墙）没有自动拼接；废墟墙风格偏规整，“破损感”只有缺角和裂缝。
- 手持物只是图标拷贝；没有弹弓手持图、没有砍树/挖矿动画。
- 自制的丧尸吼叫、挥动、死亡音效是程序合成的占位，M6 替换。

## 附录 · 完整帧表（自动生成，共 343 帧）

| 帧名 | 尺寸 |
|---|---|
| `bed` | 16×32 |
| `berry_bush` | 16×16 |
| `berry_bush_empty` | 16×16 |
| `campfire_0`…`campfire_3`（4 帧） | 16×24 |
| `campfire_out` | 16×24 |
| `can` | 16×16 |
| `car_wreck` | 32×24 |
| `chest` | 16×16 |
| `chest_open` | 16×16 |
| `crate_ruin` | 16×16 |
| `crate_ruin_open` | 16×16 |
| `decor_bush` | 16×16 |
| `decor_flower_0`…`decor_flower_2`（3 帧） | 16×16 |
| `decor_mushroom` | 16×16 |
| `decor_pebbles` | 16×16 |
| `decor_rubble` | 16×16 |
| `decor_tallgrass_0`…`decor_tallgrass_1`（2 帧） | 16×16 |
| `dirt_00`…`dirt_15`（16 帧） | 16×16 |
| `door_wood` | 16×24 |
| `door_wood_open` | 16×24 |
| `floor_ruin` | 16×16 |
| `floor_ruin_1`…`floor_ruin_2`（2 帧） | 16×16 |
| `fx_crack_1`…`fx_crack_3`（3 帧） | 16×24 |
| `grass_00`…`grass_15`（16 帧） | 16×16 |
| `held_axe` | 16×16 |
| `held_pickaxe` | 16×16 |
| `held_spear` | 16×16 |
| `held_stick` | 16×16 |
| `icon_axe` | 16×16 |
| `icon_berry` | 16×16 |
| `icon_can` | 16×16 |
| `icon_pebble` | 16×16 |
| `icon_pickaxe` | 16×16 |
| `icon_slingshot` | 16×16 |
| `icon_spear` | 16×16 |
| `icon_stick` | 16×16 |
| `icon_stone` | 16×16 |
| `icon_wood` | 16×16 |
| `player_idle_down_0` | 16×24 |
| `player_idle_side_0` | 16×24 |
| `player_idle_up_0` | 16×24 |
| `player_silhouette_idle_down_0` | 16×24 |
| `player_silhouette_idle_side_0` | 16×24 |
| `player_silhouette_idle_up_0` | 16×24 |
| `player_silhouette_walk_down_0`…`player_silhouette_walk_down_3`（4 帧） | 16×24 |
| `player_silhouette_walk_side_0`…`player_silhouette_walk_side_3`（4 帧） | 16×24 |
| `player_silhouette_walk_up_0`…`player_silhouette_walk_up_3`（4 帧） | 16×24 |
| `player_walk_down_0`…`player_walk_down_3`（4 帧） | 16×24 |
| `player_walk_side_0`…`player_walk_side_3`（4 帧） | 16×24 |
| `player_walk_up_0`…`player_walk_up_3`（4 帧） | 16×24 |
| `road_00`…`road_15`（16 帧） | 16×16 |
| `rock` | 16×16 |
| `rubble_pile` | 16×16 |
| `tree` | 16×32 |
| `tree_stump` | 16×16 |
| `ui_build_bad` | 16×16 |
| `ui_build_ok` | 16×16 |
| `ui_hotbar_select` | 20×20 |
| `ui_hotbar_slot` | 20×20 |
| `wall_ruin` | 16×24 |
| `wall_ruin_broken_1`…`wall_ruin_broken_2`（2 帧） | 16×24 |
| `wall_ruin_corner` | 16×24 |
| `wall_ruin_door` | 16×24 |
| `wall_ruin_window` | 16×24 |
| `wall_wood` | 16×24 |
| `wall_wood_front` | 16×8 |
| `wall_wood_top` | 16×16 |
| `water_00`…`water_15`（16 帧） | 16×16 |
| `workbench` | 16×16 |
| `zombie_attack_down_0`…`zombie_attack_down_2`（3 帧） | 16×24 |
| `zombie_attack_side_0`…`zombie_attack_side_2`（3 帧） | 16×24 |
| `zombie_attack_up_0`…`zombie_attack_up_2`（3 帧） | 16×24 |
| `zombie_brute_attack_down_0`…`zombie_brute_attack_down_2`（3 帧） | 24×32 |
| `zombie_brute_attack_side_0`…`zombie_brute_attack_side_2`（3 帧） | 24×32 |
| `zombie_brute_attack_up_0`…`zombie_brute_attack_up_2`（3 帧） | 24×32 |
| `zombie_brute_death_0`…`zombie_brute_death_3`（4 帧） | 24×32 |
| `zombie_brute_hit_down_0`…`zombie_brute_hit_down_1`（2 帧） | 24×32 |
| `zombie_brute_hit_side_0`…`zombie_brute_hit_side_1`（2 帧） | 24×32 |
| `zombie_brute_hit_up_0`…`zombie_brute_hit_up_1`（2 帧） | 24×32 |
| `zombie_brute_silhouette_attack_down_0`…`zombie_brute_silhouette_attack_down_2`（3 帧） | 24×32 |
| `zombie_brute_silhouette_attack_side_0`…`zombie_brute_silhouette_attack_side_2`（3 帧） | 24×32 |
| `zombie_brute_silhouette_attack_up_0`…`zombie_brute_silhouette_attack_up_2`（3 帧） | 24×32 |
| `zombie_brute_silhouette_death_0`…`zombie_brute_silhouette_death_3`（4 帧） | 24×32 |
| `zombie_brute_silhouette_hit_down_0`…`zombie_brute_silhouette_hit_down_1`（2 帧） | 24×32 |
| `zombie_brute_silhouette_hit_side_0`…`zombie_brute_silhouette_hit_side_1`（2 帧） | 24×32 |
| `zombie_brute_silhouette_hit_up_0`…`zombie_brute_silhouette_hit_up_1`（2 帧） | 24×32 |
| `zombie_brute_silhouette_walk_down_0`…`zombie_brute_silhouette_walk_down_3`（4 帧） | 24×32 |
| `zombie_brute_silhouette_walk_side_0`…`zombie_brute_silhouette_walk_side_3`（4 帧） | 24×32 |
| `zombie_brute_silhouette_walk_up_0`…`zombie_brute_silhouette_walk_up_3`（4 帧） | 24×32 |
| `zombie_brute_walk_down_0`…`zombie_brute_walk_down_3`（4 帧） | 24×32 |
| `zombie_brute_walk_side_0`…`zombie_brute_walk_side_3`（4 帧） | 24×32 |
| `zombie_brute_walk_up_0`…`zombie_brute_walk_up_3`（4 帧） | 24×32 |
| `zombie_death_0`…`zombie_death_3`（4 帧） | 16×24 |
| `zombie_hit_down_0`…`zombie_hit_down_1`（2 帧） | 16×24 |
| `zombie_hit_side_0`…`zombie_hit_side_1`（2 帧） | 16×24 |
| `zombie_hit_up_0`…`zombie_hit_up_1`（2 帧） | 16×24 |
| `zombie_runner_attack_down_0`…`zombie_runner_attack_down_2`（3 帧） | 16×24 |
| `zombie_runner_attack_side_0`…`zombie_runner_attack_side_2`（3 帧） | 16×24 |
| `zombie_runner_attack_up_0`…`zombie_runner_attack_up_2`（3 帧） | 16×24 |
| `zombie_runner_death_0`…`zombie_runner_death_3`（4 帧） | 16×24 |
| `zombie_runner_hit_down_0`…`zombie_runner_hit_down_1`（2 帧） | 16×24 |
| `zombie_runner_hit_side_0`…`zombie_runner_hit_side_1`（2 帧） | 16×24 |
| `zombie_runner_hit_up_0`…`zombie_runner_hit_up_1`（2 帧） | 16×24 |
| `zombie_runner_silhouette_attack_down_0`…`zombie_runner_silhouette_attack_down_2`（3 帧） | 16×24 |
| `zombie_runner_silhouette_attack_side_0`…`zombie_runner_silhouette_attack_side_2`（3 帧） | 16×24 |
| `zombie_runner_silhouette_attack_up_0`…`zombie_runner_silhouette_attack_up_2`（3 帧） | 16×24 |
| `zombie_runner_silhouette_death_0`…`zombie_runner_silhouette_death_3`（4 帧） | 16×24 |
| `zombie_runner_silhouette_hit_down_0`…`zombie_runner_silhouette_hit_down_1`（2 帧） | 16×24 |
| `zombie_runner_silhouette_hit_side_0`…`zombie_runner_silhouette_hit_side_1`（2 帧） | 16×24 |
| `zombie_runner_silhouette_hit_up_0`…`zombie_runner_silhouette_hit_up_1`（2 帧） | 16×24 |
| `zombie_runner_silhouette_walk_down_0`…`zombie_runner_silhouette_walk_down_3`（4 帧） | 16×24 |
| `zombie_runner_silhouette_walk_side_0`…`zombie_runner_silhouette_walk_side_3`（4 帧） | 16×24 |
| `zombie_runner_silhouette_walk_up_0`…`zombie_runner_silhouette_walk_up_3`（4 帧） | 16×24 |
| `zombie_runner_walk_down_0`…`zombie_runner_walk_down_3`（4 帧） | 16×24 |
| `zombie_runner_walk_side_0`…`zombie_runner_walk_side_3`（4 帧） | 16×24 |
| `zombie_runner_walk_up_0`…`zombie_runner_walk_up_3`（4 帧） | 16×24 |
| `zombie_silhouette_attack_down_0`…`zombie_silhouette_attack_down_2`（3 帧） | 16×24 |
| `zombie_silhouette_attack_side_0`…`zombie_silhouette_attack_side_2`（3 帧） | 16×24 |
| `zombie_silhouette_attack_up_0`…`zombie_silhouette_attack_up_2`（3 帧） | 16×24 |
| `zombie_silhouette_death_0`…`zombie_silhouette_death_3`（4 帧） | 16×24 |
| `zombie_silhouette_hit_down_0`…`zombie_silhouette_hit_down_1`（2 帧） | 16×24 |
| `zombie_silhouette_hit_side_0`…`zombie_silhouette_hit_side_1`（2 帧） | 16×24 |
| `zombie_silhouette_hit_up_0`…`zombie_silhouette_hit_up_1`（2 帧） | 16×24 |
| `zombie_silhouette_walk_down_0`…`zombie_silhouette_walk_down_3`（4 帧） | 16×24 |
| `zombie_silhouette_walk_side_0`…`zombie_silhouette_walk_side_3`（4 帧） | 16×24 |
| `zombie_silhouette_walk_up_0`…`zombie_silhouette_walk_up_3`（4 帧） | 16×24 |
| `zombie_walk_down_0`…`zombie_walk_down_3`（4 帧） | 16×24 |
| `zombie_walk_side_0`…`zombie_walk_side_3`（4 帧） | 16×24 |
| `zombie_walk_up_0`…`zombie_walk_up_3`（4 帧） | 16×24 |
