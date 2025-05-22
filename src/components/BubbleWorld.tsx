
import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import { Bubble } from '@/types/bubble';
import { useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import { useReflectionStatus } from '@/hooks/useReflectionStatus';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface BubbleProps {
  position: [number, number, number];
  size: number;
  color: string;
  bubble: Bubble;
  isTargetBubble: boolean;
  onBubbleClick: (id: string) => void;
  orbitRadius: number;
  orbitSpeed: number;
  orbitOffset: number;
  bubbleIndex: number;
  allBubblePositions: React.MutableRefObject<THREE.Vector3[]>;
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

// Central Core component
const CoreSphere = () => {
  const ref = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y += 0.005;
    }
  });
  
  return (
    <mesh ref={ref} position={[0, 0, 0]}>
      <sphereGeometry args={[1.2, 32, 32]} />
      <meshStandardMaterial 
        color="#FFD700" 
        metalness={0.7}
        roughness={0.2}
        emissive="#FFD700"
        emissiveIntensity={0.4}
      />
    </mesh>
  );
};

// Bubble repulsion system
const useRepulsionSystem = (
  bubbleIndex: number,
  allPositions: React.MutableRefObject<THREE.Vector3[]>,
  orbitRadius: number,
  orbitAngle: React.MutableRefObject<number>,
  orbitSpeed: number,
  heightOffset: number
) => {
  // Base position calculation (orbital path)
  const calcBasePosition = (state: any) => {
    orbitAngle.current += orbitSpeed;
    
    // Calculate new position based on orbital physics
    const x = Math.cos(orbitAngle.current) * orbitRadius;
    const z = Math.sin(orbitAngle.current) * orbitRadius;
    const y = heightOffset + Math.sin(state.clock.getElapsedTime() * 0.5 + orbitAngle.current) * 0.8;
    
    return new THREE.Vector3(x, y, z);
  };
  
  // Apply repulsion forces between bubbles
  const applyRepulsion = (basePos: THREE.Vector3) => {
    if (!allPositions.current[bubbleIndex]) {
      allPositions.current[bubbleIndex] = basePos.clone();
      return basePos;
    }
    
    // Start with the base orbital position
    const finalPosition = basePos.clone();
    
    // Check distance with other bubbles and apply repulsion
    for (let i = 0; i < allPositions.current.length; i++) {
      if (i !== bubbleIndex && allPositions.current[i]) {
        const otherPos = allPositions.current[i];
        const direction = finalPosition.clone().sub(otherPos);
        const distance = direction.length();
        
        // Apply repulsion if bubbles are too close
        if (distance < 2.5) {
          direction.normalize();
          // The closer they are, the stronger the repulsion
          const repulsionStrength = (2.5 - distance) * 0.05;
          direction.multiplyScalar(repulsionStrength);
          finalPosition.add(direction);
        }
      }
    }
    
    // Update position in the shared array
    allPositions.current[bubbleIndex] = finalPosition.clone();
    return finalPosition;
  };
  
  return { calcBasePosition, applyRepulsion };
};

