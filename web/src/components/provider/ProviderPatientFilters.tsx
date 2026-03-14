"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type PatientFilterValue = "active" | "all" | "inactive";

interface ProviderPatientFiltersProps {
  filter: PatientFilterValue;
  search: string;
}

export function ProviderPatientFilters({ filter, search }: ProviderPatientFiltersProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [searchValue, setSearchValue] = useState(search);
  const [filterValue, setFilterValue] = useState<PatientFilterValue>(filter);

  const applyFilters = () => {
    const params = new URLSearchParams();

    if (searchValue.trim()) {
      params.set("search", searchValue.trim());
    }

    if (filterValue !== "all") {
      params.set("filter", filterValue);
    }

    const queryString = params.toString();
    router.push(queryString ? `${pathname}?${queryString}` : pathname);
  };

  return (
    <div className="grid gap-3 md:grid-cols-[1fr_220px_auto]">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-9"
          onChange={(event) => setSearchValue(event.target.value)}
          placeholder="Search by patient name or email"
          value={searchValue}
        />
      </div>

      <Select onValueChange={(value) => setFilterValue(value as PatientFilterValue)} value={filterValue}>
        <SelectTrigger>
          <SelectValue placeholder="Filter patients" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All patients</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="inactive">Inactive</SelectItem>
        </SelectContent>
      </Select>

      <Button className="md:w-fit" onClick={applyFilters} type="button">
        Apply
      </Button>
    </div>
  );
}
