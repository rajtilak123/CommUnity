"use client";

import { useActionState, useState } from "react";
import { Loader2, Save, Send, Image as ImageIcon, Trash2 } from "lucide-react";

import { createFacilityAction, updateFacilityAction, type FacilityActionState } from "@/lib/facilities/actions";
import { uploadFacilityImages, type UploadedFacilityImage } from "@/lib/facilities/upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { FacilityWithRelations } from "@/types/facilities";

type FacilityFormProps = {
  facility?: FacilityWithRelations;
};

const initialState: FacilityActionState = {};

export function FacilityForm({ facility }: FacilityFormProps) {
  const isEditing = !!facility;
  const [facilityId] = useState(() => facility?.id || crypto.randomUUID());

  const formActionWrapper = isEditing ? updateFacilityAction : createFacilityAction;
  const [state, formAction, isPending] = useActionState(formActionWrapper, initialState);

  const [uploads, setUploads] = useState<UploadedFacilityImage[]>(() =>
    facility?.images.map((img) => ({
      fileUrl: img.file_url,
      fileName: img.file_name || "",
      previewUrl: img.file_url,
    })) || []
  );

  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      const next = await uploadFacilityImages(facilityId, Array.from(files));
      setUploads((prev) => [...prev, ...next]);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const removeUpload = (idx: number) => {
    setUploads((prev) => prev.filter((_, i) => i !== idx));
  };

  return (
    <form action={formAction} className="flex flex-col gap-lg rounded-[0.75rem] border border-outline-variant bg-surface-container-lowest p-md md:p-xl shadow-sm">
      <input type="hidden" name="id" value={facilityId} />

      <div className="grid grid-cols-1 gap-lg md:grid-cols-2">
        <div className="flex flex-col gap-xs">
          <Label htmlFor="name" className="text-label-md text-on-surface-variant px-1">
            Facility Name
          </Label>
          <Input
            id="name"
            name="name"
            defaultValue={facility?.name}
            placeholder="e.g. Clubhouse, Tennis Court"
            required
            className="rounded-lg border-outline-variant bg-surface px-md py-sm text-body-md"
          />
        </div>

        <div className="flex flex-col gap-xs">
          <Label htmlFor="capacity" className="text-label-md text-on-surface-variant px-1">
            Max Capacity (Informational)
          </Label>
          <Input
            id="capacity"
            name="capacity"
            type="number"
            min={1}
            defaultValue={facility?.capacity || 1}
            required
            className="rounded-lg border-outline-variant bg-surface px-md py-sm text-body-md"
          />
        </div>
      </div>

      <div className="flex flex-col gap-xs">
        <Label htmlFor="description" className="text-label-md text-on-surface-variant px-1">
          Description
        </Label>
        <textarea
          id="description"
          name="description"
          defaultValue={facility?.description}
          rows={4}
          required
          placeholder="Brief description of the amenity..."
          className="min-h-[100px] w-full resize-none rounded-lg border border-outline-variant bg-surface px-md py-sm text-body-lg md:text-body-md transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
        />
      </div>

      <div className="flex flex-col gap-xs">
        <Label htmlFor="rules" className="text-label-md text-on-surface-variant px-1">
          Usage Rules / Instructions (Optional)
        </Label>
        <textarea
          id="rules"
          name="rules"
          defaultValue={facility?.rules || ""}
          rows={4}
          placeholder="List usage regulations, guidelines, cleaning policies..."
          className="min-h-[100px] w-full resize-none rounded-lg border border-outline-variant bg-surface px-md py-sm text-body-lg md:text-body-md transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
        />
      </div>

      {/* Status switch option */}
      <div className="flex items-center gap-md rounded-lg border border-outline-variant bg-surface-container/30 p-md">
        <input
          id="is_active"
          name="is_active"
          type="checkbox"
          value="true"
          defaultChecked={facility ? facility.is_active : true}
          className="size-5 rounded border-outline-variant text-primary focus:ring-primary cursor-pointer"
        />
        <div className="flex flex-col">
          <Label htmlFor="is_active" className="text-body-md font-semibold text-on-surface cursor-pointer">
            Active / Enabled
          </Label>
          <span className="text-label-md text-on-surface-variant">
            Disabled facilities cannot be selected or booked by residents.
          </span>
        </div>
      </div>

      {/* Image Uploader */}
      <div className="flex flex-col gap-xs">
        <Label className="text-label-md text-on-surface-variant px-1">Facility Images</Label>
        
        <div className="group flex cursor-pointer flex-col items-center justify-center rounded-[0.75rem] border-2 border-dashed border-outline-variant bg-surface p-xl transition-colors hover:bg-surface-container-low relative">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFiles}
            className="absolute inset-0 opacity-0 cursor-pointer"
            disabled={isUploading}
          />
          <div className="mb-md flex size-12 items-center justify-center rounded-full bg-surface-container-high transition-transform group-hover:scale-110">
            <ImageIcon className="size-6 text-primary" />
          </div>
          <p className="text-body-md font-semibold text-on-surface">
            {isUploading ? "Uploading..." : "Click or drag images to upload"}
          </p>
          <p className="text-label-md text-on-surface-variant">PNG, JPG, WEBP (max. 10MB)</p>
        </div>

        {uploadError ? <p className="text-body-md text-error mt-1">{uploadError}</p> : null}

        {/* Thumbnail Preview Row */}
        {uploads.length > 0 && (
          <div className="mt-md grid grid-cols-2 gap-sm sm:grid-cols-4">
            {uploads.map((up, idx) => (
              <div key={idx} className="group relative aspect-video overflow-hidden rounded-lg border border-outline-variant bg-surface-container">
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white p-xs text-center text-[10px] break-all">
                  {up.fileName}
                </div>
                <button
                  type="button"
                  onClick={() => removeUpload(idx)}
                  className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white hover:bg-error transition-all"
                  title="Remove Image"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Hidden inputs to pass urls/names to Server Actions */}
      {uploads.map((up) => (
        <input key={up.fileUrl} type="hidden" name="image_urls" value={up.fileUrl} />
      ))}
      {uploads.map((up) => (
        <input key={`${up.fileUrl}-name`} type="hidden" name="image_names" value={up.fileName} />
      ))}

      {state.error ? (
        <p className="rounded-lg border border-error/30 bg-error-container/40 px-md py-sm text-body-md text-on-error-container">
          {state.error}
        </p>
      ) : null}

      <div className="mt-md flex justify-end gap-sm border-t border-outline-variant pt-md">
        <Button
          type="submit"
          disabled={isPending || isUploading}
          className="h-auto w-full gap-sm rounded-lg px-2xl py-md text-body-md font-semibold md:w-auto"
        >
          {isPending ? (
            <>
              <Loader2 className="size-5 animate-spin" />
              Saving...
            </>
          ) : isEditing ? (
            <>
              Save Facility
              <Save className="size-5" />
            </>
          ) : (
            <>
              Create Facility
              <Send className="size-5" />
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
