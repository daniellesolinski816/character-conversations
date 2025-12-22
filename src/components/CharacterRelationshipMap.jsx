import React, { useState, useEffect, useRef } from 'react';
import { X, ZoomIn, ZoomOut, Maximize2, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import CharacterAvatar from './CharacterAvatar';

const relationshipColors = {
  friend: { line: '#22c55e', bg: 'bg-green-100', text: 'text-green-700', label: 'Friend' },
  enemy: { line: '#ef4444', bg: 'bg-red-100', text: 'text-red-700', label: 'Enemy' },
  mentor: { line: '#8b5cf6', bg: 'bg-violet-100', text: 'text-violet-700', label: 'Mentor' },
  student: { line: '#a855f7', bg: 'bg-purple-100', text: 'text-purple-700', label: 'Student' },
  rival: { line: '#f97316', bg: 'bg-orange-100', text: 'text-orange-700', label: 'Rival' },
  family: { line: '#3b82f6', bg: 'bg-blue-100', text: 'text-blue-700', label: 'Family' },
  lover: { line: '#ec4899', bg: 'bg-pink-100', text: 'text-pink-700', label: 'Lover' },
  ally: { line: '#14b8a6', bg: 'bg-teal-100', text: 'text-teal-700', label: 'Ally' },
  neutral: { line: '#9ca3af', bg: 'bg-gray-100', text: 'text-gray-700', label: 'Neutral' },
};

function calculateNodePositions(characters, containerWidth, containerHeight) {
  const centerX = containerWidth / 2;
  const centerY = containerHeight / 2;
  const radius = Math.min(containerWidth, containerHeight) * 0.35;
  
  return characters.map((char, index) => {
    const angle = (2 * Math.PI * index) / characters.length - Math.PI / 2;
    return {
      ...char,
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    };
  });
}

function RelationshipLine({ from, to, relationship, zoom }) {
  const colors = relationshipColors[relationship.relationship_type] || relationshipColors.neutral;
  
  // Calculate midpoint for label
  const midX = (from.x + to.x) / 2;
  const midY = (from.y + to.y) / 2;
  
  // Calculate angle for curved line
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  // Control point for curve (perpendicular offset)
  const curvature = 0.15;
  const cx = midX - dy * curvature;
  const cy = midY + dx * curvature;
  
  return (
    <g>
      <path
        d={`M ${from.x} ${from.y} Q ${cx} ${cy} ${to.x} ${to.y}`}
        stroke={colors.line}
        strokeWidth={2 / zoom}
        fill="none"
        strokeDasharray={relationship.relationship_type === 'enemy' ? '5,5' : 'none'}
        opacity={0.7}
      />
      {/* Relationship label */}
      <g transform={`translate(${midX}, ${midY})`}>
        <rect
          x={-30 / zoom}
          y={-10 / zoom}
          width={60 / zoom}
          height={20 / zoom}
          rx={4 / zoom}
          fill="white"
          stroke={colors.line}
          strokeWidth={1 / zoom}
        />
        <text
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={10 / zoom}
          fill={colors.line}
          fontWeight="500"
        >
          {colors.label}
        </text>
      </g>
    </g>
  );
}

function CharacterNode({ character, x, y, zoom, isSelected, onClick }) {
  const nodeSize = 60 / zoom;
  
  return (
    <g 
      transform={`translate(${x}, ${y})`} 
      onClick={() => onClick(character)}
      style={{ cursor: 'pointer' }}
    >
      <motion.circle
        r={nodeSize / 2 + 4}
        fill={isSelected ? '#fbbf24' : 'white'}
        stroke={isSelected ? '#f59e0b' : '#e2e8f0'}
        strokeWidth={2 / zoom}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
      />
      <foreignObject
        x={-nodeSize / 2}
        y={-nodeSize / 2}
        width={nodeSize}
        height={nodeSize}
      >
        <div className="w-full h-full flex items-center justify-center">
          <CharacterAvatar 
            name={character.name} 
            avatar={character.avatar}
            size="md"
          />
        </div>
      </foreignObject>
      <text
        y={nodeSize / 2 + 14 / zoom}
        textAnchor="middle"
        fontSize={12 / zoom}
        fontWeight="600"
        fill="#1e293b"
      >
        {character.name}
      </text>
      {character.role && (
        <text
          y={nodeSize / 2 + 26 / zoom}
          textAnchor="middle"
          fontSize={9 / zoom}
          fill="#64748b"
          textTransform="capitalize"
        >
          {character.role}
        </text>
      )}
    </g>
  );
}

export default function CharacterRelationshipMap({ open, onOpenChange, characters = [] }) {
  const [zoom, setZoom] = useState(1);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 500 });
  const containerRef = useRef(null);

  useEffect(() => {
    if (open && containerRef.current) {
      const updateDimensions = () => {
        const rect = containerRef.current?.getBoundingClientRect();
        if (rect) {
          setDimensions({ width: rect.width, height: rect.height });
        }
      };
      updateDimensions();
      window.addEventListener('resize', updateDimensions);
      return () => window.removeEventListener('resize', updateDimensions);
    }
  }, [open]);

  const nodes = calculateNodePositions(characters, dimensions.width, dimensions.height);

  // Build edges from relationships
  const edges = [];
  nodes.forEach((char) => {
    if (char.relationships) {
      char.relationships.forEach((rel) => {
        const targetNode = nodes.find(n => n.name === rel.character_name);
        if (targetNode) {
          // Avoid duplicate edges
          const existingEdge = edges.find(
            e => (e.from.name === char.name && e.to.name === targetNode.name) ||
                 (e.from.name === targetNode.name && e.to.name === char.name)
          );
          if (!existingEdge) {
            edges.push({ from: char, to: targetNode, relationship: rel });
          }
        }
      });
    }
  });

  const handleZoomIn = () => setZoom(z => Math.min(z + 0.2, 2));
  const handleZoomOut = () => setZoom(z => Math.max(z - 0.2, 0.5));
  const handleReset = () => setZoom(1);

  const handleShare = () => {
    const shareText = `Check out the character relationships in this story!\n\nCharacters: ${characters.map(c => c.name).join(', ')}`;
    navigator.clipboard.writeText(shareText);
    toast.success('Relationship map info copied to clipboard!');
  };

  const selectedCharDetails = selectedCharacter 
    ? characters.find(c => c.name === selectedCharacter.name)
    : null;

  if (characters.length === 0) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="flex items-center justify-between">
            <span>Character Relationship Map</span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={handleShare} title="Share">
                <Share2 className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={handleZoomOut}>
                <ZoomOut className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={handleReset}>
                <Maximize2 className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={handleZoomIn}>
                <ZoomIn className="w-4 h-4" />
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex overflow-hidden">
          {/* Graph Area */}
          <div ref={containerRef} className="flex-1 bg-slate-50 relative overflow-hidden">
            <svg 
              width="100%" 
              height="100%" 
              viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
              className="cursor-grab"
            >
              {/* Draw edges first */}
              {edges.map((edge, idx) => (
                <RelationshipLine
                  key={idx}
                  from={{ x: edge.from.x, y: edge.from.y }}
                  to={{ x: edge.to.x, y: edge.to.y }}
                  relationship={edge.relationship}
                  zoom={zoom}
                />
              ))}
              
              {/* Draw nodes on top */}
              {nodes.map((node, idx) => (
                <CharacterNode
                  key={idx}
                  character={node}
                  x={node.x}
                  y={node.y}
                  zoom={zoom}
                  isSelected={selectedCharacter?.name === node.name}
                  onClick={setSelectedCharacter}
                />
              ))}
            </svg>

            {/* Legend */}
            <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur rounded-lg p-3 shadow-sm border">
              <p className="text-xs font-medium text-slate-600 mb-2">Relationships</p>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {Object.entries(relationshipColors).slice(0, 6).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-1.5">
                    <div 
                      className="w-3 h-1 rounded-full" 
                      style={{ backgroundColor: value.line }}
                    />
                    <span className="text-slate-600">{value.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Character Details Panel */}
          {selectedCharDetails && (
            <motion.div 
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="w-72 border-l bg-white overflow-y-auto p-4"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <CharacterAvatar 
                    name={selectedCharDetails.name} 
                    avatar={selectedCharDetails.avatar}
                    size="md"
                  />
                  <div>
                    <h3 className="font-semibold text-slate-900">{selectedCharDetails.name}</h3>
                    {selectedCharDetails.role && (
                      <span className="text-xs text-slate-500 capitalize">{selectedCharDetails.role}</span>
                    )}
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6"
                  onClick={() => setSelectedCharacter(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {selectedCharDetails.description && (
                <p className="text-sm text-slate-600 mb-4">{selectedCharDetails.description}</p>
              )}

              {/* Relationships */}
              {selectedCharDetails.relationships?.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-xs font-medium text-slate-500 uppercase mb-2">Relationships</h4>
                  <div className="space-y-2">
                    {selectedCharDetails.relationships.map((rel, idx) => {
                      const colors = relationshipColors[rel.relationship_type] || relationshipColors.neutral;
                      return (
                        <div key={idx} className={`p-2 rounded-lg ${colors.bg}`}>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-medium ${colors.text}`}>{colors.label}</span>
                            <span className="text-xs text-slate-600">→ {rel.character_name}</span>
                          </div>
                          {rel.description && (
                            <p className="text-xs text-slate-600 mt-1">{rel.description}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Canon Events */}
              {selectedCharDetails.canon_events?.length > 0 && (
                <div>
                  <h4 className="text-xs font-medium text-slate-500 uppercase mb-2">Key Events</h4>
                  <div className="space-y-2">
                    {selectedCharDetails.canon_events.slice(0, 3).map((event, idx) => (
                      <div key={idx} className="p-2 bg-amber-50 rounded-lg">
                        <p className="text-xs font-medium text-amber-800">{event.event}</p>
                        {event.emotional_impact && (
                          <p className="text-xs text-amber-600 mt-1">{event.emotional_impact}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}