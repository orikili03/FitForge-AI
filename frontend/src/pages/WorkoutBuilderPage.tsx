import { Card } from "../components/ui";

export function WorkoutBuilderPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold text-amber-400">Workout Builder</h1>
                <p className="text-sm text-ds-text-muted mt-1">
                    Manual builder for coaches and advanced athletes. Future versions can plug into external AI agents and wearable data.
                </p>
            </div>
            <Card className="text-sm text-ds-text-muted">
                Design custom WODs here (TBD). For now, use the generator and then tweak details manually.
            </Card>
        </div>
    );
}

