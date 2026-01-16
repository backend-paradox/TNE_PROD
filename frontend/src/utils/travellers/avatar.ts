const fallbackSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
  <rect width="40" height="40" rx="20" fill="#e2e8f0"/>
  <text x="50%" y="55%" text-anchor="middle" font-size="18">👤</text>
</svg>`;

export const fallbackAvatarDataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(fallbackSvg)}`;

export const applyAvatarFallback = (event: { currentTarget: HTMLImageElement }) => {
  const target = event.currentTarget;
  if (target.dataset.fallbackApplied === 'true') return;
  target.dataset.fallbackApplied = 'true';
  target.src = fallbackAvatarDataUrl;
};
