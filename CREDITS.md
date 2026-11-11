# CREDITS · 素材来源与授权

本项目 M1 使用的全部美术与音效素材如下。CC0 素材不强制署名，这里仍按惯例致谢。

## 第三方素材

### Kenney — Tiny Town (v1.1)
- 作者：Kenney（www.kenney.nl）
- 地址：https://kenney.nl/assets/tiny-town
- 授权：**Creative Commons Zero (CC0 1.0)** — http://creativecommons.org/publicdomain/zero/1.0/
  （已核对压缩包内 `License.txt`：“License: (Creative Commons Zero, CC0)”）
- 使用的原始图块：tile_0000、0001（草地）；0012–0014、0024–0026、0036–0038（泥土九宫格）；0005、0016（树）；0106（原木图标）
- 对应帧：`dirt_00`…`dirt_15`（16 帧）、`grass_00`…`grass_15`（16 帧）、`icon_wood`、`tree`

### Kenney — Tiny Dungeon (v1.0)
- 作者：Kenney（www.kenney.nl）
- 地址：https://kenney.nl/assets/tiny-dungeon
- 授权：**Creative Commons Zero (CC0 1.0)** — http://creativecommons.org/publicdomain/zero/1.0/
  （已核对压缩包内 `License.txt`：“License: (Creative Commons Zero, CC0)”）
- 使用的原始图块：tile_0085（角色，原图只有正面单帧；背面、侧面和走路帧是我们在此基础上改绘的）
- 对应帧：`player_idle_down_0`、`player_idle_side_0`、`player_idle_up_0`、`player_walk_down_0`…`player_walk_down_3`（4 帧）、`player_walk_side_0`…`player_walk_side_3`（4 帧）、`player_walk_up_0`…`player_walk_up_3`（4 帧）

## 自制素材（本项目原创，以 CC0 1.0 发布）
- 作者：苏轩项目组（美术 Jane），程序生成脚本见 `art/src/`
- 部分自制图使用了 Kenney Tiny Town / Tiny Dungeon 的调色板以保持风格一致
- 对应帧：`fx_crack_1`…`fx_crack_3`（3 帧）、`icon_stone`、`player_silhouette_idle_down_0`、`player_silhouette_idle_side_0`、`player_silhouette_idle_up_0`、`player_silhouette_walk_down_0`…`player_silhouette_walk_down_3`（4 帧）、`player_silhouette_walk_side_0`…`player_silhouette_walk_side_3`（4 帧）、`player_silhouette_walk_up_0`…`player_silhouette_walk_up_3`（4 帧）、`rock`、`tree_stump`、`ui_build_bad`、`ui_build_ok`、`ui_hotbar_select`、`ui_hotbar_slot`、`wall_wood_front`、`wall_wood_top`、`wall_wood`、`water_00`…`water_15`（16 帧）
- 音效：`audio/sfx_chop.wav`（砍木）、`audio/sfx_place.wav`（放置方块）— Python 程序合成（jsfxr 风格），自制，CC0 1.0

## 逐帧来源明细

