import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface CountryOption {
  code: string;
  name: string;
  /**
   * Selected because the setup wizard needs it to propose a default currency.
   * One shared cache entry serving both callers beats two queries differing by
   * a single small column.
   */
  currency_code: string | null;
}

/**
 * The country list, fetched once per session.
 *
 * T13 · Twenty-one pages each ran their own
 * `supabase.from("countries").select(...)` inside a `useEffect`, so the same
 * static list was re-fetched on every mount and on every navigation back to a
 * page that needed it. Countries change on a timescale of decades; this is
 * `staleTime: Infinity` and a single shared cache entry.
 *
 * Worth being precise about the size of this win: it is one round trip, not
 * the whole page. It matters because it is on the onboarding path, where the
 * user reported the slowness, and because an effect-based fetch also means
 * the `<Select>` renders empty first and fills in afterwards — which reads as
 * a broken dropdown rather than a slow one.
 */
export function useCountries() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["countries"],
    queryFn: async (): Promise<CountryOption[]> => {
      const { data, error } = await supabase
        .from("countries")
        .select("code,name,currency_code")
        .order("name");
      // Surfaced rather than swallowed: every one of the twenty-one call sites
      // did `.then(({ data }) => setX(data ?? []))`, so a failed read and a
      // country list that is genuinely empty looked identical — an empty
      // dropdown with no explanation.
      if (error) throw error;
      return (data ?? []) as CountryOption[];
    },
    staleTime: Infinity,
    gcTime: Infinity,
    retry: 1,
  });
  return { countries: data ?? [], isLoading, error: error as Error | null };
}
