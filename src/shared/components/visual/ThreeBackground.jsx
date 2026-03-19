import { useEffect, useRef } from 'react';

const ThreeBackground = () => {
    const containerRef = useRef();

    useEffect(() => {
        if (!containerRef.current) return;

        const container = containerRef.current;

        let renderer, scene, camera, points, geometry, material;
        let animationFrameId;

        const init = async () => {
            const THREE = await import('three');

            // Scene setup
            scene = new THREE.Scene();
            camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            if (containerRef.current) {
                containerRef.current.appendChild(renderer.domElement);
            }

            // Particles
            const particlesCount = 1500;
            const positions = new Float32Array(particlesCount * 3);
            const colors = new Float32Array(particlesCount * 3);

            const colorPalette = [
                new THREE.Color('#3b82f6'), // primary blue
                new THREE.Color('#10b981'), // primary green
                new THREE.Color('#f59e0b'), // amber
                new THREE.Color('#ffffff'), // white
            ];

            for (let i = 0; i < particlesCount * 3; i += 3) {
                positions[i] = (Math.random() - 0.5) * 15;
                positions[i + 1] = (Math.random() - 0.5) * 15;
                positions[i + 2] = (Math.random() - 0.5) * 15;

                const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
                colors[i] = color.r;
                colors[i + 1] = color.g;
                colors[i + 2] = color.b;
            }

            geometry = new THREE.BufferGeometry();
            geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

            material = new THREE.PointsMaterial({
                size: 0.05,
                vertexColors: true,
                transparent: true,
                opacity: 0.6,
                sizeAttenuation: true,
            });

            points = new THREE.Points(geometry, material);
            scene.add(points);

            camera.position.z = 5;

            const animate = () => {
                animationFrameId = requestAnimationFrame(animate);

                points.rotation.y += 0.001;
                points.rotation.x += 0.0005;

                // Subtle mouse parallax logic kept local
                const currentMouseX = window.__mouseX || 0;
                const currentMouseY = window.__mouseY || 0;

                camera.position.x += (currentMouseX * 0.5 - camera.position.x) * 0.05;
                camera.position.y += (-currentMouseY * 0.5 - camera.position.y) * 0.05;
                camera.lookAt(scene.position);

                renderer.render(scene, camera);
            };

            animate();
        };

        init();

        // Mouse move handler
        const handleMouseMove = (event) => {
            window.__mouseX = (event.clientX / window.innerWidth - 0.5) * 2;
            window.__mouseY = (event.clientY / window.innerHeight - 0.5) * 2;
        };

        window.addEventListener('mousemove', handleMouseMove);

        // Resize handler
        const handleResize = () => {
            if (camera && renderer) {
                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(window.innerWidth, window.innerHeight);
            }
        };

        window.addEventListener('resize', handleResize);

        // Cleanup
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('resize', handleResize);
            if (animationFrameId) cancelAnimationFrame(animationFrameId);

            if (container && renderer) {
                container.removeChild(renderer.domElement);
            }
            if (geometry) geometry.dispose();
            if (material) material.dispose();
            if (renderer) renderer.dispose();
        };
    }, []);

    return (
        <div
            ref={containerRef}
            className="fixed inset-0 -z-10 bg-gradient-to-br from-slate-50 to-white pointer-events-none"
        />
    );
};

export default ThreeBackground;
