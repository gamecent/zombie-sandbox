import { config } from '../config.js';

const PHASE = {
  day: '白天',
  dusk: '黄昏',
  night: '夜晚',
};

function pad(n) {
  return n < 10 ? '0' + n : String(n);
}

/** In-game clock driven only by config.dayNight. No lighting in M1. */
export function describeClock(elapsedSec) {
  const dn = config.dayNight;
  const total = elapsedSec + dn.startAt;
  const dayIndex = Math.floor(total / dn.cycle) + 1;
  const into = total - Math.floor(total / dn.cycle) * dn.cycle;
  let phase = 'day';
  if (into >= dn.day + dn.dusk) phase = 'night';
  else if (into >= dn.day) phase = 'dusk';
  let phaseLabel = PHASE[phase];
  if (phase === 'night' && dn.bloodMoonEvery > 0 && dayIndex % dn.bloodMoonEvery === 0) {
    phaseLabel = '血月';
  }
  const mm = Math.floor(into / 60);
  const ss = Math.floor(into % 60);
  const tm = Math.floor(dn.cycle / 60);
  const ts = Math.floor(dn.cycle % 60);
  return {
    dayIndex,
    phase,
    label: `第${dayIndex}天 ${pad(mm)}:${pad(ss)}/${pad(tm)}:${pad(ts)} ${phaseLabel}`,
  };
}
