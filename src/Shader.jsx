import { useRef, useMemo } from "react"
import { Vector2, Matrix4 } from "three"
import { useThree } from "@react-three/fiber"
import { useFBO } from "@react-three/drei"

import fragmentShader from "./shaders/orthographic/fragmentShader.js"
import vertexShader from "./shaders/orthographic/vertexShader.js"

export default function Shader({ position }) {
  const meshRef = useRef()
  const buffer = useFBO()
  const viewport = useThree((state) => state.viewport)
  const scene = useThree((state) => state.scene)
  const camera = useThree((state) => state.camera)

  const uniforms = useMemo(
    () => ({
      uCamPos: { value: camera.position },
      uCamToWorldMat: { value: camera.matrixWorld },
      uCamInverseProjMat: { value: camera.projectionMatrixInverse },
      uInverseModelMat: {
        value: new Matrix4(),
      },
      uTime: {
        type: "f",
        value: 1.0,
      },
      uMouse: {
        type: "v2",
        value: new Vector2(0, 0),
      },
      uResolution: {
        type: "v2",
        value: new Vector2(viewport.width, viewport.height).multiplyScalar(
          Math.min(window.devicePixelRatio, 2)
        ),
      },
      uTexture: {
        type: "sampler2D",
        value: buffer.texture,
      },
    }),
    [viewport.width, viewport.height, buffer.texture]
  )

  return (
    <>
      <mesh position={position}>
        <planeGeometry args={[2, 1.5]} />
        <shaderMaterial
          uniforms={uniforms}
          fragmentShader={fragmentShader}
          vertexShader={vertexShader}
        />
      </mesh>
    </>
  )
}
