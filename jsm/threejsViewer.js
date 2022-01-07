import * as THREE from "../threejs/build/three.module.js";
import { MarchingCubes } from '../threejs/examples/jsm/objects/MarchingCubes.js'
import { OrbitControls } from '../threejs/examples/jsm/controls/OrbitControls.js'

class threejsViewer {
    constructor(domElement) {
        this.mesh=null
        this.size = 0
        this.databuffer = null
        this.textureOption = 1
        this.threshold = 55
        this.enableLine = false
        this.data = null

        let width = domElement.clientWidth;
        let height = domElement.clientHeight;
        let materialList = {
            0: new THREE.MeshPhongMaterial({ color: 0xbbddff}),
            1: new THREE.MeshToonMaterial( { color: 0x112233}),
            2: new THREE.MeshNormalMaterial()
        }
        // Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(width, height);
        this.renderer.setClearColor(0xE6E6FA, 1.0)
        domElement.appendChild(this.renderer.domElement);

        // Scene
        this.scene = new THREE.Scene();

        // Camera
        let aspect = window.innerWidth / window.innerHeight;

        this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 50);
        this.camera.position.set(2, 1, 2)
        this.scene.add(this.camera)

        // Light
        let directionalLight = new THREE.DirectionalLight(0xffffff, 1)
        directionalLight.position.set(2, 1, 2)   
        this.scene.add(directionalLight)

        // Controller
        let controller = new OrbitControls(this.camera, this.renderer.domElement)
        controller.target.set(0, 0.5, 0)
        controller.update()
        
        //Axis Landmark
        const axesHelper = new THREE.AxesHelper(100)
        this.scene.add(axesHelper)

        // Ground
        const plane = new THREE.Mesh(
            new THREE.CircleGeometry(2, 30),
            new THREE.MeshPhongMaterial({ color: 0xbbddff, opacity:0.4, transparent: true })
        );
        plane.rotation.x = - Math.PI / 2;
        this.scene.add(plane);

        let scope = this
        this.renderScene = function () {
            requestAnimationFrame(scope.renderScene)
            scope.renderer.render(scope.scene, scope.camera);
        }

        //視窗變動時 ，更新畫布大小以及相機(投影矩陣)繪製的比例
        window.addEventListener('resize', () => {
            //update render canvas size
            let width = domElement.clientWidth
            let height = domElement.clientHeight
            this.renderer.setSize(width, height);

            //update camera project aspect
            this.camera.aspect = width / height
            this.camera.updateProjectionMatrix();
        })

        this.newMesh = (callback) => {

            let mesh = this.scene.getObjectByName('mesh')
            if (mesh) {
                this.scene.remove( mesh )
            }

            mesh = new MarchingCubes(this.size, materialList[this.textureOption])
            mesh.name = 'mesh'
            
            mesh.isolation = this.threshold
            mesh.position.set(0, 1, 0)
            
            callback(mesh)

            this.mesh = mesh
            this.scene.add(this.mesh)
        }

        this.updateMesh = () => {
            // let data = this.mesh.field
            
            for (let i = 0; i < this.size; i++) {
                for (let j = 0; j < this.size; j++) {
                    for (let k = 0; k < this.size; k++) {
                        let index = (i * this.size + j) * this.size + k
                        if (this.databuffer[index] >= this.threshold)
                            this.mesh.setCell(i, j, k, this.databuffer[index])
                        else this.mesh.setCell(i, j, k, 0)
                    }
                }
            }
        }

        this.changeMaterial = () => {
            this.mesh.material = materialList[this.textureOption]
        }

        this.download = () => {
            this.mesh.generateGeometry()
            return this.mesh
        }

        this.renderScene()
    }
}

export {
    threejsViewer
}
