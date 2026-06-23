"use client"

import { useEffect, useRef, useState } from "react"
import * as THREE from "three"

export interface ShaderVariantProps {
  xScale?: number
  yScale?: number
  distortion?: number
  speed?: number
  colorMode?: "rgb" | "cyan-magenta" | "warm" | "cool" | "mono"
}

export function ShaderVariant({
  xScale = 1.0,
  yScale = 0.5,
  distortion = 0.05,
  speed = 0.01,
  colorMode = "rgb",
}: ShaderVariantProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sceneRef = useRef<{
    scene: THREE.Scene | null
    camera: THREE.OrthographicCamera | null
    renderer: THREE.WebGLRenderer | null
    mesh: THREE.Mesh | null
    uniforms: any
    animationId: number | null
  }>({
    scene: null,
    camera: null,
    renderer: null,
    mesh: null,
    uniforms: null,
    animationId: null,
  })

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const { current: refs } = sceneRef

    const vertexShader = `
      attribute vec3 position;
      void main() {
        gl_Position = vec4(position, 1.0);
      }
    `

    const getFragmentShader = (mode: string) => {
      const baseShader = `
        precision highp float;
        uniform vec2 resolution;
        uniform float time;
        uniform float xScale;
        uniform float yScale;
        uniform float distortion;

        void main() {
          vec2 p = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y);
          
          float d = length(p) * distortion;
          
          float rx = p.x * (1.0 + d);
          float gx = p.x;
          float bx = p.x * (1.0 - d);

          float r = 0.05 / abs(p.y + sin((rx + time) * xScale) * yScale);
          float g = 0.05 / abs(p.y + sin((gx + time) * xScale) * yScale);
          float b = 0.05 / abs(p.y + sin((bx + time) * xScale) * yScale);
      `

      switch (mode) {
        case "cyan-magenta":
          return baseShader + `
            gl_FragColor = vec4(g * 0.3, r * 0.8 + b * 0.8, b, 1.0);
          }
          `
        case "warm":
          return baseShader + `
            gl_FragColor = vec4(r * 1.2, g * 0.7, b * 0.3, 1.0);
          }
          `
        case "cool":
          return baseShader + `
            gl_FragColor = vec4(r * 0.3, g * 0.8, b * 1.2, 1.0);
          }
          `
        case "mono":
          return baseShader + `
            float intensity = (r + g + b) * 0.33;
            gl_FragColor = vec4(vec3(intensity), 1.0);
          }
          `
        default:
          return baseShader + `
            gl_FragColor = vec4(r, g, b, 1.0);
          }
          `
      }
    }

    const fragmentShader = getFragmentShader(colorMode)

    const initScene = () => {
      refs.scene = new THREE.Scene()
      refs.renderer = new THREE.WebGLRenderer({ canvas, alpha: false })
      refs.renderer.setPixelRatio(window.devicePixelRatio)
      refs.renderer.setClearColor(new THREE.Color(0x000000))

      refs.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, -1)

      refs.uniforms = {
        resolution: { value: [canvas.width, canvas.height] },
        time: { value: 0.0 },
        xScale: { value: xScale },
        yScale: { value: yScale },
        distortion: { value: distortion },
      }

      const position = [
        -1.0, -1.0, 0.0,
         1.0, -1.0, 0.0,
        -1.0,  1.0, 0.0,
         1.0, -1.0, 0.0,
        -1.0,  1.0, 0.0,
         1.0,  1.0, 0.0,
      ]

      const positions = new THREE.BufferAttribute(new Float32Array(position), 3)
      const geometry = new THREE.BufferGeometry()
      geometry.setAttribute("position", positions)

      const material = new THREE.RawShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: refs.uniforms,
        side: THREE.DoubleSide,
      })

      refs.mesh = new THREE.Mesh(geometry, material)
      refs.scene.add(refs.mesh)

      handleResize()
    }

    const animate = () => {
      if (refs.uniforms) refs.uniforms.time.value += speed
      if (refs.renderer && refs.scene && refs.camera) {
        refs.renderer.render(refs.scene, refs.camera)
      }
      refs.animationId = requestAnimationFrame(animate)
    }

    const handleResize = () => {
      if (!refs.renderer || !refs.uniforms || !canvas.parentElement) return
      const width = canvas.parentElement.clientWidth
      const height = canvas.parentElement.clientHeight
      refs.renderer.setSize(width, height, false)
      refs.uniforms.resolution.value = [width, height]
    }

    initScene()
    animate()
    window.addEventListener("resize", handleResize)

    return () => {
      if (refs.animationId) cancelAnimationFrame(refs.animationId)
      window.removeEventListener("resize", handleResize)
      if (refs.mesh) {
        refs.scene?.remove(refs.mesh)
        refs.mesh.geometry.dispose()
        if (refs.mesh.material instanceof THREE.Material) {
          refs.mesh.material.dispose()
        }
      }
      refs.renderer?.dispose()
    }
  }, [xScale, yScale, distortion, speed, colorMode])

  return <canvas ref={canvasRef} className="w-full h-full block" />
}

