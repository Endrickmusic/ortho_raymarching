import { useMemo, useRef, useEffect, useState, useCallback } from "react"
import { Vector2, Matrix4 } from "three"
import { useThree, useFrame } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"

import vertexShader from "./shaders/cube/vertexShader.js"
import fragmentShader from "./shaders/cube/fragmentShader.js"

export default function Experience() {
  const meshRef = useRef()
  const viewport = useThree((state) => state.viewport)
  const camera = useThree((state) => state.camera)

  const [worldToObjectMatrix, setWorldToObjectMatrix] = useState(new Matrix4())

  const mousePosition = useRef({ x: 0, y: 0 })

  const updateMousePosition = useCallback((e) => {
    mousePosition.current = { x: e.pageX, y: e.pageY }
  }, [])

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
    }),
    [viewport.width, viewport.height]
  )

  useEffect(() => {
    window.addEventListener("mousemove", updateMousePosition, false)
    console.log("mousePosition", mousePosition)
    return () => {
      window.removeEventListener("mousemove", updateMousePosition, false)
    }
  }, [updateMousePosition])

  useEffect(() => {
    const object = meshRef.current

    if (object) {
      object.updateMatrixWorld()
      const worldMatrix = object.matrixWorld
      const inverseMatrix = new Matrix4().copy(worldMatrix).invert()
      setWorldToObjectMatrix(inverseMatrix)
      console.log("World to Object Matrix:", inverseMatrix)
      meshRef.current.material.uniforms.uInverseModelMat.value = inverseMatrix
      meshRef.current.updateMatrixWorld()
    }
  }, [
    meshRef.current?.position,
    meshRef.current?.rotation,
    meshRef.current?.scale,
  ])

  useFrame((state) => {
    let time = state.clock.getElapsedTime()

    if (meshRef.current) {
    }

    // Update the uniform

    meshRef.current.material.uniforms.uCamPos.value = camera.position
    // meshRef.current.material.uniforms.uMouse.value = new Vector2(0, 0)

    meshRef.current.material.uniforms.uMouse.value = new Vector2(
      mousePosition.current.x,
      mousePosition.current.y
    )
  })

  return (
    <>
      <OrbitControls />
      <mesh
        ref={meshRef}
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