const BubbleSphere: React.FC<BubbleProps> = ({ 
  position, 
  size, 
  color, 
  bubble, 
  isTargetBubble, 
  onBubbleClick, 
  orbitRadius, 
  orbitSpeed, 
  orbitOffset,
  bubbleIndex,
  allBubblePositions
}) => {
  const ref = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const { isReflected } = useReflectionStatus(bubble.id);
  const orbitAngle = useRef(orbitOffset);
  
  // Initialize repulsion system
  const { calcBasePosition, applyRepulsion } = useRepulsionSystem(
    bubbleIndex,
    allBubblePositions,
    orbitRadius,
    orbitAngle,
    orbitSpeed,
    position[1]
  );
  
  useFrame((state) => {
    if (ref.current) {
      if (!isTargetBubble) {
        // Calculate base orbital position
        const basePosition = calcBasePosition(state);
        
        // Apply repulsion forces
        const finalPosition = applyRepulsion(basePosition);
        
        // Update mesh position
        ref.current.position.copy(finalPosition);
        
        // Rotation animation
        ref.current.rotation.y += 0.01;
        ref.current.rotation.x += 0.005;
      } else {
        // Target bubble animation (center it)
        ref.current.position.lerp(new THREE.Vector3(0, 0, 0), 0.05);
        ref.current.rotation.y += 0.01;
      }
    }
  });
  
  const handleClick = () => {
    onBubbleClick(bubble.id);
  };
  
  // Calculate opacity based on whether this is the target bubble
  const opacity = isTargetBubble ? 0.9 : hovered ? 0.85 : 0.8; 
  // Fade out non-target bubbles when a target is selected
  const fadeOpacity = isTargetBubble ? 1 : (isTargetBubble === false) ? 0.3 : 1;
  
  // Calculate emissive intensity based on reflection count
  const reflectCount = bubble.reflect_count || 0;
  const emissiveIntensity = hovered ? 0.8 : isReflected ? 0.6 : 
                            (reflectCount >= 10 ? 0.7 : 
                             reflectCount >= 5 ? 0.5 : 
                             reflectCount >= 1 ? 0.4 : 0.3);
  
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
        <meshPhysicalMaterial 
          color={color} 
          transparent 
          opacity={opacity * fadeOpacity}
          emissive={color}
          emissiveIntensity={emissiveIntensity}
          metalness={0.6}
          roughness={0.2}
          clearcoat={0.5}
          clearcoatRoughness={0.3}
          envMapIntensity={0.8}
        />
      </mesh>
      
      {/* Show label when hovered */}
      {hovered && (
        <Text
          position={[ref.current?.position.x || 0, (ref.current?.position.y || 0) + size + 0.3, ref.current?.position.z || 0]}
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

// Environment to add lighting and atmosphere
const BubbleEnvironment = () => {
  return (
    <>
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} intensity={1.5} />
      <pointLight position={[-10, -10, -10]} intensity={1} color="#FFE166" />
      <fog attach="fog" args={['#000', 15, 40]} />
    </>
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
  
  // Shared reference for all bubble positions (used for collision avoidance)
  const allBubblePositions = useRef<THREE.Vector3[]>([]);
  
  // Initialize bubble positions array when bubbles change
  useEffect(() => {
    allBubblePositions.current = new Array(bubbles.length);
  }, [bubbles.length]);
  
  // Handle mouse movement for tooltip
  const handleMouseMove = (e: React.MouseEvent) => {
    setTooltipPosition({ x: e.clientX, y: e.clientY });
  };
  
  const handleBubbleClick = (id: string) => {
    // Find the bubble's position based on index
    const bubbleIndex = bubbles.findIndex(b => b.id === id);
    if (bubbleIndex >= 0) {
      // Calculate an appropriate target position for the camera
      const orbitRadius = 3 + (bubbleIndex % 5);
      const orbitOffset = bubbleIndex * 0.5;
      const x = Math.cos(orbitOffset) * orbitRadius;
      const y = Math.sin(orbitOffset * 0.5) * 1.5;
      const z = Math.sin(orbitOffset) * orbitRadius;
      
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
        <BubbleEnvironment />
        
        {!isAnimating && <OrbitControls enableZoom={true} enablePan={false} />}
        <CameraController 
          targetPosition={targetPosition} 
          isAnimating={isAnimating}
          onAnimationComplete={handleAnimationComplete}
        />
        
        {/* Core sphere at the center */}
        {!isAnimating && <CoreSphere />}
        
        {bubbles.map((bubble, index) => {
          // Calculate orbital parameters with more variation
          const orbitGroup = index % 5; // 5 main orbit groups for more distribution
          const baseRadius = 4 + orbitGroup * 1.5; // Different radius for each group
          const radiusVariation = (index % 7) * 0.4; // More variation within groups
          const orbitRadius = baseRadius + radiusVariation;
          
          // Orbit speed and initial angle with more variation
          const baseSpeed = 0.0008 + (orbitGroup * 0.0003); 
          const speedVariation = (index % 9) * 0.00012;
          const orbitSpeed = baseSpeed - speedVariation;
          const orbitOffset = index * (Math.PI / (bubbles.length / 2)); // Distribute bubbles evenly
          
          // Starting position on the orbit
          const startAngle = orbitOffset;
          const x = Math.cos(startAngle) * orbitRadius;
          const y = Math.sin(index * 0.7) * 3; // More vertical distribution
          const z = Math.sin(startAngle) * orbitRadius;
          
          // Determine size and color based on reflection count more dramatically
          const reflectCount = bubble.reflect_count || 0;
          
          // More dramatic size scaling
          let size = 0.6 + (reflectCount * 0.12);
          // Cap size at a reasonable maximum
          size = Math.min(size, 2.5);
          
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
                orbitRadius={orbitRadius}
                orbitSpeed={orbitSpeed}
                orbitOffset={orbitOffset}
                bubbleIndex={index}
                allBubblePositions={allBubblePositions}
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
