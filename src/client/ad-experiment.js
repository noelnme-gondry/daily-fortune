import { AD_LAYOUT } from '../domain/ad-experiment.js';

let tool;

export function initAdExperiment() {
  const root = document.querySelector('#tool, #tojeong-tool');
  if (tool || !root || !document.querySelector('[data-partner-ad-slot]')) return;
  tool = root.dataset.tool === 'home' ? 'today' : root.dataset.tool || 'tojeong';
  root.dataset.adLayout = AD_LAYOUT.id;
}

export function adExperimentParams() {
  if (!tool) return {};
  return {
    ad_layout_version: AD_LAYOUT.id,
    ad_placement: AD_LAYOUT.placement,
    tool,
  };
}
