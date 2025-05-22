
import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree, extend } from '@react-three/fiber';
import { OrbitControls, Text, Billboard } from '@react-three/drei';
import { Bubble } from '@/types/bubble';
import { useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import { useReflectionStatus } from '@/hooks/useReflectionStatus';

// Camera animation controller
const CameraController = ({ targetPosition, isAnimating, onAnimationComplete }: { 
  targetPosition: THREE.Vector3 | null, 
  isAnimating: boolean,
  onAnimationComplete: () => void
}) => {
  const { camera } = useThree();
  const initialPos = useRef(new THREE.Vector3(0, 0, 20));
  
  useFrame(() => {
    if (isAnimating && targetPosition) {
      // Calculate direction to target
      const cameraDirection = new THREE.Vector3();
      cameraDirection.subVectors(targetPosition, camera.position);
      
      // Move camera closer to bubble (but stop short to see it properly)
      if (cameraDirection.length() > 3) {
        cameraDirection.normalize();
        cameraDirection.multiplyScalar(0.2);
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
        color="#FFE066" 
        metalness={0.4}
        roughness={0.2}
        emissive="#FFE066"
        emissiveIntensity={0.8}
      />
    </mesh>
  );
};

// Enhanced bubble repulsion system with stronger forces
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
  
  // Apply stronger repulsion forces between bubbles with improved spacing
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
        
        // Apply much stronger repulsion if bubbles are too close
        // Increased minimum distance from 3.5 to 4.5 for better spacing
        if (distance < 4.5) {
          direction.normalize();
          // The closer they are, the stronger the repulsion
          // Increased repulsion strength significantly from 0.12 to 0.25
          const repulsionStrength = (4.5 - distance) * 0.25;
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

// Enhanced bubble with improved text overlays
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
  const textRef = useRef<THREE.Group>(null);
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
        
        // Update text position to match bubble
        if (textRef.current) {
          // Position text directly above the bubble with proper vertical spacing
          textRef.current.position.copy(finalPosition);
        }
        
        // Rotation animation
        ref.current.rotation.y += 0.01;
        ref.current.rotation.x += 0.005;
      } else {
        // Target bubble animation (center it)
        ref.current.position.lerp(new THREE.Vector3(0, 0, 0), 0.05);
        if (textRef.current) {
          textRef.current.position.lerp(new THREE.Vector3(0, 0, 0), 0.05);
        }
        ref.current.rotation.y += 0.01;
      }
    }
  });
  
  const handleClick = () => {
    onBubbleClick(bubble.id);
  };
  
  // Calculate emissive intensity based on reflection count - increased base values for more glow
  const reflectCount = bubble.reflect_count || 0;
  const emissiveIntensity = hovered ? 1.2 : isReflected ? 1.0 : 
                            (reflectCount >= 10 ? 1.2 : 
                             reflectCount >= 5 ? 1.0 : 
                             reflectCount >= 1 ? 0.8 : 0.6);
  
  // Calculate the text size based on bubble size - improved scaling
  const textScaleFactor = Math.max(0.2, Math.min(0.5, size * 0.25));
  const countTextSize = textScaleFactor * 0.8;
  
  // Calculate vertical offset for text based on bubble size
  const verticalOffset = size * 1.2;
  
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
          emissive={color}
          emissiveIntensity={emissiveIntensity}
          metalness={0.6}  // Increased metalness for more glossy appearance
          roughness={0.2}  // Decreased roughness for shinier appearance
          clearcoat={1.0}  // Enhanced clearcoat for better light reflection
          clearcoatRoughness={0.1}
          reflectivity={0.8} // Increased reflectivity
          transparent={false}
          opacity={1.0}
        />
      </mesh>
      
      {/* Improved text overlay with billboard for camera-facing orientation */}
      <group 
        ref={textRef}
        position={[position[0], position[1], position[2]]}
      >
        <Billboard
          follow={true}
          lockX={false}
          lockY={false}
          lockZ={false}
        >
          {/* Topic text (centered above bubble) */}
          <Text
            position={[0, verticalOffset, 0]}
            fontSize={textScaleFactor}
            color="white"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.05} // Increased outline width for better readability
            outlineColor="#000000"
            outlineOpacity={0.9} // Increased opacity for stronger outline
            maxWidth={size * 4}
            textAlign="center"
            font="/fonts/Inter-Bold.woff" // Using a consistent font
          >
            {bubble.topic}
          </Text>
          
          {/* Author/username (smaller) */}
          <Text
            position={[0, verticalOffset - textScaleFactor * 1.2, 0]}
            fontSize={textScaleFactor * 0.7}
            color="white"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.03}
            outlineColor="#000000"
            outlineOpacity={0.9}
            font="/fonts/Inter-Medium.woff"
          >
            {bubble.username || "Anonymous"}
          </Text>
          
          {/* Reflection count with star icon */}
          <Text
            position={[0, verticalOffset - textScaleFactor * 2.4, 0]}
            fontSize={countTextSize}
            color="white"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.03}
            outlineColor="#000000"
            outlineOpacity={0.9}
            font="/fonts/Inter-Medium.woff"
          >
            {`★ ${bubble.reflect_count || 0}`}
          </Text>
        </Billboard>
      </group>
      
      {/* Enhanced background glow effect */}
      {hovered && (
        <mesh position={[ref.current?.position.x || 0, ref.current?.position.y || 0, ref.current?.position.z || 0]}>
          <sphereGeometry args={[size * 1.3, 28, 28]} />
          <meshBasicMaterial color={color} transparent opacity={0.2} />
        </mesh>
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

// Environment to add enhanced lighting and atmosphere
const BubbleEnvironment = () => {
  return (
    <>
      <ambientLight intensity={1.5} /> {/* Increased ambient light intensity */}
      <pointLight position={[10, 10, 10]} intensity={2.5} color="#FFFFFF" /> {/* Increased point light intensity */}
      <pointLight position={[-10, -10, -10]} intensity={1.8} color="#FFE166" /> {/* Increased yellow light intensity */}
      <fog attach="fog" args={['#000', 25, 50]} /> {/* Adjusted fog to be more distant */}
    </>
  );
};

// Empty state component
const EmptyBubblesState = () => {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
      <div className="w-24 h-24 mb-6 relative">
        <div className="animate-float absolute w-16 h-16 rounded-full bg-bubble-yellow opacity-60 left-4"></div>
        <div className="animate-float absolute w-12 h-12 rounded-full bg-bubble-yellow opacity-80 right-0 top-4" style={{ animationDelay: '0.5s' }}></div>
        <div className="animate-float absolute w-8 h-8 rounded-full bg-bubble-yellow opacity-70 left-2 bottom-0" style={{ animationDelay: '1s' }}></div>
      </div>
      <h3 className="text-xl font-semibold mb-2">No Bubbles Yet</h3>
      <p className="text-gray-300 text-center max-w-xs">Create your first bubble to start a conversation or explore trending topics</p>
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
      const y = Math.sin(bubbleIndex * 0.7) * 3.5;
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
      <Canvas camera={{ position: [0, 0, 20], fov: 60 }}> {/* Adjusted camera distance for better initial view */}
        <BubbleEnvironment />
        
        {!isAnimating && 
          <OrbitControls 
            enableZoom={true} 
            enablePan={false} 
            minDistance={8}
            maxDistance={50}
            enableRotate={true}
            // Enable full 360-degree rotation on all axes
            minPolarAngle={0} 
            maxPolarAngle={Math.PI}
            minAzimuthAngle={-Infinity}
            maxAzimuthAngle={Infinity}
            rotateSpeed={0.5}
          />
        }
        
        <CameraController 
          targetPosition={targetPosition} 
          isAnimating={isAnimating}
          onAnimationComplete={handleAnimationComplete}
        />
        
        {/* Core sphere at the center */}
        {!isAnimating && <CoreSphere />}
        
        {bubbles.length > 0 ? (
          bubbles.map((bubble, index) => {
            // Calculate orbital parameters with more variation
            const orbitGroup = index % 5; // 5 main orbit groups for more distribution
            const baseRadius = 5 + orbitGroup * 2.5; // Increased radius and spacing between groups
            const radiusVariation = (index % 7) * 0.8; // More variation within groups
            const orbitRadius = baseRadius + radiusVariation;
            
            // Orbit speed and initial angle with more variation
            const baseSpeed = 0.0006 + (orbitGroup * 0.0002);
            const speedVariation = (index % 9) * 0.00012;
            const orbitSpeed = baseSpeed - speedVariation;
            const orbitOffset = index * (Math.PI / (bubbles.length / 2)); // Distribute bubbles evenly
            
            // Starting position on the orbit
            const startAngle = orbitOffset;
            const x = Math.cos(startAngle) * orbitRadius;
            const y = Math.sin(index * 0.7) * 3.5; // More vertical distribution
            const z = Math.sin(startAngle) * orbitRadius;
            
            // Determine size and color based on reflection count more dramatically
            const reflectCount = bubble.reflect_count || 0;
            
            // More dramatic size scaling
            let size = 0.8 + (reflectCount * 0.15); // Increased base size
            // Cap size at a reasonable maximum
            size = Math.min(size, 2.8);
            
            // Use golden-yellow palette to match logo (brighter, more consistent)
            let color;
            if (reflectCount >= 15) {
              color = '#FFD000'; // Bright gold
            } else if (reflectCount >= 10) {
              color = '#FFD933'; // Slightly lighter gold
            } else if (reflectCount >= 5) {
              color = '#FFE066'; // Light gold
            } else if (reflectCount >= 1) {
              color = '#FFEC99'; // Very light gold
            } else {
              color = '#FFD000'; // Default gold
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
          })
        ) : (
          // Render empty state directly in the 3D canvas
          <EmptyBubblesState />
        )}
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
