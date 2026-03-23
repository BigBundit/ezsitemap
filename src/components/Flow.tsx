import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  ReactFlow,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  Connection,
  Edge,
  Node,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { toPng } from 'html-to-image';
import { Download, Save, Upload, Trash2, Loader2, Sparkles, Wand2, Plus, X, Copy, ClipboardPaste, Undo2, Redo2, Key, FileText } from 'lucide-react';

import Sidebar from './Sidebar';
import PageNode from './nodes/PageNode';
import CategoryNode from './nodes/CategoryNode';
import LinkNode from './nodes/LinkNode';
import TagNode from './nodes/TagNode';
import TextNode from './nodes/TextNode';
import LineNode from './nodes/LineNode';
import ApiKeyModal from './ApiKeyModal';
import ImportTextModal from './ImportTextModal';
import { getLayoutedElements } from '../utils/layout';
import { generateSitemapFromUrl, generateSitemapFromText } from '../services/geminiService';

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'pageNode',
    data: { label: 'Home Page' },
    position: { x: 250, y: 50 },
  },
];

const nodeTypes = {
  pageNode: PageNode,
  categoryNode: CategoryNode,
  linkNode: LinkNode,
  tagNode: TagNode,
  textNode: TextNode,
  lineNode: LineNode,
};

let id = 0;
const getId = () => `dndnode_${id++}`;

interface Project {
  id: string;
  name: string;
  nodes: Node[];
  edges: Edge[];
  past: { nodes: Node[], edges: Edge[] }[];
  future: { nodes: Node[], edges: Edge[] }[];
}

let globalClipboard: { nodes: Node[], edges: Edge[] } = { nodes: [], edges: [] };

