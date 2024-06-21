import { Canvas } from "@react-three/fiber"
import { Environment } from "@react-three/drei"

import "./index.css"

import Experience from "./Experience"
import Shader from "./Shader"

export default function App() {
  return (
    <Canvas orthographic shadows camera={{ position: [0, 0, 1], zoom: 200 }}>
      <Environment files="./textures/envmap.hdr" />
      <color attach="background" args={["#eeeeee"]} />
      <Experience />
      <Shader position={[-2, 0, 0]} />
    </Canvas>
  )
}
