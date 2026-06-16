export function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden pb-24 md:pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 md:pt-8">
        {/* Nav Skeleton */}
        <div className="flex justify-center gap-1.5 mb-8">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-7 w-20 rounded-full bg-muted/30 animate-pulse" />
          ))}
        </div>

        <div className="space-y-14 md:space-y-24">
          {/* Hero Skeleton */}
          <div className="rounded-[2.5rem] border border-border/50 bg-card p-6 md:p-10 lg:p-12 space-y-8">
            <div className="flex justify-between">
              <div className="space-y-4 flex-1">
                <div className="h-4 w-48 bg-muted/40 rounded-full animate-pulse" />
                <div className="h-12 w-[420px] bg-muted/30 rounded-lg animate-pulse" />
                <div className="h-5 w-[580px] bg-muted/20 rounded-lg animate-pulse" />
              </div>
              <div className="h-8 w-32 bg-muted/30 rounded-full animate-pulse" />
            </div>
            <div className="flex gap-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <div className="h-16 w-16 rounded-full bg-muted/30 animate-pulse" />
                  <div className="h-3 w-12 bg-muted/20 rounded animate-pulse" />
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-border/30">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-3 w-20 bg-muted/20 rounded animate-pulse" />
                  <div className="h-1.5 rounded-full bg-muted/20 animate-pulse" />
                </div>
              ))}
            </div>
          </div>

          {/* Intelligence Skeleton */}
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="h-8 w-1 rounded-full bg-muted/30 animate-pulse" />
              <div className="space-y-1">
                <div className="h-5 w-44 bg-muted/30 rounded animate-pulse" />
                <div className="h-4 w-28 bg-muted/20 rounded animate-pulse" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-40 rounded-2xl border border-border/50 bg-card p-6 space-y-5">
                  <div className="flex justify-between">
                    <div className="h-11 w-11 rounded-xl bg-muted/30 animate-pulse" />
                    <div className="h-5 w-20 bg-muted/30 rounded-full animate-pulse" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 w-24 bg-muted/20 rounded animate-pulse" />
                    <div className="h-8 w-32 bg-muted/40 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Snapshot Skeleton */}
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="h-8 w-1 rounded-full bg-muted/30 animate-pulse" />
              <div className="space-y-1">
                <div className="h-5 w-44 bg-muted/30 rounded animate-pulse" />
                <div className="h-4 w-28 bg-muted/20 rounded animate-pulse" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-36 rounded-2xl border border-border/50 bg-card p-6 space-y-4">
                  <div className="flex justify-between">
                    <div className="h-11 w-11 rounded-xl bg-muted/30 animate-pulse" />
                    <div className="h-5 w-16 bg-muted/30 rounded-full animate-pulse" />
                  </div>
                  <div className="space-y-1">
                    <div className="h-3 w-20 bg-muted/20 rounded animate-pulse" />
                    <div className="h-8 w-40 bg-muted/40 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Salary Skeleton */}
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="h-8 w-1 rounded-full bg-muted/30 animate-pulse" />
              <div className="space-y-1">
                <div className="h-5 w-44 bg-muted/30 rounded animate-pulse" />
                <div className="h-4 w-28 bg-muted/20 rounded animate-pulse" />
              </div>
            </div>
            <div className="rounded-[2.5rem] border border-border/50 bg-card shadow-soft overflow-hidden">
              <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-border/30 border-b border-border/30">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="p-4 md:p-5 space-y-2">
                    <div className="h-3 w-16 bg-muted/20 rounded animate-pulse" />
                    <div className="h-4 w-24 bg-muted/30 rounded animate-pulse" />
                  </div>
                ))}
              </div>
              <div className="p-6 md:p-8 space-y-6">
                <div className="h-72 md:h-80 bg-muted/10 rounded-2xl animate-pulse" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-24 rounded-2xl bg-muted/10 animate-pulse" />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Trends Skeleton */}
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="h-8 w-1 rounded-full bg-muted/30 animate-pulse" />
              <div className="space-y-1">
                <div className="h-5 w-44 bg-muted/30 rounded animate-pulse" />
                <div className="h-4 w-28 bg-muted/20 rounded animate-pulse" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-72 rounded-[2rem] border border-border/50 bg-card p-6 md:p-8 space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-muted/30 animate-pulse" />
                    <div className="space-y-2">
                      <div className="h-4 w-36 bg-muted/30 rounded animate-pulse" />
                      <div className="h-3 w-24 bg-muted/20 rounded animate-pulse" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    {[...Array(3)].map((_, j) => (
                      <div key={j} className="h-14 rounded-xl bg-muted/10 animate-pulse" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Skills Skeleton */}
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="h-8 w-1 rounded-full bg-muted/30 animate-pulse" />
              <div className="space-y-1">
                <div className="h-5 w-44 bg-muted/30 rounded animate-pulse" />
                <div className="h-4 w-28 bg-muted/20 rounded animate-pulse" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-44 rounded-2xl border border-border/50 bg-card p-6 space-y-5">
                  <div className="flex items-center gap-4">
                    <div className="h-11 w-11 rounded-xl bg-muted/30 animate-pulse" />
                    <div className="space-y-2">
                      <div className="h-4 w-32 bg-muted/30 rounded animate-pulse" />
                      <div className="h-3 w-20 bg-muted/20 rounded animate-pulse" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {[...Array(4)].map((_, j) => (
                      <div key={j} className="h-8 w-24 bg-muted/20 rounded-xl animate-pulse" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations Skeleton */}
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="h-8 w-1 rounded-full bg-muted/30 animate-pulse" />
              <div className="space-y-1">
                <div className="h-5 w-44 bg-muted/30 rounded animate-pulse" />
                <div className="h-4 w-28 bg-muted/20 rounded animate-pulse" />
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-72 rounded-[2rem] border border-border/50 bg-card p-6 md:p-8 space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="h-11 w-11 rounded-xl bg-muted/30 animate-pulse" />
                    <div className="space-y-2">
                      <div className="h-4 w-36 bg-muted/30 rounded animate-pulse" />
                      <div className="h-3 w-24 bg-muted/20 rounded animate-pulse" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    {[...Array(3)].map((_, j) => (
                      <div key={j} className="h-16 rounded-xl bg-muted/10 animate-pulse" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions Skeleton */}
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="h-8 w-1 rounded-full bg-muted/30 animate-pulse" />
              <div className="space-y-1">
                <div className="h-5 w-44 bg-muted/30 rounded animate-pulse" />
                <div className="h-4 w-28 bg-muted/20 rounded animate-pulse" />
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-36 rounded-2xl border border-border/50 bg-card p-5 md:p-6 space-y-4">
                  <div className="h-11 w-11 rounded-xl bg-muted/30 animate-pulse" />
                  <div className="space-y-2">
                    <div className="h-4 w-24 bg-muted/30 rounded animate-pulse" />
                    <div className="h-3 w-20 bg-muted/20 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