| 帧名 | 来源 |
|---|---|
| `dirt_00` | kenney_tiny_town:tile_0012-0014,0024-0026,0036-0038 (composited) |
| `dirt_01` | kenney_tiny_town:tile_0012-0014,0024-0026,0036-0038 (composited) |
| `dirt_02` | kenney_tiny_town:tile_0012-0014,0024-0026,0036-0038 (composited) |
| `dirt_03` | kenney_tiny_town:tile_0012-0014,0024-0026,0036-0038 (composited) |
| `dirt_04` | kenney_tiny_town:tile_0012-0014,0024-0026,0036-0038 (composited) |
| `dirt_05` | kenney_tiny_town:tile_0012-0014,0024-0026,0036-0038 (composited) |
| `dirt_06` | kenney_tiny_town:tile_0012-0014,0024-0026,0036-0038 (composited) |
| `dirt_07` | kenney_tiny_town:tile_0012-0014,0024-0026,0036-0038 (composited) |
| `dirt_08` | kenney_tiny_town:tile_0012-0014,0024-0026,0036-0038 (composited) |
| `dirt_09` | kenney_tiny_town:tile_0012-0014,0024-0026,0036-0038 (composited) |
| `dirt_10` | kenney_tiny_town:tile_0012-0014,0024-0026,0036-0038 (composited) |
| `dirt_11` | kenney_tiny_town:tile_0012-0014,0024-0026,0036-0038 (composited) |
| `dirt_12` | kenney_tiny_town:tile_0012-0014,0024-0026,0036-0038 (composited) |
| `dirt_13` | kenney_tiny_town:tile_0012-0014,0024-0026,0036-0038 (composited) |
| `dirt_14` | kenney_tiny_town:tile_0012-0014,0024-0026,0036-0038 (composited) |
| `dirt_15` | kenney_tiny_town:tile_0012-0014,0024-0026,0036-0038 (composited) |
| `fx_crack_1` | self-made |
| `fx_crack_2` | self-made |
| `fx_crack_3` | self-made |
| `grass_00` | kenney_tiny_town:tile_0000/0001 + self-made edge |
| `grass_01` | kenney_tiny_town:tile_0000/0001 + self-made edge |
| `grass_02` | kenney_tiny_town:tile_0000/0001 + self-made edge |
| `grass_03` | kenney_tiny_town:tile_0000/0001 + self-made edge |
| `grass_04` | kenney_tiny_town:tile_0000/0001 + self-made edge |
| `grass_05` | kenney_tiny_town:tile_0000/0001 + self-made edge |
| `grass_06` | kenney_tiny_town:tile_0000/0001 + self-made edge |
| `grass_07` | kenney_tiny_town:tile_0000/0001 + self-made edge |
| `grass_08` | kenney_tiny_town:tile_0000/0001 + self-made edge |
| `grass_09` | kenney_tiny_town:tile_0000/0001 + self-made edge |
| `grass_10` | kenney_tiny_town:tile_0000/0001 + self-made edge |
| `grass_11` | kenney_tiny_town:tile_0000/0001 + self-made edge |
| `grass_12` | kenney_tiny_town:tile_0000/0001 + self-made edge |
| `grass_13` | kenney_tiny_town:tile_0000/0001 + self-made edge |
| `grass_14` | kenney_tiny_town:tile_0000/0001 + self-made edge |
| `grass_15` | kenney_tiny_town:tile_0000/0001 + self-made edge |
| `icon_stone` | self-made (Kenney Tiny Dungeon palette) |
| `icon_wood` | kenney_tiny_town:tile_0106 |
| `player_idle_down_0` | kenney_tiny_dungeon:tile_0085 (derived) |
| `player_idle_side_0` | kenney_tiny_dungeon:tile_0085 (derived) |
| `player_idle_up_0` | kenney_tiny_dungeon:tile_0085 (derived) |
| `player_silhouette_idle_down_0` | self-made (silhouette derived from player frame) |
| `player_silhouette_idle_side_0` | self-made (silhouette derived from player frame) |
| `player_silhouette_idle_up_0` | self-made (silhouette derived from player frame) |
| `player_silhouette_walk_down_0` | self-made (silhouette derived from player frame) |
| `player_silhouette_walk_down_1` | self-made (silhouette derived from player frame) |
| `player_silhouette_walk_down_2` | self-made (silhouette derived from player frame) |
| `player_silhouette_walk_down_3` | self-made (silhouette derived from player frame) |
| `player_silhouette_walk_side_0` | self-made (silhouette derived from player frame) |
| `player_silhouette_walk_side_1` | self-made (silhouette derived from player frame) |
| `player_silhouette_walk_side_2` | self-made (silhouette derived from player frame) |
| `player_silhouette_walk_side_3` | self-made (silhouette derived from player frame) |
| `player_silhouette_walk_up_0` | self-made (silhouette derived from player frame) |
| `player_silhouette_walk_up_1` | self-made (silhouette derived from player frame) |
| `player_silhouette_walk_up_2` | self-made (silhouette derived from player frame) |
| `player_silhouette_walk_up_3` | self-made (silhouette derived from player frame) |
| `player_walk_down_0` | kenney_tiny_dungeon:tile_0085 (derived: up/side views & walk frames self-edited) |
| `player_walk_down_1` | kenney_tiny_dungeon:tile_0085 (derived: up/side views & walk frames self-edited) |
| `player_walk_down_2` | kenney_tiny_dungeon:tile_0085 (derived: up/side views & walk frames self-edited) |
| `player_walk_down_3` | kenney_tiny_dungeon:tile_0085 (derived: up/side views & walk frames self-edited) |
| `player_walk_side_0` | kenney_tiny_dungeon:tile_0085 (derived: up/side views & walk frames self-edited) |
| `player_walk_side_1` | kenney_tiny_dungeon:tile_0085 (derived: up/side views & walk frames self-edited) |
| `player_walk_side_2` | kenney_tiny_dungeon:tile_0085 (derived: up/side views & walk frames self-edited) |
| `player_walk_side_3` | kenney_tiny_dungeon:tile_0085 (derived: up/side views & walk frames self-edited) |
| `player_walk_up_0` | kenney_tiny_dungeon:tile_0085 (derived: up/side views & walk frames self-edited) |
| `player_walk_up_1` | kenney_tiny_dungeon:tile_0085 (derived: up/side views & walk frames self-edited) |
| `player_walk_up_2` | kenney_tiny_dungeon:tile_0085 (derived: up/side views & walk frames self-edited) |
| `player_walk_up_3` | kenney_tiny_dungeon:tile_0085 (derived: up/side views & walk frames self-edited) |
| `rock` | self-made (Kenney Tiny Dungeon palette) |
| `tree` | kenney_tiny_town:tile_0016 + tile_0005 (composited, trunk extended) |
| `tree_stump` | self-made (Kenney Tiny Town palette) |
| `ui_build_bad` | self-made |
| `ui_build_ok` | self-made |
| `ui_hotbar_select` | self-made |
| `ui_hotbar_slot` | self-made (Kenney Tiny Dungeon palette) |
| `wall_wood` | self-made (Kenney Tiny Town palette) |
| `wall_wood_front` | self-made (Kenney Tiny Town palette) |
| `wall_wood_top` | self-made (Kenney Tiny Town palette) |
| `water_00` | self-made |
| `water_01` | self-made |
| `water_02` | self-made |
| `water_03` | self-made |
| `water_04` | self-made |
| `water_05` | self-made |
| `water_06` | self-made |
| `water_07` | self-made |
| `water_08` | self-made |
| `water_09` | self-made |
| `water_10` | self-made |
| `water_11` | self-made |
| `water_12` | self-made |
| `water_13` | self-made |
| `water_14` | self-made |
| `water_15` | self-made |
