import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface UrlFormProps {
  onSubmit: (url: string) => void;
  isLoading: boolean;
}

export default function UrlForm({ onSubmit, isLoading }: UrlFormProps) {
  const [url, setUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(url);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-6 flex gap-3 max-md:flex-col items-center justify-between md:w-[60%] w-full px-4"
    >
      <Input
        type="url"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Enter product URL"
        className="w-full  flex-grow focus-visible:ring-primary"
        required
      />
      <Button
        type="submit"
        disabled={isLoading}
        className=" disabled:bg-opacity-50 "
      >
        {isLoading ? "Loading..." : "Analyze Product"}
      </Button>
    </form>
  );
}
