export type Vec3 = { x: number; y: number; z: number };
export type DomainId =
  | "leadgen" | "outreach" | "pipeline" | "engagement" | "followups" | "content"
  | "systems" | "finance" | "ops" | "recovery" | "data" | "automation";
export type ViewId = "agents" | "brain" | "deck" | "team" | "usage" | "settings";
export interface Domain { id: DomainId; label: string; color: string; icon: string; }
export type NodeKind = "core" | "agent" | "client";
export interface GraphNode {
  id: string; kind: NodeKind; label: string; domain: DomainId; icon: string;
  pos: Vec3; level: number; xp: number; status: "active" | "idle" | "working";
  queue: string[]; metric: string; series: number[];
}
export interface Link { from: string; to: string; }
export interface FeedEvent { id: string; t: number; domain: DomainId; tag: string; text: string; }
