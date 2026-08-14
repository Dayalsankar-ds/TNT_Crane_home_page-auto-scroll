/**
 * SINGLE WEBGL SPLIT POINT — every `dynamic(ssr: false)` GL mount must import
 * from THIS module, never from a scene file directly. Separate dynamic entry
 * points each bundle their own copy of Three.js (~230KB gzipped per copy —
 * exactly what happened with the hero + Statement as separate entries); one
 * shared entry means one Three.js chunk site-wide, fetched once.
 */

export { default as HeroFrameGL } from "../HeroFrameGL";
export { default as StatementGL } from "./StatementGL";
