import { useQuery } from "@tanstack/react-query";
import type { UseFormRegisterReturn } from "react-hook-form";
import useDebounce from "@/hooks/use-debounce";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronDown, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useRef, useEffect, useMemo } from "react";
import type { FiltersType } from "@/types/app";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DataItem {
  value: string;
  label: string;
}

interface BaseQueryInputProps<
  TDataItem extends DataItem,
  TFilters = FiltersType
> {
  queryKey: (string | number | TFilters)[];
  queryFn: (
    search?: string,
    limit?: number,
    filters?: TFilters
  ) => Promise<TDataItem[]>;
  getItemByIdQueryFn?: (
    id: string | number
  ) => Promise<TDataItem | null | undefined>;
  placeholder?: string;
  register: UseFormRegisterReturn;
  error?: string;
  searchPlaceholder?: string;
  debounceDelay?: number;
  filters?: TFilters;
  limit?: number;
  isDisabled?: boolean;
  leftIcon?: React.ReactNode;
  allowUnselect?: boolean;
  className?: string;
}

interface SingleSelectQueryInputProps<
  TDataItem extends DataItem,
  TFilters = FiltersType
> extends BaseQueryInputProps<TDataItem, TFilters> {
  isMulti?: false;
  onSelect: (value: string) => void;
  selectedValue?: string;
  initialData?: {
    value: string;
    label: string;
  };
}

interface MultiSelectQueryInputProps<
  TDataItem extends DataItem,
  TFilters = FiltersType
> extends BaseQueryInputProps<TDataItem, TFilters> {
  isMulti: true;
  onSelect: (value: string[]) => void;
  selectedValue?: string[];
  initialData?: {
    value: string;
    label: string;
  }[];
}

type QueryInputProps<TDataItem extends DataItem, TFilters = FiltersType> =
  | SingleSelectQueryInputProps<TDataItem, TFilters>
  | MultiSelectQueryInputProps<TDataItem, TFilters>;

