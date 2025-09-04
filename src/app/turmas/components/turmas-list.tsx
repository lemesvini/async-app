// Placeholder for Turmas list component
// To be implemented later

interface TurmasListProps {
  data: any[];
}

export function TurmasList({ data }: TurmasListProps) {
  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-4">Turmas List</h3>
      <p className="text-muted-foreground">
        This component will display the list of turmas. To be implemented.
      </p>
      <p className="text-sm text-muted-foreground mt-2">
        Items to display: {data.length}
      </p>
    </div>
  );
}
