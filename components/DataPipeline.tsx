import { ArrowRight, Brain, Database, TableProperties } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card"

interface PipelineStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  status: "waiting" | "processing" | "completed";
}

interface DataPipelineProps {
  onImportComplete: () => void;
}

export function DataPipeline({ onImportComplete }: DataPipelineProps) {
  const [isImporting, setIsImporting] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [steps, setSteps] = useState<PipelineStep[]>([
    {
      id: "source",
      title: "Data Sources",
      description: "Fetching from Trust Pilot & Live Chat",
      icon: <Database className="w-5 h-5" />,
      status: "waiting",
    },
    {
      id: "process",
      title: "AI Processing",
      description: "Analyzing sentiment and priority",
      icon: <Brain className="w-5 h-5" />,
      status: "waiting",
    },
    {
      id: "load",
      title: "Data Loading",
      description: "Preparing dashboard view",
      icon: <TableProperties className="w-5 h-5" />,
      status: "waiting",
    },
  ]);

  const processingMessages = {
    source: [
      "Connecting to Trust Pilot API...",
      "Fetching latest reviews...",
      "Connecting to Live Chat system...",
      "Retrieving customer conversations...",
    ],
    process: [
      "Analyzing customer sentiment...",
      "Detecting urgent issues...",
      "Categorizing feedback...",
      "Prioritizing action items...",
    ],
    load: [
      "Structuring data...",
      "Updating dashboard...",
      "Finalizing import...",
    ],
  };

  const [currentMessage, setCurrentMessage] = useState("");

  useEffect(() => {
    if (!isImporting) return;

    const step = steps[currentStepIndex];
    const messages =
      processingMessages[step.id as keyof typeof processingMessages];
    let messageIndex = 0;

    const messageInterval = setInterval(() => {
      setCurrentMessage(messages[messageIndex]);
      messageIndex = (messageIndex + 1) % messages.length;
    }, 2000);

    const stepTimeout = setTimeout(() => {
      setSteps((prev) =>
        prev.map((s, i) => ({
          ...s,
          status:
            i === currentStepIndex
              ? "completed"
              : i === currentStepIndex + 1
              ? "processing"
              : s.status,
        }))
      );

      if (currentStepIndex < steps.length - 1) {
        setCurrentStepIndex((prev) => prev + 1);
      } else {
        setIsImporting(false);
        onImportComplete();
      }
    }, 8000);

    return () => {
      clearInterval(messageInterval);
      clearTimeout(stepTimeout);
    };
  }, [currentStepIndex, isImporting, steps, onImportComplete]);

  // Reset steps when component mounts (in case data was cleared)
  useEffect(() => {
    setSteps((prev) =>
      prev.map((s) => ({
        ...s,
        status: "waiting",
      }))
    );
    setCurrentStepIndex(0);
    setIsImporting(false);
  }, []);

  return (
    <div className="space-y-8 p-6 bg-card rounded-lg border border-border">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Data Pipeline</h2>
        <Button
          onClick={() => {
            setIsImporting(true);
            setSteps((prev) =>
              prev.map((s, i) => ({
                ...s,
                status: i === 0 ? "processing" : "waiting",
              }))
            );
          }}
          disabled={isImporting}
          variant="default"
        >
          Import Data
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {steps.map((step, index) => (
          <div key={step.id} className="relative">
            <Card
              className={`
              transition-all duration-300 h-full
              ${
                step.status === "processing"
                  ? "border-blue-500 animate-gradient bg-gradient-to-r from-blue-500/10 via-blue-500/20 to-blue-500/10 bg-[length:200%_100%]"
                  : step.status === "completed"
                  ? "border-green-500 bg-green-500/10"
                  : ""
              }
            `}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  {step.icon}
                  <h3 className="font-medium">{step.title}</h3>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  {step.status === "processing"
                    ? currentMessage
                    : step.description}
                </p>
              </CardContent>
            </Card>

            {index < steps.length - 1 && (
              <div className="absolute top-1/2 -right-6 transform -translate-y-1/2">
                <ArrowRight className="w-4 h-4 text-white/30" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
