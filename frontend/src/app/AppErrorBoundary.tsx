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
                <div style={{
                    padding: "2rem",
                    maxWidth: "40rem",
                    margin: "2rem auto",
                    fontFamily: "sans-serif",
                    backgroundColor: "#0f172a",
                    color: "#f8fafc",
                    borderRadius: "12px",
                    boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)"
                }}>
                    <h1 style={{ color: "#fbbf24", marginBottom: "1rem", fontSize: "1.5rem" }}>
                        Application Error
                    </h1>
                    <p style={{ marginBottom: "1rem", color: "#94a3b8" }}>
                        Something went wrong during initialization:
                    </p>
                    <pre style={{
                        background: "#1e293b",
                        color: "#e2e8f0",
                        padding: "1rem",
                        borderRadius: "8px",
                        overflow: "auto",
                        fontSize: "0.875rem",
                        border: "1px solid #334155"
                    }}>
                        {this.state.error.message}
                    </pre>
                    <button
                        onClick={() => window.location.reload()}
                        style={{
                            marginTop: "1.5rem",
                            padding: "0.5rem 1rem",
                            backgroundColor: "#334155",
                            color: "white",
                            border: "none",
                            borderRadius: "6px",
                            cursor: "pointer"
                        }}
                    >
                        Reload Page
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}
