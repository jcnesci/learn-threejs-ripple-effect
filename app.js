import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import vertex from "./shaders/vertex.glsl";
import fragment from "./shaders/fragment.glsl";
// import * as dat from "dat.gui";
// import gsap from "gsap";
const brush = new URL("./burash01.png", import.meta.url);

export default class Sketch {
  constructor(options) {
    this.scene = new THREE.Scene();

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
    this.time = 0;

    this.isPlaying = true;

    this.addObjects();
    this.resize();
    this.render();
    this.setupResize();
  }

  setupResize() {
    window.addEventListener("resize", this.setupResize.bind(this));
  }

  resize() {
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.renderer.setSize(this.width, this.height);
    this.camera.aspect = this.width / this.height;

    // image cover (?)
    // this.imageAspect = 853 / 1280;
    // let a1, a2;
    // if (this.height / this.width > this.imageAspect) {
    //   a1 = (this.width / this.height) * this.imageAspect;
    //   a2 = 1;
    // } else {
    //   a1 = 1;
    //   a2 = this.height / this.width / this.imageAspect;
    // }
    // this.material.uniforms.resolution.value.x = this.width;
    // this.material.uniforms.resolution.value.y = this.height;
    // this.material.uniforms.resolution.value.z = a1;
    // this.material.uniforms.resolution.value.w = a2;

    this.camera.updateProjectionMatrix();
  }

  addObjects() {
    // this.geometry = new THREE.PlaneBufferGeometry(1, 1);
    this.geometry = new THREE.PlaneGeometry(100, 100, 1, 1);
    // this.material = new THREE.MeshNormalMaterial({ side: THREE.DoubleSide });
    // this.material = new THREE.ShaderMaterial({
    //   vertexShader: vertex,
    //   fragmentShader: fragment,
    //   uniforms: {
    //     progress: { type: "f", value: 0 },
    //   },
    //   side: THREE.DoubleSide,
    // });

    this.max = 3;
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
      // mesh.visible = false;
      mesh.rotation.z = 2 * Math.PI * Math.random();
      this.scene.add(mesh);
      this.meshes.push(mesh);
    }
  }

  render() {
    this.time++;
    this.renderer.render(this.scene, this.camera);
    window.requestAnimationFrame(this.render.bind(this));
  }
}

new Sketch({ dom: document.getElementById("container") });
