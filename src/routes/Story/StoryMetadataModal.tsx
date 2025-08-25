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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, DollarSign, Users, FileText, Info } from "lucide-react";
import { storiesRepo } from "@/services/StoriesRepo";
import { storage } from "@/config/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useCampaignContext } from "@/contexts/campaignContext";
import { useAddress } from "@thirdweb-dev/react";

interface StoryMetadataModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

type CreationType = "regular" | "crowdfunded";

const StoryMetadataModal: React.FC<StoryMetadataModalProps> = ({
  isOpen,
  onClose,
  userId,
}) => {
  const navigate = useNavigate();
  const address = useAddress();
  const { createCampaign } = useCampaignContext();

  const [creationType, setCreationType] = useState<CreationType>("regular");
  // Common fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [language, setLanguage] = useState("");
  const [copyright, setCopyright] = useState("");
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Crowdfunding specific fields
  const [fundingTarget, setFundingTarget] = useState("");
  const [fundingDuration, setFundingDuration] = useState("30");
  const [storyConcept, setStoryConcept] = useState("");
  const [expectedLength, setExpectedLength] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const isCrowdfundedAndDisconnected =
    creationType === "crowdfunded" && !address;
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCoverImage(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleRegularStorySubmit = async (e: React.FormEvent) => {
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

  const handleCrowdfundingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);

    try {
      let coverImageUrl = "";
      if (coverImage) {
        const storageRef = ref(
          storage,
          `campaign-covers/${userId}/${title}-${Date.now()}`
        );
        await uploadBytes(storageRef, coverImage);
        coverImageUrl = await getDownloadURL(storageRef);
      }

      const deadlineDate = new Date();
      deadlineDate.setDate(deadlineDate.getDate() + parseInt(fundingDuration));

      await createCampaign({
        title: title,
        description: storyConcept,
        target: fundingTarget, // Pass the ETH amount as a string
        deadline: deadlineDate.toISOString(), // Pass the date as a string
        image: coverImageUrl,
      });

      console.log("Successfully created crowdfunding campaign!");

      onClose();
      navigate(`/campaigns`);
    } catch (error) {
      console.error("Error creating crowdfunding campaign:", error);
      // Add user-facing error handling, e.g., a toast notification
      // showError("Failed to create campaign. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setCategory("");
    setTags("");
    setTargetAudience("");
    setLanguage("");
    setCopyright("");
    setCoverImage(null);
    setImagePreview(null);
    setFundingTarget("");
    setFundingDuration("30");
    setStoryConcept("");
    setExpectedLength("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] flex flex-col bg-white dark:bg-black text-black dark:text-white border border-black/20 dark:border-white/20 transition-colors duration-200">
        <DialogHeader>
          <DialogTitle className="text-black dark:text-white flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Create New Story
          </DialogTitle>
        </DialogHeader>

        <Tabs
          value={creationType}
          onValueChange={(value) => setCreationType(value as CreationType)}
          className="flex-grow flex flex-col"
        >
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="regular" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Regular Story
            </TabsTrigger>
            <TabsTrigger
              value="crowdfunded"
              className="flex items-center gap-2"
            >
              <Users className="w-4 h-4" />
              Crowdfunded Story
            </TabsTrigger>
          </TabsList>

          <div className="flex-grow overflow-y-auto px-1">
            <TabsContent value="regular" className="space-y-4 mt-0">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Create a traditional story that you'll write independently.
                  You'll have full creative control from start to finish.
                </p>
              </div>

              <form onSubmit={handleRegularStorySubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="title"
                      className="text-black dark:text-white"
                    >
                      Title *
                    </Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                      className="bg-white dark:bg-black text-black dark:text-white border-black/20 dark:border-white/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="category"
                      className="text-black dark:text-white"
                    >
                      Category
                    </Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger className="bg-white dark:bg-black text-black dark:text-white border-black/20 dark:border-white/20">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-black border-black/20 dark:border-white/20">
                        <SelectItem value="fiction">Fiction</SelectItem>
                        <SelectItem value="non-fiction">Non-Fiction</SelectItem>
                        <SelectItem value="poetry">Poetry</SelectItem>
                        <SelectItem value="fantasy">Fantasy</SelectItem>
                        <SelectItem value="mystery">Mystery</SelectItem>
                        <SelectItem value="romance">Romance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="description"
                    className="text-black dark:text-white"
                  >
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief description of your story..."
                    className="bg-white dark:bg-black text-black dark:text-white border-black/20 dark:border-white/20"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="tags"
                      className="text-black dark:text-white"
                    >
                      Tags
                    </Label>
                    <Input
                      id="tags"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      placeholder="adventure, magic, quest"
                      className="bg-white dark:bg-black text-black dark:text-white border-black/20 dark:border-white/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="language"
                      className="text-black dark:text-white"
                    >
                      Language
                    </Label>
                    <Input
                      id="language"
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      placeholder="English"
                      className="bg-white dark:bg-black text-black dark:text-white border-black/20 dark:border-white/20"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="coverImage"
                    className="text-black dark:text-white"
                  >
                    Cover Image
                  </Label>
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
                    variant="outline"
                    className="w-full"
                  >
                    Choose Cover Image
                  </Button>
                  {imagePreview && (
                    <div className="mt-2">
                      <img
                        src={imagePreview}
                        alt="Cover preview"
                        className="max-w-full h-32 object-cover rounded"
                      />
                    </div>
                  )}
                </div>
              </form>
            </TabsContent>

            <TabsContent value="crowdfunded" className="space-y-4 mt-0">
              <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
                <p className="text-sm text-green-800 dark:text-green-200">
                  Launch a funding campaign for your story idea. Backers will
                  fund your project and vote on key narrative decisions.
                </p>
              </div>

              <form onSubmit={handleCrowdfundingSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="campaign-title"
                      className="text-black dark:text-white"
                    >
                      Campaign Title *
                    </Label>
                    <Input
                      id="campaign-title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                      placeholder="The Epic Fantasy Adventure"
                      className="bg-white dark:bg-black text-black dark:text-white border-black/20 dark:border-white/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="funding-target"
                      className="text-black dark:text-white flex items-center gap-1"
                    >
                      <DollarSign className="w-4 h-4" />
                      Funding Goal (ETH) *
                    </Label>
                    <Input
                      id="funding-target"
                      type="number"
                      step="0.01"
                      min="0.1"
                      value={fundingTarget}
                      onChange={(e) => setFundingTarget(e.target.value)}
                      required
                      placeholder="1.5"
                      className="bg-white dark:bg-black text-black dark:text-white border-black/20 dark:border-white/20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="funding-duration"
                      className="text-black dark:text-white flex items-center gap-1"
                    >
                      <Calendar className="w-4 h-4" />
                      Funding Period (days)
                    </Label>
                    <Select
                      value={fundingDuration}
                      onValueChange={setFundingDuration}
                    >
                      <SelectTrigger className="bg-white dark:bg-black text-black dark:text-white border-black/20 dark:border-white/20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-black text-black dark:text-white z-50 border border-black/20 dark:border-white/20">
                        <SelectItem value="7">7 days</SelectItem>
                        <SelectItem value="14">14 days</SelectItem>
                        <SelectItem value="30">30 days</SelectItem>
                        <SelectItem value="60">60 days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="expected-length"
                      className="text-black dark:text-white"
                    >
                      Expected Length
                    </Label>
                    <Select
                      value={expectedLength}
                      onValueChange={setExpectedLength}
                    >
                      <SelectTrigger className="bg-white dark:bg-black text-black dark:text-white border-black/20 dark:border-white/20">
                        <SelectValue placeholder="Select length" />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-black text-black dark:text-white z-50 border border-black/20 dark:border-white/20">
                        <SelectItem value="short">
                          Short Story (&lt; 10k words)
                        </SelectItem>
                        <SelectItem value="novella">
                          Novella (10k–40k words)
                        </SelectItem>
                        <SelectItem value="novel">
                          Novel (40k+ words)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="story-concept"
                    className="text-black dark:text-white"
                  >
                    Story Concept & Pitch *
                  </Label>
                  <Textarea
                    id="story-concept"
                    value={storyConcept}
                    onChange={(e) => setStoryConcept(e.target.value)}
                    required
                    rows={4}
                    placeholder="Describe your story concept, what makes it unique, and why people should fund it. This will be your main pitch to potential backers."
                    className="bg-white dark:bg-black text-black dark:text-white border-black/20 dark:border-white/20"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="campaign-category"
                      className="text-black dark:text-white"
                    >
                      Genre
                    </Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger className="bg-white dark:bg-black text-black dark:text-white border-black/20 dark:border-white/20">
                        <SelectValue placeholder="Select genre" />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-black text-black dark:text-white border-black/20 dark:border-white/20">
                        <SelectItem value="fiction">Fiction</SelectItem>
                        <SelectItem value="fantasy">Fantasy</SelectItem>
                        <SelectItem value="sci-fi">Science Fiction</SelectItem>
                        <SelectItem value="mystery">Mystery</SelectItem>
                        <SelectItem value="romance">Romance</SelectItem>
                        <SelectItem value="horror">Horror</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="campaign-tags"
                      className="text-black dark:text-white"
                    >
                      Tags
                    </Label>
                    <Input
                      id="campaign-tags"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      placeholder="epic, dragons, magic"
                      className="bg-white dark:bg-black text-black dark:text-white border-black/20 dark:border-white/20"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="campaign-cover"
                    className="text-black dark:text-white"
                  >
                    Campaign Cover Image
                  </Label>
                  <Input
                    id="campaign-cover"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    ref={fileInputRef}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                    className="w-full"
                  >
                    Choose Campaign Image
                  </Button>
                  {imagePreview && (
                    <div className="mt-2">
                      <img
                        src={imagePreview}
                        alt="Campaign cover preview"
                        className="max-w-full h-32 object-cover rounded"
                      />
                    </div>
                  )}
                </div>
              </form>
            </TabsContent>
          </div>
        </Tabs>

        <DialogFooter className="mt-4">
          {isCrowdfundedAndDisconnected && (
            <p className="text-sm text-yellow-600 dark:text-yellow-400 flex items-center gap-2 mb-2">
              <Info size={16} />
              Please connect your wallet to launch a campaign.
            </p>
          )}
          <Button variant="outline" onClick={handleClose} className="mr-2">
            Cancel
          </Button>
          <Button
            type="submit"
            // Step 2: Update the disabled logic
            disabled={isSubmitting || isCrowdfundedAndDisconnected}
            onClick={
              creationType === "regular"
                ? handleRegularStorySubmit
                : handleCrowdfundingSubmit
            }
            className="bg-dark-green dark:bg-light-green text-white hover:bg-light-green dark:hover:bg-dark-green transition-colors duration-200"
          >
            {creationType === "regular" ? "Create Story" : "Launch Campaign"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StoryMetadataModal;
