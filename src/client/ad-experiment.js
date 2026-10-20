import { AD_POSITION_EXPERIMENT, assignAdVariant } from '../domain/ad-experiment.js';

let assignment;
let tool;

export function initAdExperiment() {
  const root = document.querySelector('#tool, #tojeong-tool');
  if (assignment || !root || !document.querySelector('[data-partner-ad-slot]')) return;
  assignment = assignAdVariant([
    { scope: 'browser', open: () => window.localStorage },
    { scope: 'session', open: () => window.sessionStorage },
  ]);
  tool = root.dataset.tool === 'home' ? 'today' : root.dataset.tool || 'tojeong';
  root.dataset.adVariant = assignment.variant;
}

export function adExperimentParams() {
  if (!assignment) return {};
  return {
    experiment_id: AD_POSITION_EXPERIMENT.id,
    experiment_variant: assignment.variant,
    ad_placement: AD_POSITION_EXPERIMENT.placements[assignment.variant],
    assignment_scope: assignment.scope,
    tool,
  };
}
