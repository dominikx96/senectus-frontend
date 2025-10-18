import Image from "next/image";
import { ElevenLabsWidget } from "@/components/elevenlabs-widget";

export default function SeniorsPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-8">
      <Image
        src="/fridge.jpeg"
        alt="Person checking fridge with phone"
        width={1024}
        height={1024}
        className="max-h-[300px] w-auto rounded-lg shadow-lg"
        priority
      />
      <ElevenLabsWidget />
    </div>
  );
}
