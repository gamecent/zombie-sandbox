# ASSETS.md · M1 美术素材接口说明

> 接口由技术（Wind）确定，美术按此交付。重新生成：在 `art/` 下运行 `./build.sh`。

## 1. 交付位置（两处内容相同）

| 用途 | 图集 | 音效 | 授权 |
|---|---|---|---|
| 游戏仓库结构 | `public/assets/atlas/main.png` + `main.json`（图集 key 建议 `main`） | `public/assets/audio/*.wav` | `CREDITS.md`（仓库根） |
| 独立交付包 | `build/atlas.png` + `atlas.json` | `build/audio/*.wav` | `build/CREDITS.md` |

两份 JSON 只有 `meta.image` 不同（`main.png` / `atlas.png`），帧坐标完全一致。
源文件与工具：`src/`（生成脚本、单帧 PNG `src/frames/`）、`tools/pack.js`（打包）、`packs/`（下载的 Kenney 原包）、`preview/`（预览图）。

## 2. 图集格式
- Phaser 3 **JSON Hash**，由 free-tex-packer-core 0.3.x 打包，512×512 PNG。
- **不裁剪**（trimmed=false）、不旋转、padding 2px、extrude 1px（边缘像素外扩，防止缩放接缝）。
- 加载：`this.load.atlas('main', 'assets/atlas/main.png', 'assets/atlas/main.json')`
- 显示：16×16 图块，整数 3 倍缩放；游戏配置开启 `pixelArt: true`、`roundPixels: true`。
- JSON 里的 `pivot` 一律是 0.5/0.5（打包器默认值），**锚点以代码 setOrigin 为准**（见第 5 节）。

## 3. 命名规则
帧名 = 数据表里的 id，小写 snake_case；序号后缀从 0 开始；地面后缀为两位数位掩码。

| 帧名 | 尺寸 | 说明 |
|---|---|---|
| `grass_00`…`grass_15` | 16×16 | 草地自动拼接 |
| `dirt_00`…`dirt_15` | 16×16 | 泥土自动拼接（缺邻居的一侧画草边） |
| `water_00`…`water_15` | 16×16 | 水面自动拼接（缺邻居的一侧画浅色岸边） |
| `tree` | 16×32 | 可砍的树；树干底部在下方 16×16 内（约 y=27–28） |
| `tree_stump` | 16×16 | 树桩（砍倒后） |
| `rock` | 16×16 | 石头 |
| `wall_wood` | 16×24 | 木墙整图：上 16×16 = 顶面，下 8px = 前立面 |
| `wall_wood_top` | 16×16 | 木墙顶面（单独图层） |
| `wall_wood_front` | 16×8 | 木墙前立面（单独图层） |
| `fx_crack_1`…`fx_crack_3` | 16×24 | 裂纹叠加层（轻/中/重），透明底，与 `wall_wood` 像素对齐 |
| `icon_wood`、`icon_stone` | 16×16 | 物品图标 |
| `ui_build_ok`、`ui_build_bad` | 16×16 | 地面格提示（绿/红半透明 + 1px 边框） |
| `ui_hotbar_slot`、`ui_hotbar_select` | **20×20** | 快捷栏格子 / 选中框（16px 图标居中，四周留 2px） |
| `player_walk_down_0..3`、`player_walk_up_0..3`、`player_walk_side_0..3` | 16×24 | 走路 4 帧；side 朝右，朝左由代码 `flipX` |
| `player_idle_down_0`、`player_idle_up_0`、`player_idle_side_0` | 16×24 | 站立 |
| `player_silhouette_<同上后缀>` | 16×24 | 与每个玩家帧一一对应的剪影 |

玩家帧脚底对齐图片底边，角色主体在下方 16px，上方 8px 透明（预留给以后的帽子/武器）。走路帧顺序：0 站立、1 右脚着地身体上抬 1px、2 站立、3 左脚着地；建议 8 帧/秒。

## 4. 地面自动拼接位掩码
后缀 = 4 邻接位掩码，**邻居是同类型时该位为 1**：N=1、E=2、S=4、W=8。
例：四面都同类 = `_15`；孤立一格 = `_00`；只有北、南同类 = `_05`。
地图边界外视为同类型（不画边）。M1 不做 47 格角落细分；暂未做“森林地面”，按约定先做草、泥土、水。

## 5. 墙的锚点与深度排序
- 墙用精灵（不进 tilemap 图层），**origin (0.5, 1)**，放在格子底边中点：`x = col*16+8, y = (row+1)*16`（世界像素，乘缩放前）。
- **depth = 底边 y**（同一个 y 时：墙 < 裂纹 < 预览，可加 0.1/0.2 微调）。玩家、丧尸、树同样用 origin (0.5, 1)、depth = 脚底 y。
- 碰撞仍是 1 格（该格本身）；顶面会向上多画 8px，盖住站在墙北侧的角色下半身。
- 裂纹：与墙同位置同 origin 叠一层 `fx_crack_n`。
- M1 墙**不做自动拼接**，相邻墙之间会看到 1px 深色竖缝（属预期）。

## 6. 建造预览
游戏内用墙体着色：绿 `setTint(0x55ff55)` + `setAlpha(0.5)`（可放）、红 `setTint(0xff5555)` + `setAlpha(0.5)`（不可放）。
`ui_build_ok` / `ui_build_bad` 作为地面格提示，可同时画在目标格上。

## 7. 墙后角色剪影（已定：角色轮廓剪影画在墙上方）
- 剪影帧：填充 #7cc8ff、约 63% 不透明；1px 外缘 #e8f7ff、约 92% 不透明。
- 推荐做法 B：剪影 depth 置顶，并只在被墙遮挡的像素显示（用墙图层做 mask，或检测重叠时才显示）。
- 简化做法 C：被墙挡住时整个剪影置顶（露出部分也会偏蓝）。
- 示意图：`preview/silhouette_mockup_3x.png`（A 无剪影 / B 推荐 / C 简化），`preview/silhouette_mockup_B_3x_exact.png`。

## 8. 音效
`sfx_chop.wav`（砍木，0.22s）、`sfx_place.wav`（放置方块，0.16s）：44.1kHz 16-bit 单声道，Python 程序合成（`src/gen_audio.py`）。加载 key 建议与文件名相同。

## 9. 仍是占位的内容
- 玩家：Kenney Tiny Dungeon 单帧角色改绘；背面/侧面/走路帧是简单改色和上下抬动，侧面像素不是真正侧脸。M2 前需重画。
- 水面、石头、树桩、石头图标、墙、裂纹、UI 都是程序画的简版。
- 树是 Kenney 两个图块拼的；砍树动画、倒下动画尚未做。
- 草地边缘只是 1px 暗线；草与泥土交界处两种边会叠在一起，后续再细修。
- 音效为占位，M6 替换。
