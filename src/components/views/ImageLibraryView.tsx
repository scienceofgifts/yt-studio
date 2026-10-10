import React, { useState, useRef } from 'react';
import { useCustomImages } from '../../context/CustomImageContext';
import { ImageAsset, FocalPoint } from '../../types/images';
import {
  ImageIcon,
  Upload,
  Search,
  Trash2,
  Edit2,
  Check,
  AlertTriangle,
  HardDrive,
  ExternalLink,
  Layers,
  Crosshair,
  Filter,
} from 'lucide-react';

const MAX_FILE_SIZE_MB = 15;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

export const ImageLibraryView: React.FC = () => {
  const {
    assets,
    uploadToLibrary,
    deleteAsset,
    renameAsset,
    getAssetUsages,
  } = useCustomImages();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(assets[0]?.id || null);
  const [editingAssetId, setEditingAssetId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndUpload = async (file: File) => {
    setErrorMessage(null);
    if (!ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
      setErrorMessage('Unsupported file format. Please upload a PNG, JPG, or WebP image.');
      return;
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setErrorMessage(`File exceeds ${MAX_FILE_SIZE_MB}MB size limit.`);
      return;
    }

    try {
      const newAsset = await uploadToLibrary(file);
      setSelectedAssetId(newAsset.id);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save image to IndexedDB.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndUpload(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndUpload(e.dataTransfer.files[0]);
    }
  };

  const handleStartRename = (asset: ImageAsset) => {
    setEditingAssetId(asset.id);
    setEditingName(asset.name);
  };

  const handleSaveRename = async (assetId: string) => {
    if (editingName.trim()) {
      await renameAsset(assetId, editingName.trim());
    }
    setEditingAssetId(null);
  };

  const handleExecuteDelete = async (assetId: string) => {
    await deleteAsset(assetId);
    setDeleteConfirmId(null);
    if (selectedAssetId === assetId) {
      const remaining = assets.filter((a) => a.id !== assetId);
      setSelectedAssetId(remaining[0]?.id || null);
    }
  };

  const filteredAssets = assets.filter((a) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return a.name.toLowerCase().includes(q) || a.filename.toLowerCase().includes(q);
  });

  const selectedAsset = assets.find((a) => a.id === selectedAssetId) || assets[0];
  const selectedUsages = selectedAsset ? getAssetUsages(selectedAsset.id) : [];

  return (
    <div className="max-w-6xl mx-auto pb-20">
      {/* Top Banner */}
      <div className="bg-[#101722]/80 border border-[#1E2B3E] rounded-2xl p-6 backdrop-blur-sm flex flex-wrap items-center justify-between gap-4 mb-6 shadow-xl">
        <div>
          <h2 className="text-lg font-semibold text-[#F2EEE6] flex items-center gap-2.5 font-display">
            <ImageIcon className="w-5 h-5 text-[#E8AE62]" />
            Studio Image Library
          </h2>
          <p className="text-xs text-[#A1AEC0] mt-1">
            Central repository of custom artwork, atmospheric reference photos, and card thumbnails
          </p>
        </div>

        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-[#0B1018] bg-[#E8AE62] hover:bg-[#F2BE7D] rounded-xl shadow-md transition-all"
          >
            <Upload className="w-4 h-4" />
            Upload to Library
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 bg-rose-950/30 border border-rose-800/60 rounded-xl text-xs text-rose-300 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Toolbar + Grid + Dropzone */}
        <div className="lg:col-span-2 space-y-4">
          {/* Search bar & count */}
          <div className="flex items-center justify-between gap-3 p-3 bg-[#101722] border border-[#1E2B3E] rounded-2xl">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-[#A1AEC0] absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search images by filename or title..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#0B1018] border border-[#1E2B3E] rounded-xl text-[#F2EEE6] placeholder-[#A1AEC0]/40 focus:outline-none focus:border-[#E8AE62]"
              />
            </div>
            <div className="text-xs font-mono text-[#A1AEC0] px-3 py-1 rounded-lg bg-[#0B1018] border border-[#1E2B3E]">
              {filteredAssets.length} {filteredAssets.length === 1 ? 'Asset' : 'Assets'}
            </div>
          </div>

          {/* Drag & drop quick upload bar */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`p-4 border border-dashed rounded-2xl text-center cursor-pointer transition-all ${
              dragActive
                ? 'border-[#E8AE62] bg-[#E8AE62]/10'
                : 'border-[#1E2B3E] hover:border-[#283952] bg-[#0B1018]/40 hover:bg-[#0B1018]'
            }`}
          >
            <div className="flex items-center justify-center gap-2 text-xs text-[#A1AEC0]">
              <Upload className="w-4 h-4 text-[#E8AE62]" />
              <span>Drop an image anywhere here or click to browse (PNG, JPG, WebP)</span>
            </div>
          </div>

          {/* Grid of Images */}
          {filteredAssets.length === 0 ? (
            <div className="p-16 text-center bg-[#101722]/40 border border-[#1E2B3E] rounded-2xl">
              <ImageIcon className="w-10 h-10 text-[#A1AEC0]/30 mx-auto mb-2" />
              <h4 className="text-sm font-semibold text-[#F2EEE6] mb-1 font-display">
                No Artwork Assets Found
              </h4>
              <p className="text-xs text-[#A1AEC0] max-w-sm mx-auto mb-4">
                Upload images to personalize your ambience cards and create consistent moodboards.
              </p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 text-xs font-semibold text-[#0B1018] bg-[#E8AE62] hover:bg-[#F2BE7D] rounded-xl transition-all shadow-md"
              >
                Upload Artwork Now
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
              {filteredAssets.map((asset) => {
                const isSelected = selectedAsset?.id === asset.id;
                const usages = getAssetUsages(asset.id);

                return (
                  <div
                    key={asset.id}
                    onClick={() => setSelectedAssetId(asset.id)}
                    className={`group relative rounded-2xl overflow-hidden border cursor-pointer transition-all duration-150 flex flex-col ${
                      isSelected
                        ? 'border-[#E8AE62] ring-2 ring-[#E8AE62]/50 bg-[#151F2E] shadow-xl'
                        : 'border-[#1E2B3E] hover:border-[#283952] bg-[#101722] hover:bg-[#131D2C]'
                    }`}
                  >
                    <div className="relative w-full aspect-[16/10] bg-[#070B10] overflow-hidden">
                      <img
                        src={asset.dataUrl}
                        alt={asset.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      {isSelected && (
                        <div className="absolute top-2 right-2 p-1 bg-[#E8AE62] text-[#0B1018] rounded-full shadow-md z-10">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                      {usages.length > 0 && (
                        <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-[#0B1018]/85 text-[10px] font-mono text-[#E8AE62] border border-[#1E2B3E] shadow-sm">
                          {usages.length} in use
                        </div>
                      )}
                    </div>

                    <div className="p-3 bg-[#101722] flex-1 flex flex-col justify-between">
                      <div className="text-xs font-medium text-[#F2EEE6] truncate group-hover:text-[#E8AE62] transition-colors">
                        {asset.name}
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-[#A1AEC0] font-mono mt-1">
                        <span>{(asset.size / 1024).toFixed(0)} KB</span>
                        <span>{new Date(asset.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right 1 Column: Detail Inspection Panel */}
        <div>
          {selectedAsset ? (
            <div className="bg-[#101722] border border-[#1E2B3E] rounded-2xl p-5 sticky top-6 shadow-xl space-y-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-[#A1AEC0] font-mono pb-2 border-b border-[#1E2B3E] flex items-center justify-between">
                <span>Asset Inspection</span>
                <span className="text-[#E8AE62]">IndexedDB Cached</span>
              </div>

              {/* Large Image Preview */}
              <div className="relative w-full aspect-[16/10] rounded-xl overflow-hidden border border-[#283952] bg-[#070B10] shadow-inner">
                <img
                  src={selectedAsset.dataUrl}
                  alt={selectedAsset.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Title & Rename Form */}
              <div>
                {editingAssetId === selectedAsset.id ? (
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className="px-2.5 py-1 text-xs bg-[#0B1018] border border-[#E8AE62] rounded-lg text-[#F2EEE6] w-full"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => handleSaveRename(selectedAsset.id)}
                      className="p-1 text-[#E8AE62]"
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-semibold text-[#F2EEE6] font-display truncate">
                      {selectedAsset.name}
                    </h3>
                    <button
                      type="button"
                      onClick={() => handleStartRename(selectedAsset)}
                      className="p-1.5 text-[#A1AEC0] hover:text-[#E8AE62] rounded-lg hover:bg-[#192434] transition-colors"
                      title="Rename"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
                <div className="text-[11px] text-[#A1AEC0] font-mono truncate mt-0.5">
                  {selectedAsset.filename}
                </div>
              </div>

              {/* Metadata specs */}
              <div className="grid grid-cols-2 gap-2 text-xs font-mono text-[#F2EEE6]">
                <div className="p-2.5 rounded-xl bg-[#0B1018] border border-[#1E2B3E]">
                  <div className="text-[10px] text-[#A1AEC0] uppercase">File Size</div>
                  <div className="font-semibold">{(selectedAsset.size / 1024).toFixed(1)} KB</div>
                </div>
                <div className="p-2.5 rounded-xl bg-[#0B1018] border border-[#1E2B3E]">
                  <div className="text-[10px] text-[#A1AEC0] uppercase">Resolution</div>
                  <div className="font-semibold">{selectedAsset.width || '?'} × {selectedAsset.height || '?'}</div>
                </div>
              </div>

              {/* Usages in Workspace */}
              <div>
                <label className="block text-xs font-semibold uppercase font-mono tracking-wider text-[#A1AEC0] mb-2">
                  Active Card References ({selectedUsages.length})
                </label>
                {selectedUsages.length === 0 ? (
                  <div className="p-3 rounded-xl bg-[#0B1018] border border-[#1E2B3E] text-xs text-[#A1AEC0] italic">
                    Not currently assigned to any world, location, or project cards.
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-36 overflow-y-auto">
                    {selectedUsages.map((usage) => (
                      <div
                        key={usage.targetKey}
                        className="p-2 rounded-xl bg-[#0B1018] border border-[#1E2B3E] text-xs text-[#F2EEE6] flex items-center justify-between"
                      >
                        <span className="truncate">{usage.label}</span>
                        <span className="text-[10px] font-mono text-[#E8AE62] px-1.5 py-0.5 rounded bg-[#192434] border border-[#283952]">
                          {usage.category}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Delete with Safeguard */}
              <div className="pt-2 border-t border-[#1E2B3E]">
                {deleteConfirmId === selectedAsset.id ? (
                  <div className="p-3.5 bg-rose-950/40 border border-rose-800/80 rounded-xl space-y-2.5">
                    <div className="text-xs text-rose-300 leading-snug">
                      {selectedUsages.length > 0
                        ? `Warning: In use by ${selectedUsages.length} card(s). Deleting this image will safely restore those cards to their default artwork.`
                        : 'Are you sure you want to delete this image from your library?'}
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmId(null)}
                        className="px-3 py-1.5 text-xs text-[#A1AEC0] hover:text-[#F2EEE6] bg-[#0B1018] rounded-lg"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleExecuteDelete(selectedAsset.id)}
                        className="px-3.5 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-lg shadow-sm"
                      >
                        Confirm Delete
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setDeleteConfirmId(selectedAsset.id)}
                    className="w-full flex items-center justify-center gap-2 py-2 text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-950/20 rounded-xl border border-rose-900/30 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete From Library
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-[#A1AEC0] bg-[#101722] border border-[#1E2B3E] rounded-2xl">
              Select an image from the library grid to inspect details and see where it is referenced.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
