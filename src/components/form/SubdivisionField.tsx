import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  listCountrySubdivisions,
  subdivisionLabel,
  type CountrySubdivision,
} from "@/lib/country-reference.functions";

/**
 * State / province / region, as a dropdown where the country has one.
 *
 * T16 · This was a free-text box everywhere, so the same state arrived as
 * "NSW", "N.S.W.", "New South Wales" and "nsw" — which makes every downstream
 * grouping, payroll-tax split and long-service-leave rule unreliable, and none
 * of it visibly broken.
 *
 * Three deliberate behaviours:
 *
 * 1. **A country with no list still gets a text box.** Launch coverage is AU
 *    and NP. A dropdown with nothing in it is a dead end — a form somebody
 *    cannot finish is worse than one that accepts free text.
 * 2. **A failed read falls back to the text box too**, and says so. An empty
 *    list and a failed request must not look the same.
 * 3. **Changing country clears the value**, which is the caller's job — see
 *    `clearSubdivisionOnCountryChange`. A stale "NSW" sitting in the field
 *    while the country says Nepal is a wrong answer that looks answered.
 */
export function SubdivisionField({
  countryCode,
  value,
  onChange,
  id = "subdivision",
  required,
  invalidProps,
  error,
}: {
  countryCode: string | null | undefined;
  value: string;
  onChange: (next: string) => void;
  id?: string;
  required?: boolean;
  /** Spread from useFormErrors().register(name), when the caller validates. */
  invalidProps?: Record<string, unknown>;
  error?: React.ReactNode;
}) {
  const listFn = useServerFn(listCountrySubdivisions);
  const code = (countryCode ?? "").toUpperCase();

  const { data, isLoading } = useQuery({
    queryKey: ["country-subdivisions", code],
    queryFn: () => listFn({ data: { countryCode: code } }),
    enabled: code.length === 2,
    // Reference data. It changes when a constitution does.
    staleTime: Infinity,
    retry: false,
  });

  const subdivisions: CountrySubdivision[] = data?.subdivisions ?? [];
  const readFailed = data ? data.known === false : false;
  const label = subdivisionLabel(subdivisions);
  const useSelect = subdivisions.length > 0;

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label}
        {required && <span className="text-destructive"> *</span>}
      </Label>

      {useSelect ? (
        <Select value={value || undefined} onValueChange={onChange}>
          <SelectTrigger id={id} {...(invalidProps as object)}>
            <SelectValue placeholder={`Select ${label.toLowerCase()}…`} />
          </SelectTrigger>
          <SelectContent>
            {subdivisions.map((s) => (
              <SelectItem key={s.code} value={s.code}>
                {s.name}
                <span className="ml-2 text-xs text-muted-foreground">{s.code}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <Input
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={
            code.length === 2 && !isLoading
              ? "Type the state, province or region"
              : "Choose a country first"
          }
          {...(invalidProps as object)}
        />
      )}

      {readFailed && (
        <p className="text-xs text-muted-foreground">
          We couldn't load the list for this country, so type it instead.
        </p>
      )}
      {error}
    </div>
  );
}
