import { useMemo, useRef } from "react"
import { Vector2, Matrix4 } from "three"
import { useThree } from "@react-three/fiber"
import { OrbitControls, useFBO } from "@react-three/drei"

import vertexShader from "./shaders/vertexShader.js"
import fragmentShader from "./shaders/fragmentShader.js"

export default function Experience() {
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
      // uNoiseTexture: {
      //   type: "sampler2D",
      //   value: noiseTexture,
      // },
      // iChannel0: {
      //   type: "samplerCube",
      //   value: cubeTexture,
      // },
      // uSpeed: {
      //   type: "f",
      //   value: speed,
      // },
      // uIOR: {
      //   type: "f",
      //   value: IOR,
      // },
      // uCount: {
      //   type: "i",
      //   value: count,
      // },
      // uReflection: {
      //   type: "f",
      //   value: reflection,
      // },
      // uSize: {
      //   type: "f",
      //   value: size,
      // },
      // uDispersion: {
      //   type: "f",
      //   value: dispersion,
      // },
      // uRefractPower: {
      //   type: "f",
      //   value: refract,
      // },
      // uChromaticAbberation: {
      //   type: "f",
      //   value: chromaticAbberation,
      // },
    }),
    [viewport.width, viewport.height, buffer.texture]
  )

  return (
    <>
      <OrbitControls />
      <mesh
        rotation={[Math.PI / 4, Math.PI / 4, Math.PI / 2]}
        position={[0, 0, 0]}
      >
        <boxGeometry args={[1, 1, 1]} />
        <shaderMaterial
          uniforms={uniforms}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          transparent={false}
        />
      </mesh>
    </>
  )
}
