import { getItem } from '../world/TileRegistry.js';

export class Inventory {
  constructor(size) {
    this.size = size;
    this.slots = new Array(size);
    for (let i = 0; i < size; i++) this.slots[i] = null;
    this.selected = 0;
  }

  countOf(itemId) {
    let total = 0;
    for (let i = 0; i < this.size; i++) {
      const slot = this.slots[i];
      if (slot && slot.id === itemId) total += slot.count;
    }
    return total;
  }

  add(itemId, count) {
    const def = getItem(itemId);
    const max = def && def.stack ? def.stack : 99;
    let left = count;
    for (let i = 0; i < this.size && left > 0; i++) {
      const slot = this.slots[i];
      if (slot && slot.id === itemId && slot.count < max) {
        const room = max - slot.count;
        const put = room < left ? room : left;
        slot.count += put;
        left -= put;
      }
    }
    for (let i = 0; i < this.size && left > 0; i++) {
      if (!this.slots[i]) {
        const put = max < left ? max : left;
        this.slots[i] = { id: itemId, count: put };
        left -= put;
      }
    }
    return count - left;
  }

  remove(itemId, count) {
    if (this.countOf(itemId) < count) return false;
    let left = count;
    for (let i = 0; i < this.size && left > 0; i++) {
      const slot = this.slots[i];
      if (!slot || slot.id !== itemId) continue;
      const take = slot.count < left ? slot.count : left;
      slot.count -= take;
      left -= take;
      if (slot.count <= 0) this.slots[i] = null;
    }
    return true;
  }

  canAfford(costs) {
    if (!costs) return true;
    for (let i = 0; i < costs.length; i++) {
      if (this.countOf(costs[i].item) < costs[i].count) return false;
    }
    return true;
  }

  pay(costs) {
    if (!this.canAfford(costs)) return false;
    for (let i = 0; i < costs.length; i++) this.remove(costs[i].item, costs[i].count);
    return true;
  }
}
