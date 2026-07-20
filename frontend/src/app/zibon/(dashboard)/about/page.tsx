"use client";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { aboutApi, mediaApi } from "@/lib/api";
import toast from "react-hot-toast";
import { Plus, Trash, Image as ImageIcon } from "lucide-react";
import Image from "next/image";

export default function AdminAboutPage() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: "",
    designation: "",
    phone: "",
    email: "",
    biography: "",
    profileImage: "",
    signatureImage: "",
    skills: [] as { name: string; percentage: number }[],
  });

  const { data, isLoading } = useQuery({
    queryKey: ["admin-about"],
    queryFn: () => aboutApi.get(),
  });

  useEffect(() => {
    if (data?.data?.data) {
      setFormData(data.data.data);
    }
  }, [data]);

  const updateMutation = useMutation({
    mutationFn: (updateData: any) => aboutApi.update(updateData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-about"] });
      queryClient.invalidateQueries({ queryKey: ["public-about"] });
      toast.success("About page updated successfully");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to update");
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const addSkill = () => {
    setFormData((prev) => ({
      ...prev,
      skills: [...prev.skills, { name: "", percentage: 0 }],
    }));
  };

  const removeSkill = (index: number) => {
    setFormData((prev) => {
      const newSkills = [...prev.skills];
      newSkills.splice(index, 1);
      return { ...prev, skills: newSkills };
    });
  };

  const handleSkillChange = (index: number, field: string, value: string | number) => {
    setFormData((prev) => {
      const newSkills = [...prev.skills];
      newSkills[index] = { ...newSkills[index], [field]: value };
      return { ...prev, skills: newSkills };
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: "profileImage" | "signatureImage") => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    
    const toastId = toast.loading("Uploading image...");
    
    try {
      const res = await mediaApi.upload(file);
      setFormData((prev) => ({ ...prev, [field]: res.data.data.secureUrl }));
      toast.success("Image uploaded", { id: toastId });
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Upload failed", { id: toastId });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  if (isLoading) return <div className="p-8">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold font-display text-text">About Page Settings</h1>
        <button
          onClick={handleSubmit}
          disabled={updateMutation.isPending}
          className="btn btn-primary"
        >
          {updateMutation.isPending ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Basic Info */}
        <div className="bg-bg-card border border-border rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-bold mb-4 border-b border-border pb-2">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-bg border border-border rounded-lg focus:outline-none focus:border-primary text-text"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Designation</label>
              <input
                type="text"
                name="designation"
                value={formData.designation}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-bg border border-border rounded-lg focus:outline-none focus:border-primary text-text"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone (Optional)</label>
              <input
                type="text"
                name="phone"
                value={formData.phone || ""}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-bg border border-border rounded-lg focus:outline-none focus:border-primary text-text"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email (Optional)</label>
              <input
                type="email"
                name="email"
                value={formData.email || ""}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-bg border border-border rounded-lg focus:outline-none focus:border-primary text-text"
              />
            </div>
          </div>
        </div>

        {/* Biography */}
        <div className="bg-bg-card border border-border rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-bold mb-4 border-b border-border pb-2">Biography</h2>
          <textarea
            name="biography"
            value={formData.biography}
            onChange={handleChange}
            rows={6}
            className="w-full px-4 py-2 bg-bg border border-border rounded-lg focus:outline-none focus:border-primary text-text"
          />
        </div>

        {/* Images */}
        <div className="bg-bg-card border border-border rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-bold mb-4 border-b border-border pb-2">Images</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Profile Image */}
            <div>
              <label className="block text-sm font-medium mb-2">Profile Image (Required)</label>
              <div className="flex items-start gap-4">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-bg border border-border flex items-center justify-center shrink-0">
                  {formData.profileImage ? (
                    <Image src={formData.profileImage} alt="Profile" width={96} height={96} className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="text-text-muted" />
                  )}
                </div>
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, "profileImage")}
                    className="block w-full text-sm text-text-secondary
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-full file:border-0
                      file:text-sm file:font-semibold
                      file:bg-primary/10 file:text-primary
                      hover:file:bg-primary/20 cursor-pointer mb-2"
                  />
                  <p className="text-xs text-text-muted">Upload a square image for best results.</p>
                </div>
              </div>
            </div>
            
            {/* Signature Image */}
            <div>
              <label className="block text-sm font-medium mb-2">Signature Image (Optional)</label>
              <div className="flex items-start gap-4">
                <div className="w-32 h-16 rounded overflow-hidden bg-bg border border-border flex items-center justify-center shrink-0">
                  {formData.signatureImage ? (
                    <Image src={formData.signatureImage} alt="Signature" width={128} height={64} className="w-full h-full object-contain p-1" />
                  ) : (
                    <ImageIcon className="text-text-muted" />
                  )}
                </div>
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, "signatureImage")}
                    className="block w-full text-sm text-text-secondary
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-full file:border-0
                      file:text-sm file:font-semibold
                      file:bg-primary/10 file:text-primary
                      hover:file:bg-primary/20 cursor-pointer mb-2"
                  />
                  <p className="text-xs text-text-muted">Transparent PNG recommended.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Skills */}
        <div className="bg-bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4 border-b border-border pb-2">
            <h2 className="text-lg font-bold">Skills</h2>
            <button
              type="button"
              onClick={addSkill}
              className="btn btn-sm btn-secondary flex items-center gap-1"
            >
              <Plus size={16} /> Add Skill
            </button>
          </div>
          
          {formData.skills.length === 0 ? (
            <p className="text-text-muted text-center py-4">No skills added yet. Add some to show circular progress bars!</p>
          ) : (
            <div className="space-y-4">
              {formData.skills.map((skill, index) => (
                <div key={index} className="flex gap-4 items-start bg-bg p-4 rounded-lg border border-border">
                  <div className="flex-1">
                    <label className="block text-xs font-medium mb-1 text-text-muted">Skill Name</label>
                    <input
                      type="text"
                      value={skill.name}
                      onChange={(e) => handleSkillChange(index, "name", e.target.value)}
                      placeholder="e.g. Writing, Marketing..."
                      className="w-full px-3 py-2 bg-bg-card border border-border rounded focus:outline-none focus:border-primary text-text text-sm"
                    />
                  </div>
                  <div className="w-32">
                    <label className="block text-xs font-medium mb-1 text-text-muted">Percentage (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={skill.percentage}
                      onChange={(e) => handleSkillChange(index, "percentage", parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-bg-card border border-border rounded focus:outline-none focus:border-primary text-text text-sm"
                    />
                  </div>
                  <div className="pt-5">
                    <button
                      type="button"
                      onClick={() => removeSkill(index)}
                      className="w-9 h-9 flex items-center justify-center rounded bg-error/10 text-error hover:bg-error hover:text-white transition-colors"
                      title="Remove Skill"
                    >
                      <Trash size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </form>
    </div>
  );
}
