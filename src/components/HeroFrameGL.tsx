"use client";

/* eslint-disable react-hooks/immutability --
 * R3F idiom: Three.js objects (the shared Texture, frame-index ref) are
 * mutated imperatively inside useFrame/effects. React never reads or renders
 * these values, so the compiler-safety rule's assumptions don't apply here. */

/**
 * HERO FRAME GL — WebGL frame surface for the R3F hero port.
 *
 * Replaces the 2D-canvas `drawImage` scrub with a single full-viewport plane
 * whose texture is swapped to the current frame (one THREE.Texture reused —
 * uploading 578 separate textures would eat ~2GB of VRAM; swapping `.image`
 * costs the same as the old drawImage per frame change).
 *
 * Behavior contract (must stay identical to the 2D version):
 *  - frame index = scroll progress through the section, no easing
 *  - cover-fit: fill viewport, preserve aspect, center overflow
 *  - renders only on scroll/resize (demand frameloop + invalidate)
 *  - sRGB texture + `flat` canvas → colors match the 2D canvas exactly
 */

import { useEffect, useMemo, useRef, type RefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { LinearFilter, SRGBColorSpace, Texture, type Mesh } from "three";
import SceneCanvas from "@/components/three/SceneCanvas";

type FrameProps = {
  sectionRef: RefObject<HTMLElement | null>;
  imagesRef: RefObject<HTMLImageElement[]>;
  frameCount: number;
  framesReady: boolean;
};

function FramePlane({
  sectionRef,
  imagesRef,
  frameCount,
  framesReady,
}: FrameProps) {
  const meshRef = useRef<Mesh>(null);
  const lastIndex = useRef(-1);
  const invalidate = useThree((state) => state.invalidate);
  const viewport = useThree((state) => state.viewport);

  const texture = useMemo(() => {
    const t = new Texture();
    t.colorSpace = SRGBColorSpace;
    // Frames are viewport-scale; mipmaps would only blur and cost upload time.
    t.generateMipmaps = false;
    t.minFilter = LinearFilter;
    return t;
  }, []);
  useEffect(() => () => texture.dispose(), [texture]);

  // Scroll/resize → request one render. Same event surface as the old hero;
  // the demand frameloop replaces its manual rAF queueing.
  useEffect(() => {
    const onScrollOrResize = () => invalidate();
    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize, { passive: true });
    invalidate();
    return () => {
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [invalidate]);

  // First frames may finish loading after mount — redraw when the set is ready.
  useEffect(() => {
    lastIndex.current = -1;
    invalidate();
  }, [framesReady, invalidate]);

  useFrame(() => {
    const section = sectionRef.current;
    const images = imagesRef.current;
    const mesh = meshRef.current;
    if (!section || !mesh) return;

    // Identical progress math to the 2D hero: sticky child is 100vh, the
    // parent's extra height is the scrub distance.
    const rect = section.getBoundingClientRect();
    const distance = section.offsetHeight - window.innerHeight;
    const p =
      distance > 0 ? Math.min(1, Math.max(0, -rect.top / distance)) : 0;

    const index = Math.round(p * (frameCount - 1));
    const img = images[index];
    if (
      index !== lastIndex.current &&
      img?.complete &&
      img.naturalWidth > 0
    ) {
      texture.image = img;
      texture.needsUpdate = true;
      lastIndex.current = index;
    }

    // Until a frame has been uploaded the plane would render black — keep it
    // hidden so the poster <img> behind/above stays the visible surface.
    const current = texture.image as HTMLImageElement | undefined;
    mesh.visible = !!current;
    if (current) {
      const imageAspect = current.naturalWidth / current.naturalHeight;
      const viewAspect = viewport.width / viewport.height;
      const w =
        viewAspect > imageAspect ? viewport.width : viewport.height * imageAspect;
      const h =
        viewAspect > imageAspect ? viewport.width / imageAspect : viewport.height;
      mesh.scale.set(w, h, 1);
    }
  });

  return (
    <mesh ref={meshRef} visible={false}>
      <planeGeometry />
      <meshBasicMaterial map={texture} toneMapped={false} />
    </mesh>
  );
}

export default function HeroFrameGL(props: FrameProps) {
  return (
    <SceneCanvas
      className="absolute inset-0 h-full w-full"
      flat
      camera={{ position: [0, 0, 5], fov: 50 }}
    >
      <FramePlane {...props} />
    </SceneCanvas>
  );
}
