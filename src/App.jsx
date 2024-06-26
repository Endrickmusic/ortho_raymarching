import { Canvas } from "@react-three/fiber"
import { Environment } from "@react-three/drei"

import "./index.css"

import Experience from "./Experience"
import Shader from "./Shader"

export default function App() {
  return (
    <Canvas
      orthographic
      shadows
      camera={{ position: [0, 0, 5], near: 0.005, far: 1000, zoom: 200 }}
    >
      {/* <Canvas shadows camera={{ position: [0, 0, 5], fov: 40 }}> */}
      <Environment files="./textures/envmap.hdr" />
      <color attach="background" args={["#eeeeee"]} />
      <Experience position={[0, 0, 0]} />
      <Shader position={[-2, 0, 0]} />
    </Canvas>
  )
}
