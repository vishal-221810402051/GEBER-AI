import type { PcbProject } from "./domain";

const app = document.querySelector<HTMLDivElement>("#app");

if (app) {
  app.dataset.app = "geber-ai";
}

export type { PcbProject };
