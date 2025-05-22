
import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import { Bubble } from '@/types/bubble';
import { useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import { useReflectionStatus } from '@/hooks/useReflectionStatus';

interface BubbleProps {
  position: [number, number, number];
  size: number;
  color: string;
  bubble: Bubble;
}

const BubbleSphere: React.FC<BubbleProps> = ({ position, size, color, bubble }) => {
  const ref = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);
  const navigate = useNavigate();
  const { isReflected } = useReflectionStatus(bubble.id);
  
  useFrame((state) => {
    if (ref.current) {
      // Add subtle floating motion
      ref.current.position.y = position[1] + Math.sin(state.clock.getElapsedTime() * 0.5) * 0.1;
      // Gentle rotation
      ref.current.rotation.y += 0.001;
    }
  });
  
  const handleClick = () => {
    setClicked(true);
    // Navigate to bubble detail after a short delay (for animation)
    setTimeout(() => {
      navigate(`/bubble/${bubble.id}`);
    }, 500);
  };
  
  return (
    <group>
      <mesh 
        ref={ref}
        position={position}
        scale={clicked ? 1.5 : hovered ? 1.15 : 1}
        onClick={handleClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[size, 32, 32]} />
        <meshStandardMaterial 
          color={color} 
          transparent 
          opacity={0.7}
          emissive={color}
          emissiveIntensity={hovered ? 0.8 : isReflected ? 0.6 : 0.4}
          metalness={0.3}
          roughness={0.4}
        />
      </mesh>
      
      {/* Show label when hovered */}
      {hovered && (
        <Text
          position={[position[0], position[1] + size + 0.3, position[2]]}
          fontSize={0.2}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          {bubble.topic} ({bubble.reflect_count || 0})
        </Text>
      )}
    </group>
  );
};

interface BubbleWorldProps {
  bubbles: Bubble[];
}

const BubbleWorld: React.FC<BubbleWorldProps> = ({ bubbles }) => {
  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [0, 0, 15], fov: 60 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        <OrbitControls enableZoom={true} enablePan={false} />
        
        {bubbles.map((bubble, index) => {
          // Calculate position based on spiral pattern
          const angle = index * 0.5;
          const radius = 3 + index * 0.3;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle * 0.5) * 2;
          const z = Math.sin(angle) * radius;
          
          // Determine size and color based on reflection count more dramatically
          const reflectCount = bubble.reflect_count || 0;
          
          // More dramatic size scaling
          let size = 0.6 + (reflectCount * 0.08);
          // Cap size at a reasonable maximum
          size = Math.min(size, 2.2);
          
          // Vibrant color palette based on reflect count
          let color;
          if (reflectCount >= 15) {
            // Bright gold for highly reflected bubbles
            color = '#FFD700'; 
          } else if (reflectCount >= 10) {
            // Orange-gold
            color = '#FFA500';
          } else if (reflectCount >= 5) {
            // Brighter yellow
            color = '#FFDD33';
          } else if (reflectCount >= 1) {
            // Light yellow
            color = '#FFF59D';
          } else {
            // Default yellow for no reflections
            color = '#FFEB3B';
          }
          
          return (
            <BubbleSphere
              key={bubble.id}
              position={[x, y, z]}
              size={size}
              color={color}
              bubble={bubble}
            />
          );
        })}
      </Canvas>
    </div>
  );
};

export default BubbleWorld;
