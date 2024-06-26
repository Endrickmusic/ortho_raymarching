import { useMemo, useRef, useEffect, useState, useCallback } from "react"
import { Vector2, Matrix4, Vector3, MathUtils, Box3 } from "three"
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

    if (object) {
      object.updateMatrixWorld()
      const worldMatrix = object.matrixWorld
      const inverseMatrix = new Matrix4().copy(worldMatrix).invert()
      setWorldToObjectMatrix(inverseMatrix)
      console.log("World to Object Matrix:", inverseMatrix)
      meshRef.current.material.uniforms.uInverseModelMat.value = inverseMatrix
      meshRef.current.updateMatrixWorld()
    }
    // object.material.uniforms.uObjectScale.value = object.scale
    meshRef.current.material.uniforms.uObjectPosition.value =
      meshRef.current.position
    console.log(
      "meshRef.current.position",
      meshRef.current.material.uniforms.uObjectPosition.value
    )
  }, [
    meshRef.current?.position,
    meshRef.current?.rotation,
    meshRef.current?.scale,
  ])

  useFrame((state) => {
    let time = state.clock.getElapsedTime()

    // if (meshRef.current) {
    //   const geometry = meshRef.current.geometry
    //   geometry.computeBoundingBox()
    //   const bbox = geometry.boundingBox
    // }

    // if (meshRef.current.material) {
    //   meshRef.current.material.uniforms.uMinBound.set(
    //     bbox.min.x,
    //     bbox.min.y,
    //     bbox.min.z
    //   )
    //   meshRef.current.material.uniforms.uMaxBound.set(
    //     bbox.max.x,
    //     bbox.max.y,
    //     bbox.max.z
    //   )
    // }

    // Update the uniform
    meshRef.current.material.uniforms.uCamPos.value = camera.position
    // meshRef.current.material.uniforms.uMouse.value = new Vector2(0, 0)

    meshRef.current.material.uniforms.uMouse.value = new Vector2(
      mousePosition.current.x,
      mousePosition.current.y
    )
    camera.getWorldDirection(forward)
    meshRef.current.material.uniforms.uForward.value = forward

    meshRef.current.material.uniforms.uTime.value = time * 0.4
    meshRef.current.material.uniforms.uObjectScale.value.copy(
      meshRef.current.scale
    )

    meshRef.current.material.uniforms.uCamZoom.value = camera.zoom

    // console.log(
    //   "camera.getWorldDirection(forward)",
    //   camera.getWorldDirection(forward)
    // )
  })

  useEffect(() => {
    if (materialRef.current) {
      // Calculate the bounding box
      const bbox = new Box3().setFromObject(meshRef.current)
      materialRef.current.uniforms.uMinBound.value.copy(bbox.min)
      materialRef.current.uniforms.uMaxBound.value.copy(bbox.max)
      materialRef.current.uniforms.uObjectScale.value.set(
        meshRef.current.scale.x,
        meshRef.current.scale.y,
        meshRef.current.scale.z
      )
      console.log("bbox", bbox)
      console.log(
        "materialRef.current.uniforms.uObjectScale",
        materialRef.current.uniforms.uObjectScale
      )
    }
  }, [materialRef])

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
      viewportSize: {
        value: new Vector2(viewport.width, viewport.height),
      },
      uObjectScale: {
        value: new Vector3(1, 1, 1),
      },
      uCamZoom: {
        value: camera.zoom,
      },
      uMinBound: {
        value: new Vector3(),
      },
      uMaxBound: {
        value: new Vector3(),
      },
      uObjectPosition: {
        value: new Vector3(),
      },
    }),
    [(viewport.width, viewport.height)]
  )

  return (
    <>
      <OrbitControls />
      <mesh
        ref={meshRef}
        // rotation={[Math.PI / 4, Math.PI / 4, Math.PI / 2]}
        position={position}
        scale={[1, 4, 1]}
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
