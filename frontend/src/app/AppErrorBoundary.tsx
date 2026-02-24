import React from "react";

export class AppErrorBoundary extends React.Component<
    { children: React.ReactNode },
    { hasError: boolean; error: Error | null }
> {
    state = { hasError: false, error: null as Error | null };

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
    }

    render() {
        if (this.state.hasError && this.state.error) {
            return (
                <div style={{ padding: "2rem", maxWidth: "40rem", margin: "0 auto", fontFamily: "sans-serif" }}>
                    <h1 style={{ color: "#f8fafc", marginBottom: "0.5rem" }}>Something went wrong</h1>
                    <pre style={{ background: "#1e293b", color: "#e2e8f0", padding: "1rem", borderRadius: "8px", overflow: "auto" }}>
                        {this.state.error.message}
                    </pre>
                </div>
            );
        }
        return this.props.children;
    }
}
