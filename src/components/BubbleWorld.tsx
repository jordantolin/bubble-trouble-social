
import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import { Bubble } from '@/types/bubble';
import { useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import { useReflectionStatus } from '@/hooks/useReflectionStatus';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';

interface BubbleProps {
  position: [number, number, number];
  size: number;
  color: string;
  bubble: Bubble;
  isTargetBubble: boolean;
  onBubbleClick: (id: string) => void;
}

// Camera animation controller
const CameraController = ({ targetPosition, isAnimating, onAnimationComplete }: { 
  targetPosition: THREE.Vector3 | null, 
  isAnimating: boolean,
  onAnimationComplete: () => void
}) => {
  const { camera } = useThree();
  const initialPos = useRef(new THREE.Vector3(0, 0, 15));
  
  useFrame(() => {
    if (isAnimating && targetPosition) {
      // Calculate direction to target
      const cameraDirection = new THREE.Vector3();
      cameraDirection.subVectors(targetPosition, camera.position);
      
      // Move camera closer to bubble (but stop short to see it properly)
      if (cameraDirection.length() > 3) {
        cameraDirection.normalize();
        cameraDirection.multiplyScalar(0.2); // Adjust speed of camera movement
        camera.position.add(cameraDirection);
      } else {
        // Animation complete - trigger callback
        onAnimationComplete();
      }
    }
  });
  
  // Reset camera position when not animating
  useEffect(() => {
    if (!isAnimating) {
      camera.position.copy(initialPos.current);
    }
  }, [isAnimating, camera]);
  
  return null;
};

const BubbleSphere: React.FC<BubbleProps> = ({ position, size, color, bubble, isTargetBubble, onBubbleClick }) => {
  const ref = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const { isReflected } = useReflectionStatus(bubble.id);
  const originalPosition = useRef(new THREE.Vector3(position[0], position[1], position[2]));
  
  useFrame((state) => {
    if (ref.current) {
      if (!isTargetBubble) {
        // Normal animation for non-target bubbles
        ref.current.position.y = position[1] + Math.sin(state.clock.getElapsedTime() * 0.5) * 0.1;
        ref.current.rotation.y += 0.001;
      } else {
        // Target bubble animation (center it)
        ref.current.position.lerp(new THREE.Vector3(0, 0, 0), 0.05);
        ref.current.rotation.y += 0.005;
      }
    }
  });
  
  const handleClick = () => {
    onBubbleClick(bubble.id);
  };
  
  // Calculate opacity based on whether this is the target bubble
  const opacity = isTargetBubble ? 0.9 : hovered ? 0.8 : 0.7;
  // Fade out non-target bubbles when a target is selected
  const fadeOpacity = isTargetBubble ? 1 : (isTargetBubble === false) ? 0.3 : 1;
  
  return (
    <group>
      <mesh 
        ref={ref}
        position={position}
        scale={isTargetBubble ? 1.5 : hovered ? 1.15 : 1}
        onClick={handleClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[size, 32, 32]} />
        <meshStandardMaterial 
          color={color} 
          transparent 
          opacity={opacity * fadeOpacity}
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

// Tooltip component for 2D overlay
const BubbleTooltip: React.FC<{bubble: Bubble | null, position: {x: number, y: number}, visible: boolean}> = ({
  bubble, position, visible
}) => {
  if (!visible || !bubble) return null;
  
  return (
    <div 
      className="absolute pointer-events-none bg-black bg-opacity-80 text-white px-3 py-2 rounded-md text-sm z-50"
      style={{
        left: position.x + 15,
        top: position.y - 15,
        transform: 'translateY(-100%)',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.2s ease'
      }}
    >
      <p className="font-bold">{bubble.topic}</p>
      <p>Reflections: {bubble.reflect_count || 0}</p>
      <p className="text-xs opacity-80">Click to zoom</p>
    </div>
  );
};

interface BubbleWorldProps {
  bubbles: Bubble[];
}

const BubbleWorld: React.FC<BubbleWorldProps> = ({ bubbles }) => {
  const [targetBubble, setTargetBubble] = useState<string | null>(null);
  const [targetPosition, setTargetPosition] = useState<THREE.Vector3 | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const navigate = useNavigate();
  const [hoveredBubble, setHoveredBubble] = useState<Bubble | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [tooltipVisible, setTooltipVisible] = useState(false);
  
  // Handle mouse movement for tooltip
  const handleMouseMove = (e: React.MouseEvent) => {
    setTooltipPosition({ x: e.clientX, y: e.clientY });
  };
  
  const handleBubbleClick = (id: string) => {
    // Find the bubble's position
    const bubbleIndex = bubbles.findIndex(b => b.id === id);
    if (bubbleIndex >= 0) {
      const angle = bubbleIndex * 0.5;
      const radius = 3 + bubbleIndex * 0.3;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle * 0.5) * 2;
      const z = Math.sin(angle) * radius;
      
      // Set the target position for camera animation
      setTargetPosition(new THREE.Vector3(x, y, z));
      setTargetBubble(id);
      setIsAnimating(true);
    }
  };
  
  // Handle 3D animation completion
  const handleAnimationComplete = () => {
    // Navigate to bubble detail after animation completes
    if (targetBubble) {
      setTimeout(() => {
        navigate(`/bubble/${targetBubble}`);
      }, 500); // Additional short delay for visual effect
    }
  };
  
  return (
    <div className="w-full h-full relative" onMouseMove={handleMouseMove}>
      <Canvas camera={{ position: [0, 0, 15], fov: 60 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        {!isAnimating && <OrbitControls enableZoom={true} enablePan={false} />}
        <CameraController 
          targetPosition={targetPosition} 
          isAnimating={isAnimating}
          onAnimationComplete={handleAnimationComplete}
        />
        
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
          
          // Configure event handlers for tooltip
          const handlePointerOver = () => {
            setHoveredBubble(bubble);
            setTooltipVisible(true);
          };
          
          const handlePointerOut = () => {
            setTooltipVisible(false);
            setHoveredBubble(null);
          };
          
          return (
            <group 
              key={bubble.id}
              onPointerOver={handlePointerOver}
              onPointerOut={handlePointerOut}
            >
              <BubbleSphere
                position={[x, y, z]}
                size={size}
                color={color}
                bubble={bubble}
                isTargetBubble={targetBubble === bubble.id}
                onBubbleClick={handleBubbleClick}
              />
            </group>
          );
        })}
      </Canvas>
      
      {/* 2D tooltip overlay */}
      <BubbleTooltip 
        bubble={hoveredBubble}
        position={tooltipPosition}
        visible={tooltipVisible}
      />
    </div>
  );
};

export default BubbleWorld;
