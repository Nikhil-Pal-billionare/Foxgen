import PromptBox from "@/components/dashboard/PromptBox";
import ImageGrid from "@/components/dashboard/ImageGrid";

export default function DashboardPage() {
  return (
    <div className="space-y-24">
      <PromptBox />
      <ImageGrid />
    </div>
  );
}
