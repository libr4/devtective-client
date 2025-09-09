import * as React from "react";
import {
  Box,
  Button,
  MenuItem,
  Select,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs, { Dayjs } from "dayjs";

export type FieldEditState = Record<
  "type" | "priority" | "description" | "assignedTo" | "technology" | "status" | "deadline",
  boolean
>;

type Kind = "text" | "select" | "date";

export interface SwitchableFieldProps {
  state: Record<string, any>;
  edit: FieldEditState;
  setEdit: React.Dispatch<React.SetStateAction<FieldEditState>>;
  name: keyof FieldEditState | string;
  label: string;
  minLabelWidth?: number;
  kind: Kind;
  placeholder?: string;
  selectItems?: string[];
}

/**
 * SwitchableField
 * - Shows read-only value until clicked, then switches to an editor
 * - Submits values via standard form submit (name/value).
 * - For DatePicker, we maintain a local Dayjs state and mirror it to a hidden input.
 */
export default function SwitchableFieldSecond({
  state,
  edit,
  setEdit,
  name,
  label,
  kind,
  minLabelWidth = 130,
  placeholder,
  selectItems = [],
}: SwitchableFieldProps) {
  const editing = Boolean(edit[name as keyof FieldEditState]);

  const handleEdit = () => setEdit((prev) => ({ ...prev, [name]: true }));
  const handleClose = () => setEdit((prev) => ({ ...prev, [name]: false }));

  // Date handling: keep a local Dayjs and mirror it to a hidden input named={name}
  const [dateVal, setDateVal] = React.useState<Dayjs | null>(() => {
    const raw = state[name as string];
    return raw ? dayjs(raw as string) : null;
  });

  return (
    <Box
      sx={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        gap: 1,
        minWidth: 0,
      }}
    >
      <Typography
        onClick={!editing ? handleEdit : undefined}
        sx={{ minWidth: minLabelWidth, fontWeight: 500, cursor: "pointer" }}
      >
        {label}
      </Typography>

      {!editing ? (
        <Tooltip title="Clique para editar">
          <Typography
            onClick={handleEdit}
            sx={{
              flex: 1,
              minWidth: 0,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              cursor: "pointer",
            }}
          >
            {String(state[name as string] ?? "—")}
          </Typography>
        </Tooltip>
      ) : (
        <>
          {kind === "text" && (
            <TextField
              name={name as string}
              size="small"
              placeholder={placeholder}
              defaultValue={state[name as string]}
              sx={{ flex: 1, backgroundColor: "white" }}
            />
          )}

          {kind === "select" && (
            <Select
              name={name as string}
              size="small"
              defaultValue={state[name as string] ?? (selectItems[0] ?? "")}
              sx={{ flex: 1, backgroundColor: "white" }}
            >
              {selectItems.map((item) => (
                <MenuItem key={item} value={item}>
                  {item}
                </MenuItem>
              ))}
            </Select>
          )}

          {kind === "date" && (
            <>
              <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
                <DatePicker
                  value={dateVal}
                  onChange={(val) => setDateVal(val)}
                  slotProps={{
                    textField: {
                      size: "small",
                      sx: { backgroundColor: "white", width: "100%" },
                    },
                  }}
                />
              </LocalizationProvider>
              {/* Hidden input to include the ISO date in the form submit */}
              <input
                type="hidden"
                name={name as string}
                value={dateVal ? dateVal.toISOString() : ""}
              />
            </>
          )}

          <Button onClick={handleClose} aria-label={`Fechar edição de ${label}`} sx={{ ml: 0.5 }}>
            <CloseIcon color="primary" />
          </Button>
        </>
      )}
    </Box>
  );
}
