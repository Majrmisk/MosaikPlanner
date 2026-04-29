export default function DashboardLoading() {
    return (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(min(18rem,100%),18rem))] justify-center gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-48 w-full animate-pulse rounded-xl bg-muted" />
            ))}
        </div>
    );
}
