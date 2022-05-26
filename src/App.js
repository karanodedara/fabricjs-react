import React, { Suspense, useRef, useState, useEffect, useMemo } from "react";
import {
  extend,
  Canvas,
  useFrame,
  useLoader,
  useThree
} from "react-three-fiber";
import { ContactShadows, Environment, useGLTF, OrbitControls } from "drei";
import { HexColorPicker } from "react-colorful";
import { proxy, useProxy } from "valtio";
import * as THREE from "three";
import { TextureLoader } from "three/src/loaders/TextureLoader.js";
import { DecalGeometry } from "three/examples/jsm/geometries/DecalGeometry.js";
import { DragControls } from "three/examples/jsm/controls/DragControls";
import "./styles.css";
// Using a Valtio state model to bridge reactivity between
// the canvas and the dom, both can write to it and/or react to it.
const state = proxy({
  current: null,
  items: {
    laces: "#ffffff",
    mesh: "#ffffff",
    caps: "#ffffff",
    inner: "#ffffff",
    sole: "#ffffff",
    stripes: "#ffffff",
    band: "#ffffff",
    patch: "#ffffff"
  },
  txt: "",
  model: null
});

extend({ DecalGeometry, DragControls });

function Shoe(props) {
  let doggos = "TikTok-Logo.png";
  let texture = useLoader(THREE.TextureLoader, doggos);

  const ref = useRef();
  const snap = useProxy(state);
  const position = new THREE.Vector3();
  const orientation = new THREE.Euler();
  const sizes = new THREE.Vector3(10, 10, 10);

  const intersection = {
    intersects: false,
    point: new THREE.Vector3(),
    normal: new THREE.Vector3()
  };

  // The drei useGLTF hook sets up draco automatically, that's how it differs from useLoader(GLTFLoader, url)
  // { nodes, materials } are extras that come from useLoader, these do not exist in threejs
  // nodes is a named collection of meshes, materials a named collection of materials
  const { nodes, materials, scene } = useGLTF("shoe-draco.glb");

  // load textures

  const txt1 = new THREE.TextureLoader().load(props.texture);

  txt1.wrapS = txt1.wrapT = THREE.RepeatWrapping;
  txt1.repeat.set(4, 4);
  txt1.anisotropy = 16;

  // Animate model
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    /*if (ref.current?.rotation) {
      ref.current.rotation.z = -0.2 - (1 + Math.sin(t / 1.5)) / 20;
      ref.current.rotation.x = Math.cos(t / 4) / 8;
      ref.current.rotation.y = Math.sin(t / 4) / 8;
      ref.current.position.y = (1 + Math.sin(t / 1.5)) / 10;
    }*/
  });
  // Cursor showing current color
  const [hovered, set] = useState(null);

  useEffect(() => {
    const cursor = `<svg width="64" height="64" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0)"><path d="M29.5 54C43.031 54 54 43.031 54 29.5S43.031 5 29.5 5 5 15.969 5 29.5 15.969 54 29.5 54z" stroke="#000"/><g filter="url(#filter0_d)"><path d="M29.5 47C39.165 47 47 39.165 47 29.5S39.165 12 29.5 12 12 19.835 12 29.5 19.835 47 29.5 47z" fill="${snap.items[hovered]}"/></g><path d="M2 2l11 2.947L4.947 13 2 2z" fill="#000"/><text fill="#000" style="white-space:pre" font-family="Inter var, sans-serif" font-size="10" letter-spacing="-.01em"><tspan x="35" y="63">${hovered}</tspan></text></g><defs><clipPath id="clip0"><path fill="#fff" d="M0 0h64v64H0z"/></clipPath><filter id="filter0_d" x="6" y="8" width="47" height="47" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feColorMatrix in="SourceAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"/><feOffset dy="2"/><feGaussianBlur stdDeviation="3"/><feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.15 0"/><feBlend in2="BackgroundImageFix" result="effect1_dropShadow"/><feBlend in="SourceGraphic" in2="effect1_dropShadow" result="shape"/></filter></defs></svg>`;
    const auto = `<svg width="64" height="64" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M29.5 54C43.031 54 54 43.031 54 29.5S43.031 5 29.5 5 5 15.969 5 29.5 15.969 54 29.5 54z" stroke="#000"/><path d="M2 2l11 2.947L4.947 13 2 2z" fill="#000"/></svg>`;
    document.body.style.cursor = `url('data:image/svg+xml;base64,${btoa(
      hovered ? cursor : auto
    )}'), auto`;
  }, [hovered]);

  const onChangeCurrentColor = (e) => {
    e.stopPropagation();
    state.current = e.object.material.name;
  };

  const getTexture = () => {
    const texture = props.texture === "default" ? materials.mesh : txt1;
    return texture;
  };

  useMemo(() => {
    position.copy(intersection.point);
    texture.wrapT = texture.wrapS = THREE.RepeatWrapping;
    texture.repeat.x = 1;
    orientation.z = 0.1;
    position.x = -0.7;
    position.y = -0.15;
    position.z = 1;
    sizes.set(props.width, props.height);
  }, [position, orientation, sizes]);

  // Using the GLTFJSX output here to wire in app-state and hook up events
  return (
    <>
      <group
        ref={ref}
        dispose={null}
        onPointerOver={(e) => (
          e.stopPropagation(), set(e.object.material.name)
        )}
        onPointerOut={(e) => e.intersections.length === 0 && set(null)}
        onPointerMissed={() => (state.current = null)}
        onClick={(e) => onChangeCurrentColor(e)}
      >
        <mesh
          geometry={nodes.shoe.geometry}
          material={materials.laces}
          material-color={snap.items.laces}
        />
        <group>
          {props.texture === "default" ? (
            <mesh
              geometry={nodes.shoe_1.geometry}
              material-color={snap.items.mesh}
              material={materials.mesh}
            />
          ) : (
            <mesh
              geometry={nodes.shoe_1.geometry}
              material-color={snap.items.mesh}
            >
              <meshPhongMaterial
                attach="material"
                args={[{ map: getTexture() }]}
                name="mesh"
              />
            </mesh>
          )}
          {doggos.length > 0 && (
            <mesh>
              <decalGeometry
                args={[nodes.shoe_1, position, orientation, sizes]}
              />
              <meshPhongMaterial
                map={texture}
                shininess={30}
                transparent
                specular={0x444444}
                depthTest
                depthWrite={false}
                polygonOffset
                polygonOffsetFactor={-4}
                wireframe={false}
                side={THREE.DoubleSide}
              />
            </mesh>
          )}
        </group>
        <mesh
          geometry={nodes.shoe_2.geometry}
          material={materials.caps}
          material-color={snap.items.caps}
        />
        <mesh
          geometry={nodes.shoe_3.geometry}
          material={materials.inner}
          material-color={snap.items.inner}
        />
        <mesh
          geometry={nodes.shoe_4.geometry}
          material={materials.sole}
          material-color={snap.items.sole}
        />
        <mesh
          geometry={nodes.shoe_5.geometry}
          material={materials.stripes}
          material-color={snap.items.stripes}
        />
        <mesh
          geometry={nodes.shoe_6.geometry}
          material={materials.band}
          material-color={snap.items.band}
        />
        <mesh
          geometry={nodes.shoe_7.geometry}
          material={materials.patch}
          material-color={snap.items.patch}
        />
      </group>
    </>
  );
}

