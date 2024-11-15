import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
// import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Issue } from "@/types";
import { ColumnDef } from "@tanstack/react-table";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  BellRing,
  ChevronsUpDown,
  OctagonAlert,
  Sparkles,
} from "lucide-react";
import { NotifyAlert } from "./NotifyAlert";
import { Button } from "./ui/button";

export const columns: ColumnDef<Issue>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: "sentiment",
    accessorKey: "sentiment",
    header: () => (
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-purple-600" />
        Tags
      </div>
    ),
    cell: ({ row }) => {
      const issue = row.original;
      return (
        <div className="flex items-center gap-2">
          <Badge variant={getSentimentVariant(issue.sentiment)}>
            {issue.sentiment}&nbsp;
            {getSentimentEmoji(issue.sentiment)}
          </Badge>
          {issue.critical && (
            <Badge variant="destructive">
              <OctagonAlert className="w-3 h-3 mr-1" />
              Critical
            </Badge>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "source",
    header: () => (
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-purple-600" />
        Source
      </div>
    ),
    cell: ({ row }) => {
      const issue = row.original;
      return <Badge variant="outline">{issue.source}</Badge>;
    },
  },
  {
    accessorKey: "description",
    header: () => (
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-purple-600" />
        Issue
      </div>
    ),
  },
  {
    accessorKey: "team",
    header: "Response Team",
    cell: ({ row }) => <Badge variant="default">{row.getValue("team")}</Badge>,
  },
  {
    accessorKey: "priority",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="flex items-center gap-1 p-0 hover:bg-transparent"
          onClick={() => {
            const currentSort = column.getIsSorted();
            if (currentSort === false) {
              column.toggleSorting(false); // set to ascending
            } else if (currentSort === "asc") {
              column.toggleSorting(true); // set to descending
            } else {
              column.clearSorting(); // clear sorting
            }
          }}
        >
          Priority
          {
            {
              asc: <ArrowUpIcon className="w-4 h-4 ml-1" />,
              desc: <ArrowDownIcon className="w-4 h-4 ml-1" />,
              false: <ChevronsUpDown className="w-4 h-4 ml-1 opacity-50" />,
            }[(column.getIsSorted() as string) ?? "false"]
          }
        </Button>
      );
    },
    cell: ({ row }) => {
      const priority = row.getValue("priority") as string;
      return (
        <Badge
          variant={getPriorityVariant(priority)}
          className="flex items-center gap-1 w-fit"
        >
          {priority === "High" && "↑"}
          {priority === "Low" && "↓"}
          {priority === "Medium" && "→"} {priority}
        </Badge>
      );
    },
    sortingFn: (rowA, rowB) => {
      const priorities = { High: 3, Medium: 2, Low: 1 };
      const priorityA =
        priorities[rowA.getValue("priority") as keyof typeof priorities];
      const priorityB =
        priorities[rowB.getValue("priority") as keyof typeof priorities];
      return priorityA - priorityB;
    },
  },
  {
    accessorKey: "notified",
    header: "Team Notified",
    cell: ({ row }) => {
      const notified = row.getValue("notified") as boolean;
      const notifiedAt = row.original.notifiedAt as Date | undefined;
      const issue = row.original;

      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2">
                {notified ? (
                  <div className="flex items-center gap-2 text-green-500">
                    <BellRing className="w-4 h-4" />
                    <span className="text-xs">Notified</span>
                  </div>
                ) : (
                  <NotifyAlert
                    issueId={issue.id}
                    description={issue.description}
                    onNotifySuccess={() => window.location.reload()}
                  />
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              {notified && notifiedAt ? (
                <p>Notified on {new Date(notifiedAt).toLocaleString()}</p>
              ) : (
                <p>Not yet notified</p>
              )}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
  },
];

const getSentimentVariant = (sentiment: string) => {
  switch (sentiment) {
    case "Positive":
      return "success";
    case "Neutral":
      return "neutral";
    case "Negative":
      return "destructive";
    default:
      return "default";
  }
};

const getSentimentEmoji = (sentiment: string) => {
  switch (sentiment) {
    case "Positive":
      return "😄";
    case "Neutral":
      return "😐";
    case "Negative":
      return "😢";
    default:
      return "default";
  }
};

const getPriorityVariant = (priority: string) => {
  switch (priority) {
    case "High":
      return "destructive";
    case "Medium":
      return "default";
    case "Low":
      return "secondary";
    default:
      return "default";
  }
};
