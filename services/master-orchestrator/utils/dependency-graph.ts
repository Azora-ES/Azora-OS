/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * Dependency Graph Builder and Analyzer
 */

import { DependencyGraph, DependencyEdge, ServiceMetadata } from '../types/service.types';

export class DependencyGraphBuilder {
  private nodes: Set<string> = new Set();
  private edges: DependencyEdge[] = [];
  private adjacencyList: Map<string, Set<string>> = new Map();
  private reverseAdjacencyList: Map<string, Set<string>> = new Map();

  /**
   * Build dependency graph from service metadata
   */
  buildGraph(services: Map<string, ServiceMetadata>): DependencyGraph {
    this.nodes.clear();
    this.edges = [];
    this.adjacencyList.clear();
    this.reverseAdjacencyList.clear();

    // Add all nodes
    for (const [name, metadata] of services) {
      this.nodes.add(name);
      this.adjacencyList.set(name, new Set());
      this.reverseAdjacencyList.set(name, new Set());
    }

    // Build edges from dependencies
    for (const [name, metadata] of services) {
      for (const dep of metadata.dependencies || []) {
        if (services.has(dep)) {
          this.addEdge(dep, name, true);
        }
      }
    }

    // Calculate phases using topological sort
    const phases = this.calculateLaunchPhases();

    return {
      nodes: Array.from(this.nodes),
      edges: this.edges,
      phases
    };
  }

  /**
   * Add an edge to the graph
   */
  private addEdge(from: string, to: string, required: boolean): void {
    this.edges.push({ from, to, required });
    
    const fromSet = this.adjacencyList.get(from) || new Set();
    fromSet.add(to);
    this.adjacencyList.set(from, fromSet);

    const toSet = this.reverseAdjacencyList.get(to) || new Set();
    toSet.add(from);
    this.reverseAdjacencyList.set(to, toSet);
  }

  /**
   * Calculate launch phases using topological sort
   */
  private calculateLaunchPhases(): { [phase: number]: string[] } {
    const phases: { [phase: number]: string[] } = {};
    const inDegree: Map<string, number> = new Map();
    const visited: Set<string> = new Set();

    // Calculate in-degree for each node
    for (const node of this.nodes) {
      const deps = this.reverseAdjacencyList.get(node) || new Set();
      inDegree.set(node, deps.size);
    }

    let currentPhase = 0;

    while (visited.size < this.nodes.size) {
      const currentPhaseNodes: string[] = [];

      // Find all nodes with in-degree 0 that haven't been visited
      for (const node of this.nodes) {
        if (!visited.has(node) && (inDegree.get(node) || 0) === 0) {
          currentPhaseNodes.push(node);
        }
      }

      if (currentPhaseNodes.length === 0) {
        // Circular dependency detected, add remaining nodes to final phase
        const remaining = Array.from(this.nodes).filter(n => !visited.has(n));
        if (remaining.length > 0) {
          phases[currentPhase] = remaining;
          remaining.forEach(n => visited.add(n));
        }
        break;
      }

      phases[currentPhase] = currentPhaseNodes;

      // Mark nodes as visited and update in-degrees
      for (const node of currentPhaseNodes) {
        visited.add(node);
        
        const dependents = this.adjacencyList.get(node) || new Set();
        for (const dependent of dependents) {
          const currentInDegree = inDegree.get(dependent) || 0;
          inDegree.set(dependent, currentInDegree - 1);
        }
      }

      currentPhase++;
    }

    return phases;
  }

  /**
   * Get all dependencies of a service (transitive)
   */
  getAllDependencies(service: string): Set<string> {
    const dependencies: Set<string> = new Set();
    const queue: string[] = [service];
    const visited: Set<string> = new Set();

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (visited.has(current)) continue;
      visited.add(current);

      const deps = this.reverseAdjacencyList.get(current) || new Set();
      for (const dep of deps) {
        dependencies.add(dep);
        queue.push(dep);
      }
    }

    return dependencies;
  }

  /**
   * Get all dependents of a service (transitive)
   */
  getAllDependents(service: string): Set<string> {
    const dependents: Set<string> = new Set();
    const queue: string[] = [service];
    const visited: Set<string> = new Set();

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (visited.has(current)) continue;
      visited.add(current);

      const deps = this.adjacencyList.get(current) || new Set();
      for (const dep of deps) {
        dependents.add(dep);
        queue.push(dep);
      }
    }

    return dependents;
  }

  /**
   * Detect circular dependencies
   */
  detectCircularDependencies(): string[][] {
    const cycles: string[][] = [];
    const visited: Set<string> = new Set();
    const recursionStack: Set<string> = new Set();
    const path: string[] = [];

    for (const node of this.nodes) {
      if (!visited.has(node)) {
        this.dfsDetectCycle(node, visited, recursionStack, path, cycles);
      }
    }

    return cycles;
  }

  private dfsDetectCycle(
    node: string,
    visited: Set<string>,
    recursionStack: Set<string>,
    path: string[],
    cycles: string[][]
  ): void {
    visited.add(node);
    recursionStack.add(node);
    path.push(node);

    const neighbors = this.adjacencyList.get(node) || new Set();
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        this.dfsDetectCycle(neighbor, visited, recursionStack, path, cycles);
      } else if (recursionStack.has(neighbor)) {
        // Found a cycle
        const cycleStart = path.indexOf(neighbor);
        const cycle = path.slice(cycleStart);
        cycles.push(cycle);
      }
    }

    recursionStack.delete(node);
    path.pop();
  }

  /**
   * Validate the dependency graph
   */
  validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check for circular dependencies
    const cycles = this.detectCircularDependencies();
    if (cycles.length > 0) {
      errors.push(`Circular dependencies detected: ${cycles.map(c => c.join(' -> ')).join(', ')}`);
    }

    // Check for missing dependencies
    for (const edge of this.edges) {
      if (!this.nodes.has(edge.from)) {
        errors.push(`Missing dependency: ${edge.from} (required by ${edge.to})`);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}