function Picker() {
  const snap = useProxy(state);

  const presetColors = [
    "#cd9323",
    "#1a53d8",
    "#9a2151",
    "#0d6416",
    "#8d2808",
    "#fff",
    "#000"
  ];

  return (
    <div
      style={{
        display: snap.current ? "flex" : "none"
      }}
    >
      <SwatchesPicker
        color={snap.items[snap.current]}
        onChange={(color) => (state.items[snap.current] = color)}
        presetColors={presetColors}
      />
      <h1>{snap.current}</h1>
    </div>
  );
}

function SwatchesPicker({ onChange, presetColors }) {
  return (
    <div className="picker">
      {presetColors.map((presetColor) => (
        <button
          key={presetColor}
          className="picker_color"
          style={{ background: presetColor }}
          onClick={() => onChange(presetColor)}
        />
      ))}
    </div>
  );
}

const Textures = ({ selected, setSelected }) => {
  const colors = [
    {
      name: "default",
      color: "#FFF"
    },
    {
      name: "txt1",
      texture:
        "https://media.macphun.com/img/uploads/macphun/presets/15/gallery/Texture_Kit_02.jpg?w=940&h=625&resize=cover"
    },
    {
      name: "txt2",
      texture:
        "https://thumbs.dreamstime.com/b/texture-en-caoutchouc-de-mod%C3%A8le-de-chaussure-81021681.jpg"
    }
  ];
  const selectSwatch = (e) => {
    setSelected(e);
  };
  return (
    <div id="js-tray" className="tray">
      <div id="js-tray-slide" className="tray__slide">
        {colors.map((e, i) =>
          e.color ? (
            <div
              key={i}
              className="tray__swatch"
              data-key={`${i}`}
              style={{ background: e.color }}
              onClick={() => selectSwatch(e.name)}
            />
          ) : (
            <div
              key={i}
              className="tray__swatch"
              data-key={`${i}`}
              style={{ backgroundImage: `url(${e.texture})` }}
              onClick={() => selectSwatch(e.texture)}
            />
          )
        )}
      </div>
    </div>
  );
};

