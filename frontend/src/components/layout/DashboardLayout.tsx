import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

export function DashboardLayout() {
    return (
        <div className="flex min-h-screen bg-ds-bg">
            <Sidebar />
            <div className="min-w-0 flex-1 flex flex-col lg:pl-[17rem]">
                <TopBar />
                <div className="flex flex-1 flex-col pt-14 lg:pt-0">
                    <main className="flex-1">
                        <div className="mx-auto max-w-5xl px-4 py-ds-4 sm:px-6 lg:px-8">
                            <div className="min-h-[32rem] rounded-ds-xl bg-ds-surface p-ds-4 shadow-ds-lg sm:p-ds-5">
                                <Outlet />
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}
