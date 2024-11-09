import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { storiesRepo } from "./StoriesRepo";
import { storage } from "../config/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

interface StoryMetadataModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

const StoryMetadataModal: React.FC<StoryMetadataModalProps> = ({
  isOpen,
  onClose,
  userId,
}) => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [language, setLanguage] = useState("");
  const [copyright, setCopyright] = useState("");
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCoverImage(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let coverImageUrl = "";
      if (coverImage) {
        const storageRef = ref(
          storage,
          `book-covers/${userId}/${title}-${Date.now()}`
        );
        await uploadBytes(storageRef, coverImage);
        coverImageUrl = await getDownloadURL(storageRef);
      }

      const newStoryId = await storiesRepo.createStory(
        title,
        description,
        userId,
        {
          category,
          tags: tags.split(",").map((tag) => tag.trim()),
          targetAudience,
          language,
          copyright,
          coverImageUrl,
        }
      );
      onClose();
      navigate(`/create/${newStoryId}`);
    } catch (error) {
      console.error("Error creating story:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Create New Story</DialogTitle>
        </DialogHeader>
        <div className="flex-grow overflow-y-auto px-4 -mr-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fiction">Fiction</SelectItem>
                  <SelectItem value="non-fiction">Non-Fiction</SelectItem>
                  <SelectItem value="poetry">Poetry</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="targetAudience">Target Audience</Label>
              <Input
                id="targetAudience"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Input
                id="language"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Select value={copyright} onValueChange={setCopyright}>
                <SelectTrigger>
                  <SelectValue placeholder="Copyright" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CC0">Creative Commons Zero</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="coverImage">Cover Image</Label>
              <Input
                id="coverImage"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                ref={fileInputRef}
                className="hidden"
              />
              <Button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full"
              >
                Choose Cover Image
              </Button>
              {imagePreview && (
                <div className="mt-2">
                  <img
                    src={imagePreview}
                    alt="Cover preview"
                    className="max-w-full h-auto"
                  />
                </div>
              )}
            </div>
          </form>
        </div>
        <DialogFooter className="mt-4">
          <Button type="submit" onClick={handleSubmit}>
            Create Story
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StoryMetadataModal;