export function WebGLShaderVariations() {
  const [selectedVariant, setSelectedVariant] = useState(0)

  const variants: ShaderVariantProps[] = [
    {
      xScale: 1.0,
      yScale: 0.5,
      distortion: 0.05,
      speed: 0.01,
      colorMode: "rgb",
    },
    {
      xScale: 2.5,
      yScale: 0.3,
      distortion: 0.15,
      speed: 0.015,
      colorMode: "cyan-magenta",
    },
    {
      xScale: 0.5,
      yScale: 0.8,
      distortion: 0.02,
      speed: 0.008,
      colorMode: "warm",
    },
    {
      xScale: 3.0,
      yScale: 0.2,
      distortion: 0.25,
      speed: 0.02,
      colorMode: "cool",
    },
    {
      xScale: 1.5,
      yScale: 0.6,
      distortion: 0.1,
      speed: 0.012,
      colorMode: "mono",
    },
  ]

  return (
    <div className="w-full h-screen flex flex-col md:flex-row bg-background">
      {/* Mobile Variant Switcher - Top */}
      <div className="md:hidden w-full border-b border-border bg-background p-2 overflow-x-auto">
        <div className="flex gap-2">
          {variants.map((variant, index) => (
            <button
              key={index}
              onClick={() => setSelectedVariant(index)}
              className={`flex-shrink-0 relative overflow-hidden rounded-md border-2 transition-all ${
                selectedVariant === index
                  ? "border-primary ring-2 ring-primary/20"
                  : "border-border hover:border-primary/50"
              }`}
              style={{ width: "80px", height: "60px" }}
            >
              <div
                className="absolute pointer-events-none"
                style={{
                  transform: "scale(0.08)",
                  transformOrigin: "top left",
                  width: "1250%",
                  height: "1667%",
                }}
              >
                <ShaderVariant {...variant} />
              </div>
              <div className="absolute bottom-0 right-0 bg-background/80 text-foreground text-xs px-1.5 py-0.5 rounded-tl">
                {index + 1}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Stage */}
      <div className="flex-1 w-full h-full relative">
        <ShaderVariant {...variants[selectedVariant]} />
      </div>

      {/* Desktop Variant Switcher - Right Sidebar */}
      <div className="hidden md:flex flex-col gap-3 p-4 border-l border-border bg-background w-32">
        {variants.map((variant, index) => (
          <button
            key={index}
            onClick={() => setSelectedVariant(index)}
            className={`relative overflow-hidden rounded-md border-2 transition-all ${
              selectedVariant === index
                ? "border-primary ring-2 ring-primary/20"
                : "border-border hover:border-primary/50"
            }`}
            style={{ width: "96px", height: "72px" }}
          >
            <div
              className="absolute pointer-events-none"
              style={{
                transform: "scale(0.096)",
                transformOrigin: "top left",
                width: "1042%",
                height: "1389%",
              }}
            >
              <ShaderVariant {...variant} />
            </div>
            <div className="absolute bottom-1 right-1 bg-background/80 text-foreground text-xs px-1.5 py-0.5 rounded">
              {index + 1}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

export default WebGLShaderVariations
