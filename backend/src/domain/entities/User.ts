export interface UserProps {
  id: string;
  email: string;
  passwordHash: string;
  fitnessLevel: string;
  goals: string[];
  equipmentAccess: string[];
  movementConstraints: string[];
  injuryFlags: string[];
  equipment?: {
    selected: Array<{ id: string; minWeight?: number; maxWeight?: number }>;
    customPresets: Array<{
      id: string;
      name: string;
      selected: Array<{ id: string; minWeight?: number; maxWeight?: number }>;
    }>;
  };
}

export class User {
  constructor(private props: UserProps) {}

  get id() {
    return this.props.id;
  }

  get email() {
    return this.props.email;
  }

  get passwordHash() {
    return this.props.passwordHash;
  }

  get fitnessLevel() {
    return this.props.fitnessLevel;
  }

  get goals() {
    return this.props.goals;
  }

  get equipmentAccess() {
    return this.props.equipmentAccess;
  }

  get movementConstraints() {
    return this.props.movementConstraints;
  }

  get injuryFlags() {
    return this.props.injuryFlags;
  }

  get equipment() {
    return (
      this.props.equipment ?? {
        selected: [],
        customPresets: [],
      }
    );
  }
}

