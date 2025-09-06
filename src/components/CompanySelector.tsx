import { useState, useEffect } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";

interface CompanySelectorProps {
  value: string;
  onChange: (value: string) => void;
  onCompanySelected?: (companyData: {name: string, logo?: string}) => void;
}

export const CompanySelector = ({ value, onChange, onCompanySelected }: CompanySelectorProps) => {
  const [open, setOpen] = useState(false);
  const [companies, setCompanies] = useState<Array<{name: string, logo?: string}>>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("employers")
        .select("company_name, company_logo_url")
        .order("company_name");

      if (error) throw error;

      const uniqueCompanies = data.reduce((acc: Array<{name: string, logo?: string}>, item) => {
        const existing = acc.find(company => company.name === item.company_name);
        if (!existing) {
          acc.push({
            name: item.company_name,
            logo: item.company_logo_url || undefined
          });
        }
        return acc;
      }, []);
      setCompanies(uniqueCompanies);
    } catch (error) {
      console.error("Error fetching companies:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value || "የድርጅት ስም ይምረጡ ወይም ይፃፉ..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] max-h-[300px] p-0 bg-popover border border-border z-50" align="start">
        <Command>
          <CommandInput 
            placeholder="የድርጅት ስም ይፈልጉ ወይም አዲስ ይፃፉ..." 
            value={value}
            onValueChange={onChange}
          />
          <CommandList>
            <CommandEmpty>
              {value ? (
                <div className="p-3 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground"
                     onClick={() => {
                       onChange(value);
                       setOpen(false);
                     }}>
                  <div className="text-muted-foreground text-xs">አዲስ ድርጅት መፍጠር:</div>
                  <div className="font-medium text-foreground">{value}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    ይህንን ለመምረጥ ጠቅ ያድርጉ
                  </div>
                </div>
              ) : (
                <div className="p-3 text-sm text-muted-foreground">
                  የድርጅት ስም ይፃፉ...
                </div>
              )}
            </CommandEmpty>
            <CommandGroup>
              {companies.map((company) => (
                <CommandItem
                  key={company.name}
                  value={company.name}
                  onSelect={(currentValue) => {
                    const selectedCompany = companies.find(c => c.name === currentValue);
                    onChange(currentValue === value ? "" : currentValue);
                    if (onCompanySelected && selectedCompany) {
                      onCompanySelected(selectedCompany);
                    }
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === company.name ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex items-center gap-2 flex-1">
                    {company.logo && (
                      <img 
                        src={company.logo} 
                        alt="Company logo" 
                        className="w-6 h-6 object-contain rounded"
                      />
                    )}
                    <span>{company.name}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};