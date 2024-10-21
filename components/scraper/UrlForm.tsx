import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";

interface UrlFormProps {
  onSubmit: (urls: string[]) => void;
  isLoading: boolean;
}

export default function UrlForm({ onSubmit, isLoading }: UrlFormProps) {
  const [urls, setUrls] = useState<string[]>([""]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(urls.filter((url) => url.trim() !== ""));
  };

  const addUrlInput = () => {
    setUrls([...urls, ""]);
  };

  const removeUrlInput = (index: number) => {
    const newUrls = urls.filter((_, i) => i !== index);
    setUrls(newUrls);
  };

  const updateUrl = (index: number, value: string) => {
    const newUrls = [...urls];
    newUrls[index] = value;
    setUrls(newUrls);
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6 w-full md:w-[60%] ">
      {urls.map((url, index) => (
        <div key={index} className="flex gap-3 mb-3">
          <Input
            type="url"
            value={url}
            onChange={(e) => updateUrl(index, e.target.value)}
            placeholder="Enter product URL"
            className="w-full flex-grow focus-visible:ring-primary"
            required
          />
          {urls.length > 1 && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => removeUrlInput(index)}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      ))}
      <div className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={addUrlInput}
          disabled={isLoading}
        >
          Add Product
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Analyzing..." : "Analyze Products"}
        </Button>
      </div>
    </form>
  );
}
