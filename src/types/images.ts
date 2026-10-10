/**
 * Types for Custom Image Management and Library in Ambience Intelligence Studio
 */

export type FocalPoint = 'center' | 'top' | 'bottom' | 'left' | 'right';

export interface ImageAsset {
  id: string;               // Unique ID: img_${timestamp}_${random}
  name: string;             // User-editable display name
  filename: string;         // Original file name
  mimeType: string;         // e.g. 'image/png' | 'image/jpeg' | 'image/webp'
  size: number;             // bytes
  dataUrl: string;          // base64 / blob data URL for rendering
  width?: number;
  height?: number;
  createdAt: number;
}

export interface CustomImageAssignment {
  targetKey: string;        // e.g. 'world:hogwarts-wizarding', 'location:common-room', 'project:proj-123'
  assetId: string;          // Reference to ImageAsset.id
  focalPoint?: FocalPoint;  // Alignment for cover fit
  assignedAt: number;
}

export interface ImageUsageInfo {
  targetKey: string;
  label: string;
  category: 'World' | 'Location' | 'Project' | 'Preset' | 'Scene Preview';
}