const ImportFile = ({ onChangeFile }) => {
  return (
    <div className="button-wrapper">
      <span className="label">Ajouter une image à ma paire</span>
      <input
        type="file"
        name="upload"
        id="upload"
        onChange={(e) => onChangeFile(e)}
        className="upload-box"
        placeholder="Upload File"
      />
    </div>
  );
};

const ModalPicker = ({
  onChangeFile,
  imagePreviewUrl,
  image,
  setImage,
  setModal,
  modal
}) => {
  if (!modal) {
    return null;
  }
  return (
    <div className="backdrop">
      <div className="modal">
        <div className="modal-header">
          <a
            href="#"
            type="button"
            className="modal-close-button"
            data-dismiss="modal"
            aria-label="Close"
            onClick={(e) => setModal(false)}
          >
            &times;
          </a>
        </div>
        <div className="content">
          <ImportFile onChangeFile={onChangeFile} image={image} />
          {imagePreviewUrl.length > 0 && (
            <>
              <img src={imagePreviewUrl} />
              <button
                className="valid-img"
                onClick={() => {
                  setImage();
                  setModal(false);
                }}
              >
                Valider
              </button>
            </>
          )}
        </div>
        <footer>
          <button className="toggle-button" onClick={(e) => setModal(false)}>
            Fermer
          </button>
        </footer>
      </div>
    </div>
  );
};

const OpenModalPicker = ({ setModal }) => {
  return (
    <div className="button-modal">
      <button onClick={() => setModal(true)}>Ajouter une image</button>
    </div>
  );
};

const RangeSizes = ({ setWidth, width, setHeight, height }) => {
  return (
    <>
      <div className="sizes">
        <p>Width</p>
        <input
          type="range"
          onChange={(e) => setWidth(e.target.value)}
          value={width}
          min="0"
          max="1"
          step="0.1"
        />
        <p>Height</p>
        <input
          type="range"
          onChange={(e) => setHeight(e.target.value)}
          value={height}
          min="0"
          max="1"
          step="0.1"
        />
      </div>
    </>
  );
};

export default function App() {
  const [selected, setSelected] = useState("default");
  const [width, setWidth] = useState(0.3);
  const [posX, setPosX] = useState(-0.7);
  const [posY, setPosY] = useState(-0.15);
  const [height, setHeight] = useState(0.15);
  const [modal, setModal] = useState(false);
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");
  const [image, setImage] = useState("");

  function onChangeFile(e) {
    const reader = new FileReader();
    const file = e.target.files[0];
    reader.onloadend = () => {
      setImage(file.name);
      setImagePreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);
    console.log("file", image, "path", imagePreviewUrl);
  }

  return (
    <>
      <Canvas
        concurrent
        pixelRatio={[1, 1.5]}
        camera={{ position: [0, 0, 2.75] }}
      >
        <ambientLight intensity={0.3} />
        <spotLight
          intensity={0.3}
          angle={0.1}
          penumbra={1}
          position={[5, 25, 20]}
        />
        <Suspense fallback={null}>
          <Shoe
            texture={selected}
            width={width}
            height={height}
            posX={posX}
            posY={posY}
            imagePreviewUrl={imagePreviewUrl}
            image={image}
          />
          <Environment files="royal_esplanade_1k.hdr" />
          <ContactShadows
            rotation-x={Math.PI / 2}
            position={[0, -0.8, 0]}
            opacity={0.25}
            width={10}
            height={10}
            blur={2}
            far={1}
          />
        </Suspense>
        <OrbitControls
          minPolarAngle={Math.PI / 2}
          maxPolarAngle={Math.PI / 2}
          enableZoom={false}
          enablePan={false}
        />
      </Canvas>
      <Picker />
      <Textures selected={selected} setSelected={setSelected} />
      <RangeSizes
        setWidth={setWidth}
        setHeight={setHeight}
        width={width}
        height={height}
      />
      <OpenModalPicker setModal={setModal} />
      <ModalPicker
        setImage={setImage}
        image={image}
        modal={modal}
        setModal={setModal}
        imagePreviewUrl={imagePreviewUrl}
        onChangeFile={onChangeFile}
      />
    </>
  );
}
