import React, { useState, useRef, useEffect } from 'react';
import { useCustomImages } from '../../context/CustomImageContext';
import { ImageAsset, FocalPoint } from '../../types/images';
import {
  X,
  Upload,
  Layers,
  Search,
  Trash2,
  Edit2,
  Check,
  AlertTriangle,
  Image as ImageIcon,
  Crosshair,
  FileText,
  Calendar,
  CheckCircle2,
  HardDrive,
} from 'lucide-react';

const MAX_FILE_SIZE_MB = 15;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

export const ImageManagerModal: React.FC = () => {
  const {
    modalState,
    closeModal,
    assets,
    assignImage,
    uploadAndAssign,
    uploadToLibrary,
    deleteAsset,
    renameAsset,
    getAssetUsages,
  } = useCustomImages();

  const isPicker = modalState.mode === 'picker' && !!modalState.targetKey;
  const targetKey = modalState.targetKey || '';
  const targetLabel = modalState.targetLabel || 'Selected Card';

  const [activeTab, setActiveTab] = useState<'upload' | 'library'>(isPicker ? 'upload' : 'library');

  // Upload tab state
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [customName, setCustomName] = useState('');
  const [focalPoint, setFocalPoint] = useState<FocalPoint>('center');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Library tab state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [libraryFocalPoint, setLibraryFocalPoint] = useState<FocalPoint>('center');
  const [editingAssetId, setEditingAssetId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const libraryUploadInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (modalState.isOpen) {
      setActiveTab(isPicker ? 'upload' : 'library');
      setSelectedFile(null);
      setPreviewUrl(null);
      setErrorMessage(null);
      setCustomName('');
      setFocalPoint('center');
      setLibraryFocalPoint('center');
      if (assets.length > 0) {
        setSelectedAssetId(assets[0].id);
      }
    }
  }, [modalState.isOpen, isPicker, assets]);

  if (!modalState.isOpen) return null;

  const validateFile = (file: File): boolean => {
    setErrorMessage(null);
    if (!ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
      setErrorMessage('Unsupported file format. Please upload a PNG, JPG, or WebP image.');
      return false;
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setErrorMessage(`File exceeds ${MAX_FILE_SIZE_MB}MB size limit. Please choose a smaller image.`);
      return false;
    }
    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processSelectedFile(file);
    }
  };

  const processSelectedFile = (file: File) => {
    if (!validateFile(file)) return;

    setSelectedFile(file);
    setCustomName(file.name.replace(/\.[^/.]+$/, ''));

    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
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
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setIsSubmitting(true);
    try {
      if (isPicker && targetKey) {
        await uploadAndAssign(targetKey, selectedFile, focalPoint, customName.trim());
      } else {
        await uploadToLibrary(selectedFile, customName.trim());
      }
      closeModal();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save image. Please check storage capacity.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAssignFromLibrary = async () => {
    if (!selectedAssetId || !targetKey) return;
    setIsSubmitting(true);
    try {
      await assignImage(targetKey, selectedAssetId, libraryFocalPoint);
      closeModal();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to assign image.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLibraryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && validateFile(file)) {
      try {
        const newAsset = await uploadToLibrary(file);
        setSelectedAssetId(newAsset.id);
      } catch (err: any) {
        setErrorMessage(err.message || 'Failed to save to library.');
      }
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
      setSelectedAssetId(assets.length > 1 ? assets[0].id : null);
    }
  };

  const filteredAssets = assets.filter((a) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return a.name.toLowerCase().includes(q) || a.filename.toLowerCase().includes(q);
  });

  const selectedAsset = assets.find((a) => a.id === selectedAssetId);
  const selectedAssetUsages = selectedAsset ? getAssetUsages(selectedAsset.id) : [];

  const focalOptions: { id: FocalPoint; label: string }[] = [
    { id: 'center', label: 'Center' },
    { id: 'top', label: 'Top' },
    { id: 'bottom', label: 'Bottom' },
    { id: 'left', label: 'Left' },
    { id: 'right', label: 'Right' },
  ];

  const getFocalPosition = (fp: FocalPoint): string => {
    switch (fp) {
      case 'top': return '50% 15%';
      case 'bottom': return '50% 85%';
      case 'left': return '15% 50%';
      case 'right': return '85% 50%';
      default: return 'center center';
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={closeModal}
    >
      <div
        className="bg-[#101722] border border-[#283952] rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="px-6 py-4 border-b border-[#1E2B3E] bg-[#0B1018]/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#192434] border border-[#283952] flex items-center justify-center text-[#E8AE62]">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#F2EEE6] font-display">
                {isPicker ? `Customize Artwork: ${targetLabel}` : 'Studio Image Library'}
              </h3>
              <p className="text-[11px] text-[#A1AEC0]">
                {isPicker
                  ? 'Upload or pick an image to replace this card\'s default artwork'
                  : 'Manage uploaded atmospheric reference artwork and thumbnails'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeModal}
            className="p-1.5 rounded-lg text-[#A1AEC0] hover:text-[#F2EEE6] hover:bg-[#192434] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation (when opened in picker mode) */}
        {isPicker && (
          <div className="flex border-b border-[#1E2B3E] px-6 bg-[#0B1018]/30">
            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-all ${
                activeTab === 'upload'
                  ? 'border-[#E8AE62] text-[#E8AE62]'
                  : 'border-transparent text-[#A1AEC0] hover:text-[#F2EEE6]'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              Upload New Image
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('library')}
              className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-all ${
                activeTab === 'library'
                  ? 'border-[#E8AE62] text-[#E8AE62]'
                  : 'border-transparent text-[#A1AEC0] hover:text-[#F2EEE6]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Choose from Library ({assets.length})
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {errorMessage && (
            <div className="mb-4 p-3 bg-rose-950/30 border border-rose-800/60 rounded-xl text-xs text-rose-300 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* TAB 1: UPLOAD NEW IMAGE */}
          {activeTab === 'upload' && (
            <form onSubmit={handleUploadSubmit} className="space-y-5">
              {!previewUrl ? (
                /* Drag and drop upload dropzone */
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${
                    dragActive
                      ? 'border-[#E8AE62] bg-[#E8AE62]/10 scale-[0.99]'
                      : 'border-[#1E2B3E] hover:border-[#283952] bg-[#0B1018]/50 hover:bg-[#0B1018]'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className="w-12 h-12 rounded-2xl bg-[#192434] border border-[#283952] flex items-center justify-center mx-auto mb-3 text-[#E8AE62]">
                    <Upload className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-semibold text-[#F2EEE6] mb-1 font-display">
                    Drag and drop image here or click to browse
                  </h4>
                  <p className="text-xs text-[#A1AEC0] mb-3">
                    Supports high-resolution PNG, JPG, or WebP files up to {MAX_FILE_SIZE_MB}MB
                  </p>
                  <span className="inline-block px-3 py-1 rounded-lg bg-[#192434] text-[11px] font-mono text-[#E8AE62] border border-[#283952]">
                    Aspect Ratio Preserved with Smart Cover-Fit
                  </span>
                </div>
              ) : (
                /* Image Preview & Settings */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left: Aspect Crop Preview */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#A1AEC0] mb-2 font-mono">
                      Live Card Crop Preview
                    </label>
                    <div className="relative w-full aspect-[16/10] rounded-xl overflow-hidden border border-[#283952] bg-[#070B10] shadow-inner">
                      <img
                        src={previewUrl}
                        alt="Upload Preview"
                        className="w-full h-full object-cover transition-all duration-300"
                        style={{ objectPosition: getFocalPosition(focalPoint) }}
                      />
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-[#0B1018]/80 text-[10px] font-mono text-[#E8AE62] border border-[#1E2B3E]">
                        Focal Point: {focalPoint.toUpperCase()}
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[11px] text-[#A1AEC0]">
                        {selectedFile && `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB · ${selectedFile.type}`}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedFile(null);
                          setPreviewUrl(null);
                        }}
                        className="text-xs text-rose-400 hover:text-rose-300"
                      >
                        Choose different file
                      </button>
                    </div>
                  </div>

                  {/* Right: Crop & Title Controls */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-[#F2EEE6] mb-1.5">
                        Image Name
                      </label>
                      <input
                        type="text"
                        value={customName}
                        onChange={(e) => setCustomName(e.target.value)}
                        placeholder="Artwork title"
                        className="w-full px-3 py-2 text-xs bg-[#0B1018] border border-[#1E2B3E] rounded-xl text-[#F2EEE6] focus:outline-none focus:border-[#E8AE62]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#F2EEE6] mb-1.5 flex items-center gap-1.5">
                        <Crosshair className="w-3.5 h-3.5 text-[#E8AE62]" />
                        Focal Point Alignment (Crop Anchor)
                      </label>
                      <p className="text-[11px] text-[#A1AEC0] mb-2">
                        Choose which part of the image stays in focus when cropped to card dimensions:
                      </p>
                      <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                        {focalOptions.map((opt) => (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => setFocalPoint(opt.id)}
                            className={`py-1.5 px-2 text-xs rounded-lg border text-center transition-all ${
                              focalPoint === opt.id
                                ? 'bg-[#192434] text-[#E8AE62] border-[#E8AE62] font-semibold shadow-xs'
                                : 'bg-[#0B1018] text-[#A1AEC0] border-[#1E2B3E] hover:text-[#F2EEE6]'
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="p-3 bg-[#0B1018] border border-[#1E2B3E] rounded-xl text-xs text-[#A1AEC0] space-y-1">
                      <div className="text-[#F2EEE6] font-medium flex items-center gap-1.5">
                        <HardDrive className="w-3.5 h-3.5 text-[#E8AE62]" />
                        Persistent IndexedDB Storage
                      </div>
                      <p className="text-[11px] leading-relaxed">
                        This image will be stored securely in your browser's dedicated database and available across all project sessions.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#1E2B3E]">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-xs text-[#A1AEC0] hover:text-[#F2EEE6]"
                >
                  Cancel
                </button>
                {previewUrl && (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-[#0B1018] bg-[#E8AE62] hover:bg-[#F2BE7D] rounded-xl shadow-md transition-all disabled:opacity-50"
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                    {isPicker ? `Apply to ${targetLabel}` : 'Add to Studio Library'}
                  </button>
                )}
              </div>
            </form>
          )}

          {/* TAB 2: CHOOSE FROM IMAGE LIBRARY / LIBRARY MANAGEMENT */}
          {activeTab === 'library' && (
            <div className="space-y-5">
              {/* Toolbar: Search + Quick Upload to Library */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="w-3.5 h-3.5 text-[#A1AEC0] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by filename or title..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#0B1018] border border-[#1E2B3E] rounded-xl text-[#F2EEE6] placeholder-[#A1AEC0]/40 focus:outline-none focus:border-[#E8AE62]"
                  />
                </div>

                <div>
                  <input
                    ref={libraryUploadInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleLibraryUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => libraryUploadInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-[#F2EEE6] hover:text-[#E8AE62] bg-[#192434] hover:bg-[#223146] border border-[#283952] rounded-xl transition-colors shadow-sm"
                  >
                    <Upload className="w-3.5 h-3.5 text-[#E8AE62]" />
                    Upload Image
                  </button>
                </div>
              </div>

              {assets.length === 0 ? (
                /* Empty Library State */
                <div className="p-12 text-center bg-[#0B1018] border border-[#1E2B3E] rounded-2xl">
                  <ImageIcon className="w-10 h-10 text-[#A1AEC0]/40 mx-auto mb-2" />
                  <h4 className="text-sm font-semibold text-[#F2EEE6] mb-1 font-display">
                    Your Image Library is Empty
                  </h4>
                  <p className="text-xs text-[#A1AEC0] max-w-sm mx-auto mb-4">
                    Upload PNG, JPG, or WebP images to build a persistent collection of custom world and location thumbnails.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('upload')}
                    className="px-4 py-2 text-xs font-semibold text-[#0B1018] bg-[#E8AE62] hover:bg-[#F2BE7D] rounded-xl transition-colors shadow-md"
                  >
                    Upload Your First Image
                  </button>
                </div>
              ) : (
                /* Library View: Grid + Sidebar Details */
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left: Thumbnails Grid (2 columns on lg) */}
                  <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[420px] overflow-y-auto pr-1">
                    {filteredAssets.map((asset) => {
                      const isSelected = selectedAssetId === asset.id;
                      const usages = getAssetUsages(asset.id);

                      return (
                        <div
                          key={asset.id}
                          onClick={() => setSelectedAssetId(asset.id)}
                          className={`group relative rounded-xl overflow-hidden border cursor-pointer transition-all duration-150 flex flex-col ${
                            isSelected
                              ? 'border-[#E8AE62] ring-2 ring-[#E8AE62]/40 bg-[#151F2E] shadow-lg'
                              : 'border-[#1E2B3E] hover:border-[#283952] bg-[#0B1018]'
                          }`}
                        >
                          <div className="relative w-full aspect-[16/10] bg-[#070B10] overflow-hidden">
                            <img
                              src={asset.dataUrl}
                              alt={asset.name}
                              className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                            />
                            {isSelected && (
                              <div className="absolute top-2 right-2 p-1 bg-[#E8AE62] text-[#0B1018] rounded-full shadow-md">
                                <Check className="w-3 h-3 stroke-[3]" />
                              </div>
                            )}
                            {usages.length > 0 && (
                              <div className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded bg-[#0B1018]/80 text-[9px] font-mono text-[#E8AE62] border border-[#1E2B3E]">
                                {usages.length} {usages.length === 1 ? 'card' : 'cards'}
                              </div>
                            )}
                          </div>

                          <div className="p-2 truncate bg-[#0B1018]">
                            <div className="text-[11px] font-medium text-[#F2EEE6] truncate">
                              {asset.name}
                            </div>
                            <div className="text-[9px] text-[#A1AEC0] truncate font-mono">
                              {(asset.size / 1024).toFixed(0)} KB
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Right: Selected Image Details & Actions */}
                  {selectedAsset ? (
                    <div className="p-4 bg-[#0B1018] border border-[#1E2B3E] rounded-xl flex flex-col justify-between space-y-4">
                      <div>
                        {/* Selected Preview */}
                        <div className="relative w-full aspect-[16/10] rounded-lg overflow-hidden border border-[#283952] mb-3 bg-[#070B10]">
                          <img
                            src={selectedAsset.dataUrl}
                            alt={selectedAsset.name}
                            className="w-full h-full object-cover"
                            style={{ objectPosition: getFocalPosition(libraryFocalPoint) }}
                          />
                        </div>

                        {/* Title & Rename */}
                        <div className="mb-3">
                          {editingAssetId === selectedAsset.id ? (
                            <div className="flex items-center gap-1.5">
                              <input
                                type="text"
                                value={editingName}
                                onChange={(e) => setEditingName(e.target.value)}
                                className="px-2 py-1 text-xs bg-[#101722] border border-[#E8AE62] rounded-lg text-[#F2EEE6] w-full"
                                autoFocus
                              />
                              <button
                                type="button"
                                onClick={() => handleSaveRename(selectedAsset.id)}
                                className="p-1 text-[#E8AE62]"
                              >
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between gap-2">
                              <h5 className="text-xs font-semibold text-[#F2EEE6] truncate font-display">
                                {selectedAsset.name}
                              </h5>
                              <button
                                type="button"
                                onClick={() => handleStartRename(selectedAsset)}
                                className="p-1 text-[#A1AEC0] hover:text-[#E8AE62]"
                                title="Rename image"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                          <div className="text-[10px] text-[#A1AEC0] font-mono truncate mt-0.5">
                            {selectedAsset.filename}
                          </div>
                        </div>

                        {/* Metadata pills */}
                        <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-[#A1AEC0] mb-3">
                          <div className="p-2 rounded bg-[#101722] border border-[#1E2B3E]">
                            Size: {(selectedAsset.size / 1024).toFixed(0)} KB
                          </div>
                          <div className="p-2 rounded bg-[#101722] border border-[#1E2B3E]">
                            Dim: {selectedAsset.width || '?'}x{selectedAsset.height || '?'}
                          </div>
                        </div>

                        {/* Usage Location Info */}
                        <div className="mb-3">
                          <label className="block text-[10px] uppercase font-mono tracking-wider text-[#A1AEC0] mb-1">
                            Current Usage ({selectedAssetUsages.length})
                          </label>
                          {selectedAssetUsages.length === 0 ? (
                            <div className="text-[11px] text-[#A1AEC0]/60 italic">
                              Not currently assigned to any cards.
                            </div>
                          ) : (
                            <div className="space-y-1 max-h-24 overflow-y-auto">
                              {selectedAssetUsages.map((u) => (
                                <div
                                  key={u.targetKey}
                                  className="text-[10px] p-1.5 rounded bg-[#101722] border border-[#1E2B3E] text-[#F2EEE6] flex items-center justify-between"
                                >
                                  <span className="truncate">{u.label}</span>
                                  <span className="text-[#E8AE62] font-mono text-[9px] shrink-0 ml-1">
                                    {u.category}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Focal Point for Assignment (only in picker mode) */}
                        {isPicker && (
                          <div className="mb-3">
                            <label className="block text-[10px] uppercase font-mono tracking-wider text-[#A1AEC0] mb-1">
                              Crop Alignment on {targetLabel}
                            </label>
                            <div className="grid grid-cols-5 gap-1">
                              {focalOptions.map((opt) => (
                                <button
                                  key={opt.id}
                                  type="button"
                                  onClick={() => setLibraryFocalPoint(opt.id)}
                                  className={`py-1 text-[10px] rounded border text-center transition-colors ${
                                    libraryFocalPoint === opt.id
                                      ? 'bg-[#192434] text-[#E8AE62] border-[#E8AE62] font-semibold'
                                      : 'bg-[#101722] text-[#A1AEC0] border-[#1E2B3E]'
                                  }`}
                                >
                                  {opt.label.slice(0, 3)}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Delete with Safeguard */}
                      <div>
                        {deleteConfirmId === selectedAsset.id ? (
                          <div className="p-3 bg-rose-950/40 border border-rose-800/80 rounded-xl space-y-2">
                            <div className="text-[11px] text-rose-300">
                              {selectedAssetUsages.length > 0
                                ? `Warning: In use by ${selectedAssetUsages.length} card(s). Deleting will restore them to default artwork.`
                                : 'Permanently remove from library?'}
                            </div>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => setDeleteConfirmId(null)}
                                className="px-2.5 py-1 text-xs text-[#A1AEC0] hover:text-[#F2EEE6] bg-[#0B1018] rounded-lg"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={() => handleExecuteDelete(selectedAsset.id)}
                                className="px-2.5 py-1 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-lg"
                              >
                                Confirm Delete
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(selectedAsset.id)}
                            className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/20 rounded-lg border border-rose-900/30 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Delete Image
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 text-center text-xs text-[#A1AEC0] border border-[#1E2B3E] rounded-xl flex items-center justify-center">
                      Select an image from the grid to view details and assign.
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons for Library */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#1E2B3E]">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-xs text-[#A1AEC0] hover:text-[#F2EEE6]"
                >
                  Close
                </button>
                {isPicker && selectedAsset && (
                  <button
                    type="button"
                    onClick={handleAssignFromLibrary}
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-[#0B1018] bg-[#E8AE62] hover:bg-[#F2BE7D] rounded-xl shadow-md transition-all disabled:opacity-50"
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                    Assign to {targetLabel}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
