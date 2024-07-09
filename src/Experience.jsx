import { useMemo, useRef, useEffect, useState, useCallback } from "react"
import { Vector2, Matrix4, Vector3, MathUtils } from "three"
import { useThree, useFrame } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"

import vertexShader from "./shaders/cube/vertexShader.js"
import fragmentShader from "./shaders/cube/fragmentShader.js"

export default function Experience({ position }) {
  const meshRef = useRef()
  const materialRef = useRef()
  const viewport = useThree((state) => state.viewport)
  const camera = useThree((state) => state.camera)
  const size = useThree((state) => state.size)

  const [worldToObjectMatrix, setWorldToObjectMatrix] = useState(new Matrix4())

  const mousePosition = useRef({ x: 0, y: 0 })

  const forward = new Vector3(0, 0, -1)

  // const nearPlaneWidth =
  //   camera.near *
  //   Math.tan(MathUtils.degToRad(camera.fov / 2) * camera.aspect * 2)

  const nearPlaneWidth = (camera.right - camera.left) / camera.zoom
  const nearPlaneHeight = (camera.top - camera.bottom) / camera.zoom

  console.log("nearPlaneWidth", camera.right, camera.left, camera.zoom)

  const updateMousePosition = useCallback((e) => {
    mousePosition.current = { x: e.pageX, y: e.pageY }
  }, [])

  useEffect(() => {
    window.addEventListener("mousemove", updateMousePosition, false)
    console.log("mousePosition", mousePosition)
    return () => {
      window.removeEventListener("mousemove", updateMousePosition, false)
    }
  }, [updateMousePosition])

  useEffect(() => {
    const object = meshRef.current

    // if (object) {
    //   object.updateMatrixWorld()
    //   const worldMatrix = object.matrixWorld
    //   const inverseMatrix = new Matrix4().copy(worldMatrix).invert()
    // materialRef.current.uniforms.uInverseModelMat = { value: new Matrix4() }
    //   setWorldToObjectMatrix(inverseMatrix)
    //   console.log("World to Object Matrix:", inverseMatrix)
    //   meshRef.current.material.uniforms.uInverseModelMat.value = inverseMatrix
    //   meshRef.current.updateMatrixWorld()
    // }
  }, [
    meshRef.current?.position,
    meshRef.current?.rotation,
    meshRef.current?.scale,
  ])

  useFrame((state) => {
    let time = state.clock.getElapsedTime()

    if (meshRef.current) {
    }
    // animation
    meshRef.current.rotation.x = time * 0.5
    // meshRef.current.rotation.y = time * 0.3

    meshRef.current.updateMatrixWorld()

    // meshRef.current.material.uniforms.uInverseModelMat.value
    //   .copy(meshRef.current.worldMatrix)
    //   .invert()
    // meshRef.current.material.uniforms.uModelViewMatrix.value.copy(
    //   meshRef.current.modelViewMatrix
    // )
    // meshRef.current.material.uniforms.uProjectionMatrix.value.copy(
    //   camera.projectionMatrix
    // )

    // Update the uniform

    meshRef.current.material.uniforms.uCamPos.value.copy(camera.position)

    meshRef.current.material.uniforms.uMouse.value.copy(
      new Vector2(mousePosition.current.x, mousePosition.current.y)
    )
    camera.getWorldDirection(forward)
    meshRef.current.material.uniforms.uForward.value.copy(forward)
    materialRef.current.needsUpdate = true
  })

  const uniforms = useMemo(
    () => ({
      uProjectionMatrix: { value: new Matrix4() },
      uModelViewMatrix: { value: new Matrix4() },
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
      uNearPlaneWidth: {
        type: "f",
        value: nearPlaneWidth,
      },
      uNearPlaneHeight: {
        type: "f",
        value: nearPlaneHeight,
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
        rotation={[Math.PI / 4, Math.PI / 4, Math.PI / 2]}
        position={position}
      >
        <boxGeometry args={[1, 1, 1]} />
        <shaderMaterial
          ref={materialRef}
          uniforms={uniforms}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          transparent={false}
        />
      </mesh>
    </>
  )
}