const QueryInput = <TDataItem extends DataItem, TFilters = FiltersType>({
  queryKey,
  queryFn,
  getItemByIdQueryFn,
  placeholder = "Selecione",
  register,
  error,
  onSelect,
  selectedValue,
  searchPlaceholder = "Buscar...",
  initialData,
  debounceDelay = 300,
  filters,
  limit = 50,
  isDisabled,
  leftIcon,
  allowUnselect = true,
  isMulti = false,
  className,
}: QueryInputProps<TDataItem, TFilters>) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, debounceDelay);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [displayValues, setDisplayValues] = useState<
    { value: string; label: string }[]
  >([]);

  const selectedValues = useMemo(() => {
    if (!selectedValue) return [];
    return Array.isArray(selectedValue) ? selectedValue : [selectedValue];
  }, [selectedValue]);

  const { data, isLoading, isError } = useQuery({
    queryKey: [...queryKey, debouncedSearch],
    queryFn: () => queryFn(debouncedSearch, limit, filters),
    staleTime: 0,
    placeholderData: initialData
      ? ((Array.isArray(initialData)
          ? initialData
          : initialData.value && initialData.label
          ? [{ value: initialData.value, label: initialData.label }]
          : undefined) as TDataItem[])
      : undefined,
  });

  const options = useMemo(() => {
    if (!Array.isArray(data)) return [];
    // Sort by label ascending
    return [...data].sort((a, b) =>
      a.label.localeCompare(b.label, undefined, { sensitivity: "base" })
    );
  }, [data]);

  // Query to fetch the specific selected items if their IDs are known but details are not in options or initialData
  const {
    data: fetchedSelectedItems,
    isLoading: isLoadingFetchedSelectedItems,
  } = useQuery({
    queryKey: ["queryInputSelectedItems", queryKey[0], selectedValues],
    queryFn: async () => {
      if (!selectedValues.length || !getItemByIdQueryFn) return [];
      const items = await Promise.all(
        selectedValues.map(async (value) => {
          if (Array.isArray(initialData)) {
            const initialItem = initialData.find(
              (item) => item.value === value
            );
            if (initialItem) return initialItem;
          } else if (initialData && initialData.value === value) {
            return initialData;
          }

          const existingOption = options.find((opt) => opt.value === value);
          if (existingOption) return existingOption;

          return getItemByIdQueryFn(value);
        })
      );
      return items.filter((item): item is TDataItem => item != null);
    },
    enabled: selectedValues.length > 0 && !!getItemByIdQueryFn,
    staleTime: 1000 * 60 * 5,
    retry: false,
  });

  // Reset option refs when options change
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm("");
    }
  }, [isOpen]);

  useEffect(() => {
    if (initialData && !selectedValue) {
      if (Array.isArray(initialData)) {
        (
          onSelect as MultiSelectQueryInputProps<
            TDataItem,
            TFilters
          >["onSelect"]
        )(initialData.map((item) => item.value));
      } else {
        (
          onSelect as SingleSelectQueryInputProps<
            TDataItem,
            TFilters
          >["onSelect"]
        )(initialData.value);
      }
    }
  }, [initialData, onSelect, selectedValue]);

  useEffect(() => {
    let currentValues: { value: string; label: string }[] = [];

    if (selectedValues.length > 0) {
      if (fetchedSelectedItems?.length) {
        currentValues = fetchedSelectedItems.map((item) => ({
          value: item.value,
          label: item.label,
        }));
      } else {
        if (Array.isArray(initialData)) {
          currentValues = selectedValues
            .map((value) => initialData.find((item) => item.value === value))
            .filter((item): item is (typeof initialData)[0] => item != null);
        } else if (initialData && selectedValues.includes(initialData.value)) {
          currentValues = [
            { value: initialData.value, label: initialData.label },
          ];
        }

        const remainingValues = selectedValues.filter(
          (value) => !currentValues.some((item) => item.value === value)
        );

        if (remainingValues.length > 0) {
          const optionsValues = remainingValues
            .map((value) => options.find((opt) => opt.value === value))
            .filter((item): item is TDataItem => item != null)
            .map((item) => ({
              value: item.value,
              label: item.label,
            }));

          currentValues = [...currentValues, ...optionsValues];
        }
      }
    }

    setDisplayValues(currentValues);
  }, [
    selectedValues,
    fetchedSelectedItems,
    initialData,
    options,
    isLoadingFetchedSelectedItems,
  ]);

  const handleSelect = (item: TDataItem) => {
    if (isMulti) {
      const newValues = selectedValues.includes(item.value)
        ? selectedValues.filter((value) => value !== item.value)
        : [...selectedValues, item.value];
      (onSelect as MultiSelectQueryInputProps<TDataItem, TFilters>["onSelect"])(
        newValues
      );
      if (!newValues.length) {
        setDisplayValues([]);
      }
    } else {
      (
        onSelect as SingleSelectQueryInputProps<TDataItem, TFilters>["onSelect"]
      )(item.value);
      setIsOpen(false);
    }
  };

  const handleRemoveValue = (valueToRemove: string) => {
    if (isMulti) {
      const newValues = selectedValues.filter(
        (value) => value !== valueToRemove
      );
      (onSelect as MultiSelectQueryInputProps<TDataItem, TFilters>["onSelect"])(
        newValues
      );
      if (!newValues.length) {
        setDisplayValues([]);
      }
    } else {
      (
        onSelect as SingleSelectQueryInputProps<TDataItem, TFilters>["onSelect"]
      )("");
      setDisplayValues([]);
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <Popover open={isOpen} onOpenChange={setIsOpen} modal={true}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            ref={buttonRef}
            aria-expanded={isOpen}
            aria-controls="query-input-listbox"
            aria-haspopup="listbox"
            className={cn(
              "!w-full h-auto min-h-[3rem] justify-between rounded-2xl border border-gray-3 text-sm px-3 py-3 font-light bg-background hover:bg-background/50 hover:text-gray-2/80 overflow-hidden items-center",
              !displayValues.length && "text-gray-1",
              displayValues.length > 0 && "text-gray-2",
              error && "border-red-500",
              isDisabled && "opacity-50 cursor-not-allowed",
              className
            )}
            disabled={isDisabled}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (!isDisabled) setIsOpen(!isOpen);
            }}
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {leftIcon && (
                <span className="flex-shrink-0 mt-0.5">{leftIcon}</span>
              )}
              <div className="flex-1 min-w-0 break-words whitespace-normal text-left leading-relaxed">
                {displayValues.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {displayValues.map((item) => (
                      <div
                        key={item.value}
                        className={`inline-flex items-center gap-1 ${
                          isMulti ? "bg-gray-100" : ""
                        } rounded-md px-2 py-1 max-w-full`}
                      >
                        <span
                          className={`truncate ${
                            isMulti ? "text-xs" : "text-sm"
                          } whitespace-nowrap overflow-hidden text-ellipsis min-w-0 block`}
                          style={{ maxWidth: isMulti ? "8rem" : "100%" }}
                        >
                          {item.label}
                        </span>
                        {!isDisabled && allowUnselect && isMulti && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveValue(item.value);
                            }}
                            className=" hover:bg-gray-200 rounded-sm cursor-pointer"
                            aria-label={`Remover ${item.label}`}
                          >
                            <X className="w-3 h-3 text-gray-500" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  placeholder
                )}
              </div>
            </div>
            <div className="flex items-center gap-1 ml-2 flex-shrink-0">
              {displayValues.length > 0 &&
                !isDisabled &&
                allowUnselect &&
                !isMulti && (
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveValue(displayValues[0].value);
                    }}
                    className="p-1 hover:bg-gray-100 rounded-md cursor-pointer"
                    role="button"
                    aria-label="Limpar seleção"
                  >
                    <X className="w-4 h-4 text-gray-500" />
                  </div>
                )}
              <ChevronDown
                className={cn(
                  "h-4 w-4 flex-shrink-0 opacity-50 transition-transform duration-200",
                  isOpen && "transform rotate-180"
                )}
              />
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[var(--radix-popper-anchor-width)] p-0 max-h-[300px] overflow-auto"
          sideOffset={5}
          align="start"
        >
          <div
            className="w-full h-full bg-white rounded-lg flex flex-col"
            role="listbox"
            id="query-input-listbox"
            aria-label={placeholder}
            aria-multiselectable={isMulti}
          >
            <div className="p-2 border-b flex gap-2 items-center shrink-0 bg-white">
              <Search className="w-4 h-4 text-gray-500 flex-shrink-0" />
              <Input
                ref={searchInputRef}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={searchPlaceholder}
                className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-8 p-0 !bg-transparent border-none"
                aria-label={searchPlaceholder}
              />
              {searchTerm && (
                <X
                  className="w-4 h-4 text-gray-500 cursor-pointer hover:text-gray-700 flex-shrink-0"
                  onClick={() => setSearchTerm("")}
                  role="button"
                  aria-label="Limpar busca"
                />
              )}
            </div>
            <div className="overflow-y-auto min-h-0 flex-1">
              {isLoading ? (
                <div
                  className="p-2 text-sm text-gray-500 text-center"
                  role="status"
                >
                  Buscando...
                </div>
              ) : isError ? (
                <div
                  className="p-2 text-sm text-red-500 text-center"
                  role="alert"
                >
                  Erro ao carregar dados.
                </div>
              ) : options.length === 0 ? (
                <div
                  className="p-2 text-sm text-gray-500 text-center"
                  role="status"
                >
                  Nenhum resultado encontrado
                </div>
              ) : (
                <div className="p-1">
                  {options.map((item) => (
                    <div
                      key={item.value}
                      className={cn(
                        "px-3 py-2 text-sm hover:bg-gray-100/75 flex items-center gap-2 cursor-pointer outline-none rounded-md whitespace-normal break-words",
                        selectedValues.includes(item.value) && "bg-gray-100"
                      )}
                      role="option"
                      aria-selected={selectedValues.includes(item.value)}
                      onClick={() => handleSelect(item)}
                    >
                      {isMulti && (
                        <div
                          className={cn(
                            "w-4 h-4 border rounded flex items-center justify-center flex-shrink-0",
                            selectedValues.includes(item.value)
                              ? "bg-primary border-primary text-white"
                              : "border-gray-300"
                          )}
                        >
                          {selectedValues.includes(item.value) && (
                            <svg
                              className="w-3 h-3"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          )}
                        </div>
                      )}
                      {item.label}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>
      {error && (
        <p className="text-red-500 text-sm mt-1" role="alert">
          {error}
        </p>
      )}
      <input
        type="hidden"
        {...register}
        value={
          isMulti && Array.isArray(selectedValue)
            ? selectedValue.join(",")
            : !isMulti && !Array.isArray(selectedValue)
            ? selectedValue || ""
            : ""
        }
      />
    </div>
  );
};

export default QueryInput;
