import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import vertex from "./shaders/vertex.glsl";
import fragment from "./shaders/fragment.glsl";
// import * as dat from "dat.gui";
// import gsap from "gsap";
const brush = new URL("./burash01.png", import.meta.url);
const image = new URL(
  "./sascha-bosshard-VmJDcG0rhDQ-unsplash.jpg",
  import.meta.url
);

export default class Sketch {
  constructor(options) {
    this.scene = new THREE.Scene();
    this.scene1 = new THREE.Scene();

    this.container = options.dom;
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(this.width, this.height);
    this.renderer.setClearColor(0x000000, 1);
    this.renderer.physicallyCorrectLights = true;
    this.renderer.outputEncoding = THREE.sRGBEncoding;

    this.container.appendChild(this.renderer.domElement);

    // this.camera = new THREE.PerspectiveCamera(
    //   70,
    //   window.innerWidth / window.innerHeight,
    //   0.001,
    //   1000
    // );
    // Orthographic camera is better for specifying exact sizes of objects in pixels.
    const frustrumSize = this.height;
    const aspect = this.width / this.height;
    this.camera = new THREE.OrthographicCamera(
      (frustrumSize * aspect) / -2,
      (frustrumSize * aspect) / 2,
      frustrumSize / 2,
      frustrumSize / -2,
      -1000,
      1000
    );
    this.camera.position.set(0, 0, 2);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    // this.time = 0;
    this.mouse = new THREE.Vector2(0, 0);
    this.prevMouse = new THREE.Vector2(0, 0);
    this.currentWave = 0;

    // FBO
    this.baseTexture = new THREE.WebGLRenderTarget(this.width, this.height, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
    });

    this.mouseEvents();
    this.addObjects();
    this.resize();
    this.render();
    this.setupResize();
  }

  mouseEvents() {
    window.addEventListener("mousemove", (e) => {
      this.mouse.x = e.clientX - this.width / 2;
      this.mouse.y = this.height / 2 - e.clientY;
    });
  }

  setupResize() {
    window.addEventListener("resize", this.setupResize.bind(this));
  }

  resize() {
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.renderer.setSize(this.width, this.height);
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
  }

  addObjects() {
    this.geometry = new THREE.PlaneGeometry(64, 64, 1, 1);

    this.max = 100;
    this.meshes = [];
    for (let i = 0; i < this.max; i++) {
      let m = new THREE.MeshBasicMaterial({
        map: new THREE.TextureLoader().load(brush.pathname),
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthTest: false,
        depthWrite: false,
      });

      let mesh = new THREE.Mesh(this.geometry, m);
      mesh.visible = false;
      mesh.rotation.z = 2 * Math.PI * Math.random();
      this.scene.add(mesh);
      this.meshes.push(mesh);
    }

    this.material = new THREE.ShaderMaterial({
      extensions: {
        derivatives: "#extension GL_OES_standard_derivatives : enable",
      },
      side: THREE.DoubleSide,
      vertexShader: vertex,
      fragmentShader: fragment,
      uniforms: {
        // time: { value: 0 },
        uDisplacement: { value: null },
        uTexture: { value: new THREE.TextureLoader().load(image.pathname) },
        // progress: { type: "f", value: 0 },
        // resolution: { value: new THREE.Vector4() },
      },
      side: THREE.DoubleSide,
    });
    this.geometryFullscreen = new THREE.PlaneGeometry(
      this.width,
      this.height,
      1,
      1
    );
    this.quad = new THREE.Mesh(this.geometryFullscreen, this.material);
    this.scene1.add(this.quad);
  }

  setNewWave(index, x, y) {
    let mesh = this.meshes[index];
    mesh.visible = true;
    mesh.position.x = x;
    mesh.position.y = y;
    mesh.scale.x = mesh.scale.y = 0.2;
    mesh.material.opacity = 0.5;
  }

  trackMousePos() {
    if (
      Math.abs(this.mouse.x - this.prevMouse.x) > 3 ||
      Math.abs(this.mouse.y - this.prevMouse.y) > 3
    ) {
      this.setNewWave(this.currentWave, this.mouse.x, this.mouse.y);
      this.currentWave = (this.currentWave + 1) % this.max;

      // console.log(this.currentWave);
    }
    this.prevMouse.x = this.mouse.x;
    this.prevMouse.y = this.mouse.y;
  }

  render() {
    this.trackMousePos();
    // this.time++;

    // How to merge 2 scenes
    this.renderer.setRenderTarget(this.baseTexture);
    this.renderer.render(this.scene, this.camera);
    this.material.uniforms.uDisplacement.value = this.baseTexture.texture;
    this.renderer.setRenderTarget(null);
    this.renderer.clear();
    this.renderer.render(this.scene1, this.camera);

    window.requestAnimationFrame(this.render.bind(this));
    this.meshes.forEach((mesh) => {
      if (mesh.visible) {
        mesh.rotation.z += 0.02;
        mesh.material.opacity *= 0.96;
        mesh.scale.x = mesh.scale.y = 0.982 * mesh.scale.x + 0.108;
        if (mesh.material.opacity < 0.002) mesh.visible = false;
      }
    });
  }
}

new Sketch({ dom: document.getElementById("container") });
