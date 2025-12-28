
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import type { Theme } from '../App';

interface ThreeBackgroundProps {
    showDragon: boolean;
    theme?: Theme;
}

export const ThreeBackground: React.FC<ThreeBackgroundProps> = ({ showDragon, theme = 'dark' }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const showDragonRef = useRef(showDragon);
    const themeRef = useRef(theme);

    // Keep refs in sync with prop for use inside the animation loop
    useEffect(() => {
        showDragonRef.current = showDragon;
    }, [showDragon]);

    useEffect(() => {
        themeRef.current = theme;
    }, [theme]);

    useEffect(() => {
        if (!containerRef.current) return;

        // --- SCENE SETUP ---
        const scene = new THREE.Scene();
        // Fog color matches theme
        // Dark: 0x000000, Light: 0xf0f4f8
        const fogColor = themeRef.current === 'dark' ? 0x000000 : 0xf0f4f8;
        scene.fog = new THREE.FogExp2(fogColor, 0.002);

        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
        camera.position.z = 120;

        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setClearColor(0x000000, 0); 
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        containerRef.current.appendChild(renderer.domElement);

        // --- 1. DYNAMIC SNOW ---
        const canvas = document.createElement('canvas');
        canvas.width = 32; canvas.height = 32;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(16, 16, 8, 0, Math.PI * 2);
            ctx.fill();
        }
        const particleTexture = new THREE.CanvasTexture(canvas);

        const snowCount = 6000;
        const snowGeo = new THREE.BufferGeometry();
        const snowPosArr = new Float32Array(snowCount * 3);
        const snowColArr = new Float32Array(snowCount * 3);
        const snowSizeArr = new Float32Array(snowCount);
        const snowData: { vy: number, vx: number, vz: number, hue: number, hueSpeed: number }[] = [];

        for (let i = 0; i < snowCount; i++) {
            snowPosArr[i * 3] = (Math.random() - 0.5) * 600;     
            snowPosArr[i * 3 + 1] = (Math.random() - 0.5) * 600; 
            snowPosArr[i * 3 + 2] = (Math.random() - 0.5) * 400; 

            // Initial colors - will be updated in loop
            snowColArr[i * 3] = 1;
            snowColArr[i * 3 + 1] = 1;
            snowColArr[i * 3 + 2] = 1;

            snowSizeArr[i] = Math.random() * 1.5 + 0.5;

            snowData.push({
                vy: -(0.05 + Math.random() * 0.15),
                vx: (Math.random() - 0.5) * 0.08,
                vz: (Math.random() - 0.5) * 0.08,
                hue: Math.random(),
                hueSpeed: 0.0005 + Math.random() * 0.001
            });
        }

        snowGeo.setAttribute('position', new THREE.BufferAttribute(snowPosArr, 3));
        snowGeo.setAttribute('color', new THREE.BufferAttribute(snowColArr, 3));
        snowGeo.setAttribute('size', new THREE.BufferAttribute(snowSizeArr, 1));

        const snowMat = new THREE.ShaderMaterial({
            uniforms: { pointTexture: { value: particleTexture } },
            vertexShader: `
                attribute float size;
                attribute vec3 color;
                varying vec3 vColor;
                void main() {
                    vColor = color;
                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                    gl_PointSize = size * (300.0 / -mvPosition.z);
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                uniform sampler2D pointTexture;
                varying vec3 vColor;
                void main() {
                    gl_FragColor = vec4(vColor, 1.0) * texture2D(pointTexture, gl_PointCoord);
                }
            `,
            transparent: true,
            blending: THREE.NormalBlending, // Changed from Additive to Normal for better visibility in light mode
            depthWrite: false
        });

        const snowSystem = new THREE.Points(snowGeo, snowMat);
        scene.add(snowSystem);

        // --- 2. DETAILED VECTOR CHINESE DRAGON ---
        const dragonSegments: THREE.Group[] = [];
        const numSegments = 50;
        const pathResolution = 4; 
        const dragonPathHistory: THREE.Vector3[] = [];
        const dragonRotHistory: THREE.Quaternion[] = []; 

        const dragonMat = new THREE.LineBasicMaterial({ color: 0xffffff });

        // Helpers
        const createLineMesh = (geo: THREE.BufferGeometry) => {
            const edges = new THREE.EdgesGeometry(geo);
            return new THREE.LineSegments(edges, dragonMat);
        };

        // --- HEAD GROUP ---
        const headGroup = new THREE.Group();
        
        // 1. Cranium (Back of head)
        const craniumGeo = new THREE.BoxGeometry(5, 5, 6);
        const cranium = createLineMesh(craniumGeo);
        headGroup.add(cranium);

        // 2. Snout
        const snoutGeo = new THREE.BoxGeometry(4, 3, 5);
        snoutGeo.translate(0, -1, 5.5); // Push forward
        const snout = createLineMesh(snoutGeo);
        headGroup.add(snout);

        // 3. Jaw
        const jawGeo = new THREE.BoxGeometry(3.5, 1, 4.5);
        jawGeo.translate(0, -3.5, 5);
        const jaw = createLineMesh(jawGeo);
        headGroup.add(jaw);

        // 4. Horns (Antlers)
        const hornStemGeo = new THREE.CylinderGeometry(0.5, 1, 6, 4);
        hornStemGeo.translate(0, 3, 0);
        const hornStem = createLineMesh(hornStemGeo);
        
        const leftHorn = hornStem.clone();
        leftHorn.position.set(-2, 2, -2);
        leftHorn.rotation.z = 0.5;
        leftHorn.rotation.x = -0.5;
        headGroup.add(leftHorn);

        const rightHorn = hornStem.clone();
        rightHorn.position.set(2, 2, -2);
        rightHorn.rotation.z = -0.5;
        rightHorn.rotation.x = -0.5;
        headGroup.add(rightHorn);

        // 5. Eyes
        const eyeGeo = new THREE.OctahedronGeometry(1, 0);
        const leftEye = createLineMesh(eyeGeo);
        leftEye.position.set(-2.5, 1, 3);
        leftEye.scale.set(1, 0.5, 1);
        headGroup.add(leftEye);

        const rightEye = createLineMesh(eyeGeo);
        rightEye.position.set(2.5, 1, 3);
        rightEye.scale.set(1, 0.5, 1);
        headGroup.add(rightEye);

        // 6. Whiskers
        const whiskerMat = new THREE.LineBasicMaterial({ color: 0xffffff, opacity: 0.7, transparent: true });
        const whiskerPts = new Array(12).fill(new THREE.Vector3(0,0,0));
        const whiskerLGeo = new THREE.BufferGeometry().setFromPoints(whiskerPts);
        const whiskerRGeo = new THREE.BufferGeometry().setFromPoints(whiskerPts);
        const whiskerL = new THREE.Line(whiskerLGeo, whiskerMat);
        const whiskerR = new THREE.Line(whiskerRGeo, whiskerMat);
        scene.add(whiskerL); 
        scene.add(whiskerR);
        scene.add(headGroup);

        // --- LEG FACTORY ---
        const createLeg = (side: 'left' | 'right') => {
            const legGroup = new THREE.Group();
            
            // Upper Leg
            const upperGeo = new THREE.BoxGeometry(1.5, 4, 1.5);
            upperGeo.translate(0, -2, 0); // Pivot at top
            const upper = createLineMesh(upperGeo);
            
            // Lower Leg
            const lowerGeo = new THREE.BoxGeometry(1.2, 4, 1.2);
            lowerGeo.translate(0, -2, 0);
            const lower = createLineMesh(lowerGeo);
            lower.position.y = -4; // Attach to bottom of upper
            lower.rotation.x = 0.5; // Default bend

            // Claw
            const clawGeo = new THREE.ConeGeometry(1, 2, 4);
            clawGeo.translate(0, -1, 0);
            clawGeo.rotateX(Math.PI/2);
            const claw = createLineMesh(clawGeo);
            claw.position.y = -4;
            lower.add(claw);

            upper.add(lower);
            legGroup.add(upper);

            // Positioning relative to body segment
            legGroup.position.set(side === 'left' ? -3 : 3, 0, 0);
            // Initial Angle
            legGroup.rotation.z = side === 'left' ? 0.3 : -0.3;

            return { group: legGroup, upper: upper, lower: lower };
        };

        const legSegments = [8, 32];
        const legsData: { 
            segmentIndex: number, 
            left: { group: THREE.Group, upper: THREE.Object3D, lower: THREE.Object3D }, 
            right: { group: THREE.Group, upper: THREE.Object3D, lower: THREE.Object3D } 
        }[] = [];

        // --- BODY CONSTRUCTION ---
        const bodyGeo = new THREE.BoxGeometry(4, 4, 5);
        const spineGeo = new THREE.ConeGeometry(1, 2, 4);
        spineGeo.rotateX(-Math.PI/4); // Point back
        spineGeo.translate(0, 3, 0);

        for (let i = 0; i < numSegments; i++) {
            const segmentGroup = new THREE.Group();
            const bodyMesh = createLineMesh(bodyGeo);
            
            let scale = 1.0;
            if (i > numSegments - 15) {
                scale = 1.0 - ((i - (numSegments - 15)) / 15);
                scale = Math.max(0.2, scale);
            }
            segmentGroup.scale.set(scale, scale, scale);
            
            const spine = createLineMesh(spineGeo);
            bodyMesh.add(spine);
            
            segmentGroup.add(bodyMesh);
            scene.add(segmentGroup);
            dragonSegments.push(segmentGroup);

            if (legSegments.includes(i)) {
                const lLeg = createLeg('left');
                const rLeg = createLeg('right');
                segmentGroup.add(lLeg.group);
                segmentGroup.add(rLeg.group);
                legsData.push({ segmentIndex: i, left: lLeg, right: rLeg });
            }
        }

        // --- 3. MOUSE TRAIL ---
        // Trail disabled for performance simplicity here, re-enable if needed
        
        // --- INTERACTION & PHYSICS STATE ---
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2(-999, -999);
        const mousePlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
        
        // Dragon Physics
        const headVel = new THREE.Vector3(0,0,0);
        let lastMouseTime = 0; // Track when mouse last moved

        const handleMouseMove = (e: MouseEvent) => {
            mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
            lastMouseTime = Date.now();
        };
        // Removed mousedown/flinch logic
        window.addEventListener('mousemove', handleMouseMove);

        // --- ANIMATION ---
        let time = 0;
        const animate = () => {
            time += 0.01; // Slower global time factor
            const isLight = themeRef.current === 'light';

            // 1. Snow Color & Movement
            const pos = snowGeo.attributes.position.array as Float32Array;
            const col = snowGeo.attributes.color.array as Float32Array;
            
            for (let i = 0; i < snowCount; i++) {
                pos[i * 3] += snowData[i].vx;
                pos[i * 3 + 1] += snowData[i].vy;
                pos[i * 3 + 2] += snowData[i].vz;
                if (pos[i * 3 + 1] < -300) pos[i * 3 + 1] = 300;
                if (pos[i * 3] < -300) pos[i * 3] = 300;
                if (pos[i * 3] > 300) pos[i * 3] = -300;
                
                // Color cycle snow
                snowData[i].hue = (snowData[i].hue + snowData[i].hueSpeed) % 1.0;
                
                let c;
                if (isLight) {
                    // Dark snow for light mode (slate blueish)
                    c = new THREE.Color().setHSL(snowData[i].hue, 0.6, 0.4); 
                } else {
                    // Bright snow for dark mode
                    c = new THREE.Color().setHSL(snowData[i].hue, 0.8, 0.6);
                }
                
                col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
            }
            snowGeo.attributes.position.needsUpdate = true;
            snowGeo.attributes.color.needsUpdate = true;
            snowSystem.rotation.y += 0.0002;

            // 2. Dragon Pathing
            const isDragonVisible = showDragonRef.current;
            headGroup.visible = isDragonVisible;
            whiskerL.visible = isDragonVisible;
            whiskerR.visible = isDragonVisible;
            dragonSegments.forEach(s => s.visible = isDragonVisible);

            // Dragon Color Update
            const dragonColor = isLight ? 0x333333 : 0xffffff;
            if (whiskerMat.color.getHex() !== dragonColor) {
                whiskerMat.color.setHex(dragonColor);
            }

            let targetPos = new THREE.Vector3();
            const isIdle = Date.now() - lastMouseTime > 2000;

            if (!isIdle && mouse.x !== -999) {
                raycaster.setFromCamera(mouse, camera);
                raycaster.ray.intersectPlane(mousePlane, targetPos);
            } else {
                targetPos.set(
                    Math.sin(time * 0.3) * 120,
                    Math.cos(time * 0.2) * 80,
                    Math.sin(time * 0.5) * 30
                );
            }

            targetPos.x += Math.cos(time * 1.5) * 15;
            targetPos.y += Math.sin(time * 2.0) * 15;

            const forceMult = isIdle ? 0.005 : 0.008; 
            const force = targetPos.clone().sub(headGroup.position).multiplyScalar(forceMult);
            headVel.add(force);
            headVel.multiplyScalar(0.96);

            const maxSpeed = isIdle ? 1.0 : 1.8;
            if (headVel.length() > maxSpeed) headVel.setLength(maxSpeed);

            headGroup.position.add(headVel);
            
            const lookPoint = headGroup.position.clone().add(headVel.clone().multiplyScalar(20));
            headGroup.lookAt(lookPoint);

            dragonPathHistory.unshift(headGroup.position.clone());
            dragonRotHistory.unshift(headGroup.quaternion.clone());
            
            const maxHistory = numSegments * pathResolution + 20;
            if (dragonPathHistory.length > maxHistory) {
                dragonPathHistory.pop();
                dragonRotHistory.pop();
            }

            for (let i = 0; i < numSegments; i++) {
                const targetIdx = i * pathResolution;
                if (dragonPathHistory[targetIdx] && dragonRotHistory[targetIdx]) {
                    const segment = dragonSegments[i];
                    segment.position.copy(dragonPathHistory[targetIdx]);
                    segment.quaternion.slerp(dragonRotHistory[targetIdx], 0.15); 

                    const hue = (time * 0.1 + i * 0.02) % 1.0;
                    
                    let col;
                    if (isLight) {
                        col = new THREE.Color().setHSL(hue, 0.8, 0.3); // Darker rainbow
                    } else {
                        col = new THREE.Color().setHSL(hue, 1.0, 0.5); // Bright rainbow
                    }
                    
                    segment.traverse((child) => {
                        if (child instanceof THREE.LineSegments || child instanceof THREE.Line) {
                            (child.material as THREE.LineBasicMaterial).color.copy(col);
                        }
                    });
                }
            }

            // Head Color Update
            const headHue = (time * 0.1) % 1.0;
            const headCol = isLight ? new THREE.Color().setHSL(headHue, 0.8, 0.3) : new THREE.Color().setHSL(headHue, 1.0, 0.6);
            
            headGroup.traverse((child) => {
                if (child instanceof THREE.LineSegments || child instanceof THREE.Line) {
                    (child.material as THREE.LineBasicMaterial).color.copy(headCol);
                }
            });

            // Animate Legs
            legsData.forEach((legData, i) => {
                const offset = i * Math.PI; 
                const legSpeed = time * 4;
                const hipRot = Math.sin(legSpeed + offset) * 0.5;
                const kneeRot = Math.abs(Math.cos(legSpeed + offset)) * 0.5 + 0.2;
                const paddle = Math.sin(legSpeed + offset) * 0.3;

                legData.left.upper.rotation.x = hipRot;
                legData.left.lower.rotation.x = -kneeRot;
                legData.left.group.rotation.z = 0.3 + paddle;

                const rOffset = offset + Math.PI;
                const rHipRot = Math.sin(legSpeed + rOffset) * 0.5;
                const rKneeRot = Math.abs(Math.cos(legSpeed + rOffset)) * 0.5 + 0.2;
                const rPaddle = Math.sin(legSpeed + rOffset) * 0.3;

                legData.right.upper.rotation.x = rHipRot;
                legData.right.lower.rotation.x = -rKneeRot;
                legData.right.group.rotation.z = -0.3 - rPaddle;
            });

            // Whiskers
            headGroup.updateMatrixWorld();
            const wLeftStart = new THREE.Vector3(-2, -1, 5).applyMatrix4(headGroup.matrixWorld);
            const wRightStart = new THREE.Vector3(2, -1, 5).applyMatrix4(headGroup.matrixWorld);
            
            const wPosL = whiskerLGeo.attributes.position.array as Float32Array;
            const wPosR = whiskerRGeo.attributes.position.array as Float32Array;

            wPosL[0] = wLeftStart.x; wPosL[1] = wLeftStart.y; wPosL[2] = wLeftStart.z;
            wPosR[0] = wRightStart.x; wPosR[1] = wRightStart.y; wPosR[2] = wRightStart.z;

            for (let j = 1; j < 12; j++) {
                const prevLX = wPosL[(j-1)*3];
                const prevLY = wPosL[(j-1)*3+1];
                const prevLZ = wPosL[(j-1)*3+2];
                
                const noiseX = Math.sin(time * 2 + j) * 0.5;
                const noiseY = Math.cos(time * 3 + j) * 0.5;

                wPosL[j*3] += (prevLX - wPosL[j*3]) * 0.3 + noiseX;
                wPosL[j*3+1] += (prevLY - wPosL[j*3+1]) * 0.3 + noiseY;
                wPosL[j*3+2] += (prevLZ - wPosL[j*3+2]) * 0.3;

                const prevRX = wPosR[(j-1)*3];
                const prevRY = wPosR[(j-1)*3+1];
                const prevRZ = wPosR[(j-1)*3+2];

                wPosR[j*3] += (prevRX - wPosR[j*3]) * 0.3 + noiseX;
                wPosR[j*3+1] += (prevRY - wPosR[j*3+1]) * 0.3 + noiseY;
                wPosR[j*3+2] += (prevRZ - wPosR[j*3+2]) * 0.3;
            }
            whiskerLGeo.attributes.position.needsUpdate = true;
            whiskerRGeo.attributes.position.needsUpdate = true;

            renderer.render(scene, camera);
            requestAnimationFrame(animate);
        };

        animate();

        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('resize', handleResize);
            if (containerRef.current) containerRef.current.innerHTML = '';
            renderer.dispose();
            snowGeo.dispose();
            snowMat.dispose();
            // Dispose dragon geometries
            bodyGeo.dispose();
            spineGeo.dispose();
            craniumGeo.dispose();
            snoutGeo.dispose();
            jawGeo.dispose();
            hornStemGeo.dispose();
            eyeGeo.dispose();
            whiskerLGeo.dispose();
            whiskerRGeo.dispose();
        };
    }, []);

    return (
        <div 
            ref={containerRef} 
            className="fixed top-0 left-0 w-full h-full z-[100] pointer-events-none"
        />
    );
};
