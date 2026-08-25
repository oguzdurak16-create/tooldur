"use client";

import { useEffect } from "react";

const PERCENT_LABEL_SELECTOR = ".pm-progress-label b, .pm-task-progress-line span:last-child";

function normalizePercentLabels(root: ParentNode) {
  root.querySelectorAll<HTMLElement>(PERCENT_LABEL_SELECTOR).forEach((element) => {
    const value = (element.textContent ?? "").trim();
    const match = value.match(/^%(\d{1,3})$/);
    if (!match) return;
    element.textContent = `${match[1]}%`;
  });
}

export default function ProjectManagementUiFixes() {
  useEffect(() => {
    const root = document.querySelector(".pm-root");
    if (!root) return;

    normalizePercentLabels(root);

    const observer = new MutationObserver(() => normalizePercentLabels(root));
    observer.observe(root, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => observer.disconnect();
  }, []);

  return null;
}