export default function Flow() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  
  const [projects, setProjects] = useState<Project[]>([
    { id: 'proj_1', name: 'Project 1', nodes: initialNodes, edges: [], past: [], future: [] }
  ]);
  const [activeProjectId, setActiveProjectId] = useState('proj_1');

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const [url, setUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [isImportTextModalOpen, setIsImportTextModalOpen] = useState(false);
  const [layoutDirection, setLayoutDirection] = useState<'TB' | 'LR'>('TB');

  // Sync current nodes/edges to the active project
  useEffect(() => {
    setProjects(prevProjects => 
      prevProjects.map(p => 
        p.id === activeProjectId ? { ...p, nodes, edges } : p
      )
    );
  }, [nodes, edges, activeProjectId]);

  const takeSnapshot = useCallback(() => {
    setProjects(prev => prev.map(p => {
      if (p.id === activeProjectId) {
        // Avoid duplicate consecutive snapshots
        const lastPast = p.past[p.past.length - 1];
        if (lastPast && JSON.stringify(lastPast.nodes) === JSON.stringify(nodes) && JSON.stringify(lastPast.edges) === JSON.stringify(edges)) {
          return p;
        }
        const newPast = [...p.past, { nodes, edges }].slice(-50);
        return { ...p, past: newPast, future: [] };
      }
      return p;
    }));
  }, [activeProjectId, nodes, edges]);

  useEffect(() => {
    const handleSnapshot = () => takeSnapshot();
    window.addEventListener('takeSnapshot', handleSnapshot);
    return () => window.removeEventListener('takeSnapshot', handleSnapshot);
  }, [takeSnapshot]);

  const undo = useCallback(() => {
    setProjects(prev => {
      const proj = prev.find(p => p.id === activeProjectId);
      if (!proj || proj.past.length === 0) return prev;

      const newPast = [...proj.past];
      const previousState = newPast.pop()!;
      
      const newFuture = [{ nodes: proj.nodes, edges: proj.edges }, ...proj.future];

      setNodes(previousState.nodes);
      setEdges(previousState.edges);

      return prev.map(p => p.id === activeProjectId ? {
        ...p,
        nodes: previousState.nodes,
        edges: previousState.edges,
        past: newPast,
        future: newFuture
      } : p);
    });
  }, [activeProjectId, setNodes, setEdges]);

  const redo = useCallback(() => {
    setProjects(prev => {
      const proj = prev.find(p => p.id === activeProjectId);
      if (!proj || proj.future.length === 0) return prev;

      const newFuture = [...proj.future];
      const nextState = newFuture.shift()!;
      
      const newPast = [...proj.past, { nodes: proj.nodes, edges: proj.edges }];

      setNodes(nextState.nodes);
      setEdges(nextState.edges);

      return prev.map(p => p.id === activeProjectId ? {
        ...p,
        nodes: nextState.nodes,
        edges: nextState.edges,
        past: newPast,
        future: newFuture
      } : p);
    });
  }, [activeProjectId, setNodes, setEdges]);

  const handleNodesChange = useCallback((changes: any) => {
    const shouldSnapshot = changes.some((c: any) => c.type === 'remove');
    if (shouldSnapshot) {
      takeSnapshot();
    }
    onNodesChange(changes);
  }, [onNodesChange, takeSnapshot]);

  const handleEdgesChange = useCallback((changes: any) => {
    const shouldSnapshot = changes.some((c: any) => c.type === 'remove');
    if (shouldSnapshot) {
      takeSnapshot();
    }
    onEdgesChange(changes);
  }, [onEdgesChange, takeSnapshot]);

  const switchTab = (projectId: string) => {
    const proj = projects.find(p => p.id === projectId);
    if (proj) {
      setActiveProjectId(projectId);
      setNodes(proj.nodes);
      setEdges(proj.edges);
      setTimeout(() => reactFlowInstance?.fitView({ duration: 800 }), 100);
    }
  };

  const addTab = () => {
    const newId = `proj_${Date.now()}`;
    const newProj: Project = {
      id: newId,
      name: `Project ${projects.length + 1}`,
      nodes: [{ id: getId(), type: 'pageNode', data: { label: 'Home Page' }, position: { x: 250, y: 50 } }],
      edges: [],
      past: [],
      future: []
    };
    setProjects([...projects, newProj]);
    setActiveProjectId(newId);
    setNodes(newProj.nodes);
    setEdges(newProj.edges);
  };

  const closeTab = (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation();
    if (projects.length === 1) return; // Don't close the last tab
    
    const newProjects = projects.filter(p => p.id !== projectId);
    setProjects(newProjects);
    
    if (activeProjectId === projectId) {
      const nextProj = newProjects[newProjects.length - 1];
      setActiveProjectId(nextProj.id);
      setNodes(nextProj.nodes);
      setEdges(nextProj.edges);
    }
  };

  const handleCopy = useCallback(() => {
    const selectedNodes = nodes.filter(n => n.selected);
    const selectedEdges = edges.filter(e => e.selected);
    if (selectedNodes.length > 0) {
      globalClipboard = { 
        nodes: JSON.parse(JSON.stringify(selectedNodes)), 
        edges: JSON.parse(JSON.stringify(selectedEdges)) 
      };
    }
  }, [nodes, edges]);

  const handlePaste = useCallback(() => {
    if (globalClipboard.nodes.length === 0) return;

    takeSnapshot();

    const idMap = new Map<string, string>();
    const newNodes = globalClipboard.nodes.map(node => {
      const newId = getId();
      idMap.set(node.id, newId);
      return {
        ...node,
        id: newId,
        position: { x: node.position.x + 50, y: node.position.y + 50 },
        selected: true,
      };
    });

    const newEdges = globalClipboard.edges.map(edge => {
      return {
        ...edge,
        id: `e${idMap.get(edge.source) || edge.source}-${idMap.get(edge.target) || edge.target}`,
        source: idMap.get(edge.source) || edge.source,
        target: idMap.get(edge.target) || edge.target,
        selected: true,
      };
    });

    // Deselect current nodes and add new ones
    setNodes(nds => nds.map(n => ({ ...n, selected: false })).concat(newNodes));
    setEdges(eds => eds.map(e => ({ ...e, selected: false })).concat(newEdges));
  }, [setNodes, setEdges, takeSnapshot]);

  // Keyboard shortcuts for Copy/Paste/Undo/Redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        if (document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
          handleCopy();
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        if (document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
          handlePaste();
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        if (document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
          e.preventDefault();
          undo();
        }
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        if (document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
          e.preventDefault();
          redo();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleCopy, handlePaste, undo, redo]);

  const onConnect = useCallback(
    (params: Connection | Edge) => {
      takeSnapshot();
      setEdges((eds) => addEdge(params, eds));
    },
    [setEdges, takeSnapshot],
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      let label = event.dataTransfer.getData('application/reactflow-label');

      if (typeof type === 'undefined' || !type) {
        return;
      }

      if (!label && type !== 'lineNode') {
        label = 'New Node';
      }

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      const newNode: Node = {
        id: getId(),
        type,
        position,
        data: { label },
      };

      takeSnapshot();
      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes, takeSnapshot],
  );

  const exportConfig = () => {
    if (!reactFlowInstance) return;
    const flow = reactFlowInstance.toObject();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(flow, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `sitemap_${activeProjectId}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const exportPng = () => {
    if (reactFlowWrapper.current) {
      // Temporarily hide controls for export
      const controls = document.querySelector('.react-flow__controls') as HTMLElement;
      if (controls) controls.style.display = 'none';

      toPng(reactFlowWrapper.current, { backgroundColor: '#f8fafc' })
        .then((dataUrl) => {
          const downloadAnchorNode = document.createElement('a');
          downloadAnchorNode.setAttribute("href", dataUrl);
          downloadAnchorNode.setAttribute("download", `sitemap_${activeProjectId}.png`);
          document.body.appendChild(downloadAnchorNode);
          downloadAnchorNode.click();
          downloadAnchorNode.remove();
          if (controls) controls.style.display = 'flex';
        })
        .catch((err) => {
          console.error('oops, something went wrong!', err);
          if (controls) controls.style.display = 'flex';
        });
    }
  };

  const clearCanvas = () => {
    takeSnapshot();
    setNodes([]);
    setEdges([]);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const flow = JSON.parse(e.target?.result as string);
          if (flow) {
            takeSnapshot();
            setNodes(flow.nodes || []);
            setEdges(flow.edges || []);
            setTimeout(() => reactFlowInstance?.fitView({ duration: 800 }), 100);
          }
        } catch (error) {
          console.error("Error parsing JSON config", error);
        }
      };
      reader.readAsText(file);
    }
    // Reset file input
    event.target.value = '';
  };

  const handleAutoLayout = useCallback((direction: 'TB' | 'LR') => {
    setLayoutDirection(direction);
    
    takeSnapshot();
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      nodes,
      edges,
      direction
    );

    setNodes([...layoutedNodes]);
    setEdges([...layoutedEdges]);

    setTimeout(() => {
      reactFlowInstance?.fitView({ duration: 800, padding: 0.2 });
    }, 100);
  }, [nodes, edges, reactFlowInstance, setNodes, setEdges, takeSnapshot]);

  const handleGenerateFromUrl = async () => {
    if (!url) return;
    setIsGenerating(true);
    try {
      const sitemapData = await generateSitemapFromUrl(url);
      
      takeSnapshot();
      
      const newNodes: Node[] = [];
      const newEdges: Edge[] = [];

      sitemapData.forEach((item: any) => {
        newNodes.push({
          id: item.id,
          type: item.type,
          position: { x: 0, y: 0 }, // Will be set by layout
          data: { label: item.label },
        });

        if (item.parentId && item.parentId !== "") {
          newEdges.push({
            id: `e${item.parentId}-${item.id}`,
            source: item.parentId,
            target: item.id,
          });
        }
      });

      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
        newNodes,
        newEdges,
        layoutDirection
      );

      setNodes(layoutedNodes);
      setEdges(layoutedEdges);

      setTimeout(() => {
        reactFlowInstance?.fitView({ duration: 800, padding: 0.2 });
      }, 100);

    } catch (error: any) {
      console.error("Failed to generate sitemap:", error);
      if (error.message === "API_KEY_MISSING") {
        alert("Please set your Gemini API Key in the settings (Key icon) first.");
        setIsApiKeyModalOpen(true);
      } else if (error.message === "INVALID_API_KEY" || error.message?.includes("API key not valid")) {
        alert("The API key you entered is invalid. Please check your key and try again.");
        setIsApiKeyModalOpen(true);
      } else if (error.message === "NO_DATA_FOUND") {
        alert("Could not extract a menu structure from this URL. The site might be blocking access or doesn't have a clear navigation menu.");
      } else {
        alert(`Error: ${error.message || "Failed to generate sitemap"}\n\nPlease check the console for details.`);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateFromText = async (text: string) => {
    setIsGenerating(true);
    try {
      const nodesData = await generateSitemapFromText(text);

      const newNodes: Node[] = nodesData.map((node: any) => ({
        id: node.id,
        type: node.type,
        position: { x: 0, y: 0 },
        data: { label: node.label },
      }));

      const newEdges: Edge[] = nodesData
        .filter((node: any) => node.parentId)
        .map((node: any) => ({
          id: `e${node.parentId}-${node.id}`,
          source: node.parentId,
          target: node.id,
          type: 'smoothstep',
          animated: true,
          style: { stroke: '#94a3b8', strokeWidth: 2 },
        }));

      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(newNodes, newEdges, layoutDirection);

      setNodes(layoutedNodes);
      setEdges(layoutedEdges);

      setTimeout(() => {
        reactFlowInstance?.fitView({ duration: 800, padding: 0.2 });
      }, 100);

    } catch (error: any) {
      console.error("Failed to generate sitemap from text:", error);
      if (error.message === "API_KEY_MISSING") {
        alert("Please set your Gemini API Key in the settings (Key icon) first.");
        setIsApiKeyModalOpen(true);
      } else if (error.message === "INVALID_API_KEY" || error.message?.includes("API key not valid")) {
        alert("The API key you entered is invalid. Please check your key and try again.");
        setIsApiKeyModalOpen(true);
      } else if (error.message === "NO_DATA_FOUND") {
        alert("Could not extract a menu structure from this text. Please check your formatting.");
      } else {
        alert(`Error: ${error.message || "Failed to generate sitemap"}\n\nPlease check the console for details.`);
      }
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex h-screen w-full flex-col bg-slate-50">
      {/* Tab Bar */}
      <div className="flex items-center bg-slate-200 px-2 pt-2 gap-1 overflow-x-auto border-b border-slate-300">
        {projects.map(p => (
          <div
            key={p.id}
            onClick={() => switchTab(p.id)}
            className={`group flex items-center gap-2 px-4 py-2 rounded-t-lg cursor-pointer text-sm font-medium transition-colors ${
              activeProjectId === p.id 
                ? 'bg-white text-indigo-600 border-t border-x border-slate-300' 
                : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
            }`}
          >
            {p.name}
            {projects.length > 1 && (
              <button 
                onClick={(e) => closeTab(e, p.id)} 
                className="p-0.5 rounded-md hover:bg-slate-400 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        ))}
        <button 
          onClick={addTab} 
          className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-300 rounded-t-lg transition-colors ml-1"
          title="New Project"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <header className="flex items-center justify-between p-4 bg-white border-b border-slate-200 z-10 shadow-sm">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
            </div>
            <h1 className="text-xl font-bold text-slate-800">Sitemap Builder</h1>
          </div>
          
          <div className="w-px h-6 bg-slate-200"></div>
          
          <div className="flex items-center gap-2">
            <input 
              type="url" 
              placeholder="Enter website URL (e.g., https://example.com)" 
              className="px-3 py-1.5 text-sm border border-slate-200 rounded-md w-72 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleGenerateFromUrl()}
              disabled={isGenerating}
            />
            <button 
              onClick={handleGenerateFromUrl}
              disabled={isGenerating || !url}
              className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-md transition-colors text-sm font-medium shadow-sm"
            >
              {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              Generate
            </button>
            <div className="w-px h-6 bg-slate-300 mx-1"></div>
            <button
              onClick={() => setIsImportTextModalOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors text-sm font-medium shadow-sm border border-slate-200"
            >
              <FileText className="w-4 h-4" />
              Import Text
            </button>
            <button
              onClick={() => setIsApiKeyModalOpen(true)}
              className="flex items-center justify-center w-8 h-8 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors"
              title="API Key Settings"
            >
              <Key className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={undo}
            disabled={projects.find(p => p.id === activeProjectId)?.past.length === 0}
            className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed text-slate-700 rounded-md transition-colors text-sm font-medium"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={redo}
            disabled={projects.find(p => p.id === activeProjectId)?.future.length === 0}
            className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed text-slate-700 rounded-md transition-colors text-sm font-medium"
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="w-4 h-4" />
          </button>
          <div className="w-px h-6 bg-slate-200 my-auto mx-1"></div>
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors text-sm font-medium"
            title="Copy Selected (Ctrl+C)"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={handlePaste}
            className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors text-sm font-medium"
            title="Paste (Ctrl+V)"
          >
            <ClipboardPaste className="w-4 h-4" />
          </button>
          <div className="w-px h-6 bg-slate-200 my-auto mx-1"></div>
          <button
            onClick={() => handleAutoLayout('TB')}
            className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors text-sm font-medium ${layoutDirection === 'TB' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}
            title="Vertical Layout"
          >
            <Wand2 className="w-4 h-4" />
            Layout ↓
          </button>
          <button
            onClick={() => handleAutoLayout('LR')}
            className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors text-sm font-medium ${layoutDirection === 'LR' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}
            title="Horizontal Layout"
          >
            <Wand2 className="w-4 h-4" />
            Layout →
          </button>
          <div className="w-px h-6 bg-slate-200 my-auto mx-1"></div>
          <label className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md cursor-pointer transition-colors text-sm font-medium">
            <Upload className="w-4 h-4" />
            Import
            <input type="file" accept=".json" className="hidden" onChange={handleImport} />
          </label>
          <button
            onClick={exportConfig}
            className="flex items-center gap-2 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-md transition-colors text-sm font-medium"
          >
            <Save className="w-4 h-4" />
            Export JSON
          </button>
          <button
            onClick={exportPng}
            className="flex items-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors text-sm font-medium shadow-sm"
          >
            <Download className="w-4 h-4" />
            Export PNG
          </button>
          <div className="w-px h-6 bg-slate-200 my-auto mx-1"></div>
          <button
            onClick={clearCanvas}
            className="flex items-center gap-2 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-md transition-colors text-sm font-medium"
          >
            <Trash2 className="w-4 h-4" />
            Clear
          </button>
        </div>
      </header>
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <div className="flex-1 h-full relative" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={handleNodesChange}
            onEdgesChange={handleEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onNodeDragStart={() => takeSnapshot()}
            nodeTypes={nodeTypes}
            fitView
            panOnDrag={[1]} // Middle mouse button (scroll wheel click) to pan
            selectionOnDrag={true} // Left mouse button to select (marquee)
            className="bg-slate-50"
            defaultEdgeOptions={{
              type: 'smoothstep',
              animated: true,
              style: { stroke: '#94a3b8', strokeWidth: 2 },
              pathOptions: { borderRadius: 24 }
            }}
          >
            <Controls />
            <Background color="#cbd5e1" gap={16} size={1} />
          </ReactFlow>
        </div>
      </div>
      <ApiKeyModal isOpen={isApiKeyModalOpen} onClose={() => setIsApiKeyModalOpen(false)} />
      <ImportTextModal 
        isOpen={isImportTextModalOpen} 
        onClose={() => setIsImportTextModalOpen(false)} 
        onImport={handleGenerateFromText}
      />
    </div>
  );
}
