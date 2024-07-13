import { useMemo, useRef, useEffect, useState, useCallback } from "react"
import { Vector2, Matrix4, Vector3, MathUtils } from "three"
import { useThree, useFrame } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"

import vertexShader from "./shaders/cube/vertexShader.js"
import fragmentShader from "./shaders/cube/fragmentShader.js"

export default function Experience({ position }) {
  const meshRef = useRef()
  const viewport = useThree((state) => state.viewport)
  const camera = useThree((state) => state.camera)
  const size = useThree((state) => state.size)
  const inverseMatrix = useRef(new Matrix4())

  const [worldToObjectMatrix, setWorldToObjectMatrix] = useState(new Matrix4())

  const forward = new Vector3(0, 0, -1)

  useFrame((state) => {
    let time = state.clock.getElapsedTime()

    if (meshRef.current) {
    }
    // animation
    meshRef.current.rotation.x += 0.01
    meshRef.current.rotation.y += 0.01

    meshRef.current.position.x = Math.sin(time) * 0.3

    // Update the uniform

    // inverse model matrix
    meshRef.current.updateMatrixWorld()
    const worldMatrix = meshRef.current.matrixWorld
    const inverseMatrix = new Matrix4()
    inverseMatrix.copy(worldMatrix).invert()
    setWorldToObjectMatrix(inverseMatrix)
    meshRef.current.material.uniforms.uInverseModelMat.value.copy(inverseMatrix)
    meshRef.current.updateMatrixWorld()

    // camera position
    meshRef.current.material.uniforms.uCamPos.value.copy(camera.position)

    // camera direction
    camera.getWorldDirection(forward)
    meshRef.current.material.uniforms.uForward.value.copy(forward)
  })

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
      uForward: {
        type: "v3",
        value: new Vector3(0, 0, -1),
      },
      uResolution: {
        type: "v2",
        value: new Vector2(size.width, size.height).multiplyScalar(
          Math.min(window.devicePixelRatio, 2)
        ),
      },
      viewportSize: { value: new Vector2(viewport.width, viewport.height) },
    }),
    [(viewport.width, viewport.height)]
  )

  return (
    <>
      <OrbitControls />
      <mesh
        ref={meshRef}
        rotation={[Math.PI / 8, Math.PI / 8, Math.PI / 8]}
        position={position}
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
