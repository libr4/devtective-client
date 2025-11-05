import { Box } from "@mui/material";
import SwitchableField from "./SwitchableFieldSecond";
import { rowSx } from "./utils";

type FieldsRowProps = {
  state: any;
  edit: any;
  setEdit: any;
  fields: Array<{
    name: string;
    label: string;
    kind: "text" | "select" | "date";
    minLabelWidth?: number;
    placeholder?: string;
    selectItems?: string[];
  }>;
};

export default function FieldsRow({ state, edit, setEdit, fields }: FieldsRowProps) {
  return (
    <Box sx={rowSx()}>
      {fields.map((f, idx) => (
        <SwitchableField
          key={idx}
          state={state}
          edit={edit}
          setEdit={setEdit}
          {...f}
        />
      ))}
    </Box>
  );
}
