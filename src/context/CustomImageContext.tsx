import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { ImageAsset, CustomImageAssignment, FocalPoint, ImageUsageInfo } from '../types/images';
import { ImageStorage } from '../services/imageStorage';
import { resolveTargetInfo } from '../utils/imageTargetResolver';

interface ModalState {
  isOpen: boolean;
  mode: 'picker' | 'library';
  targetKey?: string;
  targetLabel?: string;
}

interface CustomImageContextType {
  assets: ImageAsset[];
  assignments: Record<string, CustomImageAssignment>;
  isLoading: boolean;
  getCustomImage: (targetKey: string) => { asset: ImageAsset; focalPoint: FocalPoint } | null;
  assignImage: (targetKey: string, assetId: string, focalPoint?: FocalPoint) => Promise<void>;
  restoreDefault: (targetKey: string) => Promise<void>;
  uploadAndAssign: (targetKey: string, file: File, focalPoint?: FocalPoint, customName?: string) => Promise<ImageAsset>;
  uploadToLibrary: (file: File, customName?: string) => Promise<ImageAsset>;
  deleteAsset: (assetId: string) => Promise<{ success: boolean; usageCount: number }>;
  renameAsset: (assetId: string, newName: string) => Promise<void>;
  updateFocalPoint: (targetKey: string, focalPoint: FocalPoint) => Promise<void>;
  getAssetUsages: (assetId: string) => ImageUsageInfo[];
  modalState: ModalState;
  openPickerForTarget: (targetKey: string, targetLabel: string) => void;
  openLibraryModal: () => void;
  closeModal: () => void;
}

const CustomImageContext = createContext<CustomImageContextType | undefined>(undefined);

export const CustomImageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [assets, setAssets] = useState<ImageAsset[]>([]);
  const [assignments, setAssignments] = useState<Record<string, CustomImageAssignment>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    mode: 'library',
  });

  // Load assets and assignments on mount
  const refreshData = useCallback(async () => {
    try {
      const [loadedAssets, loadedAssignments] = await Promise.all([
        ImageStorage.getAllAssets(),
        ImageStorage.getAllAssignments(),
      ]);
      setAssets(loadedAssets);
      setAssignments(loadedAssignments);
    } catch (err) {
      console.error('Error loading custom images:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Lookup helper for any card by targetKey
  const getCustomImage = useCallback(
    (targetKey: string): { asset: ImageAsset; focalPoint: FocalPoint } | null => {
      const assignment = assignments[targetKey];
      if (!assignment) return null;
      const asset = assets.find((a) => a.id === assignment.assetId);
      if (!asset) return null;
      return {
        asset,
        focalPoint: assignment.focalPoint || 'center',
      };
    },
    [assignments, assets]
  );

  // Assign existing asset to target
  const assignImage = useCallback(
    async (targetKey: string, assetId: string, focalPoint: FocalPoint = 'center') => {
      await ImageStorage.setAssignment(targetKey, assetId, focalPoint);
      setAssignments((prev) => ({
        ...prev,
        [targetKey]: {
          targetKey,
          assetId,
          focalPoint,
          assignedAt: Date.now(),
        },
      }));
    },
    []
  );

  // Restore card to default artwork
  const restoreDefault = useCallback(async (targetKey: string) => {
    await ImageStorage.removeAssignment(targetKey);
    setAssignments((prev) => {
      const next = { ...prev };
      delete next[targetKey];
      return next;
    });
  }, []);

  // Upload file and immediately assign to a card
  const uploadAndAssign = useCallback(
    async (targetKey: string, file: File, focalPoint: FocalPoint = 'center', customName?: string) => {
      const asset = await ImageStorage.saveAsset(file, customName);
      await ImageStorage.setAssignment(targetKey, asset.id, focalPoint);

      setAssets((prev) => [asset, ...prev]);
      setAssignments((prev) => ({
        ...prev,
        [targetKey]: {
          targetKey,
          assetId: asset.id,
          focalPoint,
          assignedAt: Date.now(),
        },
      }));

      return asset;
    },
    []
  );

  // Upload file to library without assigning
  const uploadToLibrary = useCallback(async (file: File, customName?: string) => {
    const asset = await ImageStorage.saveAsset(file, customName);
    setAssets((prev) => [asset, ...prev]);
    return asset;
  }, []);

  // Delete asset from library
  const deleteAsset = useCallback(
    async (assetId: string) => {
      // Find all targetKeys using this asset
      const usingKeys = Object.entries(assignments)
        .filter(([_, a]) => a.assetId === assetId)
        .map(([k]) => k);

      await ImageStorage.deleteAsset(assetId);

      setAssets((prev) => prev.filter((a) => a.id !== assetId));
      setAssignments((prev) => {
        const next = { ...prev };
        for (const k of usingKeys) {
          delete next[k];
        }
        return next;
      });

      return { success: true, usageCount: usingKeys.length };
    },
    [assignments]
  );

  // Rename asset in library
  const renameAsset = useCallback(async (assetId: string, newName: string) => {
    await ImageStorage.renameAsset(assetId, newName);
    setAssets((prev) =>
      prev.map((a) => (a.id === assetId ? { ...a, name: newName.trim() } : a))
    );
  }, []);

  // Update focal point alignment for a card
  const updateFocalPoint = useCallback(
    async (targetKey: string, focalPoint: FocalPoint) => {
      const current = assignments[targetKey];
      if (!current) return;
      await ImageStorage.setAssignment(targetKey, current.assetId, focalPoint);
      setAssignments((prev) => ({
        ...prev,
        [targetKey]: {
          ...current,
          focalPoint,
        },
      }));
    },
    [assignments]
  );

  // Get human-readable usage info for an asset
  const getAssetUsages = useCallback(
    (assetId: string): ImageUsageInfo[] => {
      const keys = Object.entries(assignments)
        .filter(([_, a]) => a.assetId === assetId)
        .map(([k]) => k);

      return keys.map((key) => resolveTargetInfo(key));
    },
    [assignments]
  );

  // Modal actions
  const openPickerForTarget = useCallback((targetKey: string, targetLabel: string) => {
    setModalState({
      isOpen: true,
      mode: 'picker',
      targetKey,
      targetLabel,
    });
  }, []);

  const openLibraryModal = useCallback(() => {
    setModalState({
      isOpen: true,
      mode: 'library',
    });
  }, []);

  const closeModal = useCallback(() => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const value = useMemo(
    () => ({
      assets,
      assignments,
      isLoading,
      getCustomImage,
      assignImage,
      restoreDefault,
      uploadAndAssign,
      uploadToLibrary,
      deleteAsset,
      renameAsset,
      updateFocalPoint,
      getAssetUsages,
      modalState,
      openPickerForTarget,
      openLibraryModal,
      closeModal,
    }),
    [
      assets,
      assignments,
      isLoading,
      getCustomImage,
      assignImage,
      restoreDefault,
      uploadAndAssign,
      uploadToLibrary,
      deleteAsset,
      renameAsset,
      updateFocalPoint,
      getAssetUsages,
      modalState,
      openPickerForTarget,
      openLibraryModal,
      closeModal,
    ]
  );

  return <CustomImageContext.Provider value={value}>{children}</CustomImageContext.Provider>;
};

export const useCustomImages = (): CustomImageContextType => {
  const context = useContext(CustomImageContext);
  if (!context) {
    throw new Error('useCustomImages must be used within a CustomImageProvider');
  }
  return context;
};
