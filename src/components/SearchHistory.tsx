
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { History, X } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface SearchHistoryProps {
  history: string[];
  onSelectHistory: (item: string) => void;
  onClearHistory: () => void;
  onClearHistoryItem: (index: number) => void;
  className?: string;
}

const SearchHistory: React.FC<SearchHistoryProps> = ({ 
  history, 
  onSelectHistory, 
  onClearHistory, 
  onClearHistoryItem,
  className 
}) => {
  if (history.length === 0) {
    return null;
  }

  return (
    <Card className={`shadow-md dark:shadow-none dark:border-gray-800 ${className}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center justify-between">
          <span className="flex items-center">
            <History className="h-4 w-4 mr-2" />
            Search History
          </span>
          {history.length > 0 && (
            <Button variant="ghost" size="sm" onClick={onClearHistory}>
              Clear All
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        {history.map((item, index) => (
          <div key={index}>
            <div className="flex items-center justify-between py-1">
              <Button
                variant="ghost"
                className="text-left justify-start h-auto py-1 px-2 text-sm w-5/6 truncate"
                onClick={() => onSelectHistory(item)}
              >
                {item}
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                className="h-6 w-6 p-0" 
                onClick={() => onClearHistoryItem(index)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
            {index < history.length - 1 && <Separator />}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default SearchHistory;
